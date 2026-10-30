import { prisma } from "../../config/database.js";
import { OrderStatus, ProductStatus } from "../../generated/prisma/client.js";

const LOW_STOCK_THRESHOLD = 5;

function startOfLocalDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function asNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (value && typeof value === "object" && "toNumber" in value && typeof value.toNumber === "function") {
    return value.toNumber();
  }
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function getVendorDashboardStats(userId: string, rangeDays = 30) {
  const vendor = await prisma.vendorProfile.findUnique({
    where: { userId },
    select: {
      id: true,
      businessName: true,
      verificationStatus: true,
    },
  });

  if (!vendor) {
    throw new Error("Vendor profile not found.");
  }

  const now = new Date();
  const todayStart = startOfLocalDay(now);
  const rangeStart = new Date(todayStart);
  rangeStart.setDate(rangeStart.getDate() - (rangeDays - 1));

  const previousStart = new Date(rangeStart);
  previousStart.setDate(previousStart.getDate() - rangeDays);
  const previousEnd = new Date(rangeStart);

  const activeProductWhere = {
    vendorProfileId: vendor.id,
    status: { not: ProductStatus.ARCHIVED },
  };

  const [
    totalProducts,
    activeProducts,
    pendingApprovalProducts,
    rejectedProducts,
    hiddenProducts,
    lowStockProducts,
    inStockProducts,
    outOfStockProducts,
    pendingOrders,
    totalOrdersInRange,
    toShipOrders,
    shippedOrders,
    cancelledOrders,
    deliveredOrdersInRange,
    allTimeDeliveredRevenue,
    recentVendorOrders,
    rejectedListingRows,
    reviewAggregate,
    rangeVendorOrders,
    previousPeriodAggregate,
    topSellingGroups,
    pendingReturnRequests,
    payoutRows,
    allPayoutRows,
    awaitingDeliveryAggregate,
    thisMonthCommissionAggregate,
  ] = await Promise.all([
    prisma.product.count({ where: activeProductWhere }),
    prisma.product.count({
      where: {
        vendorProfileId: vendor.id,
        status: ProductStatus.ACTIVE,
        listingStatus: "APPROVED",
      },
    }),
    prisma.product.count({
      where: { vendorProfileId: vendor.id, listingStatus: "PENDING", status: { not: ProductStatus.ARCHIVED } },
    }),
    prisma.product.count({
      where: { vendorProfileId: vendor.id, listingStatus: "REJECTED", status: { not: ProductStatus.ARCHIVED } },
    }),
    prisma.product.count({
      where: {
        vendorProfileId: vendor.id,
        status: { in: [ProductStatus.INACTIVE, ProductStatus.ARCHIVED] },
      },
    }),
    prisma.product.count({
      where: {
        vendorProfileId: vendor.id,
        status: { not: ProductStatus.ARCHIVED },
        stockQuantity: { gt: 0, lte: LOW_STOCK_THRESHOLD },
      },
    }),
    prisma.product.count({
      where: {
        vendorProfileId: vendor.id,
        status: { not: ProductStatus.ARCHIVED },
        stockQuantity: { gt: LOW_STOCK_THRESHOLD },
      },
    }),
    prisma.product.count({
      where: {
        vendorProfileId: vendor.id,
        status: { not: ProductStatus.ARCHIVED },
        stockQuantity: 0,
      },
    }),
    prisma.vendorOrder.count({
      where: { vendorProfileId: vendor.id, status: OrderStatus.PENDING, createdAt: { gte: rangeStart } },
    }),
    prisma.vendorOrder.count({
      where: { vendorProfileId: vendor.id, createdAt: { gte: rangeStart } },
    }),
    prisma.vendorOrder.count({
      where: {
        vendorProfileId: vendor.id,
        status: { in: [OrderStatus.CONFIRMED, OrderStatus.PROCESSING] },
        createdAt: { gte: rangeStart },
      },
    }),
    prisma.vendorOrder.count({
      where: { vendorProfileId: vendor.id, status: OrderStatus.SHIPPED, createdAt: { gte: rangeStart } },
    }),
    prisma.vendorOrder.count({
      where: { vendorProfileId: vendor.id, status: OrderStatus.CANCELLED, createdAt: { gte: rangeStart } },
    }),
    prisma.vendorOrder.count({
      where: { vendorProfileId: vendor.id, status: OrderStatus.DELIVERED, createdAt: { gte: rangeStart } },
    }),
    prisma.vendorOrder.aggregate({
      where: { vendorProfileId: vendor.id, status: OrderStatus.DELIVERED },
      _sum: { vendorAmount: true },
    }),
    prisma.vendorOrder.findMany({
      where: { vendorProfileId: vendor.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        status: true,
        subtotal: true,
        vendorAmount: true,
        createdAt: true,
        order: { select: { orderNumber: true, customerName: true } },
      },
    }),
    prisma.product.findMany({
      where: {
        vendorProfileId: vendor.id,
        listingStatus: "REJECTED",
        status: { not: ProductStatus.ARCHIVED },
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        sku: true,
        listingNote: true,
        listingReviews: {
          orderBy: { reviewedAt: "desc" },
          take: 1,
          select: { note: true },
        },
      },
    }),
    prisma.productReview.aggregate({
      where: { product: { vendorProfileId: vendor.id }, createdAt: { gte: rangeStart } },
      _avg: { rating: true },
      _count: { rating: true },
    }),
    prisma.vendorOrder.findMany({
      where: { vendorProfileId: vendor.id, createdAt: { gte: rangeStart } },
      orderBy: { createdAt: "asc" },
      select: {
        createdAt: true,
        status: true,
        vendorAmount: true,
        commissionAmount: true,
        items: { select: { quantity: true } },
      },
    }),
    prisma.vendorOrder.aggregate({
      where: {
        vendorProfileId: vendor.id,
        status: OrderStatus.DELIVERED,
        createdAt: { gte: previousStart, lt: previousEnd },
      },
      _sum: { vendorAmount: true },
    }),
    prisma.orderItem.groupBy({
      by: ["productId", "productName"],
      where: {
        vendorOrder: {
          vendorProfileId: vendor.id,
          status: { in: [OrderStatus.DELIVERED, OrderStatus.SHIPPED] },
          createdAt: { gte: rangeStart },
        },
      },
      _sum: { quantity: true, lineTotal: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
    prisma.returnRequest.count({
      where: {
        status: { in: ["REQUESTED", "APPROVED", "PICKUP_SCHEDULED", "RECEIVED"] },
        orderItem: { vendorOrder: { vendorProfileId: vendor.id } },
      },
    }),
    prisma.vendorPayout.findMany({
      where: { vendorProfileId: vendor.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        amount: true,
        currency: true,
        status: true,
        reference: true,
        paidAt: true,
        createdAt: true,
      },
    }),
    prisma.vendorPayout.findMany({
      where: { vendorProfileId: vendor.id },
      select: { amount: true, status: true },
    }),
    prisma.vendorOrder.aggregate({
      where: {
        vendorProfileId: vendor.id,
        status: { in: [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PROCESSING, OrderStatus.SHIPPED] },
      },
      _sum: { vendorAmount: true },
    }),
    prisma.vendorOrder.aggregate({
      where: {
        vendorProfileId: vendor.id,
        createdAt: { gte: new Date(now.getFullYear(), now.getMonth(), 1) },
      },
      _sum: { commissionAmount: true },
    }),
  ]);

  // Build a complete date series so the line chart can show zero-sales days too.
  const salesByDay = new Map<string, { revenue: number; unitsSold: number; orders: number }>();
  for (let i = 0; i < rangeDays; i += 1) {
    const day = new Date(rangeStart);
    day.setDate(rangeStart.getDate() + i);
    salesByDay.set(dateKey(day), { revenue: 0, unitsSold: 0, orders: 0 });
  }

  for (const order of rangeVendorOrders) {
    const key = dateKey(order.createdAt);
    const current = salesByDay.get(key);
    if (!current) continue;
    // Only delivered orders count as realized sales/revenue.
    if (order.status === OrderStatus.DELIVERED) {
      current.revenue += asNumber(order.vendorAmount);
      current.orders += 1;
      current.unitsSold += order.items.reduce((sum, item) => sum + item.quantity, 0);
    }
  }

  const salesSeries = [...salesByDay.entries()].map(([date, values]) => ({
    date,
    revenue: Math.round(values.revenue * 100) / 100,
    unitsSold: values.unitsSold,
    orders: values.orders,
  }));

  const currentRevenue = salesSeries.reduce((sum, day) => sum + day.revenue, 0);
  const currentUnitsSold = salesSeries.reduce((sum, day) => sum + day.unitsSold, 0);
  const previousRevenue = asNumber(previousPeriodAggregate._sum.vendorAmount);
  const revenueChangePercent =
    previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : null;

  const payoutPending = allPayoutRows
    .filter((payout) => !["PAID", "COMPLETED", "SUCCESS"].includes(payout.status.toUpperCase()))
    .reduce((sum, payout) => sum + asNumber(payout.amount), 0);
  const payoutPaid = allPayoutRows
    .filter((payout) => ["PAID", "COMPLETED", "SUCCESS"].includes(payout.status.toUpperCase()))
    .reduce((sum, payout) => sum + asNumber(payout.amount), 0);

  const stockTotal = inStockProducts + lowStockProducts + outOfStockProducts;
  const listingsTotal = totalProducts;
  const deliveredRevenueAllTime = asNumber(allTimeDeliveredRevenue._sum.vendorAmount);

  return {
    vendor: {
      businessName: vendor.businessName,
      verificationStatus: vendor.verificationStatus,
    },
    products: {
      total: totalProducts,
      active: activeProducts,
      pendingApproval: pendingApprovalProducts,
      lowStock: lowStockProducts,
    },
    orders: {
      total: totalOrdersInRange,
      pending: pendingOrders,
    },
    revenue: {
      deliveredVendorAmount: deliveredRevenueAllTime,
      currency: "INR",
    },
    recentOrders: recentVendorOrders.map((order) => ({
      id: order.id,
      orderNumber: order.order.orderNumber,
      customerName: order.order.customerName,
      status: order.status,
      subtotal: asNumber(order.subtotal),
      vendorAmount: asNumber(order.vendorAmount),
      createdAt: order.createdAt.toISOString(),
    })),
    analytics: {
      rangeDays,
      listings: {
        total: listingsTotal,
        active: activeProducts,
        pending: pendingApprovalProducts,
        rejected: rejectedProducts,
        hidden: hiddenProducts,
      },
      orders: {
        total: totalOrdersInRange,
        pending: pendingOrders,
        toShip: toShipOrders,
        shipped: shippedOrders,
        cancelled: cancelledOrders,
        delivered: deliveredOrdersInRange,
      },
      stock: {
        inStock: inStockProducts,
        lowStock: lowStockProducts,
        outOfStock: outOfStockProducts,
      },
      rating: {
        average: Number(reviewAggregate._avg.rating ?? 0),
        reviewCount: reviewAggregate._count.rating,
      },
      rejectedListings: rejectedListingRows.map((product) => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        note: product.listingNote ?? product.listingReviews[0]?.note ?? null,
      })),
    },
    sales: {
      rangeDays,
      currency: "INR",
      revenue: Math.round(currentRevenue * 100) / 100,
      unitsSold: currentUnitsSold,
      previousRevenue: Math.round(previousRevenue * 100) / 100,
      revenueChangePercent:
        revenueChangePercent === null ? null : Math.round(revenueChangePercent * 10) / 10,
      series: salesSeries,
    },
    topSellingProducts: topSellingGroups.map((item) => ({
      productId: item.productId,
      name: item.productName,
      unitsSold: item._sum.quantity ?? 0,
      revenue: asNumber(item._sum.lineTotal),
    })),
    todos: {
      newOrdersToAccept: pendingOrders,
      ordersToPackAndShip: toShipOrders,
      productsOutOfStock: outOfStockProducts,
      rejectedListings: rejectedProducts,
      returnRequests: pendingReturnRequests,
    },
    payout: {
      currency: "INR",
      // Sum of payout records currently considered unpaid; uses status values from the existing table.
      pendingAmount: Math.round(payoutPending * 100) / 100,
      paidAmount: Math.round(payoutPaid * 100) / 100,
      awaitingDeliveryAmount: asNumber(awaitingDeliveryAggregate._sum.vendorAmount),
      commissionThisMonth: asNumber(thisMonthCommissionAggregate._sum.commissionAmount),
      recent: payoutRows.map((payout) => ({
        id: payout.id,
        amount: asNumber(payout.amount),
        currency: payout.currency,
        status: payout.status,
        reference: payout.reference,
        paidAt: payout.paidAt?.toISOString() ?? null,
        createdAt: payout.createdAt.toISOString(),
      })),
    },
  };
}
