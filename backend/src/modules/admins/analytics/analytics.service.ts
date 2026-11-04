import {
  Prisma,
  OrderStatus,
  PaymentStatus,
  ProductStatus,
  ReviewStatus,
  UserRole,
} from "../../../generated/prisma/client.js";
import { prisma } from "../../../config/database.js";
import type { AnalyticsQuery } from "./analytics.validation.js";

const LOW_STOCK = 5;
type Range = {
  start: Date;
  end: Date;
  previousStart: Date;
  previousEnd: Date;
  period: AnalyticsQuery["period"];
};
type NumericRow = Record<string, unknown>;
const num = (value: unknown) => Number(value ?? 0);
const dayStart = (date: Date) => {
  const result = new Date(date);
  result.setUTCHours(0, 0, 0, 0);
  return result;
};

function badRequest(message: string): never {
  throw Object.assign(new Error(message), { statusCode: 400 });
}
export function resolveAnalyticsRange(
  query: AnalyticsQuery,
  now = new Date(),
): Range {
  let start: Date;
  let end: Date;
  if (query.startDate && query.endDate) {
    start = new Date(`${query.startDate}T00:00:00.000Z`);
    end = new Date(`${query.endDate}T00:00:00.000Z`);
    end.setUTCDate(end.getUTCDate() + 1);
    if (end.getTime() - start.getTime() > 366 * 86400000)
      badRequest("Date range cannot exceed 366 days.");
  } else {
    const today = dayStart(now);
    end = new Date(today);
    end.setUTCDate(end.getUTCDate() + 1);
    if (query.period === "today") start = today;
    else if (query.period === "last7") {
      start = new Date(today);
      start.setUTCDate(start.getUTCDate() - 6);
    } else if (query.period === "last90") {
      start = new Date(today);
      start.setUTCDate(start.getUTCDate() - 89);
    } else if (query.period === "thisYear")
      start = new Date(Date.UTC(today.getUTCFullYear(), 0, 1));
    else {
      start = new Date(today);
      start.setUTCDate(start.getUTCDate() - 29);
    }
  }
  const duration = end.getTime() - start.getTime();
  return {
    start,
    end,
    previousStart: new Date(start.getTime() - duration),
    previousEnd: start,
    period: query.startDate && query.endDate ? "custom" : query.period,
  };
}
const rangeWhere = (range: Pick<Range, "start" | "end">) => ({
  gte: range.start,
  lt: range.end,
});
const sqlPeriod = (groupBy: AnalyticsQuery["groupBy"], range: Range) =>
  groupBy ??
  (range.period === "thisYear"
    ? "monthly"
    : range.period === "last90"
      ? "weekly"
      : "daily");
const truncUnit = (groupBy: AnalyticsQuery["groupBy"], range: Range) =>
  ({ daily: "day", weekly: "week", monthly: "month" })[
    sqlPeriod(groupBy, range)
  ];
const isoDate = (value: Date) => value.toISOString().slice(0, 10);
const comparison = (current: number, previous: number) =>
  previous === 0
    ? null
    : Number((((current - previous) / Math.abs(previous)) * 100).toFixed(1));
const rangeDto = (range: Range) => ({
  startDate: isoDate(range.start),
  endDate: isoDate(new Date(range.end.getTime() - 86400000)),
  period: range.period,
});

async function financialTotals(range: Pick<Range, "start" | "end">) {
  const where = { status: OrderStatus.DELIVERED, createdAt: rangeWhere(range) };
  const [vendorTotals, orderCount] = await Promise.all([
    prisma.vendorOrder.aggregate({
      where,
      _sum: { subtotal: true, vendorAmount: true, commissionAmount: true },
    }),
    prisma.$queryRaw<{ count: bigint }[]>(
      Prisma.sql`SELECT COUNT(DISTINCT "orderId") AS count FROM "VendorOrder" WHERE status = 'DELIVERED' AND "createdAt" >= ${range.start} AND "createdAt" < ${range.end}`,
    ),
  ]);
  return {
    gmv: num(vendorTotals._sum.subtotal),
    vendorNet: num(vendorTotals._sum.vendorAmount),
    platformRevenue: num(vendorTotals._sum.commissionAmount),
    deliveredOrders: num(orderCount[0]?.count),
  };
}

async function revenueTrend(range: Range, groupBy?: AnalyticsQuery["groupBy"]) {
  const unit = truncUnit(groupBy, range);
  const rows = await prisma.$queryRaw<
    { bucket: Date; gmv: number; platformRevenue: number; orders: bigint }[]
  >(Prisma.sql`
    SELECT date_trunc(${unit}, vo."createdAt") AS bucket,
      COALESCE(SUM(vo.subtotal), 0)::float8 AS gmv,
      COALESCE(SUM(vo."commissionAmount"), 0)::float8 AS "platformRevenue",
      COUNT(DISTINCT vo."orderId") AS orders
    FROM "VendorOrder" vo
    WHERE vo.status = 'DELIVERED' AND vo."createdAt" >= ${range.start} AND vo."createdAt" < ${range.end}
    GROUP BY bucket ORDER BY bucket ASC`);
  return rows.map((row) => ({
    date: row.bucket.toISOString(),
    gmv: num(row.gmv),
    platformRevenue: num(row.platformRevenue),
    orders: num(row.orders),
  }));
}

async function ordersTrend(range: Range, groupBy?: AnalyticsQuery["groupBy"]) {
  const rows = await prisma.$queryRaw<{ bucket: Date; orders: bigint }[]>(
    Prisma.sql`SELECT date_trunc(${truncUnit(groupBy, range)}, "createdAt") AS bucket, COUNT(*) AS orders FROM "Order" WHERE "createdAt">=${range.start} AND "createdAt"<${range.end} GROUP BY bucket ORDER BY bucket`,
  );
  return rows.map((row) => ({ date: row.bucket.toISOString(), orders: num(row.orders) }));
}

async function lastTwelveMonthsSales(now = new Date()) {
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1));
  const range: Range = { start, end, previousStart: start, previousEnd: end, period: "custom" };
  return revenueTrend(range, "monthly");
}

async function categoryRevenue(range: Range) {
  const rows = await prisma.$queryRaw<NumericRow[]>(Prisma.sql`
    SELECT c.id AS "categoryId", c.name AS "categoryName", COALESCE(SUM(oi."lineTotal"),0)::float8 AS sales
    FROM "OrderItem" oi JOIN "VendorOrder" vo ON vo.id = oi."vendorOrderId"
    JOIN "Product" p ON p.id = oi."productId" JOIN "Category" c ON c.id = p."categoryId"
    WHERE vo.status = 'DELIVERED' AND vo."createdAt" >= ${range.start} AND vo."createdAt" < ${range.end}
    GROUP BY c.id, c.name ORDER BY sales DESC LIMIT 12`);
  return rows.map((row) => ({
    categoryId: String(row.categoryId),
    categoryName: String(row.categoryName),
    sales: num(row.sales),
  }));
}

async function topVendorSales(range: Range, take = 8) {
  const rows = await prisma.$queryRaw<NumericRow[]>(Prisma.sql`
    SELECT vo."vendorProfileId" AS "vendorId", COALESCE(vp."businessName", u.name, 'Unnamed vendor') AS "vendorName",
      COUNT(DISTINCT vo."orderId")::int AS orders,
      COALESCE(SUM(vo.subtotal),0)::float8 AS gmv,
      COALESCE(SUM(vo."commissionAmount"),0)::float8 AS "platformRevenue"
    FROM "VendorOrder" vo JOIN "VendorProfile" vp ON vp.id = vo."vendorProfileId"
    JOIN "User" u ON u.id = vp."userId"
    WHERE vo.status = 'DELIVERED' AND vo."createdAt" >= ${range.start} AND vo."createdAt" < ${range.end}
    GROUP BY vo."vendorProfileId", vp."businessName", u.name ORDER BY gmv DESC LIMIT ${take}`);
  return rows.map((row) => ({
    vendorId: String(row.vendorId),
    vendorName: String(row.vendorName),
    orders: num(row.orders),
    gmv: num(row.gmv),
    platformRevenue: num(row.platformRevenue),
  }));
}

async function topProductSales(
  range: Range,
  take = 8,
  sortBy: "revenue" | "unitsSold" = "revenue",
) {
  const sortColumn =
    sortBy === "unitsSold" ? Prisma.sql`"unitsSold"` : Prisma.sql`revenue`;
  const rows = await prisma.$queryRaw<NumericRow[]>(Prisma.sql`
    SELECT p.id AS "productId", p.name AS "productName", p.sku, COALESCE(SUM(oi.quantity),0)::int AS "unitsSold",
      COALESCE(SUM(oi."lineTotal"),0)::float8 AS revenue, COALESCE(vp."businessName", u.name, 'Unnamed vendor') AS "vendorName"
    FROM "OrderItem" oi JOIN "VendorOrder" vo ON vo.id = oi."vendorOrderId" JOIN "Product" p ON p.id = oi."productId"
    JOIN "VendorProfile" vp ON vp.id = p."vendorProfileId" JOIN "User" u ON u.id = vp."userId"
    WHERE vo.status = 'DELIVERED' AND vo."createdAt" >= ${range.start} AND vo."createdAt" < ${range.end}
    GROUP BY p.id, p.name, p.sku, vp."businessName", u.name ORDER BY ${sortColumn} DESC LIMIT ${take}`);
  return rows.map((row) => ({
    productId: String(row.productId),
    productName: String(row.productName),
    sku: String(row.sku),
    unitsSold: num(row.unitsSold),
    revenue: num(row.revenue),
    vendorName: String(row.vendorName),
  }));
}

async function orderStatuses(range: Range) {
  const grouped = await prisma.order.groupBy({
    by: ["status"],
    where: { createdAt: rangeWhere(range) },
    _count: { _all: true },
  });
  return grouped.map((row) => ({ status: row.status, count: row._count._all }));
}

export async function getAnalyticsOverview(query: AnalyticsQuery) {
  const range = resolveAnalyticsRange(query);
  const [
    current,
    previous,
    totalVendors,
    activeVendors,
    totalCustomers,
    totalProducts,
    pendingApprovals,
    statuses,
    trend,
    orderTrend,
    byCategory,
    vendors,
    products,
    totalOrders,
  ] = await Promise.all([
    financialTotals(range),
    financialTotals({ start: range.previousStart, end: range.previousEnd }),
    prisma.user.count({ where: { role: UserRole.VENDOR } }),
    prisma.user.count({ where: { role: UserRole.VENDOR, status: "ACTIVE" } }),
    prisma.customerProfile.count(),
    prisma.product.count({
      where: { status: { not: ProductStatus.ARCHIVED } },
    }),
    prisma.product.count({ where: { listingStatus: ReviewStatus.PENDING } }),
    orderStatuses(range),
    revenueTrend(range, query.groupBy),
    ordersTrend(range, query.groupBy),
    categoryRevenue(range),
    topVendorSales(range, 6),
    topProductSales(range, 6, "unitsSold"),
    prisma.order.count({ where: { createdAt: rangeWhere(range) } }),
  ]);
  return {
    range: rangeDto(range),
    kpis: {
      gmv: {
        value: current.gmv,
        changePercent: comparison(current.gmv, previous.gmv),
      },
      platformRevenue: {
        value: current.platformRevenue,
        changePercent: comparison(
          current.platformRevenue,
          previous.platformRevenue,
        ),
      },
      totalOrders: {
        value: totalOrders,
        changePercent: comparison(
          totalOrders,
          await prisma.order.count({
            where: {
              createdAt: rangeWhere({
                start: range.previousStart,
                end: range.previousEnd,
              }),
            },
          }),
        ),
      },
      totalVendors: { value: totalVendors, changePercent: null },
      activeVendors: { value: activeVendors, changePercent: null },
      totalCustomers: { value: totalCustomers, changePercent: null },
      totalProducts: { value: totalProducts, changePercent: null },
      pendingProductApprovals: { value: pendingApprovals, changePercent: null },
    },
    charts: {
      revenueTrend: trend,
      ordersTrend: orderTrend,
      salesByCategory: byCategory,
      orderStatusDistribution: statuses,
      topVendors: vendors,
      topProducts: products,
    },
    definitions: {
      gmv: "Sum of delivered vendor-order subtotals; each vendor allocation is counted once.",
      platformRevenue:
        "Recorded commissionAmount from delivered vendor orders; refund/return commission reversals are not modeled in this backend.",
    },
  };
}

function salesOrderWhere(
  query: AnalyticsQuery,
  range: Range,
): Prisma.OrderWhereInput {
  return {
    createdAt: rangeWhere(range),
    ...(query.orderStatus ? { status: query.orderStatus } : {}),
    ...(query.paymentStatus ? { paymentStatus: query.paymentStatus } : {}),
    ...(query.search
      ? { orderNumber: { contains: query.search, mode: "insensitive" } }
      : {}),
  };
}
export async function getSalesAnalytics(query: AnalyticsQuery) {
  const range = resolveAnalyticsRange(query);
  const where = salesOrderWhere(query, range);
  const [
    totals,
    totalOrders,
    refunds,
    cancelledOrders,
    statuses,
    transactions,
    totalRows,
    trend,
    byCategory,
    byVendor,
  ] = await Promise.all([
    financialTotals(range),
    prisma.order.count({ where }),
    prisma.payment.aggregate({
      where: { status: PaymentStatus.REFUNDED, createdAt: rangeWhere(range) },
      _sum: { amount: true },
    }),
    prisma.order.count({ where: { ...where, status: OrderStatus.CANCELLED } }),
    orderStatuses(range),
    prisma.order.findMany({
      where,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      orderBy: {
        [query.sortBy === "totalAmount" || query.sortBy === "orderNumber"
          ? query.sortBy
          : "createdAt"]: query.sortOrder,
      },
      select: {
        id: true,
        orderNumber: true,
        createdAt: true,
        customerName: true,
        totalAmount: true,
        paymentStatus: true,
        status: true,
        vendorOrders: {
          select: { vendor: { select: { businessName: true } } },
        },
      },
    }),
    prisma.order.count({ where }),
    revenueTrend(range, query.groupBy),
    categoryRevenue(range),
    topVendorSales(range, 12),
  ]);
  return {
    range: rangeDto(range),
    kpis: {
      gmv: totals.gmv,
      platformRevenue: totals.platformRevenue,
      totalOrders,
      averageOrderValue: totals.deliveredOrders
        ? totals.gmv / totals.deliveredOrders
        : 0,
      recordedRefunds: num(refunds._sum.amount),
      cancelledOrders,
    },
    charts: {
      revenueTrend: trend,
      gmvVsPlatformRevenue: trend.map(({ date, gmv, platformRevenue }) => ({
        date,
        gmv,
        platformRevenue,
      })),
      monthlySalesComparison: await lastTwelveMonthsSales(),
      ordersByStatus: statuses,
      revenueByCategory: byCategory,
      revenueByVendor: byVendor,
    },
    transactions: transactions.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      orderDate: order.createdAt,
      customer: order.customerName,
      vendors: [
        ...new Set(
          order.vendorOrders
            .map((item) => item.vendor.businessName)
            .filter((value): value is string => Boolean(value)),
        ),
      ],
      orderAmount: Number(order.totalAmount),
      paymentStatus: order.paymentStatus,
      orderStatus: order.status,
    })),
    pagination: {
      currentPage: query.page,
      pageSize: query.limit,
      totalRows,
      totalPages: Math.ceil(totalRows / query.limit),
      hasNextPage: query.page * query.limit < totalRows,
      hasPreviousPage: query.page > 1,
    },
    definitions: {
      gmv: "Delivered vendor-order subtotals, not parent order totalAmount.",
      platformRevenue: "Recorded commissionAmount on delivered vendor orders.",
      recordedRefunds:
        "Sum of Payment.amount rows with REFUNDED status; partial return/refund amounts are not represented by the schema.",
    },
  };
}

function sqlFilters(filters: Prisma.Sql[]) {
  return filters.length
    ? Prisma.sql`WHERE ${Prisma.join(filters, " AND ")}`
    : Prisma.empty;
}
function dateFilter(column: string, range: Range) {
  return Prisma.sql`${Prisma.raw(column)} >= ${range.start} AND ${Prisma.raw(column)} < ${range.end}`;
}

export async function getVendorAnalytics(query: AnalyticsQuery) {
  const range = resolveAnalyticsRange(query);
  const userFilters: Prisma.Sql[] = [Prisma.sql`u.role = 'VENDOR'`];
  if (query.vendorStatus)
    userFilters.push(Prisma.sql`u.status = ${query.vendorStatus}`);
  if (query.verificationStatus)
    userFilters.push(
      Prisma.sql`vp."verificationStatus" = ${query.verificationStatus}`,
    );
  if (query.search)
    userFilters.push(
      Prisma.sql`(u.name ILIKE ${`%${query.search}%`} OR COALESCE(vp."businessName", '') ILIKE ${`%${query.search}%`} OR COALESCE(u.email, '') ILIKE ${`%${query.search}%`})`,
    );
  const where = sqlFilters(userFilters);
  const sortColumn =
    (
      {
        sales: Prisma.sql`COALESCE(s.gmv,0)`,
        orders: Prisma.sql`COALESCE(s.orders,0)`,
        name: Prisma.sql`u.name`,
        createdAt: Prisma.sql`u."createdAt"`,
      } as Record<string, Prisma.Sql>
    )[query.sortBy ?? "sales"] ?? Prisma.sql`COALESCE(s.gmv,0)`;
  const order = query.sortOrder === "asc" ? Prisma.sql`ASC` : Prisma.sql`DESC`;
  const [rows, countRows, statusGroups, verificationGroups, registration, vendorSales] =
    await Promise.all([
      prisma.$queryRaw<NumericRow[]>(Prisma.sql`
      SELECT vp.id AS "vendorId", u.name, u.email, u.status AS "vendorStatus", vp."businessName", vp."verificationStatus", u."createdAt" AS "registeredAt",
        COALESCE(p.total,0)::int AS "totalProducts", COALESCE(p.approved,0)::int AS "approvedProducts", COALESCE(s.orders,0)::int AS "totalOrders", COALESCE(s.gmv,0)::float8 AS "totalSales"
      FROM "VendorProfile" vp JOIN "User" u ON u.id=vp."userId"
      LEFT JOIN (SELECT "vendorProfileId", COUNT(*) AS total, COUNT(*) FILTER (WHERE "listingStatus"='APPROVED') AS approved FROM "Product" GROUP BY "vendorProfileId") p ON p."vendorProfileId"=vp.id
      LEFT JOIN (SELECT "vendorProfileId", COUNT(DISTINCT "orderId") AS orders, SUM(subtotal) AS gmv FROM "VendorOrder" WHERE status='DELIVERED' AND "createdAt">=${range.start} AND "createdAt"<${range.end} GROUP BY "vendorProfileId") s ON s."vendorProfileId"=vp.id
      ${where} ORDER BY ${sortColumn} ${order} NULLS LAST LIMIT ${query.limit} OFFSET ${(query.page - 1) * query.limit}`),
      prisma.$queryRaw<{ count: bigint }[]>(
        Prisma.sql`SELECT COUNT(*) AS count FROM "VendorProfile" vp JOIN "User" u ON u.id=vp."userId" ${where}`,
      ),
      prisma.user.groupBy({
        by: ["status"],
        where: { role: UserRole.VENDOR },
        _count: { _all: true },
      }),
      prisma.vendorProfile.groupBy({
        by: ["verificationStatus"],
        _count: { _all: true },
      }),
      prisma.$queryRaw<NumericRow[]>(
        Prisma.sql`SELECT date_trunc(${truncUnit(query.groupBy, range)}, "createdAt") AS bucket, COUNT(*)::int AS count FROM "User" WHERE role='VENDOR' AND "createdAt">=${range.start} AND "createdAt"<${range.end} GROUP BY bucket ORDER BY bucket`,
      ),
      topVendorSales(range, 10),
    ]);
  return {
    range: rangeDto(range),
    kpis: {
      totalVendors: statusGroups.reduce(
        (sum, item) => sum + item._count._all,
        0,
      ),
      activeVendors:
        statusGroups.find((item) => item.status === "ACTIVE")?._count._all ?? 0,
      pendingVendors:
        statusGroups.find((item) => item.status === "PENDING")?._count._all ??
        0,
      suspendedVendors:
        statusGroups.find((item) => item.status === "SUSPENDED")?._count._all ??
        0,
      verifiedVendors:
        verificationGroups.find(
          (item) => item.verificationStatus === "APPROVED",
        )?._count._all ?? 0,
    },
    registrationGrowth: registration.map((row) => ({
      date: new Date(String(row.bucket)).toISOString(),
      vendors: num(row.count),
    })),
    statusDistribution: statusGroups.map((item) => ({
      status: item.status,
      count: item._count._all,
    })),
    verificationDistribution: verificationGroups.map((item) => ({
      status: item.verificationStatus,
      count: item._count._all,
    })),
    charts: {
      vendorRevenue: vendorSales.map((vendor) => ({ vendorName: vendor.vendorName, gmv: vendor.gmv })),
      vendorOrderVolume: vendorSales.map((vendor) => ({ vendorName: vendor.vendorName, orders: vendor.orders })),
      topVendors: vendorSales,
    },
    vendors: rows.map((row) => ({
      ...row,
      totalProducts: num(row.totalProducts),
      approvedProducts: num(row.approvedProducts),
      totalOrders: num(row.totalOrders),
      totalSales: num(row.totalSales),
    })),
    pagination: {
      currentPage: query.page,
      pageSize: query.limit,
      totalRows: num(countRows[0]?.count),
      totalPages: Math.ceil(num(countRows[0]?.count) / query.limit),
      hasNextPage: query.page * query.limit < num(countRows[0]?.count),
      hasPreviousPage: query.page > 1,
    },
  };
}

export async function getProductAnalytics(query: AnalyticsQuery) {
  const range = resolveAnalyticsRange(query);
  const filters: Prisma.Sql[] = [Prisma.sql`p."status" <> 'ARCHIVED'`];
  filters.push(dateFilter('p."createdAt"', range));
  if (query.vendorId)
    filters.push(Prisma.sql`p."vendorProfileId" = ${query.vendorId}`);
  if (query.categoryId)
    filters.push(Prisma.sql`p."categoryId" = ${query.categoryId}`);
  if (query.listingStatus)
    filters.push(Prisma.sql`p."listingStatus" = ${query.listingStatus}`);
  if (query.productStatus)
    filters.push(Prisma.sql`p.status = ${query.productStatus}`);
  if (query.stockStatus === "OUT_OF_STOCK")
    filters.push(Prisma.sql`p."stockQuantity" = 0`);
  if (query.stockStatus === "IN_STOCK")
    filters.push(Prisma.sql`p."stockQuantity" > 0`);
  if (query.stockStatus === "LOW_STOCK")
    filters.push(Prisma.sql`p."stockQuantity" BETWEEN 1 AND ${LOW_STOCK}`);
  if (query.search)
    filters.push(
      Prisma.sql`(p.name ILIKE ${`%${query.search}%`} OR p.sku ILIKE ${`%${query.search}%`})`,
    );
  const where = sqlFilters(filters);
  const sortColumn =
    (
      {
        revenue: Prisma.sql`COALESCE(s.revenue,0)`,
        unitsSold: Prisma.sql`COALESCE(s.units,0)`,
        name: Prisma.sql`p.name`,
        stock: Prisma.sql`p."stockQuantity"`,
        createdAt: Prisma.sql`p."createdAt"`,
      } as Record<string, Prisma.Sql>
    )[query.sortBy ?? "revenue"] ?? Prisma.sql`COALESCE(s.revenue,0)`;
  const order = query.sortOrder === "asc" ? Prisma.sql`ASC` : Prisma.sql`DESC`;
  const productSales = Prisma.sql`SELECT oi."productId", SUM(oi.quantity) AS units, SUM(oi."lineTotal") AS revenue FROM "OrderItem" oi JOIN "VendorOrder" vo ON vo.id=oi."vendorOrderId" WHERE vo.status='DELIVERED' AND vo."createdAt">=${range.start} AND vo."createdAt"<${range.end} GROUP BY oi."productId"`;
  const [
    rows,
    totals,
    listingGroups,
    statusGroups,
    trend,
    topProductsByRevenue,
    topProductsByUnits,
    byCategory,
    countRows,
  ] = await Promise.all([
    prisma.$queryRaw<NumericRow[]>(Prisma.sql`
      SELECT p.id AS "productId", p.name AS "productName", p.sku, p.price::float8 AS price, p."stockQuantity", p.status AS "productStatus", p."listingStatus", p."createdAt",
        COALESCE(vp."businessName",u.name,'Unnamed vendor') AS "vendorName", c.name AS "categoryName", c.id AS "categoryId", img."imageUrl",
        COALESCE(s.units,0)::int AS "unitsSold", COALESCE(s.revenue,0)::float8 AS revenue
      FROM "Product" p JOIN "VendorProfile" vp ON vp.id=p."vendorProfileId" JOIN "User" u ON u.id=vp."userId" JOIN "Category" c ON c.id=p."categoryId"
      LEFT JOIN LATERAL (SELECT "imageUrl" FROM "ProductImage" WHERE "productId"=p.id ORDER BY "sortOrder", "createdAt" LIMIT 1) img ON TRUE
      LEFT JOIN (${productSales}) s ON s."productId"=p.id
      ${where} ORDER BY ${sortColumn} ${order} NULLS LAST LIMIT ${query.limit} OFFSET ${(query.page - 1) * query.limit}`),
    prisma.product.count({
      where: { status: { not: ProductStatus.ARCHIVED } },
    }),
    prisma.product.groupBy({
      by: ["listingStatus"],
      where: { status: { not: ProductStatus.ARCHIVED } },
      _count: { _all: true },
    }),
    prisma.product.groupBy({
      by: ["status"],
      where: { status: { not: ProductStatus.ARCHIVED } },
      _count: { _all: true },
    }),
    prisma.$queryRaw<NumericRow[]>(
      Prisma.sql`SELECT date_trunc(${truncUnit(query.groupBy, range)}, "createdAt") AS bucket, COUNT(*)::int AS count FROM "Product" WHERE "createdAt">=${range.start} AND "createdAt"<${range.end} GROUP BY bucket ORDER BY bucket`,
    ),
    topProductSales(range, 10, "revenue"),
    topProductSales(range, 10, "unitsSold"),
    categoryRevenue(range),
    prisma.$queryRaw<{ count: bigint }[]>(
      Prisma.sql`SELECT COUNT(*) AS count FROM "Product" p ${where}`,
    ),
  ]);
  const lowStock = await prisma.product.count({
    where: {
      status: { not: ProductStatus.ARCHIVED },
      stockQuantity: { gt: 0, lte: LOW_STOCK },
    },
  });
  const outOfStock = await prisma.product.count({
    where: { status: { not: ProductStatus.ARCHIVED }, stockQuantity: 0 },
  });
  const productStatusCount = (status: string) =>
    statusGroups.find((item) => item.status === status)?._count._all ?? 0;
  const listingStatusCount = (status: string) =>
    listingGroups.find((item) => item.listingStatus === status)?._count._all ??
    0;
  return {
    range: rangeDto(range),
    kpis: {
      totalProducts: totals,
      approvedProducts: listingStatusCount("APPROVED"),
      pendingProducts: listingStatusCount("PENDING"),
      rejectedProducts: listingStatusCount("REJECTED"),
      activeProducts: productStatusCount("ACTIVE"),
      inactiveProducts:
        productStatusCount("INACTIVE") + productStatusCount("DRAFT"),
      outOfStockProducts: outOfStock,
      lowStockProducts: lowStock,
    },
    charts: {
      topSellingProducts: topProductsByUnits,
      highestRevenueProducts: topProductsByRevenue,
      salesByCategory: byCategory,
      listingApprovalDistribution: listingGroups.map((item) => ({
        status: item.listingStatus,
        count: item._count._all,
      })),
      creationTrend: trend.map((row) => ({
        date: new Date(String(row.bucket)).toISOString(),
        products: num(row.count),
      })),
    },
    products: rows.map((row) => ({
      ...row,
      price: num(row.price),
      stockQuantity: num(row.stockQuantity),
      unitsSold: num(row.unitsSold),
      revenue: num(row.revenue),
    })),
    pagination: {
      currentPage: query.page,
      pageSize: query.limit,
      totalRows: num(countRows[0]?.count),
      totalPages: Math.ceil(num(countRows[0]?.count) / query.limit),
      hasNextPage: query.page * query.limit < num(countRows[0]?.count),
      hasPreviousPage: query.page > 1,
    },
  };
}

async function customerOrderStats(range: Range) {
  const rows = await prisma.$queryRaw<NumericRow[]>(Prisma.sql`
    WITH customer_orders AS (
      SELECT o."customerProfileId", COUNT(*) FILTER (WHERE o.status='DELIVERED')::int AS orders,
        COALESCE(SUM(o."totalAmount") FILTER (WHERE o.status='DELIVERED'),0)::float8 AS spend,
        MAX(o."createdAt") FILTER (WHERE o.status='DELIVERED') AS "lastOrderAt"
      FROM "Order" o WHERE o."createdAt">=${range.start} AND o."createdAt"<${range.end} GROUP BY o."customerProfileId"
    )
    SELECT COUNT(*) FILTER (WHERE orders>0)::int AS "customersWithOrders", COUNT(*) FILTER (WHERE orders>=2)::int AS "returningCustomers",
      COALESCE(SUM(spend),0)::float8 AS spend, COALESCE(SUM(orders),0)::int AS orders,
      CASE WHEN SUM(orders)>0 THEN (SUM(spend)/SUM(orders))::float8 ELSE 0::float8 END AS "averageOrderValue"
    FROM customer_orders`);
  return rows[0] ?? {};
}

export async function getCustomerAnalytics(query: AnalyticsQuery) {
  const range = resolveAnalyticsRange(query);
  const filters: Prisma.Sql[] = [dateFilter('u."createdAt"', range)];
  if (query.search)
    filters.push(
      Prisma.sql`(u.name ILIKE ${`%${query.search}%`} OR COALESCE(u.email,'') ILIKE ${`%${query.search}%`})`,
    );
  if (query.customerStatus)
    filters.push(Prisma.sql`u.status = ${query.customerStatus}`);
  const where = sqlFilters(filters);
  const sortColumn =
    (
      {
        name: Prisma.sql`u.name`,
        totalOrders: Prisma.sql`COALESCE(o.orders,0)`,
        totalPurchaseValue: Prisma.sql`COALESCE(o.spend,0)`,
        registeredAt: Prisma.sql`u."createdAt"`,
        lastOrderAt: Prisma.sql`o."lastOrderAt"`,
      } as Record<string, Prisma.Sql>
    )[query.sortBy ?? "totalPurchaseValue"] ?? Prisma.sql`COALESCE(o.spend,0)`;
  const order = query.sortOrder === "asc" ? Prisma.sql`ASC` : Prisma.sql`DESC`;
  const [
    totalCustomers,
    newCustomers,
    orderStats,
    rows,
    countRows,
    registration,
    purchaseTrend,
    distribution,
  ] = await Promise.all([
    prisma.customerProfile.count(),
    prisma.customerProfile.count({ where: { createdAt: rangeWhere(range) } }),
    customerOrderStats(range),
    prisma.$queryRaw<NumericRow[]>(Prisma.sql`
      SELECT cp.id AS "customerId", u.name, u.email, u.status AS "accountStatus", u."createdAt" AS "registeredAt",
        COALESCE(o.orders,0)::int AS "totalOrders", COALESCE(o.spend,0)::float8 AS "totalPurchaseValue", o."lastOrderAt"
      FROM "CustomerProfile" cp JOIN "User" u ON u.id=cp."userId"
      LEFT JOIN (SELECT "customerProfileId", COUNT(*) FILTER (WHERE status='DELIVERED')::int AS orders, SUM("totalAmount") FILTER (WHERE status='DELIVERED') AS spend, MAX("createdAt") FILTER (WHERE status='DELIVERED') AS "lastOrderAt" FROM "Order" WHERE "createdAt">=${range.start} AND "createdAt"<${range.end} GROUP BY "customerProfileId") o ON o."customerProfileId"=cp.id
      ${where} ORDER BY ${sortColumn} ${order} NULLS LAST LIMIT ${query.limit} OFFSET ${(query.page - 1) * query.limit}`),
    prisma.$queryRaw<{ count: bigint }[]>(
      Prisma.sql`SELECT COUNT(*) AS count FROM "CustomerProfile" cp JOIN "User" u ON u.id=cp."userId" ${where}`,
    ),
    prisma.$queryRaw<NumericRow[]>(
      Prisma.sql`SELECT date_trunc(${truncUnit(query.groupBy, range)}, "createdAt") AS bucket, COUNT(*)::int AS count FROM "CustomerProfile" WHERE "createdAt">=${range.start} AND "createdAt"<${range.end} GROUP BY bucket ORDER BY bucket`,
    ),
    prisma.$queryRaw<NumericRow[]>(
      Prisma.sql`SELECT date_trunc(${truncUnit(query.groupBy, range)}, "createdAt") AS bucket, COUNT(*)::int AS orders, COALESCE(SUM("totalAmount"),0)::float8 AS spend FROM "Order" WHERE status='DELIVERED' AND "createdAt">=${range.start} AND "createdAt"<${range.end} GROUP BY bucket ORDER BY bucket`,
    ),
    prisma.$queryRaw<NumericRow[]>(
      Prisma.sql`WITH counts AS (SELECT "customerProfileId", COUNT(*)::int AS orders FROM "Order" WHERE status='DELIVERED' AND "createdAt">=${range.start} AND "createdAt"<${range.end} GROUP BY "customerProfileId") SELECT CASE WHEN orders=1 THEN '1' WHEN orders BETWEEN 2 AND 5 THEN '2-5' ELSE '6+' END AS bucket, COUNT(*)::int AS customers FROM counts GROUP BY bucket ORDER BY bucket`,
    ),
  ]);
  return {
    range: rangeDto(range),
    kpis: {
      totalCustomers,
      newCustomers,
      returningCustomers: num(orderStats.returningCustomers),
      customersWithOrders: num(orderStats.customersWithOrders),
      averageCustomerOrderValue: num(orderStats.averageOrderValue),
    },
    charts: {
      registrationGrowth: registration.map((row) => ({
        date: new Date(String(row.bucket)).toISOString(),
        customers: num(row.count),
      })),
      newVsReturning: [
        { label: "New registered customers", value: newCustomers },
        {
          label: "Returning customers with 2+ delivered orders",
          value: num(orderStats.returningCustomers),
        },
      ],
      orderDistribution: distribution,
      purchaseTrend: purchaseTrend.map((row) => ({
        date: new Date(String(row.bucket)).toISOString(),
        orders: num(row.orders),
        spend: num(row.spend),
      })),
    },
    customers: rows.map((row) => ({
      ...row,
      totalOrders: num(row.totalOrders),
      totalPurchaseValue: num(row.totalPurchaseValue),
    })),
    pagination: {
      currentPage: query.page,
      pageSize: query.limit,
      totalRows: num(countRows[0]?.count),
      totalPages: Math.ceil(num(countRows[0]?.count) / query.limit),
      hasNextPage: query.page * query.limit < num(countRows[0]?.count),
      hasPreviousPage: query.page > 1,
    },
  };
}

export async function getInventoryAnalytics(query: AnalyticsQuery) {
  const range = resolveAnalyticsRange(query);
  const filters: Prisma.Sql[] = [Prisma.sql`p.status <> 'ARCHIVED'`];
  if (query.vendorId)
    filters.push(Prisma.sql`p."vendorProfileId" = ${query.vendorId}`);
  if (query.categoryId)
    filters.push(Prisma.sql`p."categoryId" = ${query.categoryId}`);
  if (query.stockStatus === "OUT_OF_STOCK")
    filters.push(Prisma.sql`p."stockQuantity" = 0`);
  if (query.stockStatus === "IN_STOCK")
    filters.push(Prisma.sql`p."stockQuantity" > 0`);
  if (query.stockStatus === "LOW_STOCK")
    filters.push(Prisma.sql`p."stockQuantity" BETWEEN 1 AND ${LOW_STOCK}`);
  if (query.search)
    filters.push(
      Prisma.sql`(p.name ILIKE ${`%${query.search}%`} OR p.sku ILIKE ${`%${query.search}%`})`,
    );
  const where = sqlFilters(filters);
  const sortColumn =
    (
      {
        stock: Prisma.sql`p."stockQuantity"`,
        unitsSold: Prisma.sql`COALESCE(s.units,0)`,
        name: Prisma.sql`p.name`,
        lastMovement: Prisma.sql`m."lastMovement"`,
      } as Record<string, Prisma.Sql>
    )[query.sortBy ?? "stock"] ?? Prisma.sql`p."stockQuantity"`;
  const order = query.sortOrder === "asc" ? Prisma.sql`ASC` : Prisma.sql`DESC`;
  const productSales = Prisma.sql`SELECT oi."productId", SUM(oi.quantity) AS units FROM "OrderItem" oi JOIN "VendorOrder" vo ON vo.id=oi."vendorOrderId" WHERE vo.status='DELIVERED' AND vo."createdAt">=${range.start} AND vo."createdAt"<${range.end} GROUP BY oi."productId"`;
  const [
    aggregate,
    lowStock,
    outOfStock,
    rows,
    countRows,
    movements,
    lowByCategory,
    fastMoving,
    slowMoving,
  ] = await Promise.all([
    prisma.product.aggregate({
      where: { status: { not: ProductStatus.ARCHIVED } },
      _count: { _all: true },
      _sum: { stockQuantity: true },
    }),
    prisma.product.count({
      where: {
        status: { not: ProductStatus.ARCHIVED },
        stockQuantity: { gt: 0, lte: LOW_STOCK },
      },
    }),
    prisma.product.count({
      where: { status: { not: ProductStatus.ARCHIVED }, stockQuantity: 0 },
    }),
    prisma.$queryRaw<NumericRow[]>(Prisma.sql`
      SELECT p.id AS "productId", p.name AS "productName", p.sku, p."stockQuantity", c.name AS "categoryName",
        COALESCE(vp."businessName",u.name,'Unnamed vendor') AS "vendorName", COALESCE(s.units,0)::int AS "unitsSold", m."lastMovement"
      FROM "Product" p JOIN "VendorProfile" vp ON vp.id=p."vendorProfileId" JOIN "User" u ON u.id=vp."userId" JOIN "Category" c ON c.id=p."categoryId"
      LEFT JOIN (${productSales}) s ON s."productId"=p.id
      LEFT JOIN LATERAL (SELECT MAX("createdAt") AS "lastMovement" FROM "InventoryMovement" WHERE "productId"=p.id) m ON TRUE
      ${where} ORDER BY ${sortColumn} ${order} NULLS LAST LIMIT ${query.limit} OFFSET ${(query.page - 1) * query.limit}`),
    prisma.$queryRaw<{ count: bigint }[]>(
      Prisma.sql`SELECT COUNT(*) AS count FROM "Product" p ${where}`,
    ),
    prisma.$queryRaw<NumericRow[]>(
      Prisma.sql`SELECT date_trunc(${truncUnit(query.groupBy, range)}, "createdAt") AS bucket, COALESCE(SUM(quantity),0)::int AS quantity, COUNT(*)::int AS movements FROM "InventoryMovement" WHERE "createdAt">=${range.start} AND "createdAt"<${range.end} GROUP BY bucket ORDER BY bucket`,
    ),
    prisma.$queryRaw<NumericRow[]>(
      Prisma.sql`SELECT c.id AS "categoryId", c.name AS "categoryName", COUNT(p.id)::int AS products FROM "Product" p JOIN "Category" c ON c.id=p."categoryId" WHERE p.status<>'ARCHIVED' AND p."stockQuantity" BETWEEN 1 AND ${LOW_STOCK} GROUP BY c.id,c.name ORDER BY products DESC LIMIT 10`,
    ),
    prisma.$queryRaw<NumericRow[]>(
      Prisma.sql`SELECT p.id AS "productId", p.name AS "productName", p.sku, SUM(oi.quantity)::int AS "unitsSold" FROM "OrderItem" oi JOIN "VendorOrder" vo ON vo.id=oi."vendorOrderId" JOIN "Product" p ON p.id=oi."productId" WHERE vo.status='DELIVERED' AND vo."createdAt">=${range.start} AND vo."createdAt"<${range.end} AND p.status<>'ARCHIVED' GROUP BY p.id,p.name,p.sku ORDER BY "unitsSold" DESC LIMIT 10`,
    ),
    prisma.$queryRaw<NumericRow[]>(
      Prisma.sql`SELECT p.id AS "productId", p.name AS "productName", p.sku,p."stockQuantity" FROM "Product" p WHERE p.status<>'ARCHIVED' AND p."stockQuantity">0 AND NOT EXISTS (SELECT 1 FROM "OrderItem" oi JOIN "VendorOrder" vo ON vo.id=oi."vendorOrderId" WHERE oi."productId"=p.id AND vo.status='DELIVERED' AND vo."createdAt">=${range.start} AND vo."createdAt"<${range.end}) ORDER BY p."stockQuantity" DESC LIMIT 10`,
    ),
  ]);
  return {
    range: rangeDto(range),
    kpis: {
      totalListedProducts: aggregate._count._all,
      totalUnitsInStock: aggregate._sum.stockQuantity ?? 0,
      lowStockProducts: lowStock,
      outOfStockProducts: outOfStock,
      inventoryValue: null,
    },
    inventoryValueNote:
      "Inventory value is unavailable because the Product model has no cost or valuation field.",
    charts: {
      stockDistribution: [
        { status: "OUT_OF_STOCK", products: outOfStock },
        { status: "LOW_STOCK", products: lowStock },
        {
          status: "IN_STOCK",
          products: Math.max(0, aggregate._count._all - outOfStock - lowStock),
        },
      ],
      lowStockByCategory: lowByCategory,
      movementTrend: movements.map((row) => ({
        date: new Date(String(row.bucket)).toISOString(),
        type: String(row.type),
        quantity: num(row.quantity),
        movements: num(row.movements),
      })),
      fastMovingProducts: fastMoving.map((row) => ({
        ...row,
        unitsSold: num(row.unitsSold),
      })),
      slowMovingProducts: slowMoving,
    },
    inventory: rows.map((row) => ({
      ...row,
      stockQuantity: num(row.stockQuantity),
      unitsSold: num(row.unitsSold),
      lastMovement: row.lastMovement
        ? new Date(String(row.lastMovement)).toISOString()
        : null,
      stockStatus:
        num(row.stockQuantity) === 0
          ? "OUT_OF_STOCK"
          : num(row.stockQuantity) <= LOW_STOCK
            ? "LOW_STOCK"
            : "IN_STOCK",
    })),
    pagination: {
      currentPage: query.page,
      pageSize: query.limit,
      totalRows: num(countRows[0]?.count),
      totalPages: Math.ceil(num(countRows[0]?.count) / query.limit),
      hasNextPage: query.page * query.limit < num(countRows[0]?.count),
      hasPreviousPage: query.page > 1,
    },
  };
}
