"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, TrendingDown, TrendingUp } from "lucide-react";
import { getAuthSession } from "@/features/auth/auth.utils";
import { getAdminAnalytics, type AdminAnalyticsSection } from "../../admin.api";
import type { AdminAnalyticsData, AnalyticsRow } from "../../admin.types";

const headings: Record<AdminAnalyticsSection, { title: string; subtitle: string }> = {
  overview: { title: "Analytics overview", subtitle: "Marketplace-wide performance for the selected period." },
  sales: { title: "Sales & revenue", subtitle: "Delivered sales, recorded commission, orders, and payment outcomes." },
  vendors: { title: "Vendor performance", subtitle: "Marketplace seller activity, verification, and delivered sales." },
  products: { title: "Product performance", subtitle: "Listing approval, availability, and completed sales by product." },
  customers: { title: "Customer analytics", subtitle: "Customer growth and completed purchase behavior." },
  inventory: { title: "Inventory analytics", subtitle: "Current stock health and recorded inventory movement." },
};
const labels: Record<string, string> = {
  gmv: "Total GMV", platformRevenue: "Platform revenue", totalOrders: "Total orders", totalVendors: "Total vendors", activeVendors: "Active vendors", totalCustomers: "Total customers", totalProducts: "Total products", pendingProductApprovals: "Pending approvals",
  averageOrderValue: "Average order value", recordedRefunds: "Recorded refunds", cancelledOrders: "Cancelled orders", pendingVendors: "Pending vendors", suspendedVendors: "Suspended vendors", verifiedVendors: "Verified vendors",
  approvedProducts: "Approved products", pendingProducts: "Pending products", rejectedProducts: "Rejected products", inactiveProducts: "Inactive products", activeProducts: "Active products", outOfStockProducts: "Out of stock", lowStockProducts: "Low stock",
  newCustomers: "New customers", returningCustomers: "Returning customers", customersWithOrders: "Customers with orders", averageCustomerOrderValue: "Average customer order value", totalListedProducts: "Listed products", totalUnitsInStock: "Units in stock",
};
const moneyKeys = new Set(["gmv", "platformRevenue", "averageOrderValue", "recordedRefunds", "totalSales", "totalPurchaseValue", "orderAmount", "revenue", "spend", "vendorAmount"]);
const currency = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
const number = (value: number) => new Intl.NumberFormat("en-IN").format(value);
const titleCase = (value: string) => value.replace(/([A-Z])/g, " $1").replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
const asNumber = (value: unknown) => typeof value === "number" ? value : Number(value ?? 0);

function Panel({ title, subtitle, children, className = "" }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return <section className={`min-w-0 rounded-xl border border-[#e1e5ec] bg-white p-4 sm:p-5 ${className}`}><div className="mb-4"><h2 className="text-sm font-semibold text-[#172033]">{title}</h2>{subtitle && <p className="mt-1 text-xs text-[#778195]">{subtitle}</p>}</div>{children}</section>;
}

function KpiGrid({ values }: { values: AdminAnalyticsData["kpis"] }) {
  const entries = Object.entries(values);
  return <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">{entries.map(([key, raw]) => {
    const value = typeof raw === "number" ? raw : raw.value;
    const change = typeof raw === "number" ? null : raw.changePercent;
    return <article key={key} className="rounded-xl border border-[#e1e5ec] bg-white p-4"><p className="text-xs font-medium text-[#778195]">{labels[key] ?? titleCase(key)}</p><p className="mt-2 truncate text-xl font-semibold tracking-tight text-[#172033]">{moneyKeys.has(key) ? currency(value) : number(value)}</p>{change !== null && change !== undefined && <p className={`mt-2 inline-flex items-center gap-1 text-[11px] font-medium ${change >= 0 ? "text-emerald-700" : "text-rose-700"}`}>{change >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}{Math.abs(change).toFixed(1)}% vs previous period</p>}</article>;
  })}</section>;
}

function TrendChart({ rows, valueKey, color = "#2864f0", format = "number", secondaryKey }: { rows: AnalyticsRow[]; valueKey: string; color?: string; format?: "number" | "currency"; secondaryKey?: string }) {
  const values = rows.map((row) => asNumber(row[valueKey]));
  const secondary = secondaryKey ? rows.map((row) => asNumber(row[secondaryKey])) : [];
  const max = Math.max(...values, ...secondary, 1);
  const pointsFor = (series: number[]) => series.map((value, index) => `${series.length < 2 ? 300 : 12 + index * (576 / (series.length - 1))},${146 - (value / max) * 122}`).join(" ");
  const points = pointsFor(values);
  const shown = rows.filter((_, index) => index === 0 || index === Math.floor((rows.length - 1) / 2) || index === rows.length - 1);
  if (!rows.length) return <div className="flex h-48 items-center justify-center text-xs text-[#8993a5]">No data for this period.</div>;
  return <div><div className="h-48 w-full"><svg viewBox="0 0 600 160" preserveAspectRatio="none" role="img" aria-label={`${titleCase(valueKey)} over time`} className="h-full w-full">{[24, 64, 104, 146].map((y) => <line key={y} x1="0" y1={y} x2="600" y2={y} stroke="#e8ecf2" strokeWidth="1" />)}{values.some((value) => value > 0) && <><polyline points={points} fill="none" stroke={color} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />{secondary.length > 0 && <polyline points={pointsFor(secondary)} fill="none" stroke="#11a683" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />}{values.map((value, index) => { const [x, y] = points.split(" ")[index]?.split(",") ?? ["0", "0"]; return <circle key={index} cx={x} cy={y} r="3" fill={color}><title>{format === "currency" ? currency(value) : number(value)}</title></circle>; })}</>}</svg></div><div className="flex justify-between text-[10px] text-[#8993a5]">{shown.map((row, index) => <span key={`${String(row.date)}-${index}`}>{row.date ? new Date(String(row.date)).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}</span>)}</div>{secondaryKey && <div className="mt-3 flex gap-4 text-[10px] text-[#667085]"><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#2864f0]" />{titleCase(valueKey)}</span><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#11a683]" />{titleCase(secondaryKey)}</span></div>}</div>;
}

function Bars({ rows, labelKey, valueKey, currencyValue = false }: { rows: AnalyticsRow[]; labelKey: string; valueKey: string; currencyValue?: boolean }) {
  const max = Math.max(...rows.map((row) => asNumber(row[valueKey])), 1);
  if (!rows.length) return <div className="py-10 text-center text-xs text-[#8993a5]">No data for this period.</div>;
  return <div className="space-y-3">{rows.slice(0, 8).map((row, index) => { const value = asNumber(row[valueKey]); const label = String(row[labelKey] ?? "Unknown"); return <div key={`${label}-${index}`}><div className="mb-1 flex items-center justify-between gap-3 text-xs"><span className="truncate text-[#596579]">{label}</span><strong className="shrink-0 text-[#253047]">{currencyValue ? currency(value) : number(value)}</strong></div><div className="h-2 overflow-hidden rounded-full bg-[#edf1f6]"><div className="h-full rounded-full bg-[#3478f6]" style={{ width: `${Math.max(value > 0 ? 2 : 0, value / max * 100)}%` }} /></div></div>; })}</div>;
}

function StatusBars({ rows, labelKey = "status", valueKey = "count" }: { rows: AnalyticsRow[]; labelKey?: string; valueKey?: string }) {
  return <Bars rows={rows.map((row) => ({ ...row, [labelKey]: titleCase(String(row[labelKey] ?? "")) }))} labelKey={labelKey} valueKey={valueKey} />;
}

function DateFilters({ period, setPeriod, startDate, setStartDate, endDate, setEndDate }: { period: string; setPeriod: (value: string) => void; startDate: string; setStartDate: (value: string) => void; endDate: string; setEndDate: (value: string) => void }) {
  return <div className="flex flex-wrap items-center gap-2"><label className="sr-only" htmlFor="analytics-period">Date range</label><select id="analytics-period" value={period} onChange={(event) => setPeriod(event.target.value)} className="rounded-lg border border-[#dce2eb] bg-white px-3 py-2 text-xs text-[#344054]"><option value="today">Today</option><option value="last7">Last 7 days</option><option value="last30">Last 30 days</option><option value="last90">Last 90 days</option><option value="thisYear">This year</option><option value="custom">Custom range</option></select>{period === "custom" && <><input aria-label="Start date" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="rounded-lg border border-[#dce2eb] px-2 py-2 text-xs" /><input aria-label="End date" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="rounded-lg border border-[#dce2eb] px-2 py-2 text-xs" /></>}</div>;
}

function Table({ rows, section, onView }: { rows: AnalyticsRow[]; section: AdminAnalyticsSection; onView?: (row: AnalyticsRow) => void }) {
  const columns: Record<AdminAnalyticsSection, [string, string][]> = {
    overview: [],
    sales: [["Order", "orderNumber"], ["Date", "orderDate"], ["Customer", "customer"], ["Vendor", "vendors"], ["Amount", "orderAmount"], ["Payment", "paymentStatus"], ["Order status", "orderStatus"]],
    vendors: [["Vendor", "name"], ["Business", "businessName"], ["Products", "totalProducts"], ["Approved", "approvedProducts"], ["Orders", "totalOrders"], ["Sales", "totalSales"], ["Account", "vendorStatus"], ["Verification", "verificationStatus"], ["View", "details"]],
    products: [["Product", "productName"], ["Vendor", "vendorName"], ["Category", "categoryName"], ["SKU", "sku"], ["Units", "unitsSold"], ["Revenue", "revenue"], ["Stock", "stockQuantity"], ["Listing", "listingStatus"], ["Status", "productStatus"]],
    customers: [["Customer", "name"], ["Email", "email"], ["Registered", "registeredAt"], ["Orders", "totalOrders"], ["Purchase value", "totalPurchaseValue"], ["Last order", "lastOrderAt"], ["Account", "accountStatus"], ["View", "details"]],
    inventory: [["Product", "productName"], ["Vendor", "vendorName"], ["SKU", "sku"], ["Category", "categoryName"], ["Stock", "stockQuantity"], ["Stock status", "stockStatus"], ["Units sold", "unitsSold"], ["Last movement", "lastMovement"]],
  };
  const cols = columns[section];
  return <div className="overflow-x-auto"><table className="w-full min-w-[760px] border-collapse text-left text-xs"><thead><tr className="border-b border-[#e8ecf2] text-[10px] uppercase tracking-wide text-[#8993a5]">{cols.map(([label]) => <th key={label} className="px-3 py-3 font-semibold">{label}</th>)}</tr></thead><tbody>{rows.map((row, rowIndex) => <tr key={String(row.id ?? row.orderNumber ?? row.productId ?? row.customerId ?? row.vendorId ?? rowIndex)} className="border-b border-[#f0f2f6] last:border-0 hover:bg-[#fafbfc]">{cols.map(([, key]) => { const value = row[key]; let shown = value === null || value === undefined || value === "" ? "—" : Array.isArray(value) ? value.join(", ") : String(value); if (typeof value === "number") shown = moneyKeys.has(key) ? currency(value) : number(value); if (typeof value === "string" && /(Date|At|date|Movement)$/.test(key) && value) shown = new Date(value).toLocaleDateString("en-IN", { dateStyle: "medium" }); return <td key={key} className="max-w-[210px] truncate px-3 py-3 text-[#475467]">{key === "details" ? <button type="button" onClick={() => onView?.(row)} className="font-semibold text-blue-700 hover:underline">View</button> : key === "productName" && row.imageUrl ? <span className="flex items-center gap-2"><img src={String(row.imageUrl)} alt="" className="h-8 w-8 rounded object-cover" /><span className="truncate">{shown}</span></span> : shown}</td>; })}</tr>)}</tbody></table></div>;
}

function kpisFor(data: AdminAnalyticsData, section: AdminAnalyticsSection) {
  const keys: Record<AdminAnalyticsSection, string[]> = {
    overview: ["gmv", "platformRevenue", "totalOrders", "totalVendors", "activeVendors", "totalCustomers", "totalProducts", "pendingProductApprovals"],
    sales: ["gmv", "platformRevenue", "totalOrders", "averageOrderValue", "recordedRefunds", "cancelledOrders"],
    vendors: ["totalVendors", "activeVendors", "pendingVendors", "suspendedVendors", "verifiedVendors"],
    products: ["totalProducts", "approvedProducts", "pendingProducts", "rejectedProducts", "activeProducts", "inactiveProducts", "outOfStockProducts", "lowStockProducts"],
    customers: ["totalCustomers", "newCustomers", "returningCustomers", "customersWithOrders", "averageCustomerOrderValue"],
    inventory: ["totalListedProducts", "totalUnitsInStock", "lowStockProducts", "outOfStockProducts"],
  };
  return Object.fromEntries(keys[section].filter((key) => key in data.kpis).map((key) => [key, data.kpis[key]]));
}

export default function AnalyticsPage({ section }: { section: AdminAnalyticsSection }) {
  const [data, setData] = useState<AdminAnalyticsData | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<AnalyticsRow | null>(null);
  const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const [period, setPeriod] = useState("last30"); const [startDate, setStartDate] = useState(""); const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState(""); const [page, setPage] = useState(1); const [sortBy, setSortBy] = useState(""); const [sortOrder, setSortOrder] = useState("desc"); const [groupBy, setGroupBy] = useState("daily");
  const [vendorStatus, setVendorStatus] = useState(""); const [customerStatus, setCustomerStatus] = useState(""); const [verification, setVerification] = useState(""); const [listingStatus, setListingStatus] = useState(""); const [productStatus, setProductStatus] = useState(""); const [orderStatus, setOrderStatus] = useState(""); const [paymentStatus, setPaymentStatus] = useState(""); const [stockStatus, setStockStatus] = useState(""); const [vendorId, setVendorId] = useState(""); const [categoryId, setCategoryId] = useState("");
  const params = useMemo(() => ({ period, ...(period === "custom" ? { startDate: startDate || undefined, endDate: endDate || undefined } : {}), groupBy, page, limit: 10, search: search || undefined, sortBy: sortBy || undefined, sortOrder,
    vendorStatus: vendorStatus || undefined, customerStatus: customerStatus || undefined, verificationStatus: verification || undefined, listingStatus: listingStatus || undefined, productStatus: productStatus || undefined, orderStatus: orderStatus || undefined, paymentStatus: paymentStatus || undefined, stockStatus: stockStatus || undefined, vendorId: vendorId || undefined, categoryId: categoryId || undefined }), [period, startDate, endDate, groupBy, page, search, sortBy, sortOrder, vendorStatus, customerStatus, verification, listingStatus, productStatus, orderStatus, paymentStatus, stockStatus, vendorId, categoryId]);
  const load = useCallback(async () => {
    if (period === "custom" && (!startDate || !endDate)) { setLoading(false); setError("Choose both dates to load the custom range."); return; }
    setLoading(true); setError("");
    try { const session = getAuthSession("ADMIN"); if (!session?.token) throw new Error("Your admin session was not found. Please log in again."); setData(await getAdminAnalytics(session.token, section, params)); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to load analytics."); }
    finally { setLoading(false); }
  }, [section, params, period, startDate, endDate]);
  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 180); return () => window.clearTimeout(timer); }, [load]);

  const setFilter = (setter: (value: string) => void, value: string) => { setPage(1); setter(value); };
  const rows = section === "sales" ? data?.transactions : section === "vendors" ? data?.vendors : section === "products" ? data?.products : section === "customers" ? data?.customers : section === "inventory" ? data?.inventory : [];
  const pagination = data?.pagination;
  const chart = (name: string) => data?.charts[name] ?? [];
  const pageHeading = headings[section];

  return <main className="min-h-full bg-[#f3f5f8] p-4 sm:p-5 lg:p-7"><div className="mx-auto max-w-[1500px] space-y-5">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#3478f6]">Marketplace analytics</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#172033]">{pageHeading.title}</h1><p className="mt-1 text-sm text-[#778195]">{pageHeading.subtitle}</p></div><div className="flex flex-wrap items-center gap-2"><DateFilters period={period} setPeriod={(value) => { setPage(1); setPeriod(value); }} startDate={startDate} setStartDate={(value) => { setPage(1); setStartDate(value); }} endDate={endDate} setEndDate={(value) => { setPage(1); setEndDate(value); }} />{(section === "overview" || section === "sales") && <FilterSelect label="Chart interval" value={groupBy} onChange={(value) => setFilter(setGroupBy, value)} options={["daily", "weekly", "monthly"]} />}<button type="button" onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-[#dce2eb] bg-white px-3 py-2 text-xs font-medium text-[#344054] disabled:opacity-60"><RefreshCw size={14} className={loading ? "animate-spin" : ""} />Refresh</button></div></header>
    {error && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"><span>{error}</span><button type="button" onClick={() => void load()} className="font-semibold underline">Retry</button></div>}
    {loading && !data ? <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{Array.from({ length: 8 }, (_, i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-white" />)}</div> : data && <>
      <KpiGrid values={kpisFor(data, section)} />
      {section === "overview" && <>
        <div className="grid gap-4 xl:grid-cols-2"><Panel title="Revenue trend" subtitle="GMV and recorded commission from delivered vendor orders."><TrendChart rows={chart("revenueTrend")} valueKey="gmv" secondaryKey="platformRevenue" format="currency" /></Panel><Panel title="Order trend" subtitle="Distinct marketplace orders created in each period."><TrendChart rows={chart("ordersTrend")} valueKey="orders" color="#11a683" /></Panel></div>
        <div className="grid gap-4 xl:grid-cols-3"><Panel title="Sales by category"><Bars rows={chart("salesByCategory")} labelKey="categoryName" valueKey="sales" currencyValue /></Panel><Panel title="Order status"><StatusBars rows={chart("orderStatusDistribution")} /></Panel><Panel title="Top vendors"><Bars rows={chart("topVendors")} labelKey="vendorName" valueKey="gmv" currencyValue /></Panel></div>
        <Panel title="Top selling products" subtitle="Completed units sold and revenue."><Bars rows={chart("topProducts")} labelKey="productName" valueKey="revenue" currencyValue /></Panel>
        {data.definitions && <p className="text-xs leading-5 text-[#778195]">{data.definitions.gmv} {data.definitions.platformRevenue}</p>}
      </>}
      {section === "sales" && <><div className="grid gap-4 xl:grid-cols-2"><Panel title="GMV and platform revenue"><TrendChart rows={chart("gmvVsPlatformRevenue")} valueKey="gmv" secondaryKey="platformRevenue" format="currency" /></Panel><Panel title="Orders by status"><StatusBars rows={chart("ordersByStatus")} /></Panel></div><div className="grid gap-4 xl:grid-cols-2"><Panel title="Revenue by category"><Bars rows={chart("revenueByCategory")} labelKey="categoryName" valueKey="sales" currencyValue /></Panel><Panel title="Revenue by vendor"><Bars rows={chart("revenueByVendor")} labelKey="vendorName" valueKey="gmv" currencyValue /></Panel></div><Panel title="Monthly sales comparison"><TrendChart rows={chart("monthlySalesComparison")} valueKey="gmv" secondaryKey="platformRevenue" format="currency" /></Panel><p className="text-xs leading-5 text-[#778195]">{data.definitions?.gmv} {data.definitions?.platformRevenue} {data.definitions?.recordedRefunds}</p></>}
      {section === "vendors" && <div className="grid gap-4 xl:grid-cols-2"><Panel title="Vendor registrations"><TrendChart rows={chart("registrationGrowth")} valueKey="vendors" color="#11a683" /></Panel><Panel title="Vendor account status"><StatusBars rows={chart("statusDistribution")} /></Panel><Panel title="Verification status"><StatusBars rows={chart("verificationDistribution")} /></Panel><Panel title="Revenue by vendor"><Bars rows={chart("vendorRevenue")} labelKey="vendorName" valueKey="gmv" currencyValue /></Panel><Panel title="Orders by vendor"><Bars rows={chart("vendorOrderVolume")} labelKey="vendorName" valueKey="orders" /></Panel></div>}
      {section === "products" && <div className="grid gap-4 xl:grid-cols-2"><Panel title="Top selling products"><Bars rows={chart("topSellingProducts")} labelKey="productName" valueKey="unitsSold" /></Panel><Panel title="Highest revenue products"><Bars rows={chart("highestRevenueProducts")} labelKey="productName" valueKey="revenue" currencyValue /></Panel><Panel title="Listing approvals"><StatusBars rows={chart("listingApprovalDistribution")} /></Panel><Panel title="Product creation trend"><TrendChart rows={chart("creationTrend")} valueKey="products" color="#11a683" /></Panel><Panel title="Category sales"><Bars rows={chart("salesByCategory")} labelKey="categoryName" valueKey="sales" currencyValue /></Panel></div>}
      {section === "customers" && <div className="grid gap-4 xl:grid-cols-2"><Panel title="Customer registrations"><TrendChart rows={chart("registrationGrowth")} valueKey="customers" color="#11a683" /></Panel><Panel title="New and returning"><StatusBars rows={chart("newVsReturning")} labelKey="label" valueKey="value" /></Panel><Panel title="Customer order distribution"><StatusBars rows={chart("orderDistribution")} labelKey="bucket" valueKey="customers" /></Panel><Panel title="Customer purchase trend"><TrendChart rows={chart("purchaseTrend")} valueKey="spend" format="currency" /></Panel></div>}
      {section === "inventory" && <div className="grid gap-4 xl:grid-cols-2"><Panel title="Stock distribution"><StatusBars rows={chart("stockDistribution")} labelKey="status" valueKey="products" /></Panel><Panel title="Low stock by category"><Bars rows={chart("lowStockByCategory")} labelKey="categoryName" valueKey="products" /></Panel><Panel title="Recorded stock movement"><TrendChart rows={chart("movementTrend")} valueKey="movements" color="#11a683" /></Panel><Panel title="Fast moving products"><Bars rows={chart("fastMovingProducts")} labelKey="productName" valueKey="unitsSold" /></Panel><Panel title="Slow moving products"><Bars rows={chart("slowMovingProducts")} labelKey="productName" valueKey="stockQuantity" /></Panel><p className="self-center text-xs leading-5 text-[#778195]">{data.inventoryValueNote}</p></div>}
      {section !== "overview" && <Panel title={section === "sales" ? "Transactions" : section === "vendors" ? "Vendor performance" : section === "products" ? "Product performance" : section === "customers" ? "Customers" : "Inventory"}>
        <div className="mb-4 flex flex-wrap items-center gap-2"><input value={search} onChange={(event) => setFilter(setSearch, event.target.value)} placeholder={section === "sales" ? "Search order number" : section === "customers" ? "Search name or email" : section === "vendors" ? "Search vendor" : "Search name or SKU"} className="min-w-[180px] flex-1 rounded-lg border border-[#dce2eb] px-3 py-2 text-xs outline-none focus:border-blue-500" />
          {section === "sales" && <><FilterSelect label="Order status" value={orderStatus} onChange={(value) => setFilter(setOrderStatus, value)} options={["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]} /><FilterSelect label="Payment" value={paymentStatus} onChange={(value) => setFilter(setPaymentStatus, value)} options={["PENDING", "PAID", "FAILED", "REFUNDED", "PARTIALLY_REFUNDED"]} /></>}
          {section === "vendors" && <><FilterSelect label="Vendor status" value={vendorStatus} onChange={(value) => setFilter(setVendorStatus, value)} options={["ACTIVE", "PENDING", "SUSPENDED"]} /><FilterSelect label="Verification" value={verification} onChange={(value) => setFilter(setVerification, value)} options={["NOT_SUBMITTED", "PENDING", "APPROVED", "REJECTED"]} /></>}
          {section === "customers" && <FilterSelect label="Customer status" value={customerStatus} onChange={(value) => setFilter(setCustomerStatus, value)} options={["ACTIVE", "PENDING", "SUSPENDED"]} />}
          {section === "products" && <><FilterSelect label="Listing" value={listingStatus} onChange={(value) => setFilter(setListingStatus, value)} options={["PENDING", "APPROVED", "REJECTED"]} /><FilterSelect label="Product status" value={productStatus} onChange={(value) => setFilter(setProductStatus, value)} options={["DRAFT", "ACTIVE", "INACTIVE", "ARCHIVED"]} /></>}
          {section === "inventory" && <FilterSelect label="Stock status" value={stockStatus} onChange={(value) => setFilter(setStockStatus, value)} options={["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK"]} />}
          {(section === "products" || section === "inventory") && <><input value={vendorId} onChange={(event) => setFilter(setVendorId, event.target.value)} placeholder="Vendor ID" className="w-36 rounded-lg border border-[#dce2eb] px-3 py-2 text-xs" /><input value={categoryId} onChange={(event) => setFilter(setCategoryId, event.target.value)} placeholder="Category ID" className="w-36 rounded-lg border border-[#dce2eb] px-3 py-2 text-xs" /></>}
          <FilterSelect label="Sort" value={sortBy} onChange={(value) => setFilter(setSortBy, value)} options={section === "sales" ? ["createdAt", "totalAmount", "orderNumber"] : section === "vendors" ? ["sales", "orders", "name", "createdAt"] : section === "products" ? ["revenue", "unitsSold", "name", "createdAt"] : section === "customers" ? ["totalPurchaseValue", "totalOrders", "name", "registeredAt"] : ["stock", "unitsSold", "name", "lastMovement"]} includeEmpty="Default sort" />
          <button type="button" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")} className="rounded-lg border border-[#dce2eb] px-3 py-2 text-xs text-[#475467]">{sortOrder === "asc" ? "Ascending" : "Descending"}</button>
        </div>
        {loading && !rows?.length ? <div className="h-36 animate-pulse rounded-lg bg-[#f3f5f8]" /> : rows?.length ? <Table rows={rows} section={section} onView={setSelectedRecord} /> : <div className="rounded-lg border border-dashed border-[#dce2eb] py-12 text-center text-xs text-[#8993a5]">No records match these filters.</div>}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-[#778195]"><span>{pagination ? `${number(pagination.totalRows)} records · page ${pagination.currentPage} of ${Math.max(1, pagination.totalPages)}` : ""}</span><div className="flex gap-2"><button disabled={!pagination?.hasPreviousPage || loading} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-lg border border-[#dce2eb] px-3 py-2 disabled:opacity-40">Previous</button><button disabled={!pagination?.hasNextPage || loading} onClick={() => setPage((value) => value + 1)} className="rounded-lg border border-[#dce2eb] px-3 py-2 disabled:opacity-40">Next</button></div></div>
      </Panel>}
      {data.definitions && section !== "overview" && <p className="text-xs leading-5 text-[#778195]">{data.definitions.gmv} {data.definitions.platformRevenue} {data.definitions.recordedRefunds}</p>}
      {selectedRecord && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#101828]/45 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedRecord(null); }}><section role="dialog" aria-modal="true" aria-label="Analytics record details" className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wide text-blue-700">{section === "vendors" ? "Vendor details" : "Customer details"}</p><h2 className="mt-1 text-lg font-semibold text-[#172033]">{String(selectedRecord.name ?? "")}</h2><p className="mt-1 text-sm text-[#778195]">{String(selectedRecord.businessName ?? selectedRecord.email ?? "")}</p></div><button type="button" onClick={() => setSelectedRecord(null)} className="rounded-lg border border-[#dce2eb] px-3 py-1.5 text-xs text-[#475467]">Close</button></div><dl className="mt-5 grid grid-cols-2 gap-3">{Object.entries(selectedRecord).filter(([key]) => !["details", "name", "email"].includes(key)).map(([key, value]) => <div key={key} className="rounded-lg bg-[#f7f8fa] p-3"><dt className="text-[10px] uppercase text-[#8993a5]">{titleCase(key)}</dt><dd className="mt-1 break-words text-sm font-medium text-[#344054]">{typeof value === "number" ? (moneyKeys.has(key) ? currency(value) : number(value)) : value === null || value === undefined ? "—" : String(value)}</dd></div>)}</dl></section></div>}
    </>}
  </div></main>;
}

function FilterSelect({ label, value, onChange, options, includeEmpty }: { label: string; value: string; onChange: (value: string) => void; options: string[]; includeEmpty?: string }) {
  return <label className="sr-only">{label}<select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} className="rounded-lg border border-[#dce2eb] bg-white px-3 py-2 text-xs text-[#344054]"><option value="">{includeEmpty ?? `All ${label.toLowerCase()}`}</option>{options.map((option) => <option key={option} value={option}>{titleCase(option)}</option>)}</select></label>;
}
