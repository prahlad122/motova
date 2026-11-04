"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowDownToLine, FileText, Plus, RefreshCw, Search, X, Check, Ban, ShieldCheck } from "lucide-react";
import { getAuthSession } from "@/features/auth/auth.utils";
import { createAdminVendor, fetchAdminVendors, getAdminDocumentAccess, getAdminVendor, reviewAdminDocument, updateAdminVendorStatus, type CreateAdminVendorInput } from "../../admin.api";
import type { AdminVendor, AdminVendorDetails } from "../../admin.types";
import VendorStats from "./VendorStats";
import VendorsTable from "./VendorsTable";

const inputClass = "w-full rounded-lg border border-[#dce2eb] bg-white px-3 py-2.5 text-sm text-[#253047] outline-none placeholder:text-[#a0a8b6] focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

function Modal({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#101828]/45 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section role="dialog" aria-modal="true" aria-label={title} className={`max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-white shadow-xl ${wide ? "max-w-2xl" : "max-w-xl"}`}>
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[#edf0f4] bg-white px-5 py-4"><h2 className="text-base font-semibold text-[#172033]">{title}</h2><button onClick={onClose} aria-label="Close" className="rounded-md p-1.5 text-[#667085] hover:bg-[#f2f4f7]"><X size={18} /></button></header>
      <div className="p-5">{children}</div>
    </section>
  </div>;
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<AdminVendor[]>([]);
  const [totalVendors, setTotalVendors] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [verification, setVerification] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<AdminVendorDetails | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");
  const [createdCredentials, setCreatedCredentials] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [documentUrls, setDocumentUrls] = useState<Record<string, string>>({});
  const [documentBusy, setDocumentBusy] = useState("");
  const [rejectingDocumentId, setRejectingDocumentId] = useState("");
  const [rejectionNote, setRejectionNote] = useState("");
  const [statusBusy, setStatusBusy] = useState(false);

  const loadVendors = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const session = getAuthSession("ADMIN");
      if (!session?.token) throw new Error("Your admin session was not found. Please log in again.");
      const result = await fetchAdminVendors(session.token, { page, limit: 10, search, status, verificationStatus: verification });
      setVendors(result.vendors); setTotalVendors(result.pagination.totalVendors); setTotalPages(result.pagination.totalPages);
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to load vendors."); }
    finally { setLoading(false); }
  }, [page, search, status, verification]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadVendors(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadVendors]);
  useEffect(() => {
    const timer = window.setTimeout(() => { setPage(1); setSearch(searchInput.trim()); }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const stats = useMemo(() => ({
    total: totalVendors,
    active: vendors.filter((vendor) => vendor.status === "ACTIVE").length,
    pending: vendors.filter((vendor) => vendor.status === "PENDING").length,
    profiles: vendors.filter((vendor) => Boolean(vendor.vendorProfile)).length,
  }), [vendors, totalVendors]);

  async function openDetails(vendor: AdminVendor) {
    setSelectedVendor(null); setActionError(""); setDetailLoading(true);
    try {
      const session = getAuthSession("ADMIN");
      if (!session?.token) throw new Error("Your admin session was not found. Please log in again.");
      setSelectedVendor(await getAdminVendor(session.token, vendor.id));
    } catch (err) { setActionError(err instanceof Error ? err.message : "Unable to load vendor details."); setError(err instanceof Error ? err.message : "Unable to load vendor details."); }
    finally { setDetailLoading(false); }
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setActionError(""); setFieldErrors({}); setCreatedCredentials("");
    const form = new FormData(event.currentTarget);
    const input: CreateAdminVendorInput = Object.fromEntries(form.entries()) as unknown as CreateAdminVendorInput;
    for (const key of ["gstNumber", "shippingAddress", "storeManager", "authorizedPerson"] as const) if (!input[key]) delete input[key];
    try {
      const session = getAuthSession("ADMIN");
      if (!session?.token) throw new Error("Your admin session was not found. Please log in again.");
      const result = await createAdminVendor(session.token, input);
      setCreatedCredentials(result.temporaryPassword);
      setPage(1); setSearch(""); setSearchInput(""); setStatus(""); setVerification("");
      await loadVendors();
    } catch (err) {
      const apiError = err as Error & { errors?: { field: string; message: string }[] };
      setActionError(apiError.errors?.length ? "Please correct the highlighted vendor details." : apiError.message || "Unable to create vendor.");
      setFieldErrors(Object.fromEntries((apiError.errors ?? []).map((item) => [item.field, item.message])));
    }
    finally { setSaving(false); }
  }

  async function openDocument(documentId: string) {
    setDocumentBusy(documentId); setActionError("");
    try {
      const session = getAuthSession("ADMIN");
      if (!session?.token) throw new Error("Your admin session was not found. Please log in again.");
      const access = await getAdminDocumentAccess(session.token, documentId);
      setDocumentUrls((current) => ({ ...current, [documentId]: access.url }));
    } catch (err) { setActionError(err instanceof Error ? err.message : "Unable to prepare a secure document link."); }
    finally { setDocumentBusy(""); }
  }

  async function handleDocumentReview(documentId: string, decision: "APPROVED" | "REJECTED", note?: string) {
    setDocumentBusy(documentId); setActionError("");
    try {
      const session = getAuthSession("ADMIN");
      if (!session?.token) throw new Error("Your admin session was not found. Please log in again.");
      await reviewAdminDocument(session.token, documentId, { decision, note });
      setRejectingDocumentId(""); setRejectionNote("");
      setSelectedVendor(await getAdminVendor(session.token, selectedVendor!.id));
      await loadVendors();
    } catch (err) { setActionError(err instanceof Error ? err.message : "Unable to update document review."); }
    finally { setDocumentBusy(""); }
  }

  async function handleVendorStatus() {
    if (!selectedVendor) return;
    setStatusBusy(true); setActionError("");
    try {
      const session = getAuthSession("ADMIN");
      if (!session?.token) throw new Error("Your admin session was not found. Please log in again.");
      const status = selectedVendor.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
      await updateAdminVendorStatus(session.token, selectedVendor.id, status);
      setSelectedVendor({ ...selectedVendor, status });
      await loadVendors();
    } catch (err) { setActionError(err instanceof Error ? err.message : "Unable to update vendor account status."); }
    finally { setStatusBusy(false); }
  }

  return <main className="min-h-full bg-[#f3f5f8] p-4 sm:p-5 lg:p-7">
    <div className="mx-auto max-w-[1440px] space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-xs font-medium text-[#667085]">Admin / Marketplace</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#172033]">Vendors</h1><p className="mt-1 text-sm text-[#778195]">Manage vendor accounts, business verification and submitted documents.</p></div>
        <div className="flex gap-2"><button onClick={() => void loadVendors()} disabled={loading} className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#dce2eb] bg-white px-3.5 text-sm font-medium text-[#344054] hover:bg-[#f9fafb] disabled:opacity-60"><RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh</button><button onClick={() => { setActionError(""); setFieldErrors({}); setCreatedCredentials(""); setShowCreate(true); }} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#2864f0] px-4 text-sm font-semibold text-white hover:bg-[#1f54d1]"><Plus size={16} /> Add vendor</button></div>
      </header>
      <VendorStats values={stats} />
      <section className="flex flex-col gap-3 rounded-xl border border-[#e7eaf0] bg-white p-3 sm:flex-row sm:items-center">
        <label className="relative min-w-0 flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#98a2b3]" /><input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search name, email, mobile or business" className={`${inputClass} pl-9`} /></label>
        <select aria-label="Filter by account status" value={status} onChange={(event) => { setPage(1); setStatus(event.target.value); }} className="rounded-lg border border-[#dce2eb] bg-white px-3 py-2.5 text-sm text-[#475467]"><option value="">All account statuses</option><option value="ACTIVE">Active</option><option value="PENDING">Pending</option><option value="SUSPENDED">Suspended</option></select>
        <select aria-label="Filter by verification status" value={verification} onChange={(event) => { setPage(1); setVerification(event.target.value); }} className="rounded-lg border border-[#dce2eb] bg-white px-3 py-2.5 text-sm text-[#475467]"><option value="">All verification statuses</option><option value="NOT_SUBMITTED">Not submitted</option><option value="PENDING">Pending review</option><option value="APPROVED">Approved</option><option value="REJECTED">Rejected</option></select>
      </section>
      {error && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"><span>{error}</span><button onClick={() => void loadVendors()} className="font-semibold underline">Try again</button></div>}
      {loading ? <div className="space-y-3 rounded-xl border border-[#e7eaf0] bg-white p-5">{[0,1,2,3,4].map((item) => <div key={item} className="h-12 animate-pulse rounded-md bg-[#f2f4f7]" />)}</div> : <VendorsTable vendors={vendors} page={page} totalPages={totalPages} totalVendors={totalVendors} onPage={setPage} onDetails={(vendor) => void openDetails(vendor)} />}
      <p className="text-center text-[11px] text-[#9aa3b2]">Vendor records and document references are loaded from the marketplace database.</p>
    </div>
    {showCreate && <Modal title={createdCredentials ? "Vendor created" : "Add a vendor"} onClose={() => { setShowCreate(false); setCreatedCredentials(""); void loadVendors(); }}>
      {createdCredentials ? <div><div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">Vendor account created successfully. Share this temporary password securely; it is shown only once.</div><label className="mt-4 block text-xs font-medium text-[#475467]">Temporary password</label><div className="mt-1 rounded-lg bg-[#f3f5f8] p-3 font-mono text-sm text-[#172033]">{createdCredentials}</div><button onClick={() => void navigator.clipboard?.writeText(createdCredentials)} className="mt-3 text-xs font-semibold text-blue-700 hover:underline">Copy password</button></div> : <form onChange={() => { setFieldErrors({}); setActionError(""); }} onSubmit={handleCreate} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">{[
          ["name", "Contact name", "e.g. Asha Mehta", true], ["email", "Email address", "name@company.com", true, "email"], ["mobile", "Mobile number", "+919876543210", true, "tel"], ["businessName", "Business name", "Company name", true], ["gstNumber", "GST number", "Optional", false], ["storeManager", "Store manager", "Optional", false], ["authorizedPerson", "Authorized person", "Optional", false],
        ].map(([name, label, placeholder, required, type]) => <label key={String(name)} className="block text-xs font-medium text-[#475467]">{String(label)}{required ? " *" : ""}<input name={String(name)} type={type ? String(type) : "text"} required={Boolean(required)} placeholder={String(placeholder)} className={`${inputClass} mt-1`} /></label>)}
          <label className="block text-xs font-medium text-[#475467]">Business address *<textarea name="businessAddress" required minLength={5} rows={2} className={`${inputClass} mt-1 resize-y`} placeholder="Registered business address" /></label>
          <label className="block text-xs font-medium text-[#475467]">Shipping address<textarea name="shippingAddress" rows={2} className={`${inputClass} mt-1 resize-y`} placeholder="Optional" /></label>
        </div>
        {actionError && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"><p>{actionError}</p>{Object.entries(fieldErrors).length > 0 && <ul className="mt-2 list-inside list-disc space-y-1">{Object.entries(fieldErrors).map(([field, message]) => <li key={field}><strong>{field.replaceAll(".", " ")}:</strong> {message}</li>)}</ul>}</div>}
        <footer className="flex justify-end gap-2 border-t border-[#edf0f4] pt-4"><button type="button" onClick={() => setShowCreate(false)} className="rounded-lg border border-[#dce2eb] px-4 py-2 text-sm text-[#475467]">Cancel</button><button disabled={saving} className="rounded-lg bg-[#2864f0] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Creating…" : "Create vendor"}</button></footer>
      </form>}
    </Modal>}
    {detailLoading && <Modal title="Vendor profile" onClose={() => setDetailLoading(false)}><div className="space-y-3">{[0,1,2].map((i) => <div key={i} className="h-12 animate-pulse rounded bg-[#f2f4f7]" />)}</div></Modal>}
    {selectedVendor && <Modal title="Vendor profile" wide onClose={() => setSelectedVendor(null)}>
      <div className="space-y-5">
        {actionError && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{actionError}</p>}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e7eaf0] p-4"><div><h3 className="text-sm font-semibold text-[#172033]">{selectedVendor.vendorProfile?.businessName || selectedVendor.name}</h3><p className="mt-1 text-xs text-[#778195]">{selectedVendor.name} · {selectedVendor.email} · {selectedVendor.mobile}</p><p className="mt-1 text-xs text-[#778195]">Account: <strong>{selectedVendor.status}</strong> · Verification: <strong>{selectedVendor.vendorProfile?.verificationStatus?.replaceAll("_", " ") || "Not submitted"}</strong></p></div><button onClick={() => void handleVendorStatus()} disabled={statusBusy} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold disabled:opacity-60 ${selectedVendor.status === "ACTIVE" ? "border border-rose-200 text-rose-700 hover:bg-rose-50" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}>{selectedVendor.status === "ACTIVE" ? <><Ban size={14} />{statusBusy ? "Updating…" : "Suspend account"}</> : <><ShieldCheck size={14} />{statusBusy ? "Updating…" : "Activate account"}</>}</button></div>
        <div className="grid gap-3 rounded-xl bg-[#f8f9fb] p-4 text-sm sm:grid-cols-2"><p><span className="text-xs text-[#8993a5]">GST number</span><br />{selectedVendor.vendorProfile?.gstNumber || "Not provided"}</p><p><span className="text-xs text-[#8993a5]">Business address</span><br />{selectedVendor.vendorProfile?.businessAddress || "Not provided"}</p><p><span className="text-xs text-[#8993a5]">Shipping address</span><br />{selectedVendor.vendorProfile?.shippingAddress || "Not provided"}</p><p><span className="text-xs text-[#8993a5]">Store manager</span><br />{selectedVendor.vendorProfile?.storeManager || "Not provided"}</p><p><span className="text-xs text-[#8993a5]">Authorized person</span><br />{selectedVendor.vendorProfile?.authorizedPerson || "Not provided"}</p><p><span className="text-xs text-[#8993a5]">Mobile verified</span><br />{selectedVendor.vendorProfile?.mobileVerified ? "Yes" : "No"}</p><p><span className="text-xs text-[#8993a5]">Joined</span><br />{new Date(selectedVendor.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}</p>{selectedVendor.vendorProfile?.verificationNote && <p className="sm:col-span-2"><span className="text-xs text-[#8993a5]">Verification note</span><br />{selectedVendor.vendorProfile.verificationNote}</p>}</div>
        <section><h3 className="mb-2 text-sm font-semibold text-[#172033]">Submitted documents <span className="font-normal text-[#8993a5]">({selectedVendor.vendorProfile?.documents.length ?? 0})</span></h3>
          {selectedVendor.vendorProfile?.documents.length ? <div className="divide-y divide-[#edf0f4] rounded-xl border border-[#e7eaf0]">{selectedVendor.vendorProfile.documents.map((document) => <div key={document.id} className="space-y-3 p-3"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><span className="rounded-lg bg-blue-50 p-2 text-blue-700"><FileText size={17} /></span><div className="min-w-0"><p className="truncate text-xs font-medium text-[#344054]">{document.fileName}</p><p className="mt-1 text-[10px] text-[#8993a5]">{document.type.replaceAll("_", " ")} · {document.status} · {new Date(document.submittedAt).toLocaleDateString("en-IN")}</p>{document.rejectionReason && <p className="mt-1 text-xs text-rose-700">Reason: {document.rejectionReason}</p>}</div></div><div className="flex flex-wrap gap-2">{documentUrls[document.id] ? <><a href={documentUrls[document.id]} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md border border-[#dce2eb] px-2.5 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50"><ArrowDownToLine size={14} /> Open document</a><button onClick={() => void openDocument(document.id)} disabled={documentBusy === document.id} className="rounded-md px-2 py-1.5 text-xs text-[#667085] underline disabled:opacity-60">Refresh link</button></> : <button onClick={() => void openDocument(document.id)} disabled={documentBusy === document.id} className="rounded-md border border-[#dce2eb] px-2.5 py-1.5 text-xs font-medium text-blue-700 disabled:opacity-60">{documentBusy === document.id ? "Preparing…" : "Get secure link"}</button>}{document.status !== "APPROVED" && <button onClick={() => void handleDocumentReview(document.id, "APPROVED")} disabled={documentBusy === document.id} className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-medium text-white disabled:opacity-60"><Check size={13} /> Approve</button>}{document.status !== "REJECTED" && <button onClick={() => { setRejectingDocumentId(document.id); setRejectionNote(""); }} disabled={documentBusy === document.id} className="rounded-md border border-rose-200 px-2.5 py-1.5 text-xs font-medium text-rose-700 disabled:opacity-60">Reject</button>}</div></div>{rejectingDocumentId === document.id && <div className="flex flex-col gap-2 rounded-lg bg-rose-50 p-3 sm:flex-row"><input value={rejectionNote} onChange={(event) => setRejectionNote(event.target.value)} placeholder="Reason required for rejection" className="min-w-0 flex-1 rounded-md border border-rose-200 bg-white px-3 py-2 text-xs outline-none focus:border-rose-400" /><button onClick={() => void handleDocumentReview(document.id, "REJECTED", rejectionNote)} disabled={!rejectionNote.trim() || documentBusy === document.id} className="rounded-md bg-rose-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">{documentBusy === document.id ? "Saving…" : "Confirm rejection"}</button><button onClick={() => setRejectingDocumentId("")} className="rounded-md px-3 py-2 text-xs text-[#667085]">Cancel</button></div>}</div>)}</div> : <p className="rounded-lg border border-dashed border-[#dce2eb] p-6 text-center text-xs text-[#8993a5]">No documents have been submitted.</p>}
        </section>
      </div>
    </Modal>}
  </main>;
}
