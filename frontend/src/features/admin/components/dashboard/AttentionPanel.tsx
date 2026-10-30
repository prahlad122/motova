
import Link from "next/link";
import type { AdminDashboardStats } from "../../admin.types";

const number = (value: number) =>
  new Intl.NumberFormat("en-IN").format(value);

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-28 items-center justify-center rounded-lg border border-dashed border-[#dce2eb] px-4 text-center text-xs text-[#778195]">
      {children}
    </div>
  );
}

export default function AttentionPanel({
  attention,
}: {
  attention: AdminDashboardStats["attention"];
}) {
  const attentionItems = [
    {
      label: "Listings low on stock",
      count: attention.lowStockListings,
      tone: "amber",
    },
    {
      label: "Vendors without orders in 30 days",
      count: attention.vendorsWithoutSalesLast30Days,
      tone: "amber",
    },
    {
      label: "Rejected listings",
      count: attention.rejectedListings,
      tone: "gray",
    },
  ].filter((item) => item.count > 0);

  return (
    <section className="min-w-0 rounded-xl border border-[#e1e5ec] bg-white p-4 sm:p-5">
      <h2 className="mb-4 text-sm font-semibold text-[#172033]">
        Needs your attention
      </h2>

      {attentionItems.length ? (
        <div className="divide-y divide-[#edf0f4]">
          {attentionItems.map((item) => (
            <Link
              key={item.label}
              href="/admin/approvals"
              className="flex items-center gap-3 py-3 first:pt-1 last:pb-1"
            >
              <span
                className={`min-w-9 rounded-full px-2 py-1 text-center text-xs font-semibold ${
                  item.tone === "amber"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {number(item.count)}
              </span>

              <span className="min-w-0 flex-1 text-xs text-[#344054]">
                {item.label}
              </span>

              <span className="text-lg text-[#9aa3b2]">›</span>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState>No outstanding attention items were returned.</EmptyState>
      )}
    </section>
  );
}
