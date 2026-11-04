import { ArrowUpRight, ChevronLeft, ChevronRight, Eye, FileText } from "lucide-react";
import type { AdminVendor } from "../../admin.types";

function Status({ children, variant }: { children: string; variant: "good" | "pending" | "muted" | "bad" }) {
  const styles = { good: "bg-emerald-50 text-emerald-700", pending: "bg-amber-50 text-amber-700", muted: "bg-slate-100 text-slate-600", bad: "bg-rose-50 text-rose-700" };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${styles[variant]}`}>{children.replaceAll("_", " ")}</span>;
}

export default function VendorsTable({ vendors, page, totalPages, totalVendors, onPage, onDetails }: {
  vendors: AdminVendor[]; page: number; totalPages: number; totalVendors: number;
  onPage: (page: number) => void; onDetails: (vendor: AdminVendor) => void;
}) {
  return <section className="overflow-hidden rounded-xl border border-[#e7eaf0] bg-white">
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#edf0f4] px-4 py-3 sm:px-5">
      <div><h2 className="text-sm font-semibold text-[#172033]">Vendor directory</h2><p className="mt-1 text-xs text-[#8993a5]">{totalVendors.toLocaleString("en-IN")} vendors</p></div>
      <span className="inline-flex items-center gap-1.5 text-xs text-[#778195]"><FileText size={14} /> Documents available in vendor profiles</span>
    </div>
    {vendors.length ? <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] text-left">
        <thead className="bg-[#f8f9fb] text-[10px] font-semibold uppercase tracking-wide text-[#8993a5]"><tr>
          <th className="px-5 py-3">Vendor</th><th className="px-4 py-3">Business</th><th className="px-4 py-3">Verification</th><th className="px-4 py-3">Account</th><th className="px-4 py-3">Joined</th><th className="px-5 py-3 text-right">Details</th>
        </tr></thead>
        <tbody className="divide-y divide-[#edf0f4]">{vendors.map((vendor) => {
          const verification = vendor.vendorProfile?.verificationStatus ?? "NOT_SUBMITTED";
          const accountTone = vendor.status === "ACTIVE" ? "good" : vendor.status === "PENDING" ? "pending" : "bad";
          const verifyTone = verification === "APPROVED" ? "good" : verification === "PENDING" ? "pending" : verification === "REJECTED" ? "bad" : "muted";
          return <tr key={vendor.id} className="hover:bg-[#fafbfc]">
            <td className="px-5 py-3.5"><p className="text-xs font-semibold text-[#273247]">{vendor.name}</p><p className="mt-1 text-[11px] text-[#8993a5]">{vendor.email}</p></td>
            <td className="px-4 py-3.5"><p className="text-xs text-[#344054]">{vendor.vendorProfile?.businessName || "—"}</p><p className="mt-1 text-[11px] text-[#8993a5]">{vendor.mobile}</p></td>
            <td className="px-4 py-3.5"><Status variant={verifyTone}>{verification}</Status></td>
            <td className="px-4 py-3.5"><Status variant={accountTone}>{vendor.status}</Status></td>
            <td className="px-4 py-3.5 text-xs text-[#667085]">{new Date(vendor.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
            <td className="px-5 py-3.5 text-right"><button onClick={() => onDetails(vendor)} className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50"><Eye size={14} /> View <ArrowUpRight size={13} /></button></td>
          </tr>;
        })}</tbody>
      </table>
    </div> : <div className="px-5 py-14 text-center"><p className="text-sm font-medium text-[#344054]">No vendors found</p><p className="mt-1 text-xs text-[#8993a5]">Try changing your search or filters.</p></div>}
    <footer className="flex items-center justify-between border-t border-[#edf0f4] px-4 py-3 text-xs text-[#778195] sm:px-5">
      <span>Page {page} of {Math.max(totalPages, 1)}</span><div className="flex gap-2">
        <button disabled={page <= 1} onClick={() => onPage(page - 1)} className="flex h-8 items-center gap-1 rounded-md border border-[#e1e5ec] px-2.5 disabled:opacity-40"><ChevronLeft size={14} /> Previous</button>
        <button disabled={page >= totalPages} onClick={() => onPage(page + 1)} className="flex h-8 items-center gap-1 rounded-md border border-[#e1e5ec] px-2.5 disabled:opacity-40">Next <ChevronRight size={14} /></button>
      </div>
    </footer>
  </section>;
}
