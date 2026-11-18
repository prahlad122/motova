import type { VendorDashboardData } from "./vendor.types";
import { parseApiResponse } from "@/lib/api-response";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

export async function getVendorDashboard(
  token: string,
  rangeDays = 30,
): Promise<VendorDashboardData> {
  let response: Response;

  try {
    response = await fetch(
      `${API_URL}/vendor/dashboard?rangeDays=${rangeDays}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
    );
  } catch (error) {
    throw new Error("Unable to connect to the server. Please try again.", {
      cause: error,
    });
  }

  return parseApiResponse<VendorDashboardData>(response);
}

export type VendorVerification = {
  id: string; verificationStatus: "NOT_SUBMITTED" | "PENDING" | "APPROVED" | "REJECTED";
  verificationNote: string | null; verifiedAt: string | null; updatedAt: string;
  user: { status: "ACTIVE" | "PENDING" | "SUSPENDED" };
  documents: { id: string; type: string; fileName: string; mimeType: string | null; fileSize: number | null; status: "PENDING" | "APPROVED" | "REJECTED"; rejectionReason: string | null; reviewedAt: string | null; submittedAt: string }[];
};

function vendorHeaders(token: string) { return { Authorization: `Bearer ${token}` }; }

export async function getVendorVerification(token: string) {
  const response = await fetch(`${API_URL}/vendor/documents/status`, { headers: vendorHeaders(token), cache: "no-store" });
  return parseApiResponse<VendorVerification>(response);
}

export async function submitVendorDocuments(token: string, items: { type: string; file: File }[]) {
  const form = new FormData();
  items.forEach(({ file }) => { form.append("documents", file); });
  form.append("documentTypes", JSON.stringify(items.map(({ type }) => type)));
  const response = await fetch(`${API_URL}/vendor/documents`, { method: "POST", headers: vendorHeaders(token), body: form, cache: "no-store" });
  return parseApiResponse<VendorVerification["documents"]>(response);
}

export async function getVendorDocumentAccess(token: string, documentId: string) {
  const response = await fetch(`${API_URL}/vendor/documents/${documentId}/access`, { headers: vendorHeaders(token), cache: "no-store" });
  return parseApiResponse<{ url: string; expiresIn: number }>(response);
}
