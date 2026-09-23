import type {
  AuthResponse,
  LoginInput,
  VendorRegisterInput,
} from "./auth.types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

async function request<T>(path: string, body: T): Promise<AuthResponse> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Unable to connect to the server. Please try again.");
  }

  const data: Partial<AuthResponse> & { message?: string } =
    await response.json().catch(() => ({}));

  if (!response.ok || !data.success || !data.token || !data.user) {
    throw new Error(data.message ?? "Authentication failed. Please try again.");
  }

  return data as AuthResponse;
}

export function vendorLogin(input: LoginInput) {
  return request("/auth/vendor/login", input);
}

export function adminLogin(input: LoginInput) {
  return request("/auth/admin/login", input);
}

export function vendorRegister(input: VendorRegisterInput) {
  return request("/auth/vendor/register", input);
}
