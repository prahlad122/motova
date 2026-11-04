import { z } from "zod";

const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must use YYYY-MM-DD.").refine((value) => {
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}, "Date is invalid.");
export const analyticsQuerySchema = z.object({
  period: z.enum(["today", "last7", "last30", "last90", "thisYear", "custom"]).default("last30"),
  startDate: dateOnly.optional(), endDate: dateOnly.optional(),
  groupBy: z.enum(["daily", "weekly", "monthly"]).optional(),
  page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(160).optional(), sortBy: z.string().max(32).optional(), sortOrder: z.enum(["asc", "desc"]).default("desc"),
  vendorId: z.string().uuid().optional(), categoryId: z.string().uuid().optional(), brandId: z.string().uuid().optional(),
  vendorStatus: z.enum(["ACTIVE", "PENDING", "SUSPENDED"]).optional(),
  customerStatus: z.enum(["ACTIVE", "PENDING", "SUSPENDED"]).optional(),
  verificationStatus: z.enum(["NOT_SUBMITTED", "PENDING", "APPROVED", "REJECTED"]).optional(),
  productStatus: z.enum(["DRAFT", "ACTIVE", "INACTIVE", "ARCHIVED"]).optional(),
  listingStatus: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  orderStatus: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]).optional(),
  paymentStatus: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED", "PARTIALLY_REFUNDED"]).optional(),
  stockStatus: z.enum(["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK"]).optional(),
}).strict().superRefine((value, context) => {
  if (value.period === "custom" && (!value.startDate || !value.endDate)) {
    context.addIssue({ code: "custom", path: ["startDate"], message: "Both startDate and endDate are required for a custom range." });
  }
  if ((value.startDate && !value.endDate) || (!value.startDate && value.endDate)) {
    context.addIssue({ code: "custom", path: ["endDate"], message: "Provide both startDate and endDate." });
  }
  if (value.startDate && value.endDate && value.startDate > value.endDate) {
    context.addIssue({ code: "custom", path: ["endDate"], message: "endDate must be on or after startDate." });
  }
});
export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;
