
"use client";

import { useVendorInventory } from "@/features/vendor/hooks/useVendorInventory";

import InventoryHeader from "./InventoryHeader";
import InventoryTabs from "./InventoryTabs";
import InventoryFilters from "./InventoryFilters";
import ProductTable from "./ProductTable";
import AddProductModal from "./AddProductModal";

export default function VendorInventory() {
  const {
    products,
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
    filteredProducts,
    showAddForm,
    saving,
    formError,
    form,
    updateForm,
    openAddForm,
    closeAddForm,
    handleCreateProduct,
    refreshProducts,
  } = useVendorInventory();

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
        totalProducts={products.length}
        loading={loading}
        error={error}
        onAddProduct={openAddForm}
        onRetry={() => void refreshProducts()}
      />

      <AddProductModal
        open={showAddForm}
        saving={saving}
        formError={formError}
        form={form}
        categories={categories}
        brands={brands}
        onChange={updateForm}
        onClose={closeAddForm}
        onSubmit={handleCreateProduct}
      />
    </main>
  );
}
