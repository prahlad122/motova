
import { randomUUID } from "node:crypto";
import { prisma } from "../../../config/database.js";
import {
  ProductStatus,
  ReviewStatus,
  InventoryMovementType,
} from "../../../generated/prisma/client.js";

type CreateProductInput = {
  categoryId: string;
  brandId?: string;
  name: string;
  description?: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  stockQuantity?: number;
};

function createSlug(name: string) {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `${base || "product"}-${randomUUID().slice(0, 8)}`;
}

async function getVendorProfileId(userId: string) {
  const vendor = await prisma.vendorProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!vendor) {
    throw Object.assign(new Error("Vendor profile not found."), {
      statusCode: 404,
    });
  }

  return vendor.id;
}

export async function listVendorProducts(userId: string) {
  const vendorProfileId = await getVendorProfileId(userId);

  const products = await prisma.product.findMany({
    where: {
      vendorProfileId,
      status: { not: ProductStatus.ARCHIVED },
    },
    include: {
      category: {
        select: { id: true, name: true },
      },
      brand: {
        select: { id: true, name: true },
      },
      images: {
        orderBy: { sortOrder: "asc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return products.map((product) => ({
    ...product,
    price: Number(product.price),
    compareAtPrice:
      product.compareAtPrice === null
        ? null
        : Number(product.compareAtPrice),
  }));
}

export async function createVendorProduct(
  userId: string,
  input: CreateProductInput,
) {
  const vendorProfileId = await getVendorProfileId(userId);

  const category = await prisma.category.findFirst({
    where: {
      id: input.categoryId,
      isActive: true,
    },
    select: { id: true },
  });

  if (!category) {
    throw Object.assign(
      new Error("The selected category does not exist or is inactive."),
      { statusCode: 400 },
    );
  }

  if (input.brandId) {
    const brand = await prisma.brand.findFirst({
      where: {
        id: input.brandId,
        isActive: true,
      },
      select: { id: true },
    });

    if (!brand) {
      throw Object.assign(
        new Error("The selected brand does not exist or is inactive."),
        { statusCode: 400 },
      );
    }
  }

  const existingSku = await prisma.product.findUnique({
    where: {
      vendorProfileId_sku: {
        vendorProfileId,
        sku: input.sku,
      },
    },
    select: { id: true },
  });

  if (existingSku) {
    throw Object.assign(
      new Error("You already have a product with this SKU."),
      { statusCode: 409 },
    );
  }

  return prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        vendorProfileId,
        categoryId: input.categoryId,
        brandId: input.brandId || null,
        name: input.name.trim(),
        slug: createSlug(input.name),
        description: input.description?.trim() || null,
        sku: input.sku.trim(),
        price: input.price,
        compareAtPrice: input.compareAtPrice ?? null,
        stockQuantity: input.stockQuantity ?? 0,
        status: ProductStatus.DRAFT,
        listingStatus: ReviewStatus.PENDING,
      },
      include: {
        category: { select: { id: true, name: true } },
        brand: { select: { id: true, name: true } },
        images: true,
      },
    });

    // Record initial stock when the product is created with stock.
    if ((input.stockQuantity ?? 0) > 0) {
      await tx.inventoryMovement.create({
        data: {
          vendorProfileId,
          productId: product.id,
          type: InventoryMovementType.STOCK_IN,
          quantity: input.stockQuantity!,
          note: "Initial product stock",
          recordedById: userId,
        },
      });
    }

    return {
      ...product,
      price: Number(product.price),
      compareAtPrice:
        product.compareAtPrice === null
          ? null
          : Number(product.compareAtPrice),
    };
  });
}
