const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

export interface AdminDashboardStats {
  vendors: {
    total: number;
    active: number;
    pending: number;
    suspended: number;
    newThisWeek: number;
  };
}

interface AdminDashboardResponse {
  success: boolean;
  message: string;
  data: AdminDashboardStats;
}

export async function getAdminDashboardStats(
  token: string
): Promise<AdminDashboardStats> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}/admin/dashboard`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
  } catch {
    throw new Error("Unable to connect to the server. Please try again.");
  }

  const result: Partial<AdminDashboardResponse> = await response
    .json()
    .catch(() => ({}));

  if (!response.ok || !result.success || !result.data?.vendors) {
    throw new Error(
      result.message ?? "Unable to load admin dashboard statistics."
    );
  }

  return result.data;
}