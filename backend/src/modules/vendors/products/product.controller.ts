
import type { Request, Response, NextFunction } from "express";
import { UserRole } from "../../../generated/prisma/client.js";
import {
  createVendorProduct,
  listVendorProducts,
} from "./product.service.js";

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: UserRole;
  };
}

function sendError(
  error: unknown,
  res: Response,
  next: NextFunction,
) {
  if (
    error &&
    typeof error === "object" &&
    "statusCode" in error &&
    typeof error.statusCode === "number"
  ) {
    res.status(error.statusCode).json({
      success: false,
      message: error instanceof Error ? error.message : "Request failed.",
    });
    return;
  }

  next(error);
}

export async function getVendorProducts(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user || req.user.role !== UserRole.VENDOR) {
      res.status(403).json({
        success: false,
        message: "Vendor access required.",
      });
      return;
    }

    const products = await listVendorProducts(req.user.userId);

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    sendError(error, res, next);
  }
}

export async function postVendorProduct(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user || req.user.role !== UserRole.VENDOR) {
      res.status(403).json({
        success: false,
        message: "Vendor access required.",
      });
      return;
    }

    const {
      categoryId,
      brandId,
      name,
      description,
      sku,
      price,
      compareAtPrice,
      stockQuantity,
    } = req.body ?? {};

    if (
      typeof categoryId !== "string" ||
      !categoryId.trim() ||
      typeof name !== "string" ||
      name.trim().length < 2 ||
      typeof sku !== "string" ||
      !sku.trim()
    ) {
      res.status(400).json({
        success: false,
        message: "Category, product name, and SKU are required.",
      });
      return;
    }

    const parsedPrice = Number(price);
    const parsedCompareAtPrice =
      compareAtPrice === undefined || compareAtPrice === null ||
      compareAtPrice === ""
        ? undefined
        : Number(compareAtPrice);

    const parsedStock =
      stockQuantity === undefined ? 0 : Number(stockQuantity);

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      res.status(400).json({
        success: false,
        message: "Price must be a positive number.",
      });
      return;
    }

    if (
      parsedCompareAtPrice !== undefined &&
      (!Number.isFinite(parsedCompareAtPrice) ||
        parsedCompareAtPrice <= 0)
    ) {
      res.status(400).json({
        success: false,
        message: "Compare-at price must be a positive number.",
      });
      return;
    }

    if (
      !Number.isInteger(parsedStock) ||
      parsedStock < 0
    ) {
      res.status(400).json({
        success: false,
        message: "Stock quantity must be a non-negative integer.",
      });
      return;
    }

    if (
      description !== undefined &&
      description !== null &&
      typeof description !== "string"
    ) {
      res.status(400).json({
        success: false,
        message: "Description must be a string.",
      });
      return;
    }

    if (
      brandId !== undefined &&
      brandId !== null &&
      typeof brandId !== "string"
    ) {
      res.status(400).json({
        success: false,
        message: "Brand ID must be a string.",
      });
      return;
    }

    const product = await createVendorProduct(req.user.userId, {
      categoryId: categoryId.trim(),
      brandId: brandId?.trim() || undefined,
      name: name.trim(),
      description,
      sku: sku.trim(),
      price: parsedPrice,
      compareAtPrice: parsedCompareAtPrice,
      stockQuantity: parsedStock,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully and submitted for review.",
      data: product,
    });
  } catch (error) {
    sendError(error, res, next);
  }
}
