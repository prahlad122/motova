import type { Request, Response, NextFunction } from "express";
import { categoryListQuerySchema, categoryParamsSchema, categoryStatusSchema, createCategorySchema, updateCategorySchema } from "./category.validation.js";
import { createCategory, deleteCategory, getCategory, getCategoryStats, listCategories, setCategoryStatus, updateCategory, uploadCategoryImage } from "./category.service.js";

function validationError(res: Response, error: { issues: Array<{ path: PropertyKey[]; message: string }> }, message: string) {
  return res.status(400).json({ success: false, message, errors: error.issues.map((issue) => ({ field: issue.path.map(String).join("."), message: issue.message })) });
}
function sendServiceError(error: unknown, res: Response, next: NextFunction) {
  if (error && typeof error === "object" && "statusCode" in error && typeof error.statusCode === "number") return res.status(error.statusCode).json({ success: false, message: error instanceof Error ? error.message : "Category request failed." });
  // Keep Prisma internals and database details out of API responses.
  return res.status(500).json({ success: false, message: "An unexpected server error occurred." });
}
export async function postCategory(req: Request, res: Response, next: NextFunction) {
  const parsed = createCategorySchema.safeParse(req.body); if (!parsed.success) return validationError(res, parsed.error, "Invalid category details.");
  try { return res.status(201).json({ success: true, message: "Category created successfully.", data: await createCategory(parsed.data) }); } catch (error) { return sendServiceError(error, res, next); }
}
export async function getCategories(req: Request, res: Response, next: NextFunction) {
  const parsed = categoryListQuerySchema.safeParse(req.query); if (!parsed.success) return validationError(res, parsed.error, "Invalid category listing filters.");
  try { const result = await listCategories(parsed.data); return res.status(200).json({ success: true, message: "Categories fetched successfully.", data: result.categories, pagination: result.pagination }); } catch (error) { return sendServiceError(error, res, next); }
}
export async function getCategoriesStats(_req: Request, res: Response, next: NextFunction) {
  try { return res.status(200).json({ success: true, message: "Category statistics fetched successfully.", data: await getCategoryStats() }); } catch (error) { return sendServiceError(error, res, next); }
}
export async function postCategoryImage(req: Request, res: Response, next: NextFunction) {
  if (!req.file) return res.status(400).json({ success: false, message: "Choose a category image to upload." });
  try { return res.status(201).json({ success: true, message: "Category image uploaded successfully.", data: await uploadCategoryImage(req.file) }); }
  catch (error) { return next(error); }
}
export async function getCategoryById(req: Request, res: Response, next: NextFunction) {
  const params = categoryParamsSchema.safeParse(req.params); if (!params.success) return validationError(res, params.error, "Invalid category ID.");
  try { const category = await getCategory(params.data.categoryId); if (!category) return res.status(404).json({ success: false, message: "Category not found." }); return res.status(200).json({ success: true, message: "Category fetched successfully.", data: category }); } catch (error) { return sendServiceError(error, res, next); }
}
export async function patchCategory(req: Request, res: Response, next: NextFunction) {
  const params = categoryParamsSchema.safeParse(req.params); if (!params.success) return validationError(res, params.error, "Invalid category ID.");
  const parsed = updateCategorySchema.safeParse(req.body); if (!parsed.success) return validationError(res, parsed.error, "Invalid category details.");
  try { const category = await updateCategory(params.data.categoryId, parsed.data); if (!category) return res.status(404).json({ success: false, message: "Category not found." }); return res.status(200).json({ success: true, message: "Category updated successfully.", data: category }); } catch (error) { return sendServiceError(error, res, next); }
}
export async function removeCategory(req: Request, res: Response, next: NextFunction) {
  const params = categoryParamsSchema.safeParse(req.params); if (!params.success) return validationError(res, params.error, "Invalid category ID.");
  try { const result = await deleteCategory(params.data.categoryId); if (result === "not-found") return res.status(404).json({ success: false, message: "Category not found." }); return res.status(200).json({ success: true, message: "Category deleted successfully." }); } catch (error) { return sendServiceError(error, res, next); }
}
export async function patchCategoryStatus(req: Request, res: Response, next: NextFunction) {
  const params = categoryParamsSchema.safeParse(req.params); if (!params.success) return validationError(res, params.error, "Invalid category ID.");
  const parsed = categoryStatusSchema.safeParse(req.body); if (!parsed.success) return validationError(res, parsed.error, "Invalid category status.");
  try { const category = await setCategoryStatus(params.data.categoryId, parsed.data.isActive); if (!category) return res.status(404).json({ success: false, message: "Category not found." }); return res.status(200).json({ success: true, message: `Category ${parsed.data.isActive ? "activated" : "deactivated"} successfully.`, data: category }); } catch (error) { return sendServiceError(error, res, next); }
}
