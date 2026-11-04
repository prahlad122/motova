import type { Request, Response, NextFunction } from "express";
import { brandListQuerySchema, createBrandSchema } from "./brand.validation.js";
import { createAdminBrand, listAdminBrands } from "./brand.service.js";

export async function postAdminBrand(req: Request, res: Response, next: NextFunction) {
  const input = createBrandSchema.safeParse(req.body);
  if (!input.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid brand details.",
      errors: input.error.issues.map((issue) => ({ field: issue.path.map(String).join("."), message: issue.message })),
    });
  }
  try {
    return res.status(201).json({ success: true, message: "Brand created successfully.", data: await createAdminBrand(input.data) });
  } catch (error) {
    if (error && typeof error === "object" && "statusCode" in error && error.statusCode === 409) {
      return res.status(409).json({ success: false, message: error instanceof Error ? error.message : "Brand already exists." });
    }
    return next(error);
  }
}

export async function getAdminBrands(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const query = brandListQuerySchema.safeParse(req.query);
  if (!query.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid brand listing filters.",
      errors: query.error.issues.map((issue) => ({
        field: issue.path.map(String).join("."),
        message: issue.message,
      })),
    });
  }

  try {
    const result = await listAdminBrands(query.data);
    return res.status(200).json({
      success: true,
      message: "Brands fetched successfully.",
      data: result.brands,
      pagination: result.pagination,
    });
  } catch (error) {
    return next(error);
  }
}
