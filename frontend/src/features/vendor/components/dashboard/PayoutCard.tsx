
import { Card, money } from "./DashboardUI";
import type { VendorDashboardData } from "../../vendor.types";

export default function PayoutCard({ revenue }: { revenue: VendorDashboardData["revenue"] }) {
  return (
    <Card className="mt-5">
      <h2 className="text-base font-medium">Payout</h2>
      <p className="mt-2 text-sm text-[#718096]">Payout details are not included in the current dashboard API.</p>
      <p className="mt-4 text-3xl font-semibold">{money(revenue.deliveredVendorAmount, revenue.currency)}</p>
      <div className="mt-5 space-y-3 border-t border-[#e9edf2] pt-4 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-[#718096]">All-time delivered earnings</span>
          <strong>{money(revenue.deliveredVendorAmount, revenue.currency)}</strong>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-[#718096]">Next payout date</span>
          <span className="text-[#8490a1]">Not available</span>
        </div>
      </div>
      <a href="/vendor/payouts" className="mt-5 flex w-full items-center justify-center rounded-md border border-[#dce2e9] px-4 py-3 text-sm font-medium hover:bg-slate-50">View payout history</a>
    </Card>
  );
}
