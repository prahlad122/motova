export interface VendorDashboardData {
  vendor: {
    businessName: string | null;
    verificationStatus: string;
  };

  products: {
    total: number;
    active: number;
    pendingApproval: number;
    lowStock: number;
  };

  orders: {
    total: number;
    pending: number;
  };

  revenue: {
    deliveredVendorAmount: number;
    currency: string;
  };

  recentOrders: {
    id: string;
    orderNumber: string;
    customerName: string;
    status: string;
    subtotal: number;
    vendorAmount: number;
    createdAt: string;
  }[];

  analytics: {
    rangeDays: number;
    listings: {
      total: number;
      active: number;
      pending: number;
      rejected: number;
      hidden: number;
    };
    orders: {
      total: number;
      pending: number;
      toShip: number;
      shipped: number;
      cancelled: number;
      delivered: number;
    };
    stock: {
      inStock: number;
      lowStock: number;
      outOfStock: number;
    };
    rating: {
      average: number;
      reviewCount: number;
    };
    rejectedListings: {
      id: string;
      name: string;
      sku: string;
      note: string | null;
    }[];
  };

  sales: {
    rangeDays: number;
    currency: string;
    revenue: number;
    unitsSold: number;
    previousRevenue: number;
    revenueChangePercent: number | null;
    series: {
      date: string;
      revenue: number;
      unitsSold: number;
      orders: number;
    }[];
  };

  topSellingProducts: {
    productId: string;
    name: string;
    unitsSold: number;
    revenue: number;
  }[];

  todos: {
    newOrdersToAccept: number;
    ordersToPackAndShip: number;
    productsOutOfStock: number;
    rejectedListings: number;
    returnRequests: number;
  };

  payout: {
    currency: string;
    pendingAmount: number;
    paidAmount: number;
    awaitingDeliveryAmount: number;
    commissionThisMonth: number;
    recent: {
      id: string;
      amount: number;
      currency: string;
      status: string;
      reference: string | null;
      paidAt: string | null;
      createdAt: string;
    }[];
  };
}
