
export interface AdminDashboardStats {
  vendors: {
    total: number;
    active: number;
    pending: number;
    suspended: number;
    newThisWeek: number;
  };

  listings: {
    total: number;
    active: number;
    pending: number;
    hidden: number;
    rejected: number;
    newThisWeek: number;
  };

  sales: {
    revenue: number;
    target: number;
    unitsSold: number;
    previousPeriodChangePercent: number | null;
    series: {
      date: string;
      revenue: number;
    }[];
  };

  topVendors: {
    vendorId: string;
    businessName: string;
    revenue: number;
  }[];

  attention: {
    lowStockListings: number;
    vendorsWithoutSalesLast30Days: number;
    rejectedListings: number;
    expiringDocuments: number;
    reportedListings: number;
  };

  approvalQueue: {
    productId: string;
    productName: string;
    businessName: string;
    submittedAt: string;
  }[];

  salesByCategory: {
    categoryId: string;
    categoryName: string;
    revenue: number;
  }[];
}
