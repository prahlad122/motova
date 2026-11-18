import {
  Prisma,
  ProductStatus,
  ReviewStatus,
  UserStatus,
  VendorVerificationStatus,
  InventoryMovementType,
  ProductRevisionStatus,
} from "../../../generated/prisma/client.js";
import { randomUUID } from "node:crypto";
import { prisma } from "../../../config/database.js";
import type { ProductListQuery } from "./product.validation.js";
import { deleteFromR2, generateR2SignedUrl } from "../../../services/r2Storage.service.js";

const LOW_STOCK_THRESHOLD = 5;
function fail(message: string, statusCode: number): never {
  throw Object.assign(new Error(message), { statusCode });
}
function safePrismaError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const target = String(error.meta?.target ?? "");
      fail(
        target.includes("slug")
          ? "A product with this slug already exists."
          : "This vendor already has a product with this SKU.",
        409,
      );
    }
    if (error.code === "P2025") fail("Product not found.", 404);
    if (error.code === "P2034") fail("This product review changed concurrently. Reload and try again.", 409);
    if (error.code === "P2003" || error.code === "P2014")
      fail(
        "Product cannot be changed because it is referenced by another record.",
        409,
      );
  }
  throw error;
}

function productWhere(query: ProductListQuery): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {
    status: query.status ?? { not: ProductStatus.ARCHIVED },
    ...(query.vendorId ? { vendorProfileId: query.vendorId } : {}),
    ...(query.categoryId ? { categoryId: query.categoryId } : {}),
    ...(query.brandId ? { brandId: query.brandId } : {}),
    ...(query.listingStatus && query.listingStatus !== ReviewStatus.PENDING ? { listingStatus: query.listingStatus } : {}),
    ...(query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: "insensitive" } },
            { sku: { contains: query.search, mode: "insensitive" } },
            { vendor: { is: { businessName: { contains: query.search, mode: "insensitive" } } } },
            { vendor: { is: { user: { is: { email: { contains: query.search, mode: "insensitive" } } } } } },
            { vendor: { is: { user: { is: { name: { contains: query.search, mode: "insensitive" } } } } } },
          ],
        }
      : {}),
  };
  if (query.listingStatus === ReviewStatus.PENDING) {
    const searchOr = where.OR;
    delete where.OR;
    where.AND = [
      ...(searchOr ? [{ OR: searchOr }] : []),
      { OR: [{ listingStatus: ReviewStatus.PENDING }, { revisions: { some: { status: ProductRevisionStatus.PENDING } } }] },
      { status: { not: ProductStatus.ARCHIVED } },
    ];
  }
  if (query.stockStatus === "IN_STOCK") where.stockQuantity = { gt: 0 };
  if (query.stockStatus === "LOW_STOCK")
    where.stockQuantity = { gt: 0, lte: LOW_STOCK_THRESHOLD };
  if (query.stockStatus === "OUT_OF_STOCK") where.stockQuantity = 0;
  return where;
}

const productListInclude = {
  vendor: {
    select: {
      id: true,
      businessName: true,
      verificationStatus: true,
      user: { select: { id: true, name: true, email: true, status: true } },
    },
  },
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
      parent: { select: { id: true, name: true, slug: true } },
    },
  },
  brand: { select: { id: true, name: true, slug: true, isActive: true } },
  images: { orderBy: { sortOrder: "asc" as const } },
  revisions: { where: { status: ProductRevisionStatus.PENDING }, select: { id: true, status: true }, take: 1 },
};

async function presentProductImages<T extends { images: { imageUrl: string; storageKey: string | null }[] }>(product: T) {
  return { ...product, images: await Promise.all(product.images.map(async (image) => ({ ...image, imageUrl: image.storageKey ? await generateR2SignedUrl(image.storageKey, 3600) : image.imageUrl }))) };
}

export async function listAdminProducts(query: ProductListQuery) {
  const where = productWhere(query);
  const [products, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      orderBy: { [query.sortBy]: query.sortOrder },
      include: productListInclude,
    }),
    prisma.product.count({ where }),
  ]);
  return {
    products: await Promise.all(products.map(async (product) => ({
      ...await presentProductImages(product),
      price: Number(product.price),
      compareAtPrice:
        product.compareAtPrice === null ? null : Number(product.compareAtPrice),
    }))),
    pagination: {
      currentPage: query.page,
      pageSize: query.limit,
      totalProducts: total,
      totalPages: Math.ceil(total / query.limit),
      hasNextPage: query.page * query.limit < total,
      hasPreviousPage: query.page > 1,
    },
  };
}

export async function getAdminProduct(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      vendor: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              mobile: true,
              status: true,
            },
          },
        },
      },
      category: {
        include: { parent: { select: { id: true, name: true, slug: true } } },
      },
      brand: true,
      images: { orderBy: { sortOrder: "asc" } },
      listingReviews: {
        orderBy: { reviewedAt: "desc" },
        include: {
          reviewer: { select: { id: true, name: true, email: true } },
        },
      },
      revisions: {
        orderBy: { submittedAt: "desc" },
        include: {
          category: { select: { id: true, name: true } },
          brand: { select: { id: true, name: true } },
          images: { orderBy: { sortOrder: "asc" } },
          reviewer: { select: { id: true, name: true, email: true } },
        },
      },
      inventoryMovements: {
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { recordedBy: { select: { id: true, name: true } } },
      },
      _count: {
        select: {
          cartItems: true,
          wishlistItems: true,
          orderItems: true,
          reviews: true,
        },
      },
    },
  });
  return (
    product && {
      ...await presentProductImages(product),
      price: Number(product.price),
      compareAtPrice:
        product.compareAtPrice === null ? null : Number(product.compareAtPrice),
      revisions: await Promise.all(product.revisions.map(async (revision) => ({
        ...await presentProductImages(revision),
        price: Number(revision.price),
        compareAtPrice: revision.compareAtPrice === null ? null : Number(revision.compareAtPrice),
      }))),
    }
  );
}

export async function getPendingAdminProducts(
  query: Pick<ProductListQuery, "page" | "limit" | "sortOrder">,
) {
  const result = await listAdminProducts({
    ...query,
    listingStatus: ReviewStatus.PENDING,
    sortBy: "createdAt",
  });
  return result;
}

export async function reviewAdminProduct(
  productId: string,
  reviewerId: string,
  decision: "APPROVED" | "REJECTED",
  note?: string,
) {
  if (decision === ReviewStatus.REJECTED && !note?.trim())
    fail("A rejection reason is required.", 400);
  try {
    return await prisma.$transaction(
      async (tx) => {
        const changed = await tx.product.updateMany({
          where: { id: productId, listingStatus: ReviewStatus.PENDING, status: { not: ProductStatus.ARCHIVED } },
          data: {
            listingStatus: decision,
            ...(decision === ReviewStatus.APPROVED
              ? {
                  approvedAt: new Date(),
                  listingNote: null,
                }
              : { listingNote: note!.trim() }),
          },
        });
        if (!changed.count) {
          const current = await tx.product.findUnique({
            where: { id: productId },
            select: { listingStatus: true },
          });
          if (!current) fail("Product not found.", 404);
          fail("Only pending products can be reviewed.", 409);
        }
        await tx.listingReview.create({
          data: {
            productId,
            reviewerId,
            status: decision,
            note: note?.trim() || null,
          },
        });
        return tx.product.findUniqueOrThrow({
          where: { id: productId },
          include: productListInclude,
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  } catch (error) {
    safePrismaError(error);
  }
}

type UpdateProductInput = {
  name?: string;
  description?: string | null;
  categoryId?: string;
  brandId?: string | null;
  price?: number;
  compareAtPrice?: number | null;
  sku?: string;
  slug?: string;
  status?: ProductStatus;
  stockQuantity?: number;
};
export async function updateAdminProduct(
  productId: string,
  adminId: string,
  input: UpdateProductInput,
) {
  try {
    return await prisma.$transaction(
      async (tx) => {
        const current = await tx.product.findUnique({
          where: { id: productId },
          select: {
            id: true,
            vendorProfileId: true,
            name: true,
            description: true,
            categoryId: true,
            brandId: true,
            price: true,
            compareAtPrice: true,
            sku: true,
            slug: true,
            status: true,
            listingStatus: true,
            stockQuantity: true,
            images: { orderBy: { sortOrder: "asc" }, select: { imageUrl: true, storageKey: true, altText: true, sortOrder: true } },
            vendor: {
              select: {
                verificationStatus: true,
                user: { select: { status: true } },
              },
            },
            category: {
              select: {
                isActive: true,
                parent: { select: { isActive: true } },
              },
            },
            brand: { select: { isActive: true } },
          },
        });
        if (!current) fail("Product not found.", 404);
        if (input.categoryId) {
          const category = await tx.category.findUnique({
            where: { id: input.categoryId },
            select: { id: true },
          });
          if (!category) fail("Category not found.", 400);
        }
        if (input.brandId) {
          const brand = await tx.brand.findUnique({
            where: { id: input.brandId },
            select: { id: true },
          });
          if (!brand) fail("Brand not found.", 400);
        }
        const sku = input.sku?.trim();
        if (
          sku &&
          sku !== current.sku &&
          (await tx.product.findUnique({
            where: {
              vendorProfileId_sku: {
                vendorProfileId: current.vendorProfileId,
                sku,
              },
            },
            select: { id: true },
          }))
        )
          fail("This vendor already has a product with this SKU.", 409);
        const slug = input.slug?.trim().toLowerCase();
        if (
          slug &&
          slug !== current.slug &&
          (await tx.product.findUnique({
            where: { slug },
            select: { id: true },
          }))
        )
          fail("A product with this slug already exists.", 409);
        const significantChange =
          (input.name !== undefined &&
            input.name.trim().replace(/\s+/g, " ") !== current.name) ||
          (input.description !== undefined &&
            (input.description?.trim() || null) !== current.description) ||
          (input.categoryId !== undefined &&
            input.categoryId !== current.categoryId) ||
          (input.brandId !== undefined && input.brandId !== current.brandId) ||
          (input.price !== undefined &&
            input.price !== Number(current.price)) ||
          (input.compareAtPrice !== undefined &&
            input.compareAtPrice !==
              (current.compareAtPrice === null
                ? null
                : Number(current.compareAtPrice)));
        const listingDetailsChanged = significantChange || (input.sku !== undefined && input.sku.trim() !== current.sku);
        const requiresReview =
          listingDetailsChanged && current.listingStatus !== ReviewStatus.PENDING;
        const effectivePrice = input.price ?? Number(current.price);
        const effectiveCompareAt =
          input.compareAtPrice === undefined
            ? current.compareAtPrice
            : input.compareAtPrice;
        if (
          effectiveCompareAt !== null &&
          effectiveCompareAt !== undefined &&
          Number(effectiveCompareAt) <= effectivePrice
        )
          fail("Compare-at price must be greater than price.", 400);
        if (input.status === ProductStatus.ACTIVE) {
          if (current.listingStatus !== ReviewStatus.APPROVED) fail("A product must be approved before it can be activated.", 409);
          if (current.vendor.user.status !== UserStatus.ACTIVE || current.vendor.verificationStatus !== VendorVerificationStatus.APPROVED) fail("The vendor must be active and verified before this product can be activated.", 409);
          if (!current.category.isActive || current.category.parent?.isActive === false || current.brand?.isActive === false) fail("The product category and brand must be active before activation.", 409);
        }
        const nextStock = input.stockQuantity ?? current.stockQuantity;
        if (requiresReview && current.listingStatus === ReviewStatus.APPROVED) {
          if (await tx.productRevision.count({ where: { productId, status: ProductRevisionStatus.PENDING } })) fail("A pending product revision already exists.", 409);
          const revision = await tx.productRevision.create({ data: {
            productId, vendorProfileId: current.vendorProfileId,
            categoryId: input.categoryId ?? current.categoryId, brandId: input.brandId === undefined ? current.brandId : input.brandId,
            name: input.name?.trim().replace(/\s+/g, " ") ?? current.name,
            description: input.description === undefined ? current.description : input.description?.trim() || null,
            sku: sku ?? current.sku, price: input.price ?? Number(current.price),
            compareAtPrice: input.compareAtPrice === undefined ? current.compareAtPrice : input.compareAtPrice,
            stockQuantity: nextStock,
            images: { create: current.images.map((image) => ({ imageUrl: image.imageUrl, storageKey: image.storageKey, altText: image.altText, sortOrder: image.sortOrder })) },
          }, include: { images: { orderBy: { sortOrder: "asc" } } } });
          if (input.status !== undefined && input.status !== current.status) await tx.product.update({ where: { id: productId }, data: { status: input.status } });
          return { ...revision, price: Number(revision.price), compareAtPrice: revision.compareAtPrice === null ? null : Number(revision.compareAtPrice), requiresReview: true };
        }
        if (input.status === ProductStatus.ACTIVE) {
          if (current.listingStatus !== ReviewStatus.APPROVED)
            fail("A product must be approved before it can be activated.", 409);
          if (
            current.vendor.user.status !== UserStatus.ACTIVE ||
            current.vendor.verificationStatus !==
              VendorVerificationStatus.APPROVED
          )
            fail(
              "The vendor must be active and verified before this product can be activated.",
              409,
            );
          if (
            !current.category.isActive ||
            current.category.parent?.isActive === false ||
            current.brand?.isActive === false
          )
            fail(
              "The product category and brand must be active before activation.",
              409,
            );
        }
        const stockDelta = nextStock - current.stockQuantity;
        const updated = await tx.product.update({
          where: { id: productId },
          data: {
            ...(input.name === undefined
              ? {}
              : { name: input.name.trim().replace(/\s+/g, " ") }),
            ...(input.description === undefined
              ? {}
              : { description: input.description?.trim() || null }),
            ...(input.categoryId === undefined
              ? {}
              : { categoryId: input.categoryId }),
            ...(input.brandId === undefined ? {} : { brandId: input.brandId }),
            ...(input.price === undefined ? {} : { price: input.price }),
            ...(input.compareAtPrice === undefined
              ? {}
              : { compareAtPrice: input.compareAtPrice }),
            ...(sku === undefined ? {} : { sku }),
            ...(slug === undefined ? {} : { slug }),
            ...(input.status === undefined ? {} : { status: input.status }),
            ...(input.stockQuantity === undefined
              ? {}
              : { stockQuantity: input.stockQuantity }),
            ...(requiresReview
              ? {
                  listingStatus: ReviewStatus.PENDING,
                  listingNote: null,
                  approvedAt: null,
                }
              : {}),
          },
          include: productListInclude,
        });
        if (stockDelta !== 0)
          await tx.inventoryMovement.create({
            data: {
              vendorProfileId: current.vendorProfileId,
              productId,
              type: InventoryMovementType.ADJUSTMENT,
              quantity: stockDelta,
              note: `Admin stock adjustment (${current.stockQuantity} → ${nextStock}).`,
              recordedById: adminId,
            },
          });
        return {
          ...updated,
          price: Number(updated.price),
          compareAtPrice:
            updated.compareAtPrice === null
              ? null
              : Number(updated.compareAtPrice),
          requiresReview,
        };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  } catch (error) {
    safePrismaError(error);
  }
}

export async function setAdminProductStatus(
  productId: string,
  status: ProductStatus,
) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      vendor: {
        select: {
          verificationStatus: true,
          user: { select: { status: true } },
        },
      },
      category: {
        select: { isActive: true, parent: { select: { isActive: true } } },
      },
      brand: { select: { isActive: true } },
    },
  });
  if (!product) return null;
  if (
    product.status === ProductStatus.ARCHIVED &&
    status !== ProductStatus.ARCHIVED
  )
    fail("Archived products cannot be reactivated.", 409);
  if (status === ProductStatus.ACTIVE) {
    if (product.listingStatus !== ReviewStatus.APPROVED)
      fail("A product must be approved before it can be activated.", 409);
    if (
      product.vendor.user.status !== UserStatus.ACTIVE ||
      product.vendor.verificationStatus !== VendorVerificationStatus.APPROVED
    )
      fail(
        "The vendor must be active and verified before this product can be activated.",
        409,
      );
    if (
      !product.category.isActive ||
      product.category.parent?.isActive === false ||
      product.brand?.isActive === false
    )
      fail(
        "The product category and brand must be active before activation.",
        409,
      );
  }
  try {
    return await prisma.product.update({
      where: { id: productId },
      data: { status },
    });
  } catch (error) {
    safePrismaError(error);
  }
}

export async function archiveAdminProduct(productId: string) {
  try {
    return await prisma.$transaction(
      async (tx) => {
        const product = await tx.product.findUnique({
          where: { id: productId },
          select: { id: true, status: true },
        });
        if (!product) return null;
        const historicalOrders = await tx.orderItem.count({
          where: { productId },
        });
        if (historicalOrders > 0)
          fail(
            "Products with historical order references cannot be deleted.",
            409,
          );
        return tx.product.update({
          where: { id: productId },
          data: { status: ProductStatus.ARCHIVED },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  } catch (error) {
    safePrismaError(error);
  }
}

export async function getAdminProductStats() {
  const [total, pending, approved, rejected, active, inactive] = await Promise.all([
    prisma.product.count({ where: { status: { not: ProductStatus.ARCHIVED } } }),
    prisma.product.count({ where: { listingStatus: ReviewStatus.PENDING, status: { not: ProductStatus.ARCHIVED } } }),
    prisma.product.count({ where: { listingStatus: ReviewStatus.APPROVED, status: { not: ProductStatus.ARCHIVED } } }),
    prisma.product.count({ where: { listingStatus: ReviewStatus.REJECTED, status: { not: ProductStatus.ARCHIVED } } }),
    prisma.product.count({ where: { status: ProductStatus.ACTIVE } }),
    prisma.product.count({ where: { status: ProductStatus.INACTIVE } }),
  ]);
  const pendingRevisions = await prisma.productRevision.count({ where: { status: ProductRevisionStatus.PENDING, product: { status: { not: ProductStatus.ARCHIVED } } } });
  return { total, pending: pending + pendingRevisions, approved, rejected, active, inactive, pendingRevisions };
}

export async function reviewAdminProductRevision(revisionId: string, reviewerId: string, decision: "APPROVED" | "REJECTED", reason?: string) {
  if (decision === "REJECTED" && !reason?.trim()) fail("A rejection reason is required.", 400);
  const oldStorageKeys: string[] = [];
  try {
    const result = await prisma.$transaction(async (tx) => {
      const revision = await tx.productRevision.findUnique({ where: { id: revisionId }, include: { images: { orderBy: { sortOrder: "asc" } } } });
      if (!revision) fail("Product revision not found.", 404);
      if (revision.status !== ProductRevisionStatus.PENDING) fail("Only pending revisions can be reviewed.", 409);
      const changed = await tx.productRevision.updateMany({ where: { id: revisionId, status: ProductRevisionStatus.PENDING }, data: { status: decision, reviewerId, reviewedAt: new Date(), rejectionReason: decision === "REJECTED" ? reason!.trim() : null } });
      if (!changed.count) fail("Revision was already reviewed by another administrator.", 409);
      const product = await tx.product.findUnique({ where: { id: revision.productId }, select: { id: true, vendorProfileId: true, sku: true, stockQuantity: true, status: true } });
      if (!product) fail("Product not found.", 404);
      if (product.status === ProductStatus.ARCHIVED) fail("Archived products cannot be reviewed.", 409);
      if (decision === "APPROVED") {
        if (revision.sku !== product.sku && await tx.product.findUnique({ where: { vendorProfileId_sku: { vendorProfileId: product.vendorProfileId, sku: revision.sku } }, select: { id: true } })) fail("The proposed SKU is already used by this vendor.", 409);
        const oldImages = await tx.productImage.findMany({ where: { productId: product.id }, select: { storageKey: true } });
        oldStorageKeys.push(...oldImages.flatMap((image) => image.storageKey ? [image.storageKey] : []));
        const slug = `${revision.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "product")}-${randomUUID().slice(0, 8)}`;
        await tx.product.update({ where: { id: product.id }, data: {
          name: revision.name, description: revision.description, categoryId: revision.categoryId, brandId: revision.brandId,
          sku: revision.sku, slug, price: revision.price, compareAtPrice: revision.compareAtPrice,
          stockQuantity: revision.stockQuantity, listingStatus: ReviewStatus.APPROVED, listingNote: null, approvedAt: new Date(),
        } });
        await tx.productImage.deleteMany({ where: { productId: product.id } });
        if (revision.images.length) await tx.productImage.createMany({ data: revision.images.map((image) => ({ productId: product.id, imageUrl: image.imageUrl, storageKey: image.storageKey, altText: image.altText, sortOrder: image.sortOrder })) });
        const delta = revision.stockQuantity - product.stockQuantity;
        if (delta) await tx.inventoryMovement.create({ data: { vendorProfileId: product.vendorProfileId, productId: product.id, type: InventoryMovementType.ADJUSTMENT, quantity: delta, note: "Stock updated with approved product revision", recordedById: reviewerId } });
      }
      await tx.listingReview.create({ data: { productId: revision.productId, reviewerId, status: decision, note: decision === "REJECTED" ? reason!.trim() : "Product revision approved." } });
      return tx.productRevision.findUniqueOrThrow({ where: { id: revisionId }, include: { product: { include: productListInclude }, images: { orderBy: { sortOrder: "asc" } } } });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    if (decision === "APPROVED" && oldStorageKeys.length) {
      const revisionImageKeys = result.images.flatMap((image) => image.storageKey ? [image.storageKey] : []);
      await Promise.allSettled(oldStorageKeys.filter((key) => !revisionImageKeys.includes(key)).map((key) => deleteFromR2(key)));
    }
    return { ...result, price: Number(result.price), compareAtPrice: result.compareAtPrice === null ? null : Number(result.compareAtPrice) };
  } catch (error) { safePrismaError(error); }
}
