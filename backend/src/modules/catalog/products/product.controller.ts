import type { Request, Response } from "express";
import { z } from "zod";
import { Prisma, ProductStatus, ReviewStatus, UserStatus, VendorVerificationStatus } from "../../../generated/prisma/client.js";
import { prisma } from "../../../config/database.js";
import { generateR2SignedUrl } from "../../../services/r2Storage.service.js";

const querySchema = z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20), search: z.string().trim().max(160).optional(), categoryId: z.string().uuid().optional(), sortOrder: z.enum(["asc", "desc"]).default("desc") }).strict();
const visibleWhere: Prisma.ProductWhereInput = {
  status: ProductStatus.ACTIVE, listingStatus: ReviewStatus.APPROVED,
  vendor: { verificationStatus: VendorVerificationStatus.APPROVED, user: { status: UserStatus.ACTIVE } },
  category: { isActive: true, parent: { is: { isActive: true } } },
  OR: [{ brandId: null }, { brand: { is: { isActive: true } } }],
};
const publicInclude = { category: { select: { id: true, name: true, slug: true } }, brand: { select: { id: true, name: true, slug: true } }, vendor: { select: { businessName: true } }, images: { orderBy: { sortOrder: "asc" as const } } };
async function present<T extends { price: Prisma.Decimal; compareAtPrice: Prisma.Decimal | null; images: { storageKey: string | null; imageUrl: string }[] }>(row: T) {
  return { ...row, price: Number(row.price), compareAtPrice: row.compareAtPrice === null ? null : Number(row.compareAtPrice), images: await Promise.all(row.images.map(async (image) => ({ ...image, imageUrl: image.storageKey ? await generateR2SignedUrl(image.storageKey, 3600) : image.imageUrl }))) };
}

export async function getMarketplaceProducts(req: Request, res: Response) {
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ success: false, message: "Invalid product filters." });
  const { page, limit, search, categoryId, sortOrder } = parsed.data;
  const where: Prisma.ProductWhereInput = { AND: [visibleWhere, ...(categoryId ? [{ categoryId }] : []), ...(search ? [{ OR: [{ name: { contains: search, mode: "insensitive" as const } }, { description: { contains: search, mode: "insensitive" as const } }, { sku: { contains: search, mode: "insensitive" as const } }] }] : [])] };
  const [rows, total] = await prisma.$transaction([prisma.product.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: sortOrder }, include: publicInclude }), prisma.product.count({ where })]);
  return res.status(200).json({ success: true, data: await Promise.all(rows.map(present)), pagination: { currentPage: page, pageSize: limit, totalProducts: total, totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPreviousPage: page > 1 } });
}

export async function getMarketplaceProduct(req: Request, res: Response) {
  const id = z.string().uuid().safeParse(req.params.productId);
  if (!id.success) return res.status(400).json({ success: false, message: "Invalid product ID." });
  const product = await prisma.product.findFirst({ where: { AND: [visibleWhere, { id: id.data }] }, include: publicInclude });
  if (!product) return res.status(404).json({ success: false, message: "Product not found." });
  return res.status(200).json({ success: true, data: await present(product) });
}
