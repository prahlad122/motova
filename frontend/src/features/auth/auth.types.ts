export type UserRole = "ADMIN" | "VENDOR";

export type UserStatus = "ACTIVE" | "SUSPENDED" | "PENDING";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  mobile?: string | null;
  role: UserRole;
  status: UserStatus;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: AuthUser;
}

export interface VendorRegisterInput {
  name: string;
  email: string;
  mobile: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}
