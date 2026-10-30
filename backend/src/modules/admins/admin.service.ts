
import { prisma } from "../../config/database.js";
import {
  UserRole,
  UserStatus,
  ProductStatus,
} from "../../generated/prisma/client.js";

export async function getAdminDashboardStats() {
  const now = new Date();

  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const [
    totalVendors,
    activeVendors,
    pendingVendors,
    suspendedVendors,
    newVendorsThisWeek,
    totalProducts,
    activeProducts,
    pendingProducts,
    rejectedProducts,
    inactiveProducts,
    newProductsThisWeek,
    lowStockProducts,
    productsOutOfStock,
    recentVendorOrders,
    pendingApprovalProducts,
    vendorProfiles,
  ] = await Promise.all([
    prisma.user.count({
      where: { role: UserRole.VENDOR },
    }),

    prisma.user.count({
      where: {
        role: UserRole.VENDOR,
        status: UserStatus.ACTIVE,
      },
    }),

    prisma.user.count({
      where: {
        role: UserRole.VENDOR,
        status: UserStatus.PENDING,
      },
    }),

    prisma.user.count({
      where: {
        role: UserRole.VENDOR,
        status: UserStatus.SUSPENDED,
      },
    }),

    prisma.user.count({
      where: {
        role: UserRole.VENDOR,
        createdAt: { gte: sevenDaysAgo, lte: now },
      },
    }),

    prisma.product.count(),

    prisma.product.count({
      where: {
        status: ProductStatus.ACTIVE,
        listingStatus: "APPROVED",
      },
    }),

    prisma.product.count({
      where: { listingStatus: "PENDING" },
    }),

    prisma.product.count({
      where: { listingStatus: "REJECTED" },
    }),

    prisma.product.count({
      where: {
        status: {
          in: [ProductStatus.INACTIVE, ProductStatus.ARCHIVED],
        },
      },
    }),

    prisma.product.count({
      where: {
        createdAt: { gte: sevenDaysAgo, lte: now },
      },
    }),

    prisma.product.count({
      where: {
        stockQuantity: { gt: 0, lte: 5 },
        status: { not: ProductStatus.ARCHIVED },
      },
    }),

    prisma.product.count({
      where: { stockQuantity: 0 },
    }),

    prisma.vendorOrder.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo, lte: now },
      },
      select: {
        status: true,
        vendorProfileId: true,
        vendorAmount: true,
        createdAt: true,
        items: {
          select: { quantity: true },
        },
        vendor: {
          select: { businessName: true },
        },
      },
      orderBy: { createdAt: "asc" },
    }),

    prisma.product.findMany({
      where: { listingStatus: "PENDING" },
      select: {
        id: true,
        name: true,
        createdAt: true,
        vendor: {
          select: { businessName: true },
        },
      },
      orderBy: { createdAt: "asc" },
      take: 5,
    }),

    prisma.vendorProfile.findMany({
      select: { id: true },
    }),
  ]);

  const revenueByDate = new Map<string, number>();

  const revenueByVendor = new Map<
    string,
    { businessName: string; revenue: number }
  >();

  let revenue = 0;
  let unitsSold = 0;

  for (const order of recentVendorOrders) {
    if (order.status !== "DELIVERED") continue;

    const amount = Number(order.vendorAmount);
    const date = order.createdAt.toISOString().slice(0, 10);

    revenue += amount;

    unitsSold += order.items.reduce(
      (total, item) => total + item.quantity,
      0,
    );

    revenueByDate.set(
      date,
      (revenueByDate.get(date) ?? 0) + amount,
    );

    const existing = revenueByVendor.get(order.vendorProfileId);

    revenueByVendor.set(order.vendorProfileId, {
      businessName: order.vendor.businessName ?? "Unnamed vendor",
      revenue: (existing?.revenue ?? 0) + amount,
    });
  }

  const series = Array.from({ length: 30 }, (_, index) => {
    const date = new Date(thirtyDaysAgo);
    date.setDate(date.getDate() + index);

    const dateKey = date.toISOString().slice(0, 10);

    return {
      date: dateKey,
      revenue: revenueByDate.get(dateKey) ?? 0,
    };
  });

  const topVendors = Array.from(revenueByVendor.entries())
    .map(([vendorId, data]) => ({
      vendorId,
      businessName: data.businessName,
      revenue: data.revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const vendorsWithOrders = new Set(
    recentVendorOrders
      .filter((order) =>
        ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"].includes(
          order.status,
        ),
      )
      .map((order) => order.vendorProfileId),
  );

  return {
    vendors: {
      total: totalVendors,
      active: activeVendors,
      pending: pendingVendors,
      suspended: suspendedVendors,
      newThisWeek: newVendorsThisWeek,
    },

    listings: {
      total: totalProducts,
      active: activeProducts,
      pending: pendingProducts,
      hidden: inactiveProducts,
      rejected: rejectedProducts,
      newThisWeek: newProductsThisWeek,
    },

    sales: {
      revenue,
      target: 0,
      unitsSold,
      previousPeriodChangePercent: null,
      series,
    },

    topVendors,

    attention: {
      lowStockListings: lowStockProducts,
      vendorsWithoutSalesLast30Days: vendorProfiles.filter(
        (vendor) => !vendorsWithOrders.has(vendor.id),
      ).length,
      rejectedListings: rejectedProducts,
      expiringDocuments: 0,
      reportedListings: 0,
    },

    approvalQueue: pendingApprovalProducts.map((product) => ({
      productId: product.id,
      productName: product.name,
      businessName: product.vendor.businessName ?? "Unnamed vendor",
      submittedAt: product.createdAt.toISOString(),
    })),

    salesByCategory: [],
  };
}


export async function getPendingProductApprovals() {
  const products = await prisma.product.findMany({
    where: {
      listingStatus: "PENDING",
    },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      stockQuantity: true,
      createdAt: true,
      vendor: {
        select: {
          id: true,
          businessName: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return products;
}

export async function reviewProductListing(
  productId: string,
  reviewerId: string,
  decision: "APPROVED" | "REJECTED",
  note?: string,
) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      listingStatus: true,
    },
  });

  if (!product) {
    throw Object.assign(new Error("Product not found."), {
      statusCode: 404,
    });
  }

  if (product.listingStatus !== "PENDING") {
    throw Object.assign(
      new Error("This product has already been reviewed."),
      { statusCode: 409 },
    );
  }

  if (decision === "REJECTED" && !note?.trim()) {
    throw Object.assign(
      new Error("A rejection reason is required."),
      { statusCode: 400 },
    );
  }

  return prisma.$transaction(async (tx) => {
    const updatedProduct = await tx.product.update({
      where: { id: productId },
      data: {
        listingStatus: decision,
        ...(decision === "APPROVED"
          ? { status: "ACTIVE" as const, approvedAt: new Date() }
          : { listingNote: note!.trim() }),
      },
    });

   
await tx.listingReview.create({
  data: {
    productId,
    reviewerId,
    status: decision,
    note: note?.trim() || null,
  },
});


    return updatedProduct;
  });
}

