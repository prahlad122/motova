
"use client";

import { useVendorDashboard } from "@/features/vendor/hooks/useVendorDashboard";

import VendorDashboardHeader from "./VendorDashboardHeader";
import DashboardCharts from "./DashboardCharts";
import DashboardAlerts from "./DashboardAlerts";
import RatingCard from "./RatingCard";
import SalesAndTodos from "./SalesAndTodos";
import RecentOrders from "./RecentOrders";
import TopSellingProducts from "./TopSellingProducts";
import PayoutCard from "./PayoutCard";

export default function VendorDashboard() {
  const {
    dashboard,
    loading,
    error,
    rangeDays,
    setRangeDays,
    loadDashboard,
  } = useVendorDashboard();

  // Loading state
  if (loading && !dashboard) {
    return (
      <main className="min-h-full animate-pulse space-y-5 bg-[#f3f5f8] p-6">
        <div className="h-16 rounded-lg bg-white" />

        <div className="grid gap-5 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-72 rounded-lg bg-white" />
          ))}
        </div>

        <div className="h-64 rounded-lg bg-white" />
      </main>
    );
  }

  // Error state
  if (!dashboard) {
    return (
      <main className="min-h-full bg-[#f3f5f8] p-6">
        <h1 className="text-2xl font-semibold text-[#172033]">
          Dashboard
        </h1>

        <div className="mt-5 rounded-xl border border-red-200 bg-white p-5">
          <p className="font-semibold text-red-700">
            Unable to load your dashboard
          </p>

          <p className="mt-2 text-sm text-slate-600">
            {error?.message || "Something went wrong. Please try again."}
          </p>

          <button
            type="button"
            onClick={() => void loadDashboard()}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  // Dashboard content
  return (
    <main className="min-h-full bg-[#f3f5f8] p-4 text-[#172033] sm:p-6 lg:p-7">
      <VendorDashboardHeader
        vendor={dashboard.vendor}
        rangeDays={rangeDays}
        setRangeDays={setRangeDays}
      />

      {/* Refresh error */}
      {error && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <span>
            {error.message} Showing the last successfully loaded data.
          </span>

          <button
            type="button"
            onClick={() => void loadDashboard()}
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Dashboard sections */}
      <DashboardAlerts analytics={dashboard.analytics} />

      <DashboardCharts analytics={dashboard.analytics} />

      <RatingCard
        rating={dashboard.analytics.rating}
        rangeDays={dashboard.analytics.rangeDays}
      />

      <SalesAndTodos dashboard={dashboard} />

      {/* Orders and products */}
      <section className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_0.9fr]">
        <RecentOrders
          orders={dashboard.recentOrders}
          currency={dashboard.revenue.currency}
        />

        <TopSellingProducts
          products={dashboard.topSellingProducts}
          currency={dashboard.sales.currency}
        />
      </section>

      {/* Payout information */}
      <PayoutCard revenue={dashboard.revenue} />
    </main>
  );
}
