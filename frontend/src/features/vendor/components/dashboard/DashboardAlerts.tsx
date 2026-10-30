
import type { VendorDashboardData } from "../../vendor.types";

export default function DashboardAlerts({ analytics }: { analytics: VendorDashboardData["analytics"] }) {
  const rejectedCount = analytics.listings.rejected;

  if (rejectedCount <= 0) return null;

  const rejectedSummary = analytics.rejectedListings.length > 0
    ? analytics.rejectedListings.slice(0, 2).map((item) => `${item.name}${item.note ? `: ${item.note}` : ""}`).join(" · ")
    : "Review your rejected listings and update them before resubmitting.";

  return (
    <section className="mb-6 flex flex-col gap-4 rounded-lg border border-[#ffd27b] border-l-[6px] border-l-[#ff9200] bg-[#fffaf0] p-4 sm:flex-row sm:items-center">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ff9200] font-bold text-white">!</span>
      <div className="min-w-0 flex-1">
        <h2 className="font-semibold text-[#923d0b]">{rejectedCount} {rejectedCount === 1 ? "listing was" : "listings were"} rejected. Fix and resubmit</h2>
        <p className="mt-1 text-sm text-[#925b35]">{rejectedSummary}</p>
      </div>
      <a href="/vendor/inventory?status=REJECTED" className="shrink-0 rounded-md bg-[#ff9200] px-4 py-3 text-center text-sm font-semibold text-white hover:bg-orange-600">See rejected listings →</a>
    </section>
  );
}
