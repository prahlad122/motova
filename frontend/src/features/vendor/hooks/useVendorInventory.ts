"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  createVendorProduct,
  getVendorProducts,
} from "../inventory/inventory.api";

import {
  INITIAL_PRODUCT_FORM,
  STATUS_TABS,
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

function productStatus(product: Product): ProductTab | string {
  if (product.stockQuantity === 0 && product.status === "ACTIVE") {
    return "OUT_OF_STOCK";
  }

  if (product.status === "ARCHIVED" || product.status === "INACTIVE") {
    return "HIDDEN";
  }

  if (product.listingStatus === "REJECTED") return "REJECTED";
  if (product.listingStatus === "PENDING") return "PENDING";

  return product.status;
}

export function useVendorInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<ProductTab>("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [brandFilter, setBrandFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState<ProductSort>("NEWEST");

  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState<ProductFormState>({
    ...INITIAL_PRODUCT_FORM,
  });

  const loadProducts = useCallback(async () => {
    const data = await getVendorProducts();
    setProducts(data);
  }, []);

  const refreshProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load products.");
    } finally {
      setLoading(false);
    }
  }, [loadProducts]);

  useEffect(() => {
    void refreshProducts();
  }, [refreshProducts]);

  const counts = useMemo<InventoryCounts>(() => {
    const result: InventoryCounts = {
      ALL: products.length,
      ACTIVE: 0,
      PENDING: 0,
      REJECTED: 0,
      OUT_OF_STOCK: 0,
      HIDDEN: 0,
    };

    for (const tab of STATUS_TABS.slice(1)) {
      result[tab.value] = products.filter(
        (product) => productStatus(product) === tab.value,
      ).length;
    }

    return result;
  }, [products]);

  const categories = useMemo<Category[]>(() => {
    const categoryMap = new Map<string, Category>();

    for (const product of products) {
      categoryMap.set(product.category.id, product.category);
    }

    return [...categoryMap.values()];
  }, [products]);

  const brands = useMemo<Brand[]>(() => {
    const brandMap = new Map<string, Brand>();

    for (const product of products) {
      if (product.brand) {
        brandMap.set(product.brand.id, product.brand);
      }
    }

    return [...brandMap.values()];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        product.name.toLowerCase().includes(searchValue) ||
        product.sku.toLowerCase().includes(searchValue);

      const matchesStatus =
        activeTab === "ALL" || productStatus(product) === activeTab;

      const matchesCategory =
        categoryFilter === "ALL" || product.category.id === categoryFilter;

      const matchesBrand =
        brandFilter === "ALL" || product.brand?.id === brandFilter;

      return matchesSearch && matchesStatus && matchesCategory && matchesBrand;
    });

    return filtered.sort((a, b) => {
      if (sortBy === "PRICE_LOW") return a.price - b.price;
      if (sortBy === "PRICE_HIGH") return b.price - a.price;
      if (sortBy === "STOCK_LOW") {
        return a.stockQuantity - b.stockQuantity;
      }

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [products, search, activeTab, categoryFilter, brandFilter, sortBy]);

  function updateForm(field: keyof ProductFormState, value: string) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function openAddForm() {
    setFormError("");
    setShowAddForm(true);
  }

  function closeAddForm() {
    if (saving) return;

    setShowAddForm(false);
    setFormError("");
  }

  function resetForm() {
    setForm({ ...INITIAL_PRODUCT_FORM });
  }

  async function handleCreateProduct(event: React.FormEvent<HTMLFormElement>) {
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

      await createVendorProduct({
        name: form.name.trim(),
        categoryId: form.categoryId,
        brandId: form.brandId || undefined,
        sku: form.sku.trim(),
        description: form.description.trim() || undefined,
        price,
        compareAtPrice,
        stockQuantity,
      });

      setShowAddForm(false);
      resetForm();
      setNotice("Product created and submitted for review.");
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
    rejectedCount,
    showAddForm,
    saving,
    formError,
    form,
    updateForm,
    openAddForm,
    closeAddForm,
    handleCreateProduct,
    refreshProducts,
  };
}
