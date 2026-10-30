
import type { ReactNode } from "react";
import type { AdminDashboardStats } from "../../admin.types";

const COLORS = {
  blue: "#2864f0",
  orange: "#ff9100",
  red: "#e5484d",
  gray: "#cbd5e1",
};

const currency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const number = (value: number) =>
  new Intl.NumberFormat("en-IN").format(value);

type Segment = {
  label: string;
  value: number;
  color: string;
};

function Panel({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`min-w-0 rounded-xl border border-[#e1e5ec] bg-white p-4 sm:p-5 ${className}`}
    >
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-[#172033]">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function DonutChart({
  segments,
  total,
  centerLabel,
}: {
  segments: Segment[];
  total: number;
  centerLabel: string;
}) {
  const radius = 43;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center justify-center">
      <div className="relative h-32 w-32 shrink-0">
        <svg
          viewBox="0 0 120 120"
          className="h-full w-full -rotate-90"
          role="img"
          aria-label={`${centerLabel}: ${number(total)}`}
        >
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#edf0f4"
            strokeWidth="13"
          />

          {total > 0 &&
            segments.map((segment) => {
              const length = (segment.value / total) * circumference;
              const currentOffset = offset;
              offset += length;

              return (
                <circle
                  key={segment.label}
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth="13"
                  strokeDasharray={`${Math.max(0, length)} ${circumference}`}
                  strokeDashoffset={-currentOffset}
                />
              );
            })}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold text-[#172033]">
            {number(total)}
          </span>
          <span className="text-[10px] text-[#778195]">{centerLabel}</span>
        </div>
      </div>
    </div>
  );
}

function Legend({ segments }: { segments: Segment[] }) {
  return (
    <div className="mt-4 space-y-2.5">
      {segments.map((segment) => (
        <div
          key={segment.label}
          className="flex items-center justify-between gap-3 text-xs"
        >
          <span className="flex min-w-0 items-center gap-2 text-[#596579]">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            <span className="truncate">{segment.label}</span>
          </span>
          <strong className="text-[#253047]">
            {number(segment.value)}
          </strong>
        </div>
      ))}
    </div>
  );
}

function SummaryCard({
  title,
  segments,
  total,
  footer,
}: {
  title: string;
  segments: Segment[];
  total: number;
  footer: string;
}) {
  return (
    <Panel title={title}>
      <DonutChart segments={segments} total={total} centerLabel="Total" />
      <Legend segments={segments} />
      <p className="mt-4 border-t border-[#edf0f4] pt-3 text-center text-[11px] text-[#778195]">
        {footer}
      </p>
    </Panel>
  );
}

export default function DashboardStats({
  stats,
}: {
  stats: AdminDashboardStats;
}) {
  const { vendors, listings, sales } = stats;

  const vendorSegments: Segment[] = [
    { label: "Active", value: vendors.active, color: COLORS.blue },
    {
      label: "Pending verification",
      value: vendors.pending,
      color: COLORS.orange,
    },
    { label: "Suspended", value: vendors.suspended, color: COLORS.gray },
  ];

  const listingSegments: Segment[] = [
    { label: "Active", value: listings.active, color: COLORS.blue },
    {
      label: "Pending approval",
      value: listings.pending,
      color: COLORS.orange,
    },
    { label: "Rejected", value: listings.rejected, color: COLORS.red },
    {
      label: "Inactive / archived",
      value: listings.hidden,
      color: COLORS.gray,
    },
  ];

  const salesSegments: Segment[] = [
    { label: "Delivered revenue", value: sales.revenue, color: COLORS.blue },
    {
      label: "No revenue recorded",
      value: 0,
      color: COLORS.gray,
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <SummaryCard
        title="VENDORS"
        segments={vendorSegments}
        total={vendors.total}
        footer={`${vendors.total ? Math.round((vendors.active / vendors.total) * 100) : 0}% active · ${number(vendors.newThisWeek)} new this week`}
      />

      <SummaryCard
        title="LISTINGS"
        segments={listingSegments}
        total={listings.total}
        footer={`${number(listings.newThisWeek)} new listings this week`}
      />

      <Panel title="SALES · LAST 30 DAYS">
        <p className="mb-1 text-2xl font-semibold text-[#172033]">
          {currency(sales.revenue)}
        </p>

        <p className="mb-3 text-xs text-[#778195]">
          Revenue from delivered vendor orders
        </p>

        <div className="flex items-center gap-4">
          <DonutChart
            segments={salesSegments}
            total={sales.revenue}
            centerLabel="Revenue"
          />

          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <p className="text-[11px] text-[#778195]">Units sold</p>
              <p className="text-lg font-semibold text-[#172033]">
                {number(sales.unitsSold)}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-[#778195]">Target</p>
              <p className="text-sm font-medium text-[#172033]">
                {sales.target > 0 ? currency(sales.target) : "Not configured"}
              </p>
            </div>
          </div>
        </div>
      </Panel>
    </section>
  );
}
