
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

export default function CategorySales({
  categories,
}: {
  categories: AdminDashboardStats["salesByCategory"];
}) {
  const maxRevenue = Math.max(
    ...categories.map((category) => category.revenue),
    1,
  );

  return (
    <section className="min-w-0 rounded-xl border border-[#e1e5ec] bg-white p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-[#172033]">
          Sales by category
        </h2>

        <Link
          href="/admin/category"
          className="shrink-0 text-xs font-medium text-[#2864f0] hover:underline"
        >
          Categories →
        </Link>
      </div>

      {categories.length ? (
        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category.categoryId}>
              <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                <span className="truncate text-[#344054]">
                  {category.categoryName}
                </span>

                <span className="shrink-0 text-[#778195]">
                  {currency(category.revenue)}
                </span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-[#edf0f5]">
                <div
                  className="h-full rounded-full bg-[#2864f0]"
                  style={{
                    width: `${Math.max(0, Math.min(100, (category.revenue / maxRevenue) * 100))}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState>
          Category sales will appear after orders generate revenue.
        </EmptyState>
      )}
    </section>
  );
}
