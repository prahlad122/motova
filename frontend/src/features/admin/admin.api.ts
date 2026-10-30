
import { parseApiResponse } from "@/lib/api-response";
import type { AdminDashboardStats } from "./admin.types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

export async function getAdminDashboardStats(
  token: string
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
    throw new Error(
      "Unable to connect to the server. Please try again.",
      { cause: error }
    );
  }

  return parseApiResponse<AdminDashboardStats>(response);
}
