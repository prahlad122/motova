import Link from "next/link";
import { ArrowRight, CheckCircle2, FileCheck2, ShieldAlert, UserRoundCog } from "lucide-react";

const steps = [
  { title: "Open a vendor profile", body: "Go to Vendors and select View on the vendor row. The profile shows business details, account status, verification status, and submitted files." },
  { title: "Open and review each file", body: "Select Get secure link. The admin API creates a private Cloudflare R2 link that expires after five minutes. Open the file and check it against the vendor and document type." },
  { title: "Approve or reject the document", body: "Use Approve when the document is valid. Use Reject when it is invalid and enter a reason so the vendor knows what to correct." },
  { title: "Set the vendor account status", body: "Use Activate account to enable the account, or Suspend account to stop access. This is separate from document verification and must be changed explicitly." },
];

export default function DocumentationPage() {
  return <main className="min-h-full bg-[#f3f5f8] p-4 sm:p-6 lg:p-8">
    <div className="mx-auto max-w-4xl space-y-6">
      <header><p className="text-xs font-medium text-[#667085]">Admin / Help</p><h1 className="mt-1 text-2xl font-semibold text-[#172033]">Vendor review guide</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[#667085]">Review submitted business documents, track verification, and manage vendor account access.</p></header>
      <section className="rounded-xl border border-[#e7eaf0] bg-white p-5 sm:p-6">
        <h2 className="text-base font-semibold text-[#172033]">Review and manage a vendor</h2>
        <ol className="mt-5 space-y-5">{steps.map((step, index) => <li key={step.title} className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">{index + 1}</span><div><h3 className="text-sm font-semibold text-[#344054]">{step.title}</h3><p className="mt-1 text-sm leading-6 text-[#667085]">{step.body}</p></div></li>)}</ol>
        <Link href="/admin/vendors" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#2864f0] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1f54d1]">Open vendor directory <ArrowRight size={15} /></Link>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-[#e7eaf0] bg-white p-4"><FileCheck2 size={19} className="text-blue-600" /><h3 className="mt-3 text-sm font-semibold text-[#344054]">Verification status</h3><p className="mt-1 text-xs leading-5 text-[#667085]">When submitted GST/PAN documents are reviewed, vendor verification updates automatically. Rejected required documents mark verification rejected; pending required documents keep it pending.</p></article>
        <article className="rounded-xl border border-[#e7eaf0] bg-white p-4"><UserRoundCog size={19} className="text-emerald-600" /><h3 className="mt-3 text-sm font-semibold text-[#344054]">Account status</h3><p className="mt-1 text-xs leading-5 text-[#667085]">Account access is separate. Activate the account after your checks are complete, or suspend it when access should be stopped. Changing a document decision does not activate the account.</p></article>
        <article className="rounded-xl border border-[#e7eaf0] bg-white p-4"><ShieldAlert size={19} className="text-amber-600" /><h3 className="mt-3 text-sm font-semibold text-[#344054]">Secure document access</h3><p className="mt-1 text-xs leading-5 text-[#667085]">Stored R2 references are private. Admin links are temporary and expire after five minutes. Generate a new secure link if one expires.</p></article>
      </section>
      <p className="flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 p-4 text-xs leading-5 text-blue-900"><CheckCircle2 size={16} className="mt-0.5 shrink-0" /> A rejection requires a reason. The reason is saved with the document review and shown on the vendor profile for follow-up.</p>
    </div>
  </main>;
}
