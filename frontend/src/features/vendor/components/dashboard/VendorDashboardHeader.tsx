
import type { VendorDashboardData } from "../../vendor.types";

interface VendorDashboardHeaderProps {
  vendor: VendorDashboardData["vendor"];
  rangeDays: number;
  setRangeDays: (value: number) => void;
}

export default function VendorDashboardHeader({ vendor, rangeDays, setRangeDays }: VendorDashboardHeaderProps) {
  const isApproved = vendor.verificationStatus === "APPROVED";

  return (
    <header className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
      <div>
        <h1 className="text-[25px] font-semibold tracking-[-0.6px] sm:text-[28px]">Welcome back, {vendor.businessName || "Vendor"}</h1>
        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs">
          <span className={`rounded-full px-2.5 py-1 font-semibold ${isApproved ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{vendor.verificationStatus.replaceAll("_", " ")} seller</span>
          <span className="text-[#7b8798]">Your store overview</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <a href="/vendor/inventory?create=1" className="inline-flex items-center justify-center rounded-full bg-[#2864f0] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">Add product +</a>
        <label className="flex items-center gap-2 rounded-lg border border-[#dce2e9] bg-white px-3 py-2.5 text-sm">
          <span className="text-[#718096]">Period</span>
          <select value={rangeDays} onChange={(event) => setRangeDays(Number(event.target.value))} className="bg-transparent font-medium outline-none">
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </label>
      </div>
    </header>
  );
}
