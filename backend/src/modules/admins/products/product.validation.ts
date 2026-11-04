import { z } from "zod";

const id = z.string().uuid("ID must be a valid UUID.");
const productStatus = z.enum(["DRAFT", "ACTIVE", "INACTIVE"]);
const reviewStatus = z.enum(["PENDING", "APPROVED", "REJECTED"]);
const decimal = z.number().finite().positive();

export const productParamsSchema = z.object({ productId: id });
export const productListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().max(160).optional(),
    vendorId: id.optional(),
    categoryId: id.optional(),
    brandId: id.optional(),
    status: productStatus.optional(),
    listingStatus: reviewStatus.optional(),
    stockStatus: z.enum(["IN_STOCK", "OUT_OF_STOCK", "LOW_STOCK"]).optional(),
    sortBy: z.enum(["createdAt", "price", "name"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  })
  .strict();

export const updateProductSchema = z
  .object({
    name: z.string().trim().min(2).max(200).optional(),
    description: z.string().trim().max(10000).nullable().optional(),
    categoryId: id.optional(),
    brandId: id.nullable().optional(),
    price: decimal.optional(),
    compareAtPrice: decimal.nullable().optional(),
    sku: z.string().trim().min(1).max(100).optional(),
    slug: z
      .string()
      .trim()
      .min(1)
      .max(180)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .optional(),
    status: productStatus.optional(),
    stockQuantity: z.number().int().min(0).max(2147483647).optional(),
  })
  .strict()
  .refine(
    (body) => Object.keys(body).length > 0,
    "Provide at least one product field to update.",
  )
  .refine(
    (body) =>
      body.compareAtPrice == null ||
      body.price === undefined ||
      body.compareAtPrice > body.price,
    {
      path: ["compareAtPrice"],
      message: "Compare-at price must be greater than price.",
    },
  );

export const rejectProductSchema = z
  .object({
    reason: z
      .string()
      .trim()
      .min(10, "Provide a meaningful rejection reason.")
      .max(2000),
  })
  .strict();
export const productStatusSchema = z
  .object({ status: z.enum(["DRAFT", "ACTIVE", "INACTIVE"]) })
  .strict();
export type ProductListQuery = z.infer<typeof productListQuerySchema>;
