
import type { AuthResponse } from "./auth.types";

const AUTH_STORAGE_KEY = "motova.auth";

export function saveAuthSession(response: AuthResponse) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify(response)
    );
  }
}

export function getAuthSession(): AuthResponse | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storedSession = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!storedSession) {
    return null;
  }

  try {
    return JSON.parse(storedSession) as AuthResponse;
  } catch (error) {
    console.error("Failed to parse auth session:", error);

    return null;
  }
}

export function clearAuthSession() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

export function getDashboardPath(
  role: AuthResponse["user"]["role"]
) {
  return role === "ADMIN"
    ? "/admin/dashboard"
    : "/vendor/dashboard";
}

export function getAuthErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

