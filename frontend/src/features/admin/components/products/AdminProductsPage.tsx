"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Eye, RefreshCw, Search, X } from "lucide-react";
import { getAuthSession } from "@/features/auth/auth.utils";
import { fetchAdminCategories, fetchAdminProducts, fetchAdminProductStats, fetchAdminVendors, getAdminProduct, approveAdminProduct, rejectAdminProduct, approveAdminProductRevision, rejectAdminProductRevision } from "../../admin.api";
import type { AdminProduct, AdminProductStats, AdminCategory, AdminVendor } from "../../admin.types";

const statusPill = (status: string) => status === "APPROVED" || status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : status === "REJECTED" || status === "INACTIVE" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700";
const inputClass = "rounded-lg border border-[#dce2eb] bg-white px-3 py-2 text-sm text-[#344054] outline-none focus:border-blue-500";
const date = (value: string) => new Date(value).toLocaleDateString("en-IN", { dateStyle: "medium" });
const money = (value: number | null) => value === null ? "—" : new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value);

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [stats, setStats] = useState<AdminProductStats | null>(null);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [vendors, setVendors] = useState<AdminVendor[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [listingStatus, setListingStatus] = useState("");
  const [publicationStatus, setPublicationStatus] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<AdminProduct | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<{ kind: "product" | "revision"; id: string } | null>(null);
  const [reason, setReason] = useState("");

  const token = () => {
    const session = getAuthSession("ADMIN");
    if (!session?.token) throw new Error("Your admin session was not found. Please log in again.");
    return session.token;
  };
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const auth = token();
      const [listing, totals] = await Promise.all([
        fetchAdminProducts(auth, { page, limit: 10, search, listingStatus: listingStatus || undefined, status: publicationStatus || undefined, vendorId: vendorId || undefined, categoryId: categoryId || undefined, sortBy, sortOrder }),
        fetchAdminProductStats(auth),
      ]);
      setProducts(listing.products); setTotal(listing.pagination.totalProducts); setPages(Math.max(1, listing.pagination.totalPages)); setStats(totals);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Products could not be loaded."); }
    finally { setLoading(false); }
  }, [page, search, listingStatus, publicationStatus, vendorId, categoryId, sortBy, sortOrder]);
  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(timer); }, [load]);
  useEffect(() => { const timer = window.setTimeout(() => { setPage(1); setSearch(searchInput.trim()); }, 250); return () => window.clearTimeout(timer); }, [searchInput]);
  useEffect(() => {
    const auth = getAuthSession("ADMIN")?.token; if (!auth) return;
    void Promise.all([
      fetchAdminCategories(auth, { page: 1, limit: 100 }).then((result) => setCategories(result.categories.flatMap((root) => [root, ...(root.children ?? [])]))).catch(() => undefined),
      fetchAdminVendors(auth, { page: 1, limit: 100 }).then((result) => setVendors(result.vendors)).catch(() => undefined),
    ]);
  }, []);

  const pendingRevision = useMemo(() => selected?.revisions?.find((revision) => revision.status === "PENDING"), [selected]);
  async function openProduct(productId: string) {
    setSelected(null); setDetailLoading(true);
    try { setSelected(await getAdminProduct(token(), productId)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Product details could not be loaded."); }
    finally { setDetailLoading(false); }
  }
  async function approveProduct(productId: string) {
    if (!window.confirm("Approve this product listing?")) return;
    setBusy(true);
    try { await approveAdminProduct(token(), productId); await openProduct(productId); await load(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Approval failed."); }
    finally { setBusy(false); }
  }
  async function approveRevision(revisionId: string, productId: string) {
    if (!window.confirm("Approve and apply the proposed product changes?")) return;
    setBusy(true);
    try { await approveAdminProductRevision(token(), revisionId); await openProduct(productId); await load(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Revision approval failed."); }
    finally { setBusy(false); }
  }
  async function submitRejection() {
    if (!rejectTarget || reason.trim().length < 10) return;
    setBusy(true);
    try {
      const auth = token();
      if (rejectTarget.kind === "product") { await rejectAdminProduct(auth, rejectTarget.id, reason); await openProduct(rejectTarget.id); }
      else { await rejectAdminProductRevision(auth, rejectTarget.id, reason); if (selected) await openProduct(selected.id); }
      setRejectTarget(null); setReason(""); await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Rejection failed."); }
    finally { setBusy(false); }
  }
  async function openRejectedProduct(product: AdminProduct) { await openProduct(product.id); }

  return <main className="min-h-full bg-[#f8f9fb] p-4 sm:p-6 lg:p-8">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-semibold text-[#25282d]">Product management</h1><p className="mt-1 text-sm text-[#667085]">Review listings and proposed changes from vendors.</p></div><button onClick={() => void load()} className={`${inputClass} inline-flex items-center gap-2`}><RefreshCw size={15} /> Refresh</button></div>
    <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-7">{[["Total", stats?.total], ["Pending", stats?.pending], ["Revisions", stats?.pendingRevisions], ["Approved", stats?.approved], ["Rejected", stats?.rejected], ["Active", stats?.active], ["Inactive", stats?.inactive]].map(([label, value]) => <div key={String(label)} className="rounded-xl border border-[#e1e5ec] bg-white p-4"><p className="text-xs text-[#667085]">{label}</p><p className="mt-1 text-2xl font-semibold text-[#172033]">{value ?? "—"}</p></div>)}</div>
    <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
      <div className="relative"><Search size={16} className="absolute left-3 top-3 text-[#98a2b3]"/><input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search product, SKU, vendor" className={`${inputClass} w-full pl-9`}/></div>
      <select value={listingStatus} onChange={(event) => { setPage(1); setListingStatus(event.target.value); }} className={inputClass}><option value="">All approval states</option>{["PENDING", "APPROVED", "REJECTED"].map((status) => <option key={status}>{status}</option>)}</select>
      <select value={publicationStatus} onChange={(event) => { setPage(1); setPublicationStatus(event.target.value); }} className={inputClass}><option value="">All publication states</option>{["DRAFT", "ACTIVE", "INACTIVE"].map((status) => <option key={status}>{status}</option>)}</select>
      <select value={vendorId} onChange={(event) => { setPage(1); setVendorId(event.target.value); }} className={inputClass}><option value="">All vendors</option>{vendors.filter((vendor) => vendor.vendorProfile).map((vendor) => <option key={vendor.vendorProfile!.id} value={vendor.vendorProfile!.id}>{vendor.vendorProfile!.businessName || vendor.name}</option>)}</select>
      <select value={categoryId} onChange={(event) => { setPage(1); setCategoryId(event.target.value); }} className={inputClass}><option value="">All categories</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
      <select value={`${sortBy}:${sortOrder}`} onChange={(event) => { const [field, order] = event.target.value.split(":"); setPage(1); setSortBy(field); setSortOrder(order); }} className={inputClass}><option value="createdAt:desc">Newest first</option><option value="createdAt:asc">Oldest first</option><option value="price:asc">Price: low to high</option><option value="price:desc">Price: high to low</option><option value="name:asc">Name: A to Z</option></select>
    </div>
    {error && <div role="alert" className="mt-4 flex items-center justify-between rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}<button onClick={() => setError("")} aria-label="Dismiss error"><X size={16}/></button></div>}
    <div className="mt-4 overflow-x-auto rounded-xl border border-[#e1e5ec] bg-white">
      <table className="w-full min-w-[1040px] text-left text-sm"><thead className="bg-[#f8f9fb] text-xs uppercase text-[#667085]"><tr>{["Product", "SKU", "Vendor", "Category", "Price", "Stock", "Status", "Approval", "Submitted", ""].map((header) => <th key={header} className="px-4 py-3 font-medium">{header}</th>)}</tr></thead>
        <tbody className="divide-y divide-[#edf0f4]">{loading ? <tr><td colSpan={10} className="p-10 text-center text-[#667085]">Loading products…</td></tr> : products.length === 0 ? <tr><td colSpan={10} className="p-10 text-center text-[#667085]">No products match these filters.</td></tr> : products.map((product) => <tr key={product.id} className="hover:bg-[#fafbfc]"><td className="px-4 py-3"><div className="flex items-center gap-3">{product.images[0]?.imageUrl ? <img src={product.images[0].imageUrl} alt="" className="h-10 w-10 rounded-lg object-cover"/> : <div className="h-10 w-10 rounded-lg bg-slate-100"/>}<span className="max-w-56 truncate font-medium text-[#273247]">{product.name}</span></div></td><td className="px-4 py-3 font-mono text-xs text-[#667085]">{product.sku}</td><td className="px-4 py-3"><div>{product.vendor.businessName ?? product.vendor.user.name}</div><div className="text-xs text-[#8993a5]">{product.vendor.user.email}</div></td><td className="px-4 py-3 text-[#475467]">{product.category.name}</td><td className="px-4 py-3">{money(product.price)}</td><td className="px-4 py-3">{product.stockQuantity}</td><td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs ${statusPill(product.status)}`}>{product.status}</span></td><td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs ${statusPill(product.revisions?.some((revision) => revision.status === "PENDING") ? "PENDING" : product.listingStatus)}`}>{product.revisions?.some((revision) => revision.status === "PENDING") ? "REVISION PENDING" : product.listingStatus}</span></td><td className="px-4 py-3 text-xs text-[#667085]">{date(product.createdAt)}</td><td className="px-4 py-3"><button onClick={() => void openRejectedProduct(product)} className="rounded-md p-2 text-blue-700 hover:bg-blue-50" aria-label={`View ${product.name}`}><Eye size={16}/></button></td></tr>)}</tbody></table>
      <div className="flex items-center justify-between border-t border-[#edf0f4] px-4 py-3 text-xs text-[#667085]"><span>{total} products · page {page} of {pages}</span><div className="flex gap-2"><button disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)} className={`${inputClass} disabled:opacity-40`}>Previous</button><button disabled={page >= pages || loading} onClick={() => setPage((value) => value + 1)} className={`${inputClass} disabled:opacity-40`}>Next</button></div></div>
    </div>
    {(selected || detailLoading) && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#101828]/45 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}><section role="dialog" aria-modal="true" aria-label="Product review" className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-xl"><header className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-5 py-4"><h2 className="font-semibold text-[#172033]">Product review</h2><button onClick={() => setSelected(null)} aria-label="Close"><X size={18}/></button></header>{detailLoading || !selected ? <div className="p-12 text-center text-sm text-[#667085]">Loading details…</div> : <div className="space-y-5 p-5">
      <div className="grid gap-5 md:grid-cols-[1fr_1fr]"><Version title="CURRENT PRODUCT" name={selected.name} sku={selected.sku} category={selected.category.name} brand={selected.brand?.name ?? "—"} price={selected.price} compare={selected.compareAtPrice} stock={selected.stockQuantity} description={selected.description} images={selected.images.map((image) => image.imageUrl)}/>{pendingRevision ? <Version title="PROPOSED REVISION" name={pendingRevision.name} sku={pendingRevision.sku} category={pendingRevision.category.name} brand={pendingRevision.brand?.name ?? "—"} price={pendingRevision.price} compare={pendingRevision.compareAtPrice} stock={pendingRevision.stockQuantity} description={pendingRevision.description} images={pendingRevision.images.map((image) => image.imageUrl)}/> : <div className="rounded-xl border border-[#e1e5ec] p-4"><h3 className="text-sm font-semibold">Vendor</h3><p className="mt-2 text-sm">{selected.vendor.businessName ?? selected.vendor.user.name}</p><p className="text-xs text-[#667085]">{selected.vendor.user.email}</p><p className="mt-3 text-xs text-[#667085]">Submitted {date(selected.createdAt)} · {selected.listingStatus} · {selected.status}</p>{selected.listingNote && <p className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{selected.listingNote}</p>}</div>}</div>
      <div className="flex flex-wrap justify-end gap-2">{pendingRevision ? <><button disabled={busy} onClick={() => setRejectTarget({ kind: "revision", id: pendingRevision.id })} className="rounded-lg border border-rose-200 px-4 py-2 text-sm font-medium text-rose-700">Reject revision</button><button disabled={busy} onClick={() => void approveRevision(pendingRevision.id, selected.id)} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white"><Check size={16}/> Approve revision</button></> : selected.listingStatus === "PENDING" ? <><button disabled={busy} onClick={() => setRejectTarget({ kind: "product", id: selected.id })} className="rounded-lg border border-rose-200 px-4 py-2 text-sm font-medium text-rose-700">Reject</button><button disabled={busy} onClick={() => void approveProduct(selected.id)} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white"><Check size={16}/> Approve</button></> : null}</div>
      <section><h3 className="mb-2 text-sm font-semibold">Review history</h3><div className="space-y-2">{selected.listingReviews?.map((review) => <p key={review.id} className="rounded-lg bg-[#f8f9fb] p-3 text-xs text-[#475467]">{review.status} by {review.reviewer.name} · {date(review.reviewedAt)}{review.note ? ` — ${review.note}` : ""}</p>)}</div></section>
    </div>}</section></div>}
    {rejectTarget && <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#101828]/45 p-4"><section role="dialog" aria-modal="true" aria-label="Reject product" className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl"><div className="flex items-center justify-between"><h2 className="font-semibold">Reject {rejectTarget.kind}</h2><button onClick={() => setRejectTarget(null)} aria-label="Close"><X size={18}/></button></div><label className="mt-4 block text-sm text-[#475467]">Reason (at least 10 characters)<textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={4} maxLength={2000} className={`${inputClass} mt-2 w-full`} /></label><div className="mt-4 flex justify-end gap-2"><button onClick={() => setRejectTarget(null)} className={`${inputClass}`}>Cancel</button><button disabled={busy || reason.trim().length < 10} onClick={() => void submitRejection()} className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-40">{busy ? "Saving…" : "Confirm rejection"}</button></div></section></div>}
  </main>;
}

function Version({ title, name, sku, category, brand, price, compare, stock, description, images }: { title: string; name: string; sku: string; category: string; brand: string; price: number; compare: number | null; stock: number; description: string | null; images: string[] }) {
  return <section className="rounded-xl border border-[#e1e5ec] p-4"><h3 className="text-xs font-semibold tracking-wide text-[#667085]">{title}</h3><h4 className="mt-3 text-lg font-semibold text-[#172033]">{name}</h4><dl className="mt-3 grid grid-cols-2 gap-3 text-sm"><Pair label="SKU" value={sku}/><Pair label="Category" value={category}/><Pair label="Brand" value={brand}/><Pair label="Price" value={money(price)}/><Pair label="Compare at" value={money(compare)}/><Pair label="Stock" value={String(stock)}/></dl><p className="mt-3 whitespace-pre-wrap text-sm text-[#475467]">{description || "No description provided."}</p>{images.length > 0 && <div className="mt-3 flex gap-2 overflow-auto">{images.map((src, index) => <img key={`${src}-${index}`} src={src} alt="Product" className="h-20 w-20 rounded-lg border object-cover"/>)}</div>}</section>;
}
function Pair({ label, value }: { label: string; value: string }) { return <div className="rounded-lg bg-[#f8f9fb] p-2"><dt className="text-[10px] uppercase text-[#98a2b3]">{label}</dt><dd className="mt-1 break-words text-xs font-medium text-[#344054]">{value}</dd></div>; }
