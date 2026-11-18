"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  createVendorProduct,
  getVendorProductPage,
  getVendorBrands,
  getVendorCategories,
  updateVendorProduct,
  uploadVendorProductImages,
} from "../inventory/inventory.api";

import {
  INITIAL_PRODUCT_FORM,
} from "../inventory/inventory.types";

import type {
  Brand,
  Category,
  InventoryCounts,
  Product,
  ProductFormState,
  ProductSort,
  ProductTab,
} from "../inventory/inventory.types";

export function useVendorInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [counts, setCounts] = useState<InventoryCounts>({ ALL: 0, ACTIVE: 0, PENDING: 0, REJECTED: 0, OUT_OF_STOCK: 0, HIDDEN: 0 });
  const [page, setPage] = useState(1);
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<ProductTab>("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [brandFilter, setBrandFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState<ProductSort>("NEWEST");

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState<ProductFormState>({
    ...INITIAL_PRODUCT_FORM,
  });

  const loadProducts = useCallback(async () => {
    const listingStatus = activeTab === "PENDING" || activeTab === "REJECTED" ? activeTab : undefined;
    const status = activeTab === "ACTIVE" ? "ACTIVE" : activeTab === "HIDDEN" ? "INACTIVE" : undefined;
    const stockStatus = activeTab === "OUT_OF_STOCK" ? "OUT_OF_STOCK" : undefined;
    const serverSortBy = sortBy === "PRICE_LOW" || sortBy === "PRICE_HIGH" ? "price" : sortBy === "STOCK_LOW" ? "stockQuantity" : "createdAt";
    const serverSortOrder = sortBy === "PRICE_LOW" || sortBy === "STOCK_LOW" ? "asc" : "desc";
    const data = await getVendorProductPage({ page, limit: 10, search: search.trim() || undefined, categoryId: categoryFilter === "ALL" ? undefined : categoryFilter, brandId: brandFilter === "ALL" ? undefined : brandFilter, listingStatus, status, stockStatus, sortBy: serverSortBy, sortOrder: serverSortOrder });
    setProducts(data.products);
    setTotalProducts(data.pagination.totalProducts);
    setTotalPages(Math.max(1, data.pagination.totalPages));
    setCounts(data.counts);
  }, [activeTab, brandFilter, categoryFilter, page, search, sortBy]);

  const refreshProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      await Promise.all([loadProducts(), getVendorCategories().then(setAvailableCategories), getVendorBrands().then(setBrands)]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load products.");
    } finally {
      setLoading(false);
    }
  }, [loadProducts]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void refreshProducts(); }, 0);
    return () => window.clearTimeout(timer);
  }, [refreshProducts]);

  const categories = availableCategories;

  const filteredProducts = useMemo(() => products, [products]);

  const applyProductStatusUpdate = useCallback((productId: string, status: "DRAFT" | "ACTIVE" | "INACTIVE") => {
    setProducts((current) => current.map((product) => product.id === productId ? { ...product, status } : product));
    setCounts((current) => {
      const next = { ...current };
      if (status === "ACTIVE") {
        next.ACTIVE += 1;
        next.HIDDEN = Math.max(0, next.HIDDEN - 1);
        const product = products.find((item) => item.id === productId);
        if (product?.stockQuantity === 0) next.OUT_OF_STOCK += 1;
      } else if (status === "INACTIVE" || status === "DRAFT") {
        next.ACTIVE = Math.max(0, next.ACTIVE - 1);
        next.HIDDEN += 1;
        const product = products.find((item) => item.id === productId);
        if (product?.stockQuantity === 0 && product.status === "ACTIVE") next.OUT_OF_STOCK = Math.max(0, next.OUT_OF_STOCK - 1);
      }
      return next;
    });
    const leavesCurrentFilter = (activeTab === "ACTIVE" && status !== "ACTIVE") || (activeTab === "HIDDEN" && status !== "INACTIVE");
    if (leavesCurrentFilter) {
      setProducts((current) => current.filter((product) => product.id !== productId));
      setTotalProducts((current) => Math.max(0, current - 1));
    }
  }, [activeTab, products]);

  function updateForm(field: keyof ProductFormState, value: string) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function changeSearch(value: string) { setPage(1); setSearch(value); }
  function changeActiveTab(value: ProductTab) { setPage(1); setActiveTab(value); }
  function changeCategoryFilter(value: string) { setPage(1); setCategoryFilter(value); }
  function changeBrandFilter(value: string) { setPage(1); setBrandFilter(value); }

  function openAddForm() {
    setFormError("");
    setEditingProduct(null);
    setForm({ ...INITIAL_PRODUCT_FORM });
    setShowAddForm(true);
  }

  function openEditForm(product: Product) {
    setFormError(""); setEditingProduct(product); setForm({ name: product.name, categoryId: product.category.id, brandId: product.brand?.id ?? "", sku: product.sku, description: product.description ?? "", price: String(product.price), compareAtPrice: product.compareAtPrice === null ? "" : String(product.compareAtPrice), stockQuantity: String(product.stockQuantity) }); setShowAddForm(true);
  }

  function closeAddForm() {
    if (saving) return;

    setShowAddForm(false);
    setFormError("");
  }

  function resetForm() {
    setForm({ ...INITIAL_PRODUCT_FORM });
  }

  async function handleCreateProduct(event: React.FormEvent<HTMLFormElement>, imageFiles: File[] = [], clearExistingImages = false) {
    event.preventDefault();
    setFormError("");
    setSaving(true);

    try {
      if (!form.categoryId) {
        throw new Error("Please select a product category.");
      }

      const price = Number(form.price);
      const compareAtPrice = form.compareAtPrice
        ? Number(form.compareAtPrice)
        : undefined;

      const stockQuantity = Number(form.stockQuantity);

      if (!Number.isFinite(price) || price <= 0) {
        throw new Error("Please enter a valid product price.");
      }

      if (
        compareAtPrice !== undefined &&
        (!Number.isFinite(compareAtPrice) || compareAtPrice <= 0)
      ) {
        throw new Error("Please enter a valid compare-at price.");
      }

      if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
        throw new Error("Stock quantity must be a non-negative integer.");
      }

      const images = imageFiles.length ? await uploadVendorProductImages(imageFiles) : clearExistingImages ? [] : undefined;
      const input = {
        name: form.name.trim(),
        categoryId: form.categoryId,
        brandId: form.brandId || undefined,
        sku: form.sku.trim(),
        description: form.description.trim() || undefined,
        price,
        compareAtPrice,
        stockQuantity,
        status: editingProduct ? editingProduct.status as "DRAFT" | "ACTIVE" | "INACTIVE" : "ACTIVE" as const,
        ...(images ? { images } : {}),
      };
      if (editingProduct) await updateVendorProduct(editingProduct.id, input);
      else await createVendorProduct(input);

      setShowAddForm(false);
      resetForm();
      setNotice(editingProduct?.listingStatus === "APPROVED" ? "Changes submitted for admin reapproval. The approved listing remains unchanged until review." : editingProduct ? "Product updated and submitted for review." : "Product created and submitted for review.");
      setEditingProduct(null);
      setActiveTab("ALL");

      await loadProducts();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setSaving(false);
    }
  }

  const rejectedCount = counts.REJECTED;

  return {
    products,
    categories,
    brands,
    loading,
    error,
    notice,
    setNotice,
    search,
    setSearch: changeSearch,
    activeTab,
    setActiveTab: changeActiveTab,
    categoryFilter,
    setCategoryFilter: changeCategoryFilter,
    brandFilter,
    setBrandFilter: changeBrandFilter,
    sortBy,
    setSortBy,
    counts,
    page,
    totalPages,
    totalProducts,
    setPage,
    filteredProducts,
    applyProductStatusUpdate,
    rejectedCount,
    showAddForm,
    saving,
    formError,
    editingProduct,
    form,
    updateForm,
    openAddForm,
    openEditForm,
    closeAddForm,
    handleCreateProduct,
    refreshProducts,
  };
}
