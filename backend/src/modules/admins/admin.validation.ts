
import { z } from "zod";

export const createVendorSchema = z.object({
  // Vendor personal details
  name: z
    .string()
    .trim()
    .min(2, "Name must contain at least 2 characters.")
    .max(100, "Name cannot exceed 100 characters."),

  email: z
    .string()
    .trim()
    .email("Please provide a valid email address.")
    .transform((value) => value.toLowerCase()),

  mobile: z
    .string()
    .trim()
    .regex(
      /^\+?[1-9]\d{7,14}$/,
      "Please provide a valid mobile number.",
    ),

  // Business details
  businessName: z
    .string()
    .trim()
    .min(2, "Business name must contain at least 2 characters.")
    .max(150, "Business name cannot exceed 150 characters."),

  gstNumber: z
    .string()
    .trim()
    .toUpperCase()
    .regex(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/,
      "Please provide a valid GST number.",
    )
    .optional()
    .or(z.literal("")),

  businessAddress: z
    .string()
    .trim()
    .min(5, "Business address must contain at least 5 characters.")
    .max(500, "Business address cannot exceed 500 characters."),

  shippingAddress: z
    .string()
    .trim()
    .max(500, "Shipping address cannot exceed 500 characters.")
    .optional()
    .or(z.literal("")),

  storeManager: z
    .string()
    .trim()
    .max(100, "Store manager name cannot exceed 100 characters.")
    .optional()
    .or(z.literal("")),

  authorizedPerson: z
    .string()
    .trim()
    .max(100, "Authorized person name cannot exceed 100 characters.")
    .optional()
    .or(z.literal("")),
});


export const getVendorsQuerySchema = z.object({
  search: z.string().trim().optional(),

  status: z
    .enum(["ACTIVE", "PENDING", "SUSPENDED"])
    .optional(),

  verificationStatus: z
    .enum(["NOT_SUBMITTED", "PENDING", "APPROVED", "REJECTED"])
    .optional(),

  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const updateVendorStatusSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED"]),
});

export const reviewVendorDocumentSchema = z.object({
  decision: z.enum(["APPROVED", "REJECTED"]),
  note: z.string().trim().max(1000, "Review note cannot exceed 1000 characters.").optional(),
}).superRefine((value, context) => {
  if (value.decision === "REJECTED" && !value.note?.trim()) {
    context.addIssue({ code: "custom", path: ["note"], message: "A reason is required when rejecting a document." });
  }
});
