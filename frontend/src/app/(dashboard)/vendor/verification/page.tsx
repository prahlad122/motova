"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getAuthSession } from "@/features/auth/auth.utils";
import { getVendorDocumentAccess, getVendorVerification, submitVendorDocuments, type VendorVerification } from "@/features/vendor/vendor.api";

const requiredTypes = [
  { type: "GST_CERTIFICATE", label: "GST certificate (GSTIN)" },
  { type: "PAN_CARD", label: "PAN card" },
];

export default function VendorVerificationPage() {
  const [verification, setVerification] = useState<VendorVerification | null>(null);
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    const token = getAuthSession("VENDOR")?.token;
    if (!token) { setError("Your session was not found. Please log in again."); return; }
    try { setVerification(await getVendorVerification(token)); } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not load verification status."); }
  }, []);
  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(timer); }, [load]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setMessage("");
    const selected = Object.entries(files).filter((entry): entry is [string, File] => entry[1] instanceof File).map(([type, file]) => ({ type, file }));
    if (!selected.some(({ type }) => type === "GST_CERTIFICATE" || type === "PAN_CARD")) { setError("Submit at least one GST certificate or PAN card for business verification."); return; }
    const token = getAuthSession("VENDOR")?.token;
    if (!token) { setError("Your session was not found. Please log in again."); return; }
    setBusy(true);
    try { await submitVendorDocuments(token, selected); setMessage("Documents submitted. Your verification is now under review."); setFiles({}); await load(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Document upload failed."); }
    finally { setBusy(false); }
  }

  async function openDocument(id: string) {
    const token = getAuthSession("VENDOR")?.token;
    if (!token) return;
    try { const access = await getVendorDocumentAccess(token, id); window.open(access.url, "_blank", "noopener,noreferrer"); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not open document."); }
  }

  const status = verification?.verificationStatus ?? "NOT_SUBMITTED";
  const accountActive = verification?.user.status === "ACTIVE";
  const copy = status === "APPROVED" && !accountActive ? ["Vendor account is inactive", "Your business is verified, but product access requires an active vendor account. Contact Motova support for account assistance."]
    : status === "APPROVED" ? ["Business Verification Approved", "Your business has been verified. Product listings still require individual admin approval."]
    : status === "PENDING" ? ["Verification Under Review", "Our team is reviewing your submitted documents. Product listing will unlock after approval."]
    : status === "REJECTED" ? ["Verification Requires Attention", verification?.verificationNote || "Review the rejected documents, then upload corrected copies."]
    : ["Complete Your Business Verification", "Before you can start listing products on Motova, please submit your required business documents for verification."];

  return <main className="min-h-full bg-[#f3f5f8] p-4 sm:p-6 lg:p-8"><div className="mx-auto max-w-4xl space-y-5">
    <header><p className="text-xs font-medium text-slate-500">Vendor / Account</p><h1 className="mt-1 text-2xl font-semibold text-slate-900">Business verification</h1></header>
    <section className="rounded-2xl border border-blue-100 bg-white p-5 sm:p-7"><div className="flex flex-wrap items-start justify-between gap-4"><div><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{status.replaceAll("_", " ")}</span><h2 className="mt-4 text-xl font-semibold text-slate-900">{copy[0]}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{copy[1]}</p></div>{status === "APPROVED" && accountActive && <Link href="/vendor/inventory" className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">Go to products</Link>}</div></section>
    {error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
    {message && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7"><div><h2 className="text-base font-semibold text-slate-900">Business documents</h2><p className="mt-1 text-sm text-slate-500">Submit a GST certificate or PAN card. You can upload both. PDF, JPG or PNG, maximum 5 MB per file.</p></div>
      <div className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200">{(verification?.documents ?? []).map((doc) => <div key={doc.id} className="flex flex-wrap items-center justify-between gap-3 p-4"><div><p className="text-sm font-medium text-slate-800">{doc.type.replaceAll("_", " ")} · {doc.fileName}</p><p className="mt-1 text-xs text-slate-500">Submitted {new Date(doc.submittedAt).toLocaleString("en-IN")} · {doc.status.replaceAll("_", " ")}</p>{doc.rejectionReason && <p className="mt-1 text-xs text-rose-700">Reason: {doc.rejectionReason}</p>}</div><button onClick={() => void openDocument(doc.id)} className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-blue-700">Preview securely</button></div>)}{!verification?.documents.length && <p className="p-5 text-sm text-slate-500">No documents submitted yet.</p>}</div>
      {status !== "PENDING" && status !== "APPROVED" && <form onSubmit={(event) => void submit(event)} className="mt-6 space-y-4">{requiredTypes.map(({ type, label }) => <label key={type} className="block text-sm font-medium text-slate-700">{label}<input type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={(event) => setFiles((current) => ({ ...current, [type]: event.target.files?.[0] ?? null }))} className="mt-2 block w-full rounded-lg border border-slate-200 p-2 text-sm" /></label>)}<button disabled={busy} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{busy ? "Submitting…" : status === "REJECTED" ? "Resubmit documents" : "Submit for verification"}</button></form>}
    </section>
  </div></main>;
}
