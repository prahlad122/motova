
import { C, DonutCard } from "./DashboardUI";
import type { VendorDashboardData } from "../../vendor.types";

type Analytics = VendorDashboardData["analytics"];

export default function DashboardCharts({ analytics }: { analytics: Analytics }) {
  const listingSegments = [
    { label: "Active", value: analytics.listings.active, color: C.blue },
    { label: "Pending", value: analytics.listings.pending, color: C.orange },
    { label: "Rejected", value: analytics.listings.rejected, color: C.red },
    { label: "Hidden", value: analytics.listings.hidden, color: C.gray },
  ];

  const orderSegments = [
    { label: "Shipped", value: analytics.orders.shipped, color: C.blue },
    { label: "To ship", value: analytics.orders.toShip, color: C.orange },
    { label: "Cancelled", value: analytics.orders.cancelled, color: C.red },
  ];

  const stockSegments = [
    { label: "In stock", value: analytics.stock.inStock, color: C.blue },
    { label: "Low", value: analytics.stock.lowStock, color: C.orange },
    { label: "Out", value: analytics.stock.outOfStock, color: C.red },
  ];

  return (
    <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
      <DonutCard title="My Listings" segments={listingSegments} footer={analytics.listings.total ? `${Math.round((analytics.listings.active / analytics.listings.total) * 100)}% of your listings are live` : "Add products to start listing"} />
      <DonutCard title={`Orders (${analytics.rangeDays} days)`} segments={orderSegments} footer={`${analytics.orders.pending} new orders waiting for you to accept`} />
      <DonutCard title="Stock Health" segments={stockSegments} footer={`${analytics.stock.lowStock + analytics.stock.outOfStock} products need restocking`} />
    </section>
  );
}
