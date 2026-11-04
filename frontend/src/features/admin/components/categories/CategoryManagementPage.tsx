"use client";
/* eslint @next/next/no-img-element: off -- R2 images use short-lived signed URLs that are rendered directly. */

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Eye, FolderTree, Image as ImageIcon, Pencil, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { getAuthSession } from "@/features/auth/auth.utils";
import { createAdminCategory, deleteAdminCategory, fetchAdminCategories, fetchAdminCategoryStats, getAdminCategory, setAdminCategoryStatus, updateAdminCategory, uploadAdminCategoryImage } from "../../admin.api";
import type { AdminCategoriesResponse, AdminCategory, AdminCategoryStats } from "../../admin.types";

const emptyStats: AdminCategoryStats = { totalCategories: 0, activeCategories: 0, inactiveCategories: 0, parentCategories: 0, subcategories: 0 };
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const inputClass = "w-full rounded-lg border border-[#dce2eb] bg-white px-3 py-2.5 text-sm text-[#344054] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export default function CategoryManagementPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [stats, setStats] = useState(emptyStats);
  const [roots, setRoots] = useState<AdminCategory[]>([]);
  const [pagination, setPagination] = useState<AdminCategoriesResponse["pagination"]>({ currentPage: 1, pageSize: 20, totalCategories: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [parentFilter, setParentFilter] = useState("");
  const [sortBy, setSortBy] = useState("sortOrder");
  const [sortOrder, setSortOrder] = useState("asc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [modal, setModal] = useState<"create" | "edit" | "view" | "delete" | null>(null);
  const [selected, setSelected] = useState<AdminCategory | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formError, setFormError] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", description: "", parentId: "", image: "", sortOrder: "0", isActive: true });
  const [imagePreview, setImagePreview] = useState("");
  const token = getAuthSession("ADMIN")?.token;

  useEffect(() => { const timer = window.setTimeout(() => { setDebouncedSearch(search.trim()); setPage(1); }, 300); return () => window.clearTimeout(timer); }, [search]);

  const load = useCallback(async () => {
    if (!token) { setError("Your admin session has expired. Please sign in again."); setLoading(false); return; }
    setLoading(true); setError("");
    try {
      const [result, summary, rootResult] = await Promise.all([
        fetchAdminCategories(token, { page, limit: 20, search: debouncedSearch, isActive: activeFilter, parentId: parentFilter, sortBy, sortOrder }),
        fetchAdminCategoryStats(token),
        fetchAdminCategories(token, { page: 1, limit: 100, sortBy: "sortOrder", sortOrder: "asc" }),
      ]);
      setCategories(result.categories); setPagination(result.pagination); setStats(summary); setRoots(rootResult.categories);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load categories."); }
    finally { setLoading(false); }
  }, [token, page, debouncedSearch, activeFilter, parentFilter, sortBy, sortOrder]);
  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(timer); }, [load]);

  const beginForm = (category?: AdminCategory) => {
    setSelected(category ?? null); setFormError(""); setSlugTouched(Boolean(category));
    setImagePreview(category?.imageUrl ?? category?.image ?? "");
    setForm(category ? { name: category.name, slug: category.slug, description: category.description ?? "", parentId: category.parentId ?? "", image: category.image ?? "", sortOrder: String(category.sortOrder), isActive: category.isActive } : { name: "", slug: "", description: "", parentId: "", image: "", sortOrder: "0", isActive: true });
    setModal(category ? "edit" : "create");
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setFormError("");
    if (!token) { setFormError("Your admin session has expired. Please sign in again."); return; }
    if (!form.name.trim()) { setFormError("Category name is required."); return; }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) { setFormError("Use lowercase letters, numbers, and hyphens for the slug."); return; }
    if (!Number.isInteger(Number(form.sortOrder)) || Number(form.sortOrder) < 0) { setFormError("Sort order must be a non-negative whole number."); return; }
    try {
      setSaving(true);
      const payload = { name: form.name.trim(), slug: form.slug, description: form.description.trim() || null, parentId: form.parentId || null, image: form.image.trim() || null, sortOrder: Number(form.sortOrder), ...(modal === "edit" ? { isActive: form.isActive } : {}) };
      if (modal === "edit" && selected) await updateAdminCategory(token, selected.id, payload); else await createAdminCategory(token, payload);
      setModal(null); setNotice(modal === "edit" ? "Category updated." : "Category created."); await load();
    } catch (cause) { setFormError(cause instanceof Error ? cause.message : "Unable to save this category."); }
    finally { setSaving(false); }
  };

  const view = async (category: AdminCategory) => {
    if (!token) return;
    try { setSelected(await getAdminCategory(token, category.id)); setModal("view"); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load category details."); }
  };
  const changeStatus = async (category: AdminCategory) => {
    if (!token) return;
    try { await setAdminCategoryStatus(token, category.id, !category.isActive); setNotice(category.isActive ? "Category deactivated. Existing products remain assigned." : "Category activated."); await load(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to update category status."); }
  };
  const remove = async () => {
    if (!token || !selected) return;
    try { setSaving(true); await deleteAdminCategory(token, selected.id); setModal(null); setNotice("Category deleted."); await load(); }
    catch (cause) { setFormError(cause instanceof Error ? cause.message : "Unable to delete category."); }
    finally { setSaving(false); }
  };
  const uploadImage = async (file?: File) => {
    if (!file || !token) return;
    if (!file.type.startsWith("image/")) { setFormError("Choose a JPG, PNG, or WebP image."); return; }
    if (file.size > 5 * 1024 * 1024) { setFormError("Image must be 5 MB or smaller."); return; }
    try { setUploadingImage(true); setFormError(""); const uploaded = await uploadAdminCategoryImage(token, file); setForm((previous) => ({ ...previous, image: uploaded.image })); setImagePreview(uploaded.url); }
    catch (cause) { setFormError(cause instanceof Error ? cause.message : "Unable to upload this image."); }
    finally { setUploadingImage(false); }
  };
  const rows = useMemo(() => categories.flatMap((category) => [{ category, depth: parentFilter ? 1 : 0 }, ...(!parentFilter ? (category.children ?? []).map((child) => ({ category: child, depth: 1 })) : [])]), [categories, parentFilter]);
  const statItems = [["Total Categories", stats.totalCategories, "#2864f0"], ["Active Categories", stats.activeCategories, "#059669"], ["Inactive Categories", stats.inactiveCategories, "#d97706"], ["Parent Categories", stats.parentCategories, "#7c3aed"], ["Subcategories", stats.subcategories, "#0891b2"]] as const;

  return <main className="min-h-full bg-[#f8f9fb] px-4 py-6 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-[1500px]">
      <header className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-2xl font-semibold tracking-tight text-[#172033]">Category Management</h1><p className="mt-1 text-sm text-[#778195]">Manage marketplace categories and organize products using parent categories and subcategories.</p></div><button onClick={() => beginForm()} className="inline-flex items-center gap-2 rounded-lg bg-[#2864f0] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"><Plus size={17} /> Add New Category</button></header>

      <section aria-label="Category summary" className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">{statItems.map(([label, value, color]) => <article key={label} className="rounded-xl border border-[#e7eaf0] bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><p className="text-xs font-medium text-[#778195]">{label}</p><span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} /></div><p className="mt-3 text-2xl font-semibold text-[#172033]">{loading ? <span className="inline-block h-7 w-12 animate-pulse rounded bg-slate-100" /> : value.toLocaleString("en-IN")}</p></article>)}</section>

      {notice && <div role="status" className="mt-4 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}<button onClick={() => setNotice("")} aria-label="Dismiss message">×</button></div>}
      {error && <div role="alert" className="mt-4 flex items-center justify-between rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}<button onClick={() => setError("")} aria-label="Dismiss error">×</button></div>}

      <section className="mt-6 rounded-xl border border-[#e7eaf0] bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf0f4] p-4 sm:px-5"><div><h2 className="text-sm font-semibold text-[#172033]">Categories</h2><p className="mt-1 text-xs text-[#8993a5]">{pagination.totalCategories.toLocaleString("en-IN")} {parentFilter ? "subcategories" : "parent categories"} · hierarchy shown inline</p></div><button onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-[#dce2eb] px-3 py-2 text-xs font-medium text-[#475467] hover:bg-slate-50 disabled:opacity-50"><RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh</button></div>
        <div className="grid gap-3 border-b border-[#edf0f4] p-4 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_190px_220px_180px]"><label className="relative"><span className="sr-only">Search categories</span><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#98a2b3]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or slug" className={`${inputClass} pl-9`} /></label><select aria-label="Filter by status" value={activeFilter} onChange={(event) => { setActiveFilter(event.target.value); setPage(1); }} className={inputClass}><option value="">All statuses</option><option value="true">Active</option><option value="false">Inactive</option></select><select aria-label="Filter by parent category" value={parentFilter} onChange={(event) => { setParentFilter(event.target.value); setPage(1); }} className={inputClass}><option value="">All parent categories</option>{roots.map((root) => <option key={root.id} value={root.id}>{root.name}</option>)}</select><select aria-label="Sort categories" value={`${sortBy}:${sortOrder}`} onChange={(event) => { const [field, direction] = event.target.value.split(":"); setSortBy(field); setSortOrder(direction); }} className={inputClass}><option value="sortOrder:asc">Sort order</option><option value="name:asc">Name A–Z</option><option value="name:desc">Name Z–A</option><option value="createdAt:desc">Newest first</option><option value="createdAt:asc">Oldest first</option></select></div>

        <div className="overflow-x-auto"><table className="w-full min-w-[1020px] text-left"><thead className="bg-[#f8f9fb] text-[10px] font-semibold uppercase tracking-wide text-[#8993a5]"><tr><th className="px-5 py-3">Category</th><th className="px-4 py-3">Slug</th><th className="px-4 py-3">Parent category</th><th className="px-4 py-3">Subcategories</th><th className="px-4 py-3">Products</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Created</th><th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-[#edf0f4]">
          {loading ? Array.from({ length: 5 }, (_, index) => <tr key={index}>{Array.from({ length: 8 }, (_, cell) => <td key={cell} className="px-4 py-4"><span className="block h-4 animate-pulse rounded bg-slate-100" /></td>)}</tr>) : rows.map(({ category, depth }) => <tr key={category.id} className="hover:bg-[#fafbfc]"><td className="px-5 py-3.5"><div className="flex items-center gap-3" style={{ paddingLeft: depth ? 23 : 0 }}>{depth > 0 && <span aria-hidden="true" className="text-[#aab3c1]">└─</span>}{(category.imageUrl ?? category.image) ? <img src={(category.imageUrl ?? category.image)!} alt="" className="h-9 w-9 rounded-lg border border-[#e7eaf0] object-cover" /> : <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><ImageIcon size={16} /></span>}<div><p className="text-xs font-semibold text-[#273247]">{category.name}</p><p className="mt-0.5 text-[10px] text-[#8993a5]">{depth ? "Subcategory" : "Parent category"}</p></div></div></td><td className="px-4 py-3.5 font-mono text-[11px] text-[#667085]">{category.slug}</td><td className="px-4 py-3.5 text-xs text-[#667085]">{category.parent?.name ?? (depth ? "—" : "—")}</td><td className="px-4 py-3.5 text-xs text-[#667085]">{category._count.children}</td><td className="px-4 py-3.5 text-xs text-[#667085]">{category._count.products}</td><td className="px-4 py-3.5"><span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${category.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{category.isActive ? "Active" : "Inactive"}</span></td><td className="px-4 py-3.5 text-xs text-[#667085]">{new Date(category.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td><td className="px-4 py-3.5"><div className="flex justify-end gap-1"><Action label="View" onClick={() => void view(category)}><Eye size={15} /></Action><Action label="Edit" onClick={() => beginForm(category)}><Pencil size={14} /></Action><Action label={category.isActive ? "Deactivate" : "Activate"} onClick={() => void changeStatus(category)}><span className="text-[10px]">{category.isActive ? "Off" : "On"}</span></Action><Action label="Delete" onClick={() => { setSelected(category); setFormError(""); setModal("delete"); }}><Trash2 size={14} /></Action></div></td></tr>)}
          {!loading && rows.length === 0 && <tr><td colSpan={8} className="px-5 py-14 text-center"><FolderTree className="mx-auto text-[#aab3c1]" size={28} /><p className="mt-3 text-sm font-medium text-[#344054]">{error ? "Categories could not be loaded" : "No categories found"}</p><p className="mt-1 text-xs text-[#8993a5]">{error ? "Check your connection and refresh." : "Try changing your search or filters, or add a category."}</p></td></tr>}
        </tbody></table></div>
        <footer className="flex items-center justify-between border-t border-[#edf0f4] px-4 py-3 text-xs text-[#778195] sm:px-5"><span>Page {pagination.currentPage} of {Math.max(pagination.totalPages, 1)}</span><div className="flex gap-2"><button disabled={!pagination.hasPreviousPage || loading} onClick={() => setPage((value) => value - 1)} className="inline-flex items-center gap-1 rounded-md border border-[#e1e5ec] px-2.5 py-2 disabled:opacity-40"><ChevronLeft size={14} /> Previous</button><button disabled={!pagination.hasNextPage || loading} onClick={() => setPage((value) => value + 1)} className="inline-flex items-center gap-1 rounded-md border border-[#e1e5ec] px-2.5 py-2 disabled:opacity-40">Next <ChevronRight size={14} /></button></div></footer>
      </section>
    </div>

    {modal && <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#101828]/45 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setModal(null); }}><section role="dialog" aria-modal="true" className="my-6 w-full max-w-2xl rounded-2xl bg-white shadow-2xl"><header className="flex items-start justify-between border-b border-[#edf0f4] px-5 py-4 sm:px-6"><div><h2 className="text-base font-semibold text-[#172033]">{modal === "create" ? "Add new category" : modal === "edit" ? "Edit category" : modal === "view" ? "Category details" : "Delete category"}</h2><p className="mt-1 text-xs text-[#8993a5]">{modal === "delete" ? "Check category usage before removing it." : "Category hierarchy is limited to parent and subcategory levels."}</p></div><button disabled={saving} onClick={() => setModal(null)} aria-label="Close dialog" className="rounded-md px-2 py-1 text-xl text-[#778195] hover:bg-slate-100">×</button></header>
      {(modal === "create" || modal === "edit") && <form onSubmit={submit} className="space-y-4 p-5 sm:p-6"><div className="grid gap-4 sm:grid-cols-2"><label className="text-xs font-medium text-[#475467]">Category name *<input required maxLength={120} value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value, slug: slugTouched ? prev.slug : slugify(event.target.value) }))} className={`${inputClass} mt-1.5`} placeholder="Car Accessories" /></label><label className="text-xs font-medium text-[#475467]">Slug *<input required maxLength={120} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={form.slug} onChange={(event) => { setSlugTouched(true); setForm((prev) => ({ ...prev, slug: event.target.value.toLowerCase() })); }} className={`${inputClass} mt-1.5 font-mono`} placeholder="car-accessories" /></label><label className="text-xs font-medium text-[#475467] sm:col-span-2">Description<textarea maxLength={5000} rows={3} value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} className={`${inputClass} mt-1.5 resize-y`} /></label><label className="text-xs font-medium text-[#475467]">Parent category<select value={form.parentId} onChange={(event) => setForm((prev) => ({ ...prev, parentId: event.target.value }))} className={`${inputClass} mt-1.5`}><option value="">None (parent category)</option>{roots.filter((root) => root.id !== selected?.id).map((root) => <option key={root.id} value={root.id}>{root.name}</option>)}</select></label><label className="text-xs font-medium text-[#475467]">Sort order<input type="number" min="0" step="1" value={form.sortOrder} onChange={(event) => setForm((prev) => ({ ...prev, sortOrder: event.target.value }))} className={`${inputClass} mt-1.5`} /></label><div className="sm:col-span-2"><label className="block text-xs font-medium text-[#475467]">Category image <span className="font-normal text-[#98a2b3]">(optional, JPG/PNG/WebP, max 5 MB)</span><input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploadingImage} onChange={(event) => { void uploadImage(event.target.files?.[0]); event.currentTarget.value = ""; }} className={`${inputClass} mt-1.5 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-blue-700`} /></label>{uploadingImage && <p className="mt-2 text-xs text-blue-700">Uploading image…</p>}{form.image && <div className="mt-2 flex items-center gap-3"><img src={imagePreview} alt="Category preview" className="h-14 w-14 rounded-lg border border-[#e7eaf0] object-cover" /><button type="button" onClick={() => { setForm((prev) => ({ ...prev, image: "" })); setImagePreview(""); }} className="text-xs text-rose-700 hover:underline">Remove image</button></div>}</div>{modal === "edit" && <label className="flex items-center gap-2 text-xs font-medium text-[#475467] sm:col-span-2"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))} className="h-4 w-4 accent-blue-600" /> Active category</label>}</div>{formError && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{formError}</p>}<footer className="flex justify-end gap-2 border-t border-[#edf0f4] pt-4"><button type="button" disabled={saving || uploadingImage} onClick={() => setModal(null)} className="rounded-lg border border-[#dce2eb] px-4 py-2 text-sm text-[#475467]">Cancel</button><button disabled={saving || uploadingImage} className="rounded-lg bg-[#2864f0] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Saving…" : modal === "edit" ? "Save changes" : "Create category"}</button></footer></form>}
      {modal === "view" && selected && <div className="space-y-4 p-5 sm:p-6">{(selected.imageUrl ?? selected.image) && <img src={(selected.imageUrl ?? selected.image)!} alt={selected.name} className="h-36 w-full rounded-xl object-cover" />}<dl className="grid gap-3 sm:grid-cols-2">{[["Name", selected.name], ["Slug", selected.slug], ["Parent category", selected.parent?.name ?? "—"], ["Status", selected.isActive ? "Active" : "Inactive"], ["Products", String(selected._count.products)], ["Subcategories", String(selected._count.children)], ["Sort order", String(selected.sortOrder)], ["Created", new Date(selected.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })]].map(([key, value]) => <div key={key} className="rounded-lg bg-[#f8f9fb] p-3"><dt className="text-[10px] uppercase tracking-wide text-[#8993a5]">{key}</dt><dd className="mt-1 break-words text-sm font-medium text-[#344054]">{value}</dd></div>)}</dl>{selected.description && <p className="rounded-lg bg-[#f8f9fb] p-3 text-sm text-[#475467]">{selected.description}</p>}<div className="flex justify-end"><button onClick={() => setModal(null)} className="rounded-lg border border-[#dce2eb] px-4 py-2 text-sm">Close</button></div></div>}
      {modal === "delete" && selected && <div className="space-y-4 p-5 sm:p-6"><p className="text-sm text-[#475467]">Delete <strong>{selected.name}</strong>? This is only allowed when the category has no products or subcategories. Existing product assignments will never be removed.</p>{(selected._count.products > 0 || selected._count.children > 0) && <p role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{selected._count.products > 0 ? `${selected._count.products} product(s) are assigned. ` : ""}{selected._count.children > 0 ? `${selected._count.children} subcategory(ies) must be moved first.` : "Reassign products before deleting this category."}</p>}{formError && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{formError}</p>}<footer className="flex justify-end gap-2 border-t border-[#edf0f4] pt-4"><button disabled={saving} onClick={() => setModal(null)} className="rounded-lg border border-[#dce2eb] px-4 py-2 text-sm">Cancel</button><button disabled={saving || selected._count.products > 0 || selected._count.children > 0} onClick={() => void remove()} className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Deleting…" : "Delete category"}</button></footer></div>}
    </section></div>}
  </main>;
}

function Action({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return <button title={label} aria-label={label} onClick={onClick} className="inline-flex h-8 min-w-8 items-center justify-center gap-1 rounded-md px-2 text-[#667085] hover:bg-blue-50 hover:text-blue-700">{children}</button>;
}
