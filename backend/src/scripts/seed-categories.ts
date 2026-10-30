
import { prisma } from "../config/database.js";

const categories = [
  {
    name: "Electronics",
    slug: "electronics",
    description: "Electronic devices and accessories",
  },
  {
    name: "Clothing",
    slug: "clothing",
    description: "Clothing and fashion products",
  },
  {
    name: "Home & Kitchen",
    slug: "home-kitchen",
    description: "Home and kitchen essentials",
  },
  {
    name: "Sports",
    slug: "sports",
    description: "Sports and fitness products",
  },
  {
    name: "Books",
    slug: "books",
    description: "Books and educational materials",
  },
];

async function main() {
  for (const category of categories) {
    const existing = await prisma.category.findUnique({
      where: { slug: category.slug },
      select: { id: true, name: true },
    });

    if (existing) {
      console.log(`Skipped existing category: ${existing.name}`);
      continue;
    }

    const created = await prisma.category.create({
      data: {
        ...category,
        isActive: true,
      },
    });

    console.log(`Created: ${created.name} (ID: ${created.id})`);
  }

  console.log("\nCategory seeding completed.");

  const allCategories = await prisma.category.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
    },
    orderBy: { name: "asc" },
  });

  console.table(allCategories);
}

main()
  .catch((error) => {
    console.error("Failed to seed categories:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
