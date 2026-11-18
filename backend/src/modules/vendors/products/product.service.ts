import { randomUUID } from "node:crypto";
import { Prisma, ProductRevisionStatus, ProductStatus, ReviewStatus, InventoryMovementType } from "../../../generated/prisma/client.js";
import { prisma } from "../../../config/database.js";
import { deleteFromR2, generateR2SignedUrl } from "../../../services/r2Storage.service.js";

export type ProductImageInput = { imageUrl: string; storageKey?: string | null; altText?: string | null };
export type VendorProductInput = {
  categoryId: string; brandId?: string | null; name: string; description?: string | null;
  sku: string; price: number; compareAtPrice?: number | null; stockQuantity?: number;
  status?: "DRAFT" | "ACTIVE" | "INACTIVE"; images?: ProductImageInput[];
};
export type VendorProductQuery = {
  page: number; limit: number; search?: string; categoryId?: string;
  brandId?: string; status?: "DRAFT" | "ACTIVE" | "INACTIVE"; listingStatus?: ReviewStatus; stockStatus?: "IN_STOCK" | "OUT_OF_STOCK" | "LOW_STOCK";
  sortBy: "createdAt" | "price" | "name" | "stockQuantity"; sortOrder: "asc" | "desc";
};

const fail = (message: string, statusCode: number): never => { throw Object.assign(new Error(message), { statusCode }); };
const slug = (name: string) => `${name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "product")}-${randomUUID().slice(0, 8)}`;

async function vendorForUser(userId: string) {
  const vendor = await prisma.vendorProfile.findUnique({ where: { userId }, select: { id: true } });
  if (!vendor) fail("Vendor profile not found.", 404);
  return vendor!.id;
}

async function validateReferences(categoryId: string, brandId?: string | null) {
  const category = await prisma.category.findFirst({ where: { id: categoryId, isActive: true, parentId: { not: null }, parent: { is: { isActive: true, parentId: null } } }, select: { id: true } });
  if (!category) fail("Select an active subcategory under an active parent category.", 400);
  if (brandId) {
    const brand = await prisma.brand.findFirst({ where: { id: brandId, isActive: true }, select: { id: true } });
    if (!brand) fail("The selected brand does not exist or is inactive.", 400);
  }
}

async function validateImages(vendorProfileId: string, images?: ProductImageInput[]) {
  if (!images) return;
  if (images.length > 6) fail("A product can have at most 6 images.", 400);
  for (const image of images) {
    if (image.storageKey && !image.storageKey.startsWith(`product-images/${vendorProfileId}/`)) fail("Product image storage reference is invalid.", 400);
    if (!image.storageKey && !/^https:\/\//i.test(image.imageUrl)) fail("Product images must use HTTPS URLs or uploaded product images.", 400);
  }
}

async function presentProduct<T extends { price: Prisma.Decimal; compareAtPrice: Prisma.Decimal | null; images: { imageUrl: string; storageKey: string | null }[] }>(product: T) {
  return {
    ...product,
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice === null ? null : Number(product.compareAtPrice),
    images: await Promise.all(product.images.map(async (image) => ({ ...image, imageUrl: image.storageKey ? await generateR2SignedUrl(image.storageKey, 3600) : image.imageUrl }))),
  };
}

const productInclude = {
  category: { select: { id: true, name: true } },
  brand: { select: { id: true, name: true } },
  images: { orderBy: { sortOrder: "asc" as const } },
};
const productDetailsInclude = { ...productInclude, revisions: { orderBy: { submittedAt: "desc" as const }, include: { images: { orderBy: { sortOrder: "asc" as const } } } } };

export async function listVendorProducts(userId: string, query: VendorProductQuery) {
  const vendorProfileId = await vendorForUser(userId);
  const where: Prisma.ProductWhereInput = {
    vendorProfileId, status: { not: ProductStatus.ARCHIVED },
    ...(query.categoryId ? { categoryId: query.categoryId } : {}),
    ...(query.brandId ? { brandId: query.brandId } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.listingStatus ? { listingStatus: query.listingStatus } : {}),
    ...(query.search ? { OR: [{ name: { contains: query.search, mode: "insensitive" } }, { sku: { contains: query.search, mode: "insensitive" } }] } : {}),
  };
  if (query.stockStatus === "IN_STOCK") where.stockQuantity = { gt: 0 };
  if (query.stockStatus === "OUT_OF_STOCK") where.stockQuantity = 0;
  if (query.stockStatus === "LOW_STOCK") where.stockQuantity = { gt: 0, lte: 5 };
  const [rows, total, allProducts, active, pending, rejected, outOfStock, hidden] = await prisma.$transaction([
    prisma.product.findMany({ where, skip: (query.page - 1) * query.limit, take: query.limit, orderBy: { [query.sortBy]: query.sortOrder }, include: productInclude }),
    prisma.product.count({ where }),
    prisma.product.count({ where: { vendorProfileId, status: { not: ProductStatus.ARCHIVED } } }),
    prisma.product.count({ where: { vendorProfileId, status: ProductStatus.ACTIVE, listingStatus: ReviewStatus.APPROVED } }),
    prisma.product.count({ where: { vendorProfileId, status: { not: ProductStatus.ARCHIVED }, listingStatus: ReviewStatus.PENDING } }),
    prisma.product.count({ where: { vendorProfileId, status: { not: ProductStatus.ARCHIVED }, listingStatus: ReviewStatus.REJECTED } }),
    prisma.product.count({ where: { vendorProfileId, status: ProductStatus.ACTIVE, stockQuantity: 0 } }),
    prisma.product.count({ where: { vendorProfileId, status: { in: [ProductStatus.DRAFT, ProductStatus.INACTIVE] }, listingStatus: ReviewStatus.APPROVED } }),
  ]);
  return {
    products: await Promise.all(rows.map(presentProduct)),
    counts: { ALL: allProducts, ACTIVE: active, PENDING: pending, REJECTED: rejected, OUT_OF_STOCK: outOfStock, HIDDEN: hidden },
    pagination: { currentPage: query.page, pageSize: query.limit, totalProducts: total, totalPages: Math.ceil(total / query.limit), hasNextPage: query.page * query.limit < total, hasPreviousPage: query.page > 1 },
  };
}

export async function getVendorProduct(userId: string, productId: string) {
  const vendorProfileId = await vendorForUser(userId);
  const product = await prisma.product.findFirst({ where: { id: productId, vendorProfileId, status: { not: ProductStatus.ARCHIVED } }, include: productDetailsInclude });
  if (!product) return null;
  return {
    ...await presentProduct(product),
    revisions: await Promise.all(product.revisions.map(async (revision) => ({
      ...revision,
      price: Number(revision.price),
      compareAtPrice: revision.compareAtPrice === null ? null : Number(revision.compareAtPrice),
      images: await Promise.all(revision.images.map(async (image) => ({ ...image, imageUrl: image.storageKey ? await generateR2SignedUrl(image.storageKey, 3600) : image.imageUrl }))),
    }))),
  };
}

export async function createVendorProduct(userId: string, input: VendorProductInput) {
  const vendorProfileId = await vendorForUser(userId);
  await validateReferences(input.categoryId, input.brandId);
  await validateImages(vendorProfileId, input.images);
  const name = input.name.trim().replace(/\s+/g, " ");
  try {
    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({ data: {
        vendorProfileId, categoryId: input.categoryId, brandId: input.brandId || null,
        name, slug: slug(name), description: input.description?.trim() || null,
        sku: input.sku.trim(), price: input.price, compareAtPrice: input.compareAtPrice ?? null,
        stockQuantity: input.stockQuantity ?? 0, status: input.status ?? ProductStatus.DRAFT,
        listingStatus: ReviewStatus.PENDING,
        images: input.images?.length ? { create: input.images.map((image, sortOrder) => ({ imageUrl: image.storageKey ? `r2://${image.storageKey}` : image.imageUrl, storageKey: image.storageKey ?? null, altText: image.altText ?? null, sortOrder })) } : undefined,
      }, include: productInclude });
      if ((input.stockQuantity ?? 0) > 0) await tx.inventoryMovement.create({ data: { vendorProfileId, productId: created.id, type: InventoryMovementType.STOCK_IN, quantity: input.stockQuantity!, note: "Initial product stock", recordedById: userId } });
      return created;
    });
    return presentProduct(product);
  } catch (error) {
    await cleanupUploadedImages(input.images);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") fail("This vendor already has a product with this SKU.", 409);
    throw error;
  }
}

async function cleanupUploadedImages(images?: ProductImageInput[]) {
  await Promise.allSettled((images ?? []).flatMap((image) => image.storageKey ? [deleteFromR2(image.storageKey)] : []));
}

export async function updateVendorProduct(userId: string, productId: string, input: VendorProductInput) {
  const vendorProfileId = await vendorForUser(userId);
  const current = await prisma.product.findFirst({ where: { id: productId, vendorProfileId, status: { not: ProductStatus.ARCHIVED } }, include: { images: { orderBy: { sortOrder: "asc" } } } });
  if (!current) return null;
  await validateReferences(input.categoryId, input.brandId);
  await validateImages(vendorProfileId, input.images);
  const imageInputs = input.images ?? current.images.map((image) => ({ imageUrl: image.imageUrl, storageKey: image.storageKey, altText: image.altText }));

  if (current.listingStatus === ReviewStatus.APPROVED) {
    try {
      return await prisma.productRevision.create({ data: {
        productId, vendorProfileId, categoryId: input.categoryId, brandId: input.brandId ?? null,
        name: input.name.trim().replace(/\s+/g, " "), description: input.description?.trim() || null,
        sku: input.sku.trim(), price: input.price, compareAtPrice: input.compareAtPrice ?? null,
        stockQuantity: input.stockQuantity ?? current.stockQuantity,
        images: { create: imageInputs.map((image, sortOrder) => ({ imageUrl: image.storageKey ? `r2://${image.storageKey}` : image.imageUrl, storageKey: image.storageKey ?? null, altText: image.altText ?? null, sortOrder })) },
      }, include: { images: { orderBy: { sortOrder: "asc" } } } });
    } catch (error) {
      await cleanupUploadedImages(input.images);
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") fail("A pending product revision already exists.", 409);
      throw error;
    }
  }

  const removedImageKeys: string[] = [];
  let result;
  try { result = await prisma.$transaction(async (tx) => {
    const updated = await tx.product.updateMany({ where: { id: productId, vendorProfileId, listingStatus: { in: [ReviewStatus.PENDING, ReviewStatus.REJECTED] } }, data: {
      categoryId: input.categoryId, brandId: input.brandId ?? null,
      name: input.name.trim().replace(/\s+/g, " "), slug: slug(input.name),
      description: input.description?.trim() || null, sku: input.sku.trim(),
      price: input.price, compareAtPrice: input.compareAtPrice ?? null,
      stockQuantity: input.stockQuantity ?? current.stockQuantity,
      status: input.status ?? current.status, listingStatus: ReviewStatus.PENDING, listingNote: null,
    } });
    if (!updated.count) fail("Product state changed. Refresh and try again.", 409);
    if (input.images) {
      const oldImages = await tx.productImage.findMany({ where: { productId }, select: { storageKey: true } });
      removedImageKeys.push(...oldImages.flatMap((image) => image.storageKey ? [image.storageKey] : []));
      await tx.productImage.deleteMany({ where: { productId } });
      await tx.productImage.createMany({ data: input.images.map((image, sortOrder) => ({ productId, imageUrl: image.storageKey ? `r2://${image.storageKey}` : image.imageUrl, storageKey: image.storageKey ?? null, altText: image.altText ?? null, sortOrder })) });
    }
    const stockDelta = (input.stockQuantity ?? current.stockQuantity) - current.stockQuantity;
    if (stockDelta) await tx.inventoryMovement.create({ data: { vendorProfileId, productId, type: InventoryMovementType.ADJUSTMENT, quantity: stockDelta, note: "Vendor product stock adjustment", recordedById: userId } });
    return tx.product.findUniqueOrThrow({ where: { id: productId }, include: productInclude });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }); }
  catch (error) { await cleanupUploadedImages(input.images); if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") fail("This vendor already has a product with this SKU.", 409); throw error; }
  const retainedKeys = new Set(imageInputs.flatMap((image) => image.storageKey ? [image.storageKey] : []));
  await Promise.allSettled(removedImageKeys.filter((key) => !retainedKeys.has(key)).map((key) => deleteFromR2(key)));
  return presentProduct(result);
}

export async function listVendorProductRevisions(userId: string, productId: string) {
  const vendorProfileId = await vendorForUser(userId);
  const product = await prisma.product.findFirst({ where: { id: productId, vendorProfileId }, select: { id: true } });
  if (!product) return null;
  const revisions = await prisma.productRevision.findMany({ where: { productId, vendorProfileId }, orderBy: { submittedAt: "desc" }, include: { images: { orderBy: { sortOrder: "asc" } }, reviewer: { select: { id: true, name: true } } } });
  return Promise.all(revisions.map(async (revision) => ({ ...revision, price: Number(revision.price), compareAtPrice: revision.compareAtPrice === null ? null : Number(revision.compareAtPrice), images: await Promise.all(revision.images.map(async (image) => ({ ...image, imageUrl: image.storageKey ? await generateR2SignedUrl(image.storageKey, 3600) : image.imageUrl }))) })));
}

export async function archiveVendorProduct(userId: string, productId: string) {
  const vendorProfileId = await vendorForUser(userId);
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findFirst({ where: { id: productId, vendorProfileId, status: { not: ProductStatus.ARCHIVED } }, select: { id: true } });
    if (!product) return null;
    if (await tx.productRevision.count({ where: { productId, status: ProductRevisionStatus.PENDING } })) fail("A product with a pending revision cannot be archived.", 409);
    if (await tx.orderItem.count({ where: { productId } })) fail("Products with historical orders cannot be deleted. Archive it by setting its status to INACTIVE.", 409);
    await tx.product.update({ where: { id: productId }, data: { status: ProductStatus.ARCHIVED } });
    return { id: productId, status: ProductStatus.ARCHIVED };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

export async function setVendorProductStatus(userId: string, productId: string, status: "DRAFT" | "ACTIVE" | "INACTIVE") {
  const vendorProfileId = await vendorForUser(userId);
  const product = await prisma.product.findFirst({ where: { id: productId, vendorProfileId, status: { not: ProductStatus.ARCHIVED } }, select: { id: true, listingStatus: true, vendor: { select: { verificationStatus: true, user: { select: { status: true } } } }, category: { select: { isActive: true, parent: { select: { isActive: true } } } }, brand: { select: { isActive: true } } } });
  if (!product) return null;
  if (status === "ACTIVE") {
    if (product.listingStatus !== ReviewStatus.APPROVED) fail("A product must be approved before activation.", 409);
    if (product.vendor.verificationStatus !== "APPROVED" || product.vendor.user.status !== "ACTIVE") fail("The vendor must be active and verified before activation.", 409);
    if (!product.category.isActive || product.category.parent?.isActive === false || product.brand?.isActive === false) fail("The product category and brand must be active before activation.", 409);
  }
  return prisma.product.update({ where: { id: product.id }, data: { status: status as ProductStatus } });
}
