// import type { AuthResponse } from "./auth.types";

// const AUTH_STORAGE_KEY = "motova.auth";

// export function saveAuthSession(response: AuthResponse) {
//   if (typeof window !== "undefined") {
//     window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(response));
//   }
// }

// export function getAuthSession(): AuthResponse | null {
//   if (typeof window === "undefined") {
//     return null;
//   }

//   const storedSession = window.localStorage.getItem(AUTH_STORAGE_KEY);

//   if (!storedSession) {
//     return null;
//   }

//   try {
//     return JSON.parse(storedSession) as AuthResponse;
//   } catch (error) {
//     console.error("Failed to parse auth session:", error);

//     return null;
//   }
// }

// export function clearAuthSession() {
//   if (typeof window !== "undefined") {
//     window.localStorage.removeItem(AUTH_STORAGE_KEY);
//   }
// }

// export function getDashboardPath(role: AuthResponse["user"]["role"]) {
//   return role === "ADMIN" ? "/admin/dashboard" : "/vendor/dashboard";
// }

// export function getAuthErrorMessage(error: unknown) {
//   return error instanceof Error
//     ? error.message
//     : "Something went wrong. Please try again.";
// }


import { WineOff } from "lucide-react";
import type { AuthResponse } from "./auth.types";
const ADMIN_AUTH_KEY = "motova.admin.auth";
const VENDOR_AUTH_KEY = "motova.vendor.auth";

function getStorageKey(role : AuthResponse ["user"] ["role"]){
  return role === "ADMIN" ? ADMIN_AUTH_KEY : VENDOR_AUTH_KEY;
}

export function saveAuthSession (response : AuthResponse){
  if(typeof window === "undefined") return;
  const storageKey = getStorageKey(response.user.role);
  window.localStorage.setItem(
    storageKey ,
    JSON.stringify(response),
  );
}

export function getAuthSession(
  role : AuthResponse["user"]["role"],
): AuthResponse | null {
  if(typeof window === "undefined") return null;

  const storageKey = getStorageKey(role);
  const storageSession = window.localStorage.getItem(storageKey);
  if(!storageSession) return null;
  try {
    const session = JSON.parse(storageSession) as AuthResponse;
    if(session.user?.role !== role || !session.token){
      return null;
    }
    
    return session;
  } catch (error) {
    console.error("Failed to parse auth session" , error);
    return null;
    
  }
}

export function clearAuthSession(
  role:AuthResponse["user"]["role"],
){
  if(typeof Window === "undefined") return;
  const storageKey = getStorageKey(role);
  window.localStorage.removeItem(storageKey);
}

export function getDashboardPath(role:AuthResponse ["user"]["role"]){
  return role === "ADMIN"
  ? "/admin/dashboard"
  : "/vendor/dashboard";
}

export function getAuthErrorMessage(error:unknown){
  return error instanceof Error 
  ? error.message 
  : "Something went wrong. Please try again.";
}

