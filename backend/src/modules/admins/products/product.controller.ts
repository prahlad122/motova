import type { Request, Response, NextFunction } from "express";
import { ReviewStatus } from "../../../generated/prisma/client.js";
import {
  getAdminProduct,
  getPendingAdminProducts,
  listAdminProducts,
  reviewAdminProduct,
  updateAdminProduct,
  setAdminProductStatus,
  archiveAdminProduct,
} from "./product.service.js";
import {
  productListQuerySchema,
  productParamsSchema,
} from "./product.validation.js";

function validationError(
  res: Response,
  error: { issues: Array<{ path: PropertyKey[]; message: string }> },
  message: string,
) {
  return res
    .status(400)
    .json({
      success: false,
      message,
      errors: error.issues.map((issue) => ({
        field: issue.path.map(String).join("."),
        message: issue.message,
      })),
    });
}
function serviceError(error: unknown, res: Response, next: NextFunction) {
  if (
    error &&
    typeof error === "object" &&
    "statusCode" in error &&
    typeof error.statusCode === "number"
  )
    return res
      .status(error.statusCode)
      .json({
        success: false,
        message:
          error instanceof Error ? error.message : "Product request failed.",
      });
  return res
    .status(500)
    .json({ success: false, message: "An unexpected server error occurred." });
}
function parsedProductId(req: Request, res: Response) {
  const parsed = productParamsSchema.safeParse(req.params);
  if (!parsed.success) {
    validationError(res, parsed.error, "Invalid product ID.");
    return null;
  }
  return parsed.data.productId;
}

export async function getAdminProducts(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const query = productListQuerySchema.safeParse(req.query);
  if (!query.success)
    return validationError(res, query.error, "Invalid product filters.");
  try {
    const result = await listAdminProducts(query.data);
    return res
      .status(200)
      .json({
        success: true,
        message: "Products fetched successfully.",
        data: result.products,
        pagination: result.pagination,
      });
  } catch (error) {
    return serviceError(error, res, next);
  }
}
export async function getAdminPendingProducts(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const query = productListQuerySchema
    .pick({ page: true, limit: true, sortOrder: true })
    .safeParse(req.query);
  if (!query.success)
    return validationError(res, query.error, "Invalid pagination filters.");
  try {
    const result = await getPendingAdminProducts(query.data);
    return res
      .status(200)
      .json({
        success: true,
        message: "Pending products fetched successfully.",
        data: result.products,
        pagination: result.pagination,
      });
  } catch (error) {
    return serviceError(error, res, next);
  }
}
export async function getAdminProductById(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const productId = parsedProductId(req, res);
  if (!productId) return;
  try {
    const product = await getAdminProduct(productId);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    return res
      .status(200)
      .json({
        success: true,
        message: "Product fetched successfully.",
        data: product,
      });
  } catch (error) {
    return serviceError(error, res, next);
  }
}
export async function approveAdminProduct(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const productId = parsedProductId(req, res);
  if (!productId) return;
  const reviewerId = (req as Request & { user?: { userId: string } }).user
    ?.userId;
  if (!reviewerId)
    return res
      .status(401)
      .json({ success: false, message: "Admin identity was not found." });
  try {
    const product = await reviewAdminProduct(
      productId,
      reviewerId,
      ReviewStatus.APPROVED,
    );
    return res
      .status(200)
      .json({
        success: true,
        message: "Product approved successfully.",
        data: product,
      });
  } catch (error) {
    return serviceError(error, res, next);
  }
}
export async function rejectAdminProduct(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const productId = parsedProductId(req, res);
  if (!productId) return;
  const reason = (req.body as { reason: string }).reason;
  const reviewerId = (req as Request & { user?: { userId: string } }).user
    ?.userId;
  if (!reviewerId)
    return res
      .status(401)
      .json({ success: false, message: "Admin identity was not found." });
  try {
    const product = await reviewAdminProduct(
      productId,
      reviewerId,
      ReviewStatus.REJECTED,
      reason,
    );
    return res
      .status(200)
      .json({
        success: true,
        message: "Product rejected successfully.",
        data: product,
      });
  } catch (error) {
    return serviceError(error, res, next);
  }
}
export async function patchAdminProduct(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const productId = parsedProductId(req, res);
  if (!productId) return;
  const adminId = (req as Request & { user?: { userId: string } }).user?.userId;
  if (!adminId)
    return res
      .status(401)
      .json({ success: false, message: "Admin identity was not found." });
  try {
    const product = await updateAdminProduct(productId, adminId, req.body);
    return res
      .status(200)
      .json({
        success: true,
        message: product.requiresReview
          ? "Product updated and returned to pending review."
          : "Product updated successfully.",
        data: product,
      });
  } catch (error) {
    return serviceError(error, res, next);
  }
}
export async function patchAdminProductStatus(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const productId = parsedProductId(req, res);
  if (!productId) return;
  const status = (req.body as { status: "DRAFT" | "ACTIVE" | "INACTIVE" })
    .status;
  try {
    const product = await setAdminProductStatus(productId, status);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    return res
      .status(200)
      .json({
        success: true,
        message: `Product ${status.toLowerCase()} successfully.`,
        data: product,
      });
  } catch (error) {
    return serviceError(error, res, next);
  }
}
export async function deleteAdminProduct(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const productId = parsedProductId(req, res);
  if (!productId) return;
  try {
    const product = await archiveAdminProduct(productId);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    return res
      .status(200)
      .json({
        success: true,
        message:
          "Product archived successfully. Product and related records are preserved.",
        data: product,
      });
  } catch (error) {
    return serviceError(error, res, next);
  }
}
