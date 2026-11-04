import type { Request, Response, NextFunction } from "express";
import { analyticsQuerySchema } from "./analytics.validation.js";
import { getAnalyticsOverview, getCustomerAnalytics, getInventoryAnalytics, getProductAnalytics, getSalesAnalytics, getVendorAnalytics } from "./analytics.service.js";

function sendError(error: unknown, res: Response, next: NextFunction) {
  if (error && typeof error === "object" && "statusCode" in error && typeof error.statusCode === "number") return res.status(error.statusCode).json({ success: false, message: error instanceof Error ? error.message : "Analytics request failed." });
  return res.status(500).json({ success: false, message: "An unexpected server error occurred." });
}
async function run(req: Request, res: Response, next: NextFunction, load: (query: ReturnType<typeof analyticsQuerySchema.parse>) => Promise<unknown>, message: string) {
  const parsed = analyticsQuerySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ success: false, message: "Invalid analytics filters.", errors: parsed.error.issues.map((issue) => ({ field: issue.path.map(String).join("."), message: issue.message })) });
  try { return res.status(200).json({ success: true, message, data: await load(parsed.data) }); }
  catch (error) { return sendError(error, res, next); }
}
export function getAnalyticsOverviewController(req: Request, res: Response, next: NextFunction) { return run(req, res, next, getAnalyticsOverview, "Analytics overview fetched successfully."); }
export function getSalesAnalyticsController(req: Request, res: Response, next: NextFunction) { return run(req, res, next, getSalesAnalytics, "Sales analytics fetched successfully."); }
export function getVendorAnalyticsController(req: Request, res: Response, next: NextFunction) { return run(req, res, next, getVendorAnalytics, "Vendor analytics fetched successfully."); }
export function getProductAnalyticsController(req: Request, res: Response, next: NextFunction) { return run(req, res, next, getProductAnalytics, "Product analytics fetched successfully."); }
export function getCustomerAnalyticsController(req: Request, res: Response, next: NextFunction) { return run(req, res, next, getCustomerAnalytics, "Customer analytics fetched successfully."); }
export function getInventoryAnalyticsController(req: Request, res: Response, next: NextFunction) { return run(req, res, next, getInventoryAnalytics, "Inventory analytics fetched successfully."); }
