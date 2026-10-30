interface ApiError extends Error {
  code?: string;
  status?: number;
}

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  code?: string;
  data: T | null;
}

export async function parseApiResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    const text = await response.text();

    console.error("Unexpected API response:", {
      status: response.status,
      url: response.url,
      contentType,
      body: text.slice(0, 300),
    });

    throw new Error("Server returned an invalid response. Please try again.");
  }

  const result = (await response.json()) as ApiEnvelope<T>;

  if (!response.ok || !result.success) {
    const error = new Error(
      result.message || `Request failed with status ${response.status}`,
    ) as ApiError;

    error.code = result.code;
    error.status = response.status;

    throw error;
  }

  return result.data as T;
}