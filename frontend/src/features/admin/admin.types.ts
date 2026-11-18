export interface AdminDashboardStats {
  vendors: { total: number; active: number; pending: number; suspended: number; newThisWeek: number };
  listings: { total: number; active: number; pending: number; hidden: number; rejected: number; newThisWeek: number };
  sales: {
    revenue: number; target: number; unitsSold: number; previousPeriodChangePercent: number | null;
    series: { date: string; revenue: number }[];
  };
  topVendors: { vendorId: string; businessName: string; revenue: number }[];
  attention: {
    lowStockListings: number; vendorsWithoutSalesLast30Days: number; rejectedListings: number;
    expiringDocuments: number; reportedListings: number;
  };
  approvalQueue: { productId: string; productName: string; businessName: string; submittedAt: string }[];
  salesByCategory: { categoryId: string; categoryName: string; revenue: number }[];
}

export interface AdminVendorStats {
  total: number;
  active: number;
  pending: number;
  profiles: number;
  unverified: number;
  verificationPending: number;
  verified: number;
  rejected: number;
} 

export interface AdminVendor {
  id: string;
  name: string;
  email: string;
  mobile: string;
  status: "ACTIVE" | "PENDING" | "SUSPENDED";
  createdAt: string;
  vendorProfile: {
    id: string;
    businessName: string | null;
    gstNumber: string | null;
    mobileVerified: boolean;
    verificationStatus: "NOT_SUBMITTED" | "PENDING" | "APPROVED" | "REJECTED";
    documents?: { submittedAt: string; reviewedAt: string | null }[];
  } | null;
}

export interface AdminVendorDocument {
  id: string;
  type: string;
  fileName: string;
  mimeType: string | null;
  fileSize: number | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  reviews: { id: string; status: "PENDING" | "APPROVED" | "REJECTED"; note: string | null; reviewedAt: string; reviewer: { id: string; name: string } }[];
}

export interface AdminVendorDetails extends Omit<AdminVendor, "vendorProfile"> {
  role: "VENDOR";
  updatedAt: string;
  vendorProfile: (Omit<NonNullable<AdminVendor["vendorProfile"]>, "documents"> & {
    businessAddress: string | null;
    shippingAddress: string | null;
    storeManager: string | null;
    authorizedPerson: string | null;
    mobileVerified: boolean;
    verificationNote: string | null;
    verifiedAt: string | null;
    documents: AdminVendorDocument[];
  }) | null;
}

export interface AdminVendorsResponse {
  vendors: AdminVendor[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalVendors: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
   stats: AdminVendorStats;
}

export interface AdminCategory {
  id: string; name: string; slug: string; description: string | null; image: string | null; imageUrl?: string | null;
  parentId: string | null; isActive: boolean; sortOrder: number; createdAt: string; updatedAt: string;
  parent?: { id: string; name: string; slug?: string; isActive?: boolean } | null;
  children?: AdminCategory[];
  _count: { products: number; children: number };
}
export interface AdminCategoryStats {
  totalCategories: number; activeCategories: number; inactiveCategories: number;
  parentCategories: number; subcategories: number;
}
export interface AdminCategoriesResponse {
  categories: AdminCategory[];
  pagination: { currentPage: number; pageSize: number; totalCategories: number; totalPages: number; hasNextPage: boolean; hasPreviousPage: boolean };
}

export interface AdminBrand {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: { products: number };
}

export interface AdminBrandsResponse {
  brands: AdminBrand[];
  pagination: { currentPage: number; pageSize: number; totalBrands: number; totalPages: number; hasNextPage: boolean; hasPreviousPage: boolean };
}

export type AnalyticsRow = Record<string, string | string[] | number | boolean | null | undefined>;
export interface AdminAnalyticsData {
  range: { startDate: string; endDate: string; period: string };
  kpis: Record<string, number | { value: number; changePercent: number | null }>;
  charts: Record<string, AnalyticsRow[]>;
  pagination?: { currentPage: number; pageSize: number; totalRows: number; totalPages: number; hasNextPage: boolean; hasPreviousPage: boolean };
  transactions?: AnalyticsRow[];
  vendors?: AnalyticsRow[];
  products?: AnalyticsRow[];
  customers?: AnalyticsRow[];
  inventory?: AnalyticsRow[];
  definitions?: Record<string, string>;
  inventoryValueNote?: string;
}

export interface AdminProduct {
  id: string; name: string; description: string | null; sku: string; price: number; compareAtPrice: number | null;
  stockQuantity: number; status: string; listingStatus: string; listingNote: string | null;
  createdAt: string; updatedAt: string; approvedAt: string | null;
  category: { id: string; name: string; slug?: string };
  brand: { id: string; name: string } | null;
  images: { id: string; imageUrl: string; storageKey?: string | null; altText: string | null }[];
  vendor: { id: string; businessName: string | null; verificationStatus?: string; user: { id: string; name: string; email: string | null; status?: string } };
  revisions?: AdminProductRevision[];
  listingReviews?: { id: string; status: string; note: string | null; reviewedAt: string; reviewer: { id: string; name: string; email: string | null } }[];
}
export interface AdminProductRevision {
  id: string; status: string; submittedAt: string; reviewedAt: string | null; rejectionReason: string | null;
  name: string; description: string | null; sku: string; price: number; compareAtPrice: number | null; stockQuantity: number;
  category: { id: string; name: string }; brand: { id: string; name: string } | null;
  images: { id: string; imageUrl: string; storageKey?: string | null; altText: string | null }[];
  reviewer?: { id: string; name: string; email: string | null } | null;
}
export interface AdminProductStats { total: number; pending: number; approved: number; rejected: number; active: number; inactive: number; pendingRevisions: number }
export interface AdminProductsPage { products: AdminProduct[]; pagination: { currentPage: number; pageSize: number; totalProducts: number; totalPages: number; hasNextPage: boolean; hasPreviousPage: boolean } }
