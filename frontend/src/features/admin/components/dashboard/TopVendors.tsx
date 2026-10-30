
import Link from "next/link";
import type { AdminDashboardStats } from "../../admin.types";

const currency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-28 items-center justify-center rounded-lg border border-dashed border-[#dce2eb] px-4 text-center text-xs text-[#778195]">
      {children}
    </div>
  );
}

export default function TopVendors({
  vendors,
}: {
  vendors: AdminDashboardStats["topVendors"];
}) {
  const topVendorMax = Math.max(
    ...vendors.map((vendor) => vendor.revenue),
    1,
  );

  return (
    <section className="min-w-0 rounded-xl border border-[#e1e5ec] bg-white p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-[#172033]">Top vendors</h2>

        <Link
          href="/admin/vendors"
          className="shrink-0 text-xs font-medium text-[#2864f0] hover:underline"
        >
          All vendors →
        </Link>
      </div>

      {vendors.length ? (
        <div className="space-y-5">
          {vendors.map((vendor) => (
            <div key={vendor.vendorId}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="truncate text-xs font-medium text-[#344054]">
                  {vendor.businessName}
                </span>

                <span className="shrink-0 text-xs font-semibold text-[#172033]">
                  {currency(vendor.revenue)}
                </span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-[#edf0f5]">
                <div
                  className="h-full rounded-full bg-[#475569]"
                  style={{
                    width: `${Math.max(0, Math.min(100, (vendor.revenue / topVendorMax) * 100))}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState>
          No delivered-order revenue yet. Top vendors will appear here when
          sales are recorded.
        </EmptyState>
      )}
    </section>
  );
}
