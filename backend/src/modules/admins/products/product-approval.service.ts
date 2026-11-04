import type { ProductReviewDecision } from "../admin.types.js";
import { getPendingAdminProducts, reviewAdminProduct } from "./product.service.js";

export async function getPendingProductApprovals() {
  const result = await getPendingAdminProducts({ page: 1, limit: 100, sortOrder: "asc" });
  return result.products;
}

export async function reviewProductListing(productId: string, reviewerId: string, decision: ProductReviewDecision, note?: string) {
  return reviewAdminProduct(productId, reviewerId, decision, note);
}
