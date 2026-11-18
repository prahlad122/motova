
"use client";

import { useVendorInventory } from "@/features/vendor/hooks/useVendorInventory";

import InventoryHeader from "./InventoryHeader";
import InventoryTabs from "./InventoryTabs";
import InventoryFilters from "./InventoryFilters";
import ProductTable from "./ProductTable";
import AddProductModal from "./AddProductModal";
import { useState } from "react";
import { archiveVendorProduct, getVendorProduct, setVendorProductStatus } from "../../inventory/inventory.api";
import { getAuthSession } from "@/features/auth/auth.utils";
import type { Product } from "../../inventory/inventory.types";

export default function VendorInventory() {
  const {
    categories,
    brands,
    loading,
    error,
    notice,
    setNotice,
    search,
    setSearch,
    activeTab,
    setActiveTab,
    categoryFilter,
    setCategoryFilter,
    brandFilter,
    setBrandFilter,
    sortBy,
    setSortBy,
    counts,
    page,
    totalPages,
    totalProducts,
    setPage,
    filteredProducts,
    applyProductStatusUpdate,
    showAddForm,
    saving,
    formError,
    form,
    updateForm,
    openAddForm,
    openEditForm,
    editingProduct,
    closeAddForm,
    handleCreateProduct,
    refreshProducts,
  } = useVendorInventory();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  async function archive(product: Product) {
    if (!window.confirm(`Archive “${product.name}”?`)) return;
    try { const token = getAuthSession("VENDOR")?.token; if (!token) throw new Error("Your session has expired. Please log in again."); await archiveVendorProduct(product.id); setNotice("Product archived."); await refreshProducts(); }
    catch (cause) { setNotice(cause instanceof Error ? cause.message : "Unable to archive product."); }
  }
  async function togglePublication(product: Product) {
    const status = product.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    if (!window.confirm(`${status === "ACTIVE" ? "Activate" : "Deactivate"} “${product.name}”?`)) return;
    try { await setVendorProductStatus(product.id, status); applyProductStatusUpdate(product.id, status); setNotice(`Product ${status.toLowerCase()}.`); setSelectedProduct(null); }
    catch (cause) { setNotice(cause instanceof Error ? cause.message : "Unable to change product status."); }
  }
  async function viewProduct(product: Product) {
    setSelectedProduct(product);
    try { setSelectedProduct(await getVendorProduct(product.id)); }
    catch (cause) { setNotice(cause instanceof Error ? cause.message : "Unable to load product details."); }
  }

  return (
    <main className="min-h-full bg-[#f5f6f8] p-4 sm:p-6 lg:p-7">
      <InventoryHeader
        onAddProduct={openAddForm}
        onImportCSV={() =>
          setNotice("CSV import is not implemented yet.")
        }
      />

      {notice && (
        <div className="mt-5 flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
          {notice}

          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Dismiss notice"
          >
            ✕
          </button>
        </div>
      )}

      <InventoryTabs
        activeTab={activeTab}
        counts={counts}
        onTabChange={setActiveTab}
      />

      <InventoryFilters
        search={search}
        onSearchChange={setSearch}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        brandFilter={brandFilter}
        onBrandChange={setBrandFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        categories={categories}
        brands={brands}
      />

      {counts.REJECTED > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <span>
            <strong>{counts.REJECTED} rejected</strong> — open a rejected
            product to review the feedback and make corrections.
          </span>

          <button
            type="button"
            onClick={() => setActiveTab("REJECTED")}
            className="rounded-md border border-red-300 px-3 py-2 font-medium"
          >
            Show rejected
          </button>
        </div>
      )}

      <ProductTable
        products={filteredProducts}
        totalProducts={totalProducts}
        loading={loading}
        error={error}
        onAddProduct={openAddForm}
        onRetry={() => void refreshProducts()}
        onView={(product) => void viewProduct(product)}
        onEdit={openEditForm}
        onArchive={(product) => void archive(product)}
        onToggle={(product) => void togglePublication(product)}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <AddProductModal
        key={editingProduct?.id ?? "create"}
        open={showAddForm}
        title={editingProduct ? "Edit product" : "Add product"}
        existingImages={editingProduct?.images ?? []}
        saving={saving}
        formError={formError}
        form={form}
        categories={categories}
        brands={brands}
        onChange={updateForm}
        onClose={closeAddForm}
        onSubmit={handleCreateProduct}
      />
      {selectedProduct && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedProduct(null); }}><section role="dialog" aria-modal="true" aria-label="Product details" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl"><div className="flex justify-between"><h2 className="text-lg font-semibold">{selectedProduct.name}</h2><button onClick={() => setSelectedProduct(null)} aria-label="Close">×</button></div><dl className="mt-4 grid grid-cols-2 gap-3 text-sm"><Detail label="SKU" value={selectedProduct.sku}/><Detail label="Category" value={selectedProduct.category.name}/><Detail label="Price" value={`₹${selectedProduct.price}`}/><Detail label="Compare at" value={selectedProduct.compareAtPrice === null ? "—" : `₹${selectedProduct.compareAtPrice}`}/><Detail label="Stock" value={String(selectedProduct.stockQuantity)}/><Detail label="Publication" value={selectedProduct.status}/><Detail label="Approval" value={selectedProduct.listingStatus}/></dl>{selectedProduct.listingNote && <p className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-800">Admin feedback: {selectedProduct.listingNote}</p>}{selectedProduct.images.length > 0 && <div className="mt-4 flex gap-2">{selectedProduct.images.map((image) => <img key={image.id} src={image.imageUrl} alt={image.altText ?? selectedProduct.name} className="h-20 w-20 rounded-lg border object-cover"/>)}</div>}<h3 className="mt-5 text-sm font-semibold">Revision history</h3>{selectedProduct.revisions?.length ? selectedProduct.revisions.map((revision) => <div key={revision.id} className="mt-2 rounded-lg border p-3 text-sm"><div className="flex justify-between"><strong>{revision.status}</strong><span className="text-xs text-gray-500">{new Date(revision.submittedAt).toLocaleDateString("en-IN")}</span></div><p className="mt-1">{revision.name} · ₹{revision.price} · stock {revision.stockQuantity}</p>{revision.rejectionReason && <p className="mt-2 text-rose-700">{revision.rejectionReason}</p>}</div>) : <p className="mt-2 text-sm text-gray-500">No revisions have been submitted.</p>}<div className="mt-5 flex justify-end"><button onClick={() => setSelectedProduct(null)} className="rounded-lg border px-4 py-2 text-sm">Close</button></div></section></div>}
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) { return <div className="rounded-lg bg-gray-50 p-3"><dt className="text-[10px] uppercase text-gray-500">{label}</dt><dd className="mt-1 font-medium text-gray-800">{value}</dd></div>; }
