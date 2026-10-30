
import { Card, StatusPill, money } from "./DashboardUI";
import type { VendorDashboardData } from "../../vendor.types";

export default function RecentOrders({ orders, currency }: { orders: VendorDashboardData["recentOrders"]; currency: string }) {
  return (
    <Card className="overflow-hidden">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-base font-medium">Recent orders</h2>
        <a href="/vendor/orders" className="text-sm text-blue-600 underline">All orders →</a>
      </div>

      {orders.length === 0 ? (
        <div className="py-10 text-center text-sm text-[#8490a1]">Orders will appear here when customers place orders.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead>
              <tr className="border-y border-[#e9edf2] text-[11px] uppercase text-[#8490a1]">
                <th className="py-3 pr-3 font-medium">Order</th>
                <th className="py-3 pr-3 font-medium">Product / customer</th>
                <th className="py-3 pr-3 font-medium">Amount</th>
                <th className="py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id} className="border-b border-[#edf0f4] last:border-0">
                  <td className="py-3 pr-3 font-medium">{order.orderNumber}</td>
                  <td className="py-3 pr-3">
                    <span className="block max-w-[190px] truncate">{order.customerName || "Customer"}</span>
                    <span className="mt-0.5 block text-xs text-[#98a2b3]">{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</span>
                  </td>
                  <td className="py-3 pr-3 font-medium">{money(order.subtotal, currency)}</td>
                  <td className="py-3"><StatusPill status={order.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
