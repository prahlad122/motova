import { z } from "zod";

const categoryId = z.string().uuid("Category ID must be a valid UUID.");
const slug = z.string().trim().toLowerCase().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain lowercase letters, numbers, and hyphens.");
const image = z.string().trim().max(2048).refine((value) => {
  if (value.startsWith("r2://category-images/")) return true;
  try { const parsed = new URL(value); return parsed.protocol === "https:" || parsed.protocol === "http:"; } catch { return false; }
}, "Image must be an HTTP(S) URL or an uploaded category image.");

export const createCategorySchema = z.object({
  name: z.string().trim().min(1).max(120), slug,
  description: z.string().trim().max(5000).nullable().optional(),
  image: image.nullable().optional(),
  parentId: categoryId.nullable().optional(),
  sortOrder: z.number().int().min(0).max(2147483647).optional(),
}).strict();

export const updateCategorySchema = z.object({
  name: z.string().trim().min(1).max(120).optional(), slug: slug.optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  image: image.nullable().optional(),
  parentId: categoryId.nullable().optional(),
  sortOrder: z.number().int().min(0).max(2147483647).optional(), isActive: z.boolean().optional(),
}).strict().refine((value) => Object.keys(value).length > 0, "Provide at least one field to update.");

export const categoryStatusSchema = z.object({ isActive: z.boolean() }).strict();
export const categoryParamsSchema = z.object({ categoryId });
const boolQuery = z.enum(["true", "false"]).transform((value) => value === "true");
export const categoryListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(120).optional(), isActive: boolQuery.optional(), parentId: categoryId.optional(),
  includeChildren: boolQuery.default(true), sortBy: z.enum(["name", "createdAt", "sortOrder"]).default("sortOrder"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
}).strict();
export type CategoryListQuery = z.infer<typeof categoryListQuerySchema>;
