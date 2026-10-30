
import Link from "next/link";
import type { AdminDashboardStats } from "../../admin.types";

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-28 items-center justify-center rounded-lg border border-dashed border-[#dce2eb] px-4 text-center text-xs text-[#778195]">
      {children}
    </div>
  );
}

export default function ApprovalQueue({
  products,
}: {
  products: AdminDashboardStats["approvalQueue"];
}) {
  return (
    <section className="min-w-0 rounded-xl border border-[#e1e5ec] bg-white p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-[#172033]">
          Approval queue
        </h2>

        <Link
          href="/admin/approvals"
          className="shrink-0 text-xs font-medium text-[#2864f0] hover:underline"
        >
          View all →
        </Link>
      </div>

      {products.length ? (
        <div className="divide-y divide-[#edf0f4]">
          {products.map((product) => (
            <div
              key={product.productId}
              className="flex items-center gap-3 py-3 first:pt-1"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eff4ff] text-sm font-semibold text-[#2864f0]">
                P
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-[#253047]">
                  {product.productName}
                </p>

                <p className="mt-1 truncate text-[10px] text-[#778195]">
                  {product.businessName} ·{" "}
                  {new Date(product.submittedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })}
                </p>
              </div>

              <Link
                href="/admin/approvals"
                className="shrink-0 rounded-md border border-[#2864f0] px-2.5 py-1.5 text-[10px] font-medium text-[#2864f0] hover:bg-[#eff4ff]"
              >
                Review
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState>No products are waiting for approval.</EmptyState>
      )}
    </section>
  );
}
