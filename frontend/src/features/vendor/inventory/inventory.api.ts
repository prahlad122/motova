
import { parseApiResponse } from "@/lib/api-response";
import { getAuthSession } from "@/features/auth/auth.utils";

import type {
  Product,
  CreateProductInput,
} from "./inventory.types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

function getAuthHeaders() {
 const session = getAuthSession("VENDOR");

  if (!session?.token) {
    throw new Error("Your session has expired. Please log in again.");
  }

  return {
    Authorization: `Bearer ${session.token}`,
  };
}

export async function getVendorProducts(): Promise<Product[]> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}/vendor/products`, {
      method: "GET",
      headers: getAuthHeaders(),
      cache: "no-store",
    });
  } catch (error) {
    throw new Error("Unable to connect to the server.", {
      cause: error,
    });
  }

  return parseApiResponse<Product[]>(response);
}

export async function createVendorProduct(
  input: CreateProductInput,
): Promise<Product> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}/vendor/products`, {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });
  } catch (error) {
    throw new Error("Unable to connect to the server.", {
      cause: error,
    });
  }

  return parseApiResponse<Product>(response);
}
