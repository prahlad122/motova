export interface Product {
  id: string;
  name: string;
  sku: string;
  slug: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  stockQuantity: number;
  status: string;
  listingStatus: string;
  listingNote: string | null;
  category: {
    id: string;
    name: string;
  };
  brand: {
    id: string;
    name: string;
  } | null;
  images: {
    id: string;
    imageUrl: string;
    altText: string | null;
  }[];
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Brand {
  id: string;
  name: string;
}

export interface CreateProductInput {
  name: string;
  categoryId: string;
  brandId?: string;
  sku: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  stockQuantity: number;
}

export interface ProductFormState {
  name: string;
  categoryId: string;
  brandId: string;
  sku: string;
  description: string;
  price: string;
  compareAtPrice: string;
  stockQuantity: string;
}

export type ProductTab =
  | "ALL"
  | "ACTIVE"
  | "PENDING"
  | "REJECTED"
  | "OUT_OF_STOCK"
  | "HIDDEN";

export type ProductSort = "NEWEST" | "PRICE_LOW" | "PRICE_HIGH" | "STOCK_LOW";

export interface InventoryCounts {
  ALL: number;
  ACTIVE: number;
  PENDING: number;
  REJECTED: number;
  OUT_OF_STOCK: number;
  HIDDEN: number;
}

export const INITIAL_PRODUCT_FORM: ProductFormState = {
  name: "",
  categoryId: "",
  brandId: "",
  sku: "",
  description: "",
  price: "",
  compareAtPrice: "",
  stockQuantity: "0",
};

export const STATUS_TABS: {
  label: string;
  value: ProductTab;
}[] = [
  { label: "All", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Pending approval", value: "PENDING" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Out of stock", value: "OUT_OF_STOCK" },
  { label: "Hidden", value: "HIDDEN" },
];
