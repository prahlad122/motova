
"use client";

import Link from "next/link";
import { useAdminDashboard } from "../../hooks/useAdminDashboard";

import DashboardHeader from "./DashboardHeader";
import DashboardStats from "./DashboardStats";
import SalesChart from "./SalesChart";
import TopVendors from "./TopVendors";
import ApprovalQueue from "./ApprovalQueue";
import AttentionPanel from "./AttentionPanel";
import CategorySales from "./CategorySales";

const number = (value: number) =>
  new Intl.NumberFormat("en-IN").format(value);

export default function AdminDashboard() {
  const { stats, isLoading, error, loadDashboard } =
    useAdminDashboard();

  if (isLoading && !stats) {
    return (
      <main className="min-h-full bg-[#f3f5f8] p-5 sm:p-7">
        <div className="mb-5 h-12 animate-pulse rounded-xl bg-white" />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-72 animate-pulse rounded-xl bg-white"
            />
          ))}
        </div>

        <div className="mt-4 h-64 animate-pulse rounded-xl bg-white" />
      </main>
    );
  }

  if (error && !stats) {
    return (
      <main className="min-h-full bg-[#f3f5f8] p-5 sm:p-7">
        <div className="rounded-xl border border-red-200 bg-white p-6">
          <h1 className="font-semibold text-red-700">
            Unable to load admin dashboard
          </h1>

          <p className="mt-2 text-sm text-[#596579]">{error}</p>

          <button
            type="button"
            onClick={() => void loadDashboard()}
            className="mt-4 rounded-lg bg-[#172033] px-4 py-2 text-sm text-white"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  if (!stats) return null;

  const { vendors, listings, sales, attention } = stats;

  const pendingCount = vendors.pending + listings.pending;

  return (
    <main className="min-h-full w-full bg-[#f3f5f8] p-4 sm:p-5 lg:p-7">
      <div className="mx-auto max-w-[1440px] space-y-5">
        <DashboardHeader onRefresh={() => void loadDashboard()} />

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"
          >
            Refresh failed: {error}
          </p>
        )}

        {pendingCount > 0 && (
          <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-red-200 border-l-4 border-l-red-500 bg-[#fff5f4] p-4">
            <div>
              <h2 className="text-sm font-semibold text-[#b42318]">
                {number(pendingCount)} items need review
              </h2>

              <p className="mt-1 text-xs leading-5 text-[#9f4039]">
                {number(listings.pending)} product listings and{" "}
                {number(vendors.pending)} vendor accounts are pending.
              </p>
            </div>

            <Link
              href="/admin/approvals"
              className="rounded-lg bg-[#df352f] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#c52b26]"
            >
              Review queue →
            </Link>
          </section>
        )}

        <DashboardStats stats={stats} />

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
          <section className="min-w-0 rounded-xl border border-[#e1e5ec] bg-white p-4 sm:p-5">
            <h2 className="mb-4 text-sm font-semibold text-[#172033]">
              Sales trend
            </h2>

            <SalesChart series={sales.series} />
          </section>

          <TopVendors vendors={stats.topVendors} />
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <AttentionPanel attention={attention} />

          <ApprovalQueue products={stats.approvalQueue} />

          <CategorySales categories={stats.salesByCategory} />
        </section>

        <p className="pb-1 text-center text-[10px] text-[#9aa3b2]">
          Motova Admin · Dashboard statistics from your marketplace database
        </p>
      </div>
    </main>
  );
}
