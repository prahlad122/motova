interface ApiError extends Error {
  code?: string;
  status?: number;
  errors?: { field: string; message: string }[];
}

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  code?: string;
  data: T | null;
  errors?: { field: string; message: string }[];
}

export async function parseApiResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    throw new Error("Server returned an invalid response. Please try again.");
  }

  const result = (await response.json()) as ApiEnvelope<T>;

  if (!response.ok || !result.success) {
    const details = result.errors ?? [];
    const error = new Error(
      details.length
        ? details.map((item) => `${item.field || "Request"}: ${item.message}`).join(" ")
        : result.message || `Request failed with status ${response.status}`,
    ) as ApiError;

    error.code = result.code;
    error.status = response.status;
    error.errors = details;

    throw error;
  }

  return result.data as T;
}
