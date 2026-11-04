"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, RefreshCw, Search, Tags, X } from "lucide-react";
import { getAuthSession } from "@/features/auth/auth.utils";
import { createAdminBrand, fetchAdminBrands } from "@/features/admin/admin.api";
import type { AdminBrand, AdminBrandsResponse } from "@/features/admin/admin.types";

const pageSize = 20;

export default function BrandsItemsPage() {
  const [brands, setBrands] = useState<AdminBrand[]>([]);
  const [pagination, setPagination] = useState<AdminBrandsResponse["pagination"]>({
    currentPage: 1, pageSize, totalBrands: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false,
  });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({ name: "", slug: "", description: "", logoUrl: "" });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const load = useCallback(async () => {
    const token = getAuthSession("ADMIN")?.token;
    if (!token) {
      setError("Your admin session has expired. Please sign in again.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await fetchAdminBrands(token, { page, limit: pageSize, search: debouncedSearch });
      setBrands(result.brands);
      setPagination(result.pagination);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load brands.");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const submitBrand = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    const token = getAuthSession("ADMIN")?.token;
    if (!token) {
      setFormError("Your admin session has expired. Please sign in again.");
      return;
    }
    const name = form.name.trim();
    const slug = form.slug.trim().toLowerCase();
    if (!name) { setFormError("Brand name is required."); return; }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      setFormError("Use lowercase letters, numbers, and hyphens for the slug.");
      return;
    }
    try {
      setSaving(true);
      await createAdminBrand(token, {
        name, slug,
        description: form.description.trim() || null,
        logoUrl: form.logoUrl.trim() || null,
      });
      setCreateOpen(false);
      setForm({ name: "", slug: "", description: "", logoUrl: "" });
      setNotice("Brand added successfully.");
      setPage(1);
      await load();
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : "Unable to create this brand.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-full w-full bg-[#f8f9fb] p-5 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[24px] font-semibold tracking-[-0.5px] text-[#25282d] sm:text-[28px]">Brands &amp; Items</h1>
            <p className="mt-1 text-sm text-[#717680]">Browse marketplace brands and their listed products.</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => { setCreateOpen(true); setFormError(""); }} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#20242b] px-3 text-sm font-medium text-white hover:bg-[#343a44]"><Plus size={16} /> Add Brand</button>
            <button type="button" onClick={() => void load()} disabled={loading} className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#e4e7ec] bg-white px-3 text-sm font-medium text-[#344054] hover:bg-[#f9fafb] disabled:opacity-60"><RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh</button>
          </div>
        </div>

        {notice && <div role="status" className="mt-4 flex items-center justify-between rounded-lg border border-[#abefc6] bg-[#ecfdf3] px-4 py-3 text-sm text-[#027a48]">{notice}<button type="button" onClick={() => setNotice("")} aria-label="Dismiss notice"><X size={16} /></button></div>}

        <section className="mt-6 overflow-hidden rounded-xl border border-[#eaecf0] bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eaecf0] px-5 py-4">
            <div>
              <h2 className="font-semibold text-[#25282d]">All Brands</h2>
              <p className="mt-0.5 text-sm text-[#717680]">{pagination.totalBrands} {pagination.totalBrands === 1 ? "brand" : "brands"}</p>
            </div>
            <label className="relative block w-full sm:w-72">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#98a2b3]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search brands"
                className="h-10 w-full rounded-lg border border-[#d0d5dd] bg-white pl-9 pr-3 text-sm text-[#25282d] outline-none placeholder:text-[#98a2b3] focus:border-[#64748b]"
              />
            </label>
          </div>

          {error ? (
            <div className="px-5 py-12 text-center">
              <p className="text-sm text-[#b42318]">{error}</p>
              <button type="button" onClick={() => void load()} className="mt-3 text-sm font-medium text-[#344054] underline">Try again</button>
            </div>
          ) : loading ? (
            <div className="space-y-3 p-5" aria-label="Loading brands">
              {[0, 1, 2, 3].map((item) => <div key={item} className="h-14 animate-pulse rounded-lg bg-[#f2f4f7]" />)}
            </div>
          ) : brands.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <Tags size={26} className="mx-auto text-[#98a2b3]" />
              <p className="mt-3 font-medium text-[#344054]">{debouncedSearch ? "No brands match your search" : "No brands found"}</p>
              <p className="mt-1 text-sm text-[#717680]">{debouncedSearch ? "Try a different brand name." : "Brands will appear here when they are added to the marketplace."}</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead className="bg-[#f9fafb] text-xs font-medium uppercase tracking-wide text-[#667085]">
                    <tr>
                      <th className="px-5 py-3">Brand</th>
                      <th className="px-5 py-3">Slug</th>
                      <th className="px-5 py-3">Products</th>
                      <th className="px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eaecf0]">
                    {brands.map((brand) => (
                      <tr key={brand.id} className="hover:bg-[#fcfcfd]">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {brand.logoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={brand.logoUrl} alt="" className="h-9 w-9 rounded-lg border border-[#eaecf0] object-contain" />
                            ) : (
                              <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#f2f4f7] text-xs font-semibold uppercase text-[#475467]">{brand.name.slice(0, 2)}</span>
                            )}
                            <div>
                              <p className="font-medium text-[#25282d]">{brand.name}</p>
                              {brand.description && <p className="mt-0.5 max-w-md truncate text-xs text-[#717680]">{brand.description}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-[#667085]">{brand.slug}</td>
                        <td className="px-5 py-4 text-[#344054]">{brand._count.products}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${brand.isActive ? "bg-[#ecfdf3] text-[#027a48]" : "bg-[#f2f4f7] text-[#475467]"}`}>
                            {brand.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between border-t border-[#eaecf0] px-5 py-3 text-sm text-[#667085]">
                <span>Page {pagination.currentPage} of {Math.max(1, pagination.totalPages)}</span>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={!pagination.hasPreviousPage || loading} aria-label="Previous page" className="grid h-9 w-9 place-items-center rounded-lg border border-[#d0d5dd] disabled:opacity-40"><ChevronLeft size={17} /></button>
                  <button type="button" onClick={() => setPage((value) => value + 1)} disabled={!pagination.hasNextPage || loading} aria-label="Next page" className="grid h-9 w-9 place-items-center rounded-lg border border-[#d0d5dd] disabled:opacity-40"><ChevronRight size={17} /></button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>

      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setCreateOpen(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="create-brand-title" className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div><h2 id="create-brand-title" className="text-lg font-semibold text-[#25282d]">Add brand</h2><p className="mt-1 text-sm text-[#667085]">Create a brand vendors can use on product listings.</p></div>
              <button type="button" onClick={() => setCreateOpen(false)} disabled={saving} aria-label="Close" className="text-[#667085]"><X size={20} /></button>
            </div>
            <form onSubmit={submitBrand} className="mt-5 space-y-4">
              <label className="block text-sm font-medium text-[#344054]">Brand name
                <input required maxLength={120} value={form.name} onChange={(event) => { const name = event.target.value; setForm((old) => ({ ...old, name, slug: name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") })); }} className="mt-1.5 h-10 w-full rounded-lg border border-[#d0d5dd] px-3 font-normal outline-none focus:border-[#64748b]" placeholder="e.g. Motova Parts" />
              </label>
              <label className="block text-sm font-medium text-[#344054]">Slug
                <input required maxLength={120} value={form.slug} onChange={(event) => setForm((old) => ({ ...old, slug: event.target.value }))} className="mt-1.5 h-10 w-full rounded-lg border border-[#d0d5dd] px-3 font-normal outline-none focus:border-[#64748b]" placeholder="motova-parts" />
              </label>
              <label className="block text-sm font-medium text-[#344054]">Description <span className="font-normal text-[#98a2b3]">(optional)</span>
                <textarea maxLength={5000} value={form.description} onChange={(event) => setForm((old) => ({ ...old, description: event.target.value }))} rows={3} className="mt-1.5 w-full rounded-lg border border-[#d0d5dd] px-3 py-2 font-normal outline-none focus:border-[#64748b]" />
              </label>
              <label className="block text-sm font-medium text-[#344054]">Logo URL <span className="font-normal text-[#98a2b3]">(optional)</span>
                <input type="url" value={form.logoUrl} onChange={(event) => setForm((old) => ({ ...old, logoUrl: event.target.value }))} className="mt-1.5 h-10 w-full rounded-lg border border-[#d0d5dd] px-3 font-normal outline-none focus:border-[#64748b]" placeholder="https://example.com/logo.png" />
              </label>
              {formError && <p role="alert" className="text-sm text-[#b42318]">{formError}</p>}
              <div className="flex justify-end gap-2 border-t border-[#eaecf0] pt-4">
                <button type="button" onClick={() => setCreateOpen(false)} disabled={saving} className="h-10 rounded-lg border border-[#d0d5dd] px-4 text-sm font-medium text-[#344054]">Cancel</button>
                <button type="submit" disabled={saving} className="h-10 rounded-lg bg-[#20242b] px-4 text-sm font-medium text-white disabled:opacity-60">{saving ? "Adding..." : "Add brand"}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
