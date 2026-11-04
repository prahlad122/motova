export interface CreateVendorInput {
  name: string;
  email: string;
  mobile: string;
  businessName: string;
  gstNumber?: string;
  businessAddress: string;
  shippingAddress?: string;
  storeManager?: string;
  authorizedPerson?: string;
}

export type ProductReviewDecision = "APPROVED" | "REJECTED";


export interface GetVendorsQuery {
  search?: string;
  status?: "ACTIVE" | "PENDING" | "SUSPENDED";
  verificationStatus?:
    | "NOT_SUBMITTED"
    | "PENDING"
    | "APPROVED"
    | "REJECTED";
  page: number;
  limit: number;
}

export type UpdateVendorStatusInput = {
  status: "ACTIVE" | "SUSPENDED";
};