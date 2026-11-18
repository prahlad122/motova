import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { Prisma, UserRole } from "../../../generated/prisma/client.js";
import { generateR2SignedUrl, uploadProductImageToR2 } from "../../../services/r2Storage.service.js";
import { archiveVendorProduct, createVendorProduct, getVendorProduct, listVendorProductRevisions, listVendorProducts, setVendorProductStatus, updateVendorProduct, type VendorProductInput } from "./product.service.js";
import { prisma } from "../../../config/database.js";

type AuthReq = Request & { user?: { userId: string; role: UserRole } };
const imageSchema = z.object({ imageUrl: z.string().url().max(2048), storageKey: z.string().max(512).optional().nullable(), altText: z.string().max(200).optional().nullable() }).strict();
const bodySchema = z.object({
  categoryId: z.string().uuid(), brandId: z.string().uuid().nullable().optional(),
  name: z.string().trim().min(2).max(200), description: z.string().max(10000).nullable().optional(),
  sku: z.string().trim().min(1).max(100), price: z.coerce.number().finite().positive(),
  compareAtPrice: z.coerce.number().finite().positive().nullable().optional(),
  stockQuantity: z.coerce.number().int().min(0).max(2147483647).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "INACTIVE"]).optional(), images: z.array(imageSchema).max(6).optional(),
}).strict().refine((value) => value.compareAtPrice == null || value.compareAtPrice > value.price, { path: ["compareAtPrice"], message: "Compare-at price must be greater than selling price." });
const querySchema = z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20), search: z.string().trim().max(160).optional(), categoryId: z.string().uuid().optional(), brandId: z.string().uuid().optional(), status: z.enum(["DRAFT", "ACTIVE", "INACTIVE"]).optional(), listingStatus: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(), stockStatus: z.enum(["IN_STOCK", "OUT_OF_STOCK", "LOW_STOCK"]).optional(), sortBy: z.enum(["createdAt", "price", "name", "stockQuantity"]).default("createdAt"), sortOrder: z.enum(["asc", "desc"]).default("desc") }).strict();
const idSchema = z.string().uuid();

function sendError(error: unknown, res: Response, _next: NextFunction) {
  if (error && typeof error === "object" && "statusCode" in error && typeof error.statusCode === "number") return res.status(error.statusCode).json({ success: false, message: error instanceof Error ? error.message : "Product request failed." });
  if (error instanceof z.ZodError) return res.status(400).json({ success: false, message: "Validation failed.", errors: error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message })) });
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") return res.status(409).json({ success: false, message: "A product with this SKU already exists." });
    if (error.code === "P2025") return res.status(404).json({ success: false, message: "Product not found." });
    if (error.code === "P2003" || error.code === "P2014") return res.status(409).json({ success: false, message: "Product cannot be changed because it is referenced by another record." });
    if (error.code === "P2034") return res.status(409).json({ success: false, message: "This product changed concurrently. Refresh and try again." });
  }
  return res.status(500).json({ success: false, message: "An unexpected server error occurred." });
}
function parseId(req: Request, res: Response) { const id = idSchema.safeParse(req.params.productId); if (!id.success) { res.status(400).json({ success: false, message: "Invalid product ID." }); return null; } return id.data; }

export async function getVendorProducts(req: AuthReq, res: Response, next: NextFunction) {
  try { const query = querySchema.safeParse(req.query); if (!query.success) return res.status(400).json({ success: false, message: "Invalid product filters." }); const result = await listVendorProducts(req.user!.userId, query.data); return res.status(200).json({ success: true, data: result.products, counts: result.counts, pagination: result.pagination }); } catch (error) { return sendError(error, res, next); }
}
export async function getVendorProductById(req: AuthReq, res: Response, next: NextFunction) {
  const id = parseId(req, res); if (!id) return;
  try { const product = await getVendorProduct(req.user!.userId, id); if (!product) return res.status(404).json({ success: false, message: "Product not found." }); return res.status(200).json({ success: true, data: product }); } catch (error) { return sendError(error, res, next); }
}
export async function postVendorProduct(req: AuthReq, res: Response, next: NextFunction) {
  const parsed = bodySchema.safeParse(req.body); if (!parsed.success) return sendError(parsed.error, res, next);
  try { const product = await createVendorProduct(req.user!.userId, parsed.data as VendorProductInput); return res.status(201).json({ success: true, message: "Product created and submitted for review.", data: product }); } catch (error) { return sendError(error, res, next); }
}
export async function patchVendorProduct(req: AuthReq, res: Response, next: NextFunction) {
  const id = parseId(req, res); if (!id) return;
  const parsed = bodySchema.safeParse(req.body); if (!parsed.success) return sendError(parsed.error, res, next);
  try { const product = await updateVendorProduct(req.user!.userId, id, parsed.data as VendorProductInput); if (!product) return res.status(404).json({ success: false, message: "Product not found." }); return res.status(200).json({ success: true, message: "APPROVED" in product ? "Product revision submitted for review." : "Product updated and submitted for review.", data: product }); } catch (error) { return sendError(error, res, next); }
}
export async function getVendorProductRevisions(req: AuthReq, res: Response, next: NextFunction) {
  const id = parseId(req, res); if (!id) return;
  try { const revisions = await listVendorProductRevisions(req.user!.userId, id); if (!revisions) return res.status(404).json({ success: false, message: "Product not found." }); return res.status(200).json({ success: true, data: revisions }); } catch (error) { return sendError(error, res, next); }
}
export async function deleteVendorProduct(req: AuthReq, res: Response, next: NextFunction) {
  const id = parseId(req, res); if (!id) return;
  try { const result = await archiveVendorProduct(req.user!.userId, id); if (!result) return res.status(404).json({ success: false, message: "Product not found." }); return res.status(200).json({ success: true, message: "Product archived successfully.", data: result }); } catch (error) { return sendError(error, res, next); }
}
export async function patchVendorProductStatus(req: AuthReq, res: Response, next: NextFunction) {
  const id = parseId(req, res); if (!id) return;
  const parsed = z.object({ status: z.enum(["DRAFT", "ACTIVE", "INACTIVE"]) }).strict().safeParse(req.body);
  if (!parsed.success) return sendError(parsed.error, res, next);
  try { const product = await setVendorProductStatus(req.user!.userId, id, parsed.data.status); if (!product) return res.status(404).json({ success: false, message: "Product not found." }); return res.status(200).json({ success: true, data: product }); } catch (error) { return sendError(error, res, next); }
}
export async function postVendorProductImages(req: AuthReq, res: Response, next: NextFunction) {
  try {
    const vendor = await prisma.vendorProfile.findUnique({ where: { userId: req.user!.userId }, select: { id: true } });
    if (!vendor) return res.status(404).json({ success: false, message: "Vendor profile not found." });
    const files = req.files as Express.Multer.File[];
    const uploaded: { imageUrl: string; storageKey: string; altText: string }[] = [];
    try {
      for (const file of files) { const storageKey = await uploadProductImageToR2(file, vendor.id); uploaded.push({ imageUrl: await generateR2SignedUrl(storageKey, 3600), storageKey, altText: file.originalname.slice(0, 200) }); }
    } catch (error) { const { deleteFromR2 } = await import("../../../services/r2Storage.service.js"); await Promise.allSettled(uploaded.map((image) => deleteFromR2(image.storageKey))); throw error; }
    return res.status(201).json({ success: true, data: uploaded });
  } catch (error) { return sendError(error, res, next); }
}
