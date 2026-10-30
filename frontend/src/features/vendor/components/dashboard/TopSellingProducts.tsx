
import { Card, money } from "./DashboardUI";
import type { VendorDashboardData } from "../../vendor.types";

export default function TopSellingProducts({ products, currency }: { products: VendorDashboardData["topSellingProducts"]; currency: string }) {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-medium">Top selling products</h2>
        <span className="text-xs text-[#8490a1]">units sold</span>
      </div>

      {products.length === 0 ? (
        <div className="flex min-h-[180px] items-center justify-center rounded-md border border-dashed border-[#d9e0e8] px-5 text-center">
          <p className="max-w-xs text-sm leading-6 text-[#8490a1]">No product sales available for this period.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {products.slice(0, 5).map((product, index) => (
            <div key={product.productId} className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-semibold text-blue-600">{index + 1}</div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#172033]">{product.name}</p>
                <p className="mt-1 text-xs text-[#8490a1]">{product.unitsSold.toLocaleString("en-IN")} units sold</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold text-[#172033]">{money(product.revenue, currency)}</p>
                <p className="mt-1 text-xs text-[#8490a1]">Revenue</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
