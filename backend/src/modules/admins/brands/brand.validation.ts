import { z } from "zod";

const slug = z.string().trim().toLowerCase().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain lowercase letters, numbers, and hyphens.");
const httpUrl = z.string().trim().url().refine((value) => /^https?:\/\//i.test(value), "Logo URL must use HTTP or HTTPS.");

export const createBrandSchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug,
  description: z.string().trim().max(5000).nullable().optional(),
  logoUrl: httpUrl.nullable().optional(),
}).strict();

export const brandListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(120).optional(),
  isActive: z.enum(["true", "false"]).transform((value) => value === "true").optional(),
  sortBy: z.enum(["name", "createdAt"]).default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
}).strict();

export type BrandListQuery = z.infer<typeof brandListQuerySchema>;
