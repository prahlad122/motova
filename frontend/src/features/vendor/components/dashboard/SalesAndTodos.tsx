
import { Card, money, SalesLineChart, TodoRow } from "./DashboardUI";
import type { VendorDashboardData } from "../../vendor.types";

export default function SalesAndTodos({ dashboard }: { dashboard: VendorDashboardData }) {
  const { analytics, revenue, sales } = dashboard;

  return (
    <section className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_0.9fr]">
      <Card>
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-medium">My sales, last {analytics.rangeDays} days</h2>
            <div className="mt-3 flex flex-wrap gap-x-8 gap-y-3">
              <div>
                <p className="text-xs text-[#718096]">Delivered revenue</p>
                <p className="mt-1 text-2xl font-semibold">{money(revenue.deliveredVendorAmount, revenue.currency)}</p>
              </div>
              <div>
                <p className="text-xs text-[#718096]">Units sold</p>
                <p className="mt-1 text-2xl font-semibold">—</p>
              </div>
              <div>
                <p className="text-xs text-[#718096]">vs previous period</p>
                <p className="mt-1 text-xl font-semibold text-[#07865c]">—</p>
              </div>
            </div>
          </div>
          <a href="/vendor/analytics" className="shrink-0 text-sm text-blue-600 underline">Open analytics →</a>
        </div>
        <SalesLineChart series={sales.series} />
      </Card>

      <Card>
        <h2 className="mb-2 text-base font-medium">Today&apos;s to-do</h2>
        <TodoRow count={analytics.orders.pending} label="New orders to accept" />
        <TodoRow count={analytics.orders.toShip} label="Orders to pack and ship" tone="amber" />
        <TodoRow count={analytics.stock.outOfStock} label="Products out of stock" tone="amber" />
        <TodoRow count={analytics.listings.rejected} label="Rejected listings to fix" />
        <TodoRow count={0} label="Return requests to review" tone="gray" />
        <p className="mt-2 text-[11px] text-[#98a2b3]">Return requests are shown as 0 until a returns endpoint is connected.</p>
      </Card>
    </section>
  );
}
