import { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../../config/database.js";
import type { BrandListQuery } from "./brand.validation.js";

export async function createAdminBrand(input: { name: string; slug: string; description?: string | null; logoUrl?: string | null }) {
  try {
    return await prisma.brand.create({
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description ?? null,
        logoUrl: input.logoUrl ?? null,
      },
      include: { _count: { select: { products: true } } },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw Object.assign(new Error("A brand with this slug already exists."), { statusCode: 409 });
    }
    throw error;
  }
}

export async function listAdminBrands(query: BrandListQuery) {
  const where: Prisma.BrandWhereInput = {
    ...(query.search
      ? { name: { contains: query.search, mode: "insensitive" } }
      : {}),
    ...(query.isActive === undefined ? {} : { isActive: query.isActive }),
  };
  const [brands, total] = await prisma.$transaction([
    prisma.brand.findMany({
      where,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      orderBy: { [query.sortBy]: query.sortOrder },
      include: { _count: { select: { products: true } } },
    }),
    prisma.brand.count({ where }),
  ]);

  return {
    brands,
    pagination: {
      currentPage: query.page,
      pageSize: query.limit,
      totalBrands: total,
      totalPages: Math.ceil(total / query.limit),
      hasNextPage: query.page * query.limit < total,
      hasPreviousPage: query.page > 1,
    },
  };
}
