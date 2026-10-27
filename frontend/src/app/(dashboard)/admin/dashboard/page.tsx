
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";

import { getAuthSession } from "@/features/auth/auth.utils";
import {
  getAdminDashboardStats,
  type AdminDashboardStats,
} from "@/features/admin/admin.api";

const sampleData = {
  listings: [
    { label: "Active", value: "4,716", color: "#2864f0" },
    { label: "Pending", value: "14", color: "#ff9100" },
    { label: "Hidden / sold out", value: "690", color: "#cbd5e1" },
  ],
  sales: [
    { label: "Sold", value: "₹18.4L", color: "#2864f0" },
    { label: "To target", value: "₹6.6L", color: "#cbd5e1" },
  ],
  orders: [
    { label: "Shipped", value: "5,462", color: "#2864f0" },
    { label: "Not yet shipped", value: "412", color: "#ff9100" },
  ],
};

const salesTrend = [
  28, 31, 29, 34, 33, 37, 36, 40, 38, 43, 41, 45, 42, 48, 47, 52, 49, 53, 50,
  56, 54, 59, 56, 60, 57, 62, 59, 64, 61, 67,
];

const topVendors = [
  { name: "Sharma Auto Accessories", amount: "₹3.2L", percent: 100 },
  { name: "Delhi Car Hub", amount: "₹2.7L", percent: 84 },
  { name: "Mumbai Motors Mart", amount: "₹2.1L", percent: 66 },
  { name: "Pune LED Works", amount: "₹1.8L", percent: 56 },
  { name: "Jaipur AutoStyle", amount: "₹1.2L", percent: 38 },
];

const attentionItems = [
  { count: 38, label: "Listings low on stock or sold out", tone: "yellow" },
  { count: 9, label: "Vendors with no sales in 30 days", tone: "yellow" },
  { count: 6, label: "Rejected listings awaiting resubmission", tone: "gray" },
  { count: 4, label: "Vendor GST documents expiring soon", tone: "red" },
  { count: 3, label: "Listings reported by buyers", tone: "red" },
];

const approvalItems = [
  {
    name: "LED Headlight Bulb H4 160W",
    vendor: "Pune LED Works",
    age: "6 days ago",
  },
  {
    name: "5D Floor Mat – Creta",
    vendor: "Delhi Car Hub",
    age: "4 days ago",
  },
  {
    name: "Roller Curtain Set – Nexon",
    vendor: "Jaipur AutoStyle",
    age: "3 days ago",
  },
  {
    name: "Android Stereo 9 inch",
    vendor: "Sharma Auto Accessories",
    age: "2 days ago",
  },
  {
    name: "Ambient Light Kit 64 colours",
    vendor: "Mumbai Motors Mart",
    age: "today",
  },
];

const categorySales = [
  { name: "Headlights", percent: 28 },
  { name: "Mats", percent: 22 },
  { name: "Sound System", percent: 15 },
  { name: "Chargers", percent: 11 },
  { name: "Curtains", percent: 9 },
];

type ChartSegment = {
  label: string;
  value: string;
  color: string;
};

function Panel({
  title,
  children,
  action,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  action?: { label: string; href: string };
  className?: string;
}) {
  return (
    <section
      className={`min-w-0 rounded-lg border border-[#dce0e6] bg-white p-4 ${className}`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-[13px] font-medium text-[#172033]">{title}</h2>

        {action && (
          <Link
            href={action.href}
            className="shrink-0 text-[11px] text-[#245df5] hover:underline"
          >
            {action.label} →
          </Link>
        )}
      </div>

      {children}
    </section>
  );
}

function DonutChart({
  segments,
  centerLabel,
}: {
  segments: ChartSegment[];
  centerLabel?: string;
}) {
  const numericValues = segments.map((segment) => {
    const parsed = Number(
      segment.value.replace(/[^\d.]/g, "")
    );

    return Number.isFinite(parsed) ? parsed : 0;
  });

  const total = numericValues.reduce((sum, value) => sum + value, 0);

  let accumulated = 0;

  const gradientStops = segments.map((segment, index) => {
    const start = accumulated;

    accumulated +=
      total > 0 ? (numericValues[index] / total) * 100 : 0;

    return `${segment.color} ${start}% ${accumulated}%`;
  });

  const conicGradient =
    total > 0
      ? `conic-gradient(${gradientStops.join(", ")})`
      : "conic-gradient(#e5e7eb 0% 100%)";

  return (
    <div className="relative mx-auto flex h-[128px] w-[128px] items-center justify-center">
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: conicGradient }}
      />

      <div className="absolute inset-[14px] flex items-center justify-center rounded-full bg-white">
        {centerLabel && (
          <span className="text-xs font-medium text-[#687386]">
            {centerLabel}
          </span>
        )}
      </div>
    </div>
  );
}

function ChartLegend({ items }: { items: ChartSegment[] }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-1.5 text-[10px] text-[#596579]"
        >
          <span
            className="h-[7px] w-[7px] shrink-0 rounded-full"
            style={{ backgroundColor: item.color }}
          />

          <span>{item.label}</span>

          <strong className="font-semibold text-[#253047]">
            {item.value}
          </strong>
        </div>
      ))}
    </div>
  );
}

function SummaryCard({
  title,
  segments,
  footer,
}: {
  title: string;
  segments: ChartSegment[];
  footer: string;
}) {
  return (
    <Panel title={title} className="flex flex-col">
      <DonutChart segments={segments} />

      <div className="mt-4 min-h-[30px]">
        <ChartLegend items={segments} />
      </div>

      <div className="mt-2 border-t border-[#e9ecf1] pt-2 text-center text-[10px] text-[#657086]">
        {footer}
      </div>
    </Panel>
  );
}

function SalesLineChart() {
  const points = salesTrend
    .map((value, index) => {
      const x = (index / (salesTrend.length - 1)) * 600;
      const y = 160 - ((value - 20) / 50) * 140;

      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `0,160 ${points} 600,160`;

  return (
    <div className="w-full">
      <div className="flex h-[185px] gap-3">
        <div className="flex flex-col justify-between pb-1 text-[10px] text-[#7b8494]">
          <span>₹80k</span>
          <span>₹60k</span>
          <span>₹40k</span>
          <span>₹20k</span>
        </div>

        <div className="min-w-0 flex-1">
          <svg
            viewBox="0 0 600 170"
            preserveAspectRatio="none"
            className="h-full w-full"
            role="img"
            aria-label="Sample sales trend line chart"
          >
            {[20, 65, 110, 155].map((y) => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="600"
                y2={y}
                stroke="#e4e8ef"
                strokeWidth="1"
              />
            ))}

            <polygon points={areaPoints} fill="#2864f0" opacity="0.1" />

            <polyline
              points={points}
              fill="none"
              stroke="#2864f0"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>

          <div className="flex justify-between pt-2 text-[10px] text-[#7b8494]">
            <span>1 Oct</span>
            <span>8 Oct</span>
            <span>16 Oct</span>
            <span>24 Oct</span>
            <span>30 Oct</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const session = getAuthSession();

        if (!session?.token || session.user.role !== "ADMIN") {
          throw new Error("Please log in with an admin account.");
        }

        const dashboardStats = await getAdminDashboardStats(session.token);

        if (!cancelled) {
          setStats(dashboardStats);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load dashboard statistics."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const vendorSegments: ChartSegment[] = [
    {
      label: "Active",
      value: String(stats?.vendors.active ?? 0),
      color: "#2864f0",
    },
    {
      label: "Pending verification",
      value: String(stats?.vendors.pending ?? 0),
      color: "#ff9100",
    },
    {
      label: "Inactive / suspended",
      value: String(stats?.vendors.suspended ?? 0),
      color: "#cbd5e1",
    },
  ];

  const activeVendorPercentage =
    stats && stats.vendors.total > 0
      ? Math.round(
          (stats.vendors.active / stats.vendors.total) * 100
        )
      : 0;

  const vendorFooter = isLoading
    ? "Loading vendor data..."
    : stats
      ? `${activeVendorPercentage}% active · +${stats.vendors.newThisWeek} new this week · ${stats.vendors.total} total`
      : "Vendor statistics unavailable";

  return (
    <div className="min-h-full w-full bg-[#f3f4f6] p-4 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1440px]">
        {isLoading && (
          <p role="status" className="mb-4 text-sm text-[#687386]">
            Loading dashboard statistics...
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600"
          >
            {error}
          </p>
        )}

        {/* Overview and date filter */}
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[12px] text-[#687386]">
              Overview · Last 30 days · Vendor data connected
            </p>
          </div>

          <button
            type="button"
            className="flex items-center gap-2 rounded-md border border-[#dce0e6] bg-white px-3 py-2 text-[11px] text-[#283246]"
          >
            Last 30 days
            <Icon name="keyboard_arrow_down" className="text-base" />
          </button>
        </div>

        {/* Pending verifications - sample data */}
        <section className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[#ffb7b2] border-l-[5px] border-l-[#e52c24] bg-[#fff4f3] px-4 py-3.5">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e52c24] text-sm font-bold text-white">
              !
            </span>

            <div>
              <h2 className="text-[13px] font-semibold text-[#b42318]">
                17 verifications pending
              </h2>

              <p className="mt-0.5 text-[11px] text-[#a33c35]">
                14 listings and 3 vendors are waiting for review. Oldest
                request has waited 6 days.
              </p>
            </div>
          </div>

          <Link
            href="/admin/approvals"
            className="rounded-md bg-[#e52c24] px-4 py-2.5 text-[11px] font-semibold text-white hover:bg-[#c9231c]"
          >
            Review now →
          </Link>
        </section>

        {/* Summary charts */}
        <section className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <SummaryCard
            title="VENDORS"
            segments={vendorSegments}
            footer={vendorFooter}
          />

          <SummaryCard
            title="LISTINGS"
            segments={sampleData.listings}
            footer="87% active · +124 new this week"
          />

          <SummaryCard
            title="SALES (30 DAYS)"
            segments={sampleData.sales}
            footer="6,230 units · +12% vs previous 30 days"
          />
        </section>

        {/* Orders - sample data */}
        <section className="mb-5">
          <Panel title="ORDERS (30 DAYS)">
            <div className="mx-auto max-w-[560px]">
              <DonutChart segments={sampleData.orders} />

              <div className="mt-4">
                <ChartLegend items={sampleData.orders} />
              </div>
            </div>

            <div className="mt-3 border-t border-[#e9ecf1] pt-2 text-center text-[10px] text-[#657086]">
              93% shipped on time
            </div>
          </Panel>
        </section>

        {/* Sales trend and top vendors - sample data */}
        <section className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
          <Panel
            title="Sales — last 30 days"
            action={{ label: "Open analytics", href: "/admin/analytics" }}
          >
            <SalesLineChart />
          </Panel>

          <Panel
            title="Top vendors"
            action={{ label: "All vendors", href: "/admin/vendors" }}
          >
            <div className="space-y-3">
              {topVendors.map((vendor) => (
                <div key={vendor.name}>
                  <div className="mb-1 flex items-center justify-between gap-3 text-[11px]">
                    <span className="truncate text-[#293449]">
                      {vendor.name}
                    </span>

                    <span className="shrink-0 text-[#657086]">
                      {vendor.amount}
                    </span>
                  </div>

                  <div className="h-[5px] overflow-hidden rounded-full bg-[#e5e7eb]">
                    <div
                      className="h-full rounded-full bg-[#4b5568]"
                      style={{ width: `${vendor.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </section>

        {/* Attention, approval queue, and category sales */}
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <Panel title="Needs your attention">
            <div className="divide-y divide-[#e9ecf1]">
              {attentionItems.map((item) => (
                <Link
                  key={item.label}
                  href="/admin/approvals"
                  className="flex items-center gap-3 py-3 first:pt-1 last:pb-1"
                >
                  <span
                    className={`flex h-[23px] min-w-[30px] items-center justify-center rounded-full px-2 text-[10px] font-semibold ${
                      item.tone === "yellow"
                        ? "bg-[#fff0c2] text-[#8a5b00]"
                        : item.tone === "gray"
                          ? "bg-[#e8ebef] text-[#374151]"
                          : "bg-[#fff0ef] text-[#b42318]"
                    }`}
                  >
                    {item.count}
                  </span>

                  <span className="min-w-0 flex-1 text-[11px] text-[#344054]">
                    {item.label}
                  </span>

                  <Icon
                    name="chevron_right"
                    className="text-base text-[#7b8494]"
                  />
                </Link>
              ))}
            </div>
          </Panel>

          <Panel
            title="Approval queue"
            action={{ label: "View all", href: "/admin/approvals" }}
          >
            <div className="divide-y divide-[#e9ecf1]">
              {approvalItems.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center gap-2.5 py-2.5 first:pt-1 last:pb-1"
                >
                  <div className="h-8 w-8 shrink-0 rounded-md bg-[#e5e7eb]" />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-medium text-[#293449]">
                      {item.name}
                    </p>

                    <p className="mt-0.5 truncate text-[10px] text-[#778195]">
                      {item.vendor} · {item.age}
                    </p>
                  </div>

                  <Link
                    href="/admin/approvals"
                    className="shrink-0 rounded-md border border-[#2864f0] px-2.5 py-1.5 text-[10px] font-medium text-[#2864f0] hover:bg-[#eff4ff]"
                  >
                    Review
                  </Link>
                </div>
              ))}
            </div>
          </Panel>

          <Panel
            title="Sales by category"
            action={{ label: "Categories", href: "/admin/category" }}
          >
            <div className="space-y-4">
              {categorySales.map((category) => (
                <div key={category.name}>
                  <div className="mb-1.5 flex items-center justify-between text-[11px]">
                    <span className="text-[#293449]">{category.name}</span>

                    <span className="text-[#657086]">
                      {category.percent}%
                    </span>
                  </div>

                  <div className="h-[5px] overflow-hidden rounded-full bg-[#e5e7eb]">
                    <div
                      className="h-full rounded-full bg-[#2864f0]"
                      style={{ width: `${category.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </section>
      </div>
    </div>
  );
}
