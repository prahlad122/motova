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
}

export interface AdminVendorDetails extends Omit<AdminVendor, "vendorProfile"> {
  role: "VENDOR";
  updatedAt: string;
  vendorProfile: (NonNullable<AdminVendor["vendorProfile"]> & {
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
