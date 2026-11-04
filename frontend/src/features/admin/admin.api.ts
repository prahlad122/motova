import { parseApiResponse } from "@/lib/api-response";
import type { AdminDashboardStats } from "./admin.types";
import type {
  AdminVendor,
  AdminVendorDetails,
  AdminVendorsResponse,
  AdminVendorDocument,
  AdminCategory,
  AdminCategoryStats,
  AdminCategoriesResponse,
  AdminBrand,
  AdminBrandsResponse,
} from "./admin.types";
import type { AdminAnalyticsData } from "./admin.types";

export interface CreateAdminVendorInput {
  name: string;
  email: string;
  mobile: string;
  businessName: string;
  gstNumber?: string;
  businessAddress: string;
  shippingAddress?: string;
  storeManager?: string;
  authorizedPerson?: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

export async function getAdminDashboardStats(
  token: string,
): Promise<AdminDashboardStats> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}/admin/dashboard`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });
  } catch (error) {
    throw new Error("Unable to connect to the server. Please try again.", {
      cause: error,
    });
  }

  return parseApiResponse<AdminDashboardStats>(response);
}

async function adminRequest<T>(
  path: string,
  token: string,
  init?: RequestInit,
) {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
      cache: "no-store",
    });
  } catch (error) {
    throw new Error("Unable to connect to the server. Please try again.", {
      cause: error,
    });
  }
  return parseApiResponse<T>(response);
}

export type AdminAnalyticsSection = "overview" | "sales" | "vendors" | "products" | "customers" | "inventory";
export async function getAdminAnalytics(
  token: string,
  section: AdminAnalyticsSection,
  params: Record<string, string | number | undefined>,
) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && String(value) !== "") query.set(key, String(value));
  }
  return adminRequest<AdminAnalyticsData>(`/admin/analytics/${section}?${query.toString()}`, token);
}

export async function fetchAdminVendors(
  token: string,
  params: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    verificationStatus?: string;
  },
): Promise<AdminVendorsResponse> {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });
  if (params.search) query.set("search", params.search);
  if (params.status) query.set("status", params.status);
  if (params.verificationStatus)
    query.set("verificationStatus", params.verificationStatus);
  let response: Response;
  try {
    response = await fetch(`${API_URL}/admin/vendors?${query}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch (error) {
    throw new Error("Unable to connect to the server. Please try again.", {
      cause: error,
    });
  }
  const envelope = (await response.clone().json()) as {
    pagination?: AdminVendorsResponse["pagination"];
  };
  const vendors = await parseApiResponse<AdminVendor[]>(response);
  if (!envelope.pagination)
    throw new Error("The server returned invalid vendor pagination.");
  return { vendors, pagination: envelope.pagination };
}

export function getAdminVendor(token: string, vendorId: string) {
  return adminRequest<AdminVendorDetails>(`/admin/vendors/${vendorId}`, token);
}

export function createAdminVendor(
  token: string,
  input: CreateAdminVendorInput,
) {
  return adminRequest<{ vendor: AdminVendor; temporaryPassword: string }>(
    "/admin/vendors",
    token,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export function getAdminDocumentAccess(token: string, documentId: string) {
  return adminRequest<{ url: string; expiresIn: number }>(
    `/admin/documents/${documentId}/access`, token,
  );
}

export function reviewAdminDocument(token: string, documentId: string, input: {
  decision: "APPROVED" | "REJECTED";
  note?: string;
}) {
  return adminRequest<Pick<AdminVendorDocument, "id" | "status" | "rejectionReason">>(
    `/admin/documents/${documentId}/review`, token,
    { method: "PATCH", body: JSON.stringify(input) },
  );
}

export function updateAdminVendorStatus(
  token: string,
  vendorId: string,
  status: "ACTIVE" | "SUSPENDED",
) {
  return adminRequest<{ id: string; status: "ACTIVE" | "PENDING" | "SUSPENDED" }>(`/admin/vendors/${vendorId}/status`, token, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function fetchAdminCategories(token: string, params: { page: number; limit: number; search?: string; isActive?: string; parentId?: string; sortBy?: string; sortOrder?: string }) {
  const query = new URLSearchParams({ page: String(params.page), limit: String(params.limit), includeChildren: "true" });
  for (const key of ["search", "isActive", "parentId", "sortBy", "sortOrder"] as const) if (params[key]) query.set(key, params[key]!);
  const response = await fetch(`${API_URL}/admin/categories?${query}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  const envelope = await response.clone().json() as { pagination?: AdminCategoriesResponse["pagination"] };
  const categories = await parseApiResponse<AdminCategory[]>(response);
  if (!envelope.pagination) throw new Error("The server returned invalid category pagination.");
  return { categories, pagination: envelope.pagination };
}

export function fetchAdminCategoryStats(token: string) { return adminRequest<AdminCategoryStats>("/admin/categories/stats", token); }
export async function fetchAdminBrands(token: string, params: { page: number; limit: number; search?: string }) {
  const query = new URLSearchParams({ page: String(params.page), limit: String(params.limit), sortBy: "name", sortOrder: "asc" });
  if (params.search) query.set("search", params.search);
  const response = await fetch(`${API_URL}/admin/brands?${query}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  const envelope = await response.clone().json() as { pagination?: AdminBrandsResponse["pagination"] };
  const brands = await parseApiResponse<AdminBrand[]>(response);
  if (!envelope.pagination) throw new Error("The server returned invalid brand pagination.");
  return { brands, pagination: envelope.pagination };
}
export function createAdminBrand(token: string, input: { name: string; slug: string; description?: string | null; logoUrl?: string | null }) {
  return adminRequest<AdminBrand>("/admin/brands", token, { method: "POST", body: JSON.stringify(input) });
}
export function getAdminCategory(token: string, id: string) { return adminRequest<AdminCategory>(`/admin/categories/${id}`, token); }
export function createAdminCategory(token: string, input: Record<string, unknown>) { return adminRequest<AdminCategory>("/admin/categories", token, { method: "POST", body: JSON.stringify(input) }); }
export function updateAdminCategory(token: string, id: string, input: Record<string, unknown>) { return adminRequest<AdminCategory>(`/admin/categories/${id}`, token, { method: "PATCH", body: JSON.stringify(input) }); }
export function setAdminCategoryStatus(token: string, id: string, isActive: boolean) { return adminRequest<AdminCategory>(`/admin/categories/${id}/status`, token, { method: "PATCH", body: JSON.stringify({ isActive }) }); }
export function deleteAdminCategory(token: string, id: string) { return adminRequest<null>(`/admin/categories/${id}`, token, { method: "DELETE" }); }
export async function uploadAdminCategoryImage(token: string, file: File) {
  const data = new FormData(); data.set("image", file);
  let response: Response;
  try { response = await fetch(`${API_URL}/admin/categories/image`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: data, cache: "no-store" }); }
  catch (error) { throw new Error("Unable to connect to the server.", { cause: error }); }
  return parseApiResponse<{ image: string; url: string }>(response);
}
