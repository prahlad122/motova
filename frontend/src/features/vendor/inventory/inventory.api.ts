
import { parseApiResponse } from "@/lib/api-response";
import { getAuthSession } from "@/features/auth/auth.utils";

import type {
  Product,
  CreateProductInput,
  Category,
  Brand,
  InventoryCounts,
} from "./inventory.types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

function getAuthHeaders() {
 const session = getAuthSession("VENDOR");

  if (!session?.token) {
    throw new Error("Your session has expired. Please log in again.");
  }

  return {
    Authorization: `Bearer ${session.token}`,
  };
}

export async function getVendorProducts(): Promise<Product[]> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}/vendor/products`, {
      method: "GET",
      headers: getAuthHeaders(),
      cache: "no-store",
    });
  } catch (error) {
    throw new Error("Unable to connect to the server.", {
      cause: error,
    });
  }

  return parseApiResponse<Product[]>(response);
}

export interface VendorProductPage { products: Product[]; counts: InventoryCounts; pagination: { currentPage: number; pageSize: number; totalProducts: number; totalPages: number; hasNextPage: boolean; hasPreviousPage: boolean } }
export async function getVendorProductPage(params: { page: number; limit: number; search?: string; categoryId?: string; brandId?: string; status?: string; listingStatus?: string; stockStatus?: string; sortBy?: string; sortOrder?: string }): Promise<VendorProductPage> {
  const query = new URLSearchParams({ page: String(params.page), limit: String(params.limit) });
  for (const [key, value] of Object.entries(params)) if (key !== "page" && key !== "limit" && value) query.set(key, String(value));
  const response = await fetch(`${API_URL}/vendor/products?${query}`, { headers: getAuthHeaders(), cache: "no-store" });
  const envelope = await response.clone().json() as { pagination?: VendorProductPage["pagination"]; counts?: InventoryCounts };
  const products = await parseApiResponse<Product[]>(response);
  if (!envelope.pagination || !envelope.counts) throw new Error("The server returned invalid product pagination.");
  return { products, pagination: envelope.pagination, counts: envelope.counts };
}

export async function getVendorCategories(): Promise<Category[]> {
  const response = await fetch(`${API_URL}/vendor/categories`, { headers: getAuthHeaders(), cache: "no-store" });
  return parseApiResponse<Category[]>(response);
}
export async function getVendorBrands(): Promise<Brand[]> {
  const response = await fetch(`${API_URL}/vendor/brands`, { headers: getAuthHeaders(), cache: "no-store" });
  return parseApiResponse<Brand[]>(response);
}

export async function createVendorProduct(
  input: CreateProductInput,
): Promise<Product> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}/vendor/products`, {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });
  } catch (error) {
    throw new Error("Unable to connect to the server.", {
      cause: error,
    });
  }

  return parseApiResponse<Product>(response);
}

export async function uploadVendorProductImages(files: File[]): Promise<import("./inventory.types").ProductImageInput[]> {
  const form = new FormData();
  for (const file of files) form.append("images", file);
  const response = await fetch(`${API_URL}/vendor/products/images`, { method: "POST", headers: getAuthHeaders(), body: form, cache: "no-store" });
  return parseApiResponse<import("./inventory.types").ProductImageInput[]>(response);
}

export async function updateVendorProduct(productId: string, input: CreateProductInput): Promise<Product> {
  const response = await fetch(`${API_URL}/vendor/products/${productId}`, { method: "PATCH", headers: { ...getAuthHeaders(), "Content-Type": "application/json" }, body: JSON.stringify(input), cache: "no-store" });
  return parseApiResponse<Product>(response);
}
export async function getVendorProduct(productId: string): Promise<Product> {
  const response = await fetch(`${API_URL}/vendor/products/${productId}`, { headers: getAuthHeaders(), cache: "no-store" });
  return parseApiResponse<Product>(response);
}
export async function getVendorProductRevisions(productId: string) {
  const response = await fetch(`${API_URL}/vendor/products/${productId}/revisions`, { headers: getAuthHeaders(), cache: "no-store" });
  return parseApiResponse<import("./inventory.types").ProductRevision[]>(response);
}
export async function archiveVendorProduct(productId: string) {
  const response = await fetch(`${API_URL}/vendor/products/${productId}`, { method: "DELETE", headers: getAuthHeaders(), cache: "no-store" });
  return parseApiResponse<{ id: string; status: string }>(response);
}
export async function setVendorProductStatus(productId: string, status: "DRAFT" | "ACTIVE" | "INACTIVE") {
  const response = await fetch(`${API_URL}/vendor/products/${productId}/status`, { method: "PATCH", headers: { ...getAuthHeaders(), "Content-Type": "application/json" }, body: JSON.stringify({ status }), cache: "no-store" });
  return parseApiResponse<Product>(response);
}
