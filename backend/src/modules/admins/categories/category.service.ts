import { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../../config/database.js";
import type { CategoryListQuery } from "./category.validation.js";
import { generateR2SignedUrl, uploadCategoryImageToR2 } from "../../../services/r2Storage.service.js";

export async function uploadCategoryImage(file: Express.Multer.File) {
  const storageKey = await uploadCategoryImageToR2(file);
  return { image: `r2://${storageKey}`, url: await generateR2SignedUrl(storageKey) };
}

async function presentCategoryImage<T extends { image: string | null }>(category: T): Promise<T & { imageUrl: string | null }> {
  const imageUrl = category.image?.startsWith("r2://")
    ? await generateR2SignedUrl(category.image.slice("r2://".length), 3600)
    : category.image;
  return { ...category, imageUrl };
}

function fail(message: string, statusCode: number): never { throw Object.assign(new Error(message), { statusCode }); }
function mapPrismaError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") fail("A category with this slug already exists.", 409);
    if (error.code === "P2003" || error.code === "P2014") fail("Category cannot be changed because it is referenced by another record.", 409);
    if (error.code === "P2025") fail("Category not found.", 404);
  }
  throw error;
}
async function requireRootParent(parentId: string) {
  const parent = await prisma.category.findUnique({ where: { id: parentId }, select: { id: true, parentId: true, isActive: true } });
  if (!parent) fail("Parent category not found.", 404);
  if (parent.parentId) fail("Categories may only be nested one level below a root category.", 400);
  if (!parent.isActive) fail("Choose an active parent category.", 409);
}

export async function createCategory(input: { name: string; slug: string; description?: string | null; image?: string | null; parentId?: string | null; sortOrder?: number }) {
  if (input.parentId) await requireRootParent(input.parentId);
  try { return await prisma.category.create({
    data: { name: input.name.trim().replace(/\s+/g, " "), slug: input.slug.trim().toLowerCase(), description: input.description?.trim() || null, image: input.image?.trim() || null, parentId: input.parentId || null, sortOrder: input.sortOrder ?? 0 },
    include: { parent: { select: { id: true, name: true, slug: true } }, _count: { select: { products: true, children: true } } },
  }); } catch (error) { mapPrismaError(error); }
}

export async function listCategories(query: CategoryListQuery) {
  const { page, limit, search, isActive, parentId, includeChildren, sortBy, sortOrder } = query;
  const where: Prisma.CategoryWhereInput = {
    parentId: parentId ?? null,
    ...(search ? parentId ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { slug: { contains: search, mode: "insensitive" } }] } : { OR: [{ name: { contains: search, mode: "insensitive" } }, { slug: { contains: search, mode: "insensitive" } }, { children: { some: { OR: [{ name: { contains: search, mode: "insensitive" } }, { slug: { contains: search, mode: "insensitive" } }] } } }] } : {}),
    ...(isActive === undefined ? {} : { isActive }),
  };
  const childWhere: Prisma.CategoryWhereInput = { ...(isActive === undefined ? {} : { isActive }), ...(search ? { name: { contains: search, mode: "insensitive" } } : {}) };
  const [categories, total] = await prisma.$transaction([
    prisma.category.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { [sortBy]: sortOrder }, include: {
      parent: { select: { id: true, name: true, slug: true, isActive: true } },
      _count: { select: { products: true, children: true } },
      ...(includeChildren ? { children: { where: childWhere, orderBy: { [sortBy]: sortOrder }, include: { parent: { select: { id: true, name: true, slug: true, isActive: true } }, _count: { select: { products: true, children: true } } } } } : {}),
    } }), prisma.category.count({ where }),
  ]);
  const presented = await Promise.all(categories.map(async (category) => ({
    ...await presentCategoryImage(category),
    children: await Promise.all(category.children.map(presentCategoryImage)),
  })));
  return { categories: presented, pagination: { currentPage: page, pageSize: limit, totalCategories: total, totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPreviousPage: page > 1 } };
}

export async function getCategory(categoryId: string) {
  const category = await prisma.category.findUnique({ where: { id: categoryId }, include: {
    parent: { select: { id: true, name: true, slug: true, isActive: true } },
    children: { orderBy: { sortOrder: "asc" }, include: { _count: { select: { products: true } } } },
    _count: { select: { products: true, children: true } },
  } });
  if (!category) return null;
  return { ...await presentCategoryImage(category), children: await Promise.all(category.children.map(presentCategoryImage)) };
}

export async function updateCategory(categoryId: string, input: { name?: string; slug?: string; description?: string | null; image?: string | null; parentId?: string | null; sortOrder?: number; isActive?: boolean }) {
  const current = await prisma.category.findUnique({ where: { id: categoryId }, select: { id: true, parentId: true, isActive: true } });
  if (!current) return null;
  if (input.parentId !== undefined) {
    if (input.parentId === categoryId) fail("A category cannot be its own parent.", 400);
    if (input.parentId) {
      if (input.parentId !== current.parentId) await requireRootParent(input.parentId);
      const descendant = await prisma.category.findFirst({ where: { id: input.parentId, parentId: categoryId }, select: { id: true } });
      if (descendant) fail("A category cannot be moved under one of its descendants.", 400);
      if (current.parentId === null && await prisma.category.count({ where: { parentId: categoryId } })) fail("A category with subcategories cannot become a subcategory.", 400);
    }
  }
  const effectiveParentId = input.parentId === undefined ? current.parentId : input.parentId;
  if (input.isActive === true && !current.isActive && effectiveParentId) {
    const parent = await prisma.category.findUnique({ where: { id: effectiveParentId }, select: { isActive: true } });
    if (!parent?.isActive) fail("Activate the parent category before activating this subcategory.", 409);
  }
  const data: Prisma.CategoryUpdateInput = {
    ...(input.name === undefined ? {} : { name: input.name.trim().replace(/\s+/g, " ") }),
    ...(input.slug === undefined ? {} : { slug: input.slug.trim().toLowerCase() }),
    ...(input.description === undefined ? {} : { description: input.description?.trim() || null }),
    ...(input.image === undefined ? {} : { image: input.image?.trim() || null }),
    ...(input.parentId === undefined ? {} : { parent: input.parentId ? { connect: { id: input.parentId } } : { disconnect: true } }),
    ...(input.sortOrder === undefined ? {} : { sortOrder: input.sortOrder }), ...(input.isActive === undefined ? {} : { isActive: input.isActive }),
  };
  try { return await prisma.category.update({ where: { id: categoryId }, data, include: { parent: { select: { id: true, name: true, slug: true } }, _count: { select: { products: true, children: true } } } }); }
  catch (error) { mapPrismaError(error); }
}

export async function deleteCategory(categoryId: string) {
  return prisma.$transaction(async (tx) => {
    const category = await tx.category.findUnique({ where: { id: categoryId }, select: { id: true } });
    if (!category) return "not-found" as const;
    const [products, children] = await Promise.all([tx.product.count({ where: { categoryId } }), tx.category.count({ where: { parentId: categoryId } })]);
    if (products) fail("Category cannot be deleted while it contains products.", 409);
    if (children) fail("Category cannot be deleted while it contains subcategories.", 409);
    try { await tx.category.delete({ where: { id: categoryId } }); } catch (error) { mapPrismaError(error); }
    return "deleted" as const;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

export async function setCategoryStatus(categoryId: string, isActive: boolean) {
  const exists = await prisma.category.findUnique({ where: { id: categoryId }, select: { id: true } });
  if (!exists) return null;
  if (isActive) {
    const category = await prisma.category.findUnique({ where: { id: categoryId }, select: { parentId: true } });
    if (category?.parentId) {
      const parent = await prisma.category.findUnique({ where: { id: category.parentId }, select: { isActive: true } });
      if (!parent?.isActive) fail("Activate the parent category before activating this subcategory.", 409);
    }
  }
  try { return await prisma.category.update({ where: { id: categoryId }, data: { isActive }, include: { parent: { select: { id: true, name: true, isActive: true } }, _count: { select: { products: true, children: true } } } }); }
  catch (error) { mapPrismaError(error); }
}

export async function getCategoryStats() {
  const [totalCategories, activeCategories, inactiveCategories, parentCategories, subcategories] = await Promise.all([
    prisma.category.count(),
    prisma.category.count({ where: { isActive: true } }),
    prisma.category.count({ where: { isActive: false } }),
    prisma.category.count({ where: { parentId: null } }),
    prisma.category.count({ where: { parentId: { not: null } } }),
  ]);
  return { totalCategories, activeCategories, inactiveCategories, parentCategories, subcategories };
}
