
import type { Product } from "../../inventory/inventory.types";

interface ProductRowProps {
  product: Product;
}

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

function productStatus(product: Product) {
  if (product.stockQuantity === 0 && product.status === "ACTIVE") {
    return "OUT_OF_STOCK";
  }

  if (product.status === "ARCHIVED" || product.status === "INACTIVE") {
    return "HIDDEN";
  }

  if (product.listingStatus === "REJECTED") return "REJECTED";
  if (product.listingStatus === "PENDING") return "PENDING";

  return product.status;
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    ACTIVE: "Active",
    PENDING: "Pending approval",
    REJECTED: "Rejected",
    OUT_OF_STOCK: "Out of stock",
    HIDDEN: "Hidden",
    DRAFT: "Draft",
    APPROVED: "Approved",
  };

  return labels[status] ?? status.replaceAll("_", " ");
}

function statusStyle(status: string) {
  if (status === "ACTIVE") return "bg-emerald-50 text-emerald-700";
  if (status === "PENDING") return "bg-amber-50 text-amber-700";
  if (status === "REJECTED") return "bg-red-50 text-red-700";

  return "bg-gray-100 text-gray-700";
}

export default function ProductRow({ product }: ProductRowProps) {
  const status = productStatus(product);

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {product.images[0]?.imageUrl ? (
            <img
              src={product.images[0].imageUrl}
              alt={product.images[0].altText ?? product.name}
              className="h-12 w-12 rounded-lg border border-gray-100 object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-lg">
              📦
            </div>
          )}

          <div>
            <p className="font-medium text-gray-900">{product.name}</p>
            <p className="mt-1 text-xs text-gray-500">
              SKU {product.sku}
            </p>
          </div>
        </div>
      </td>

      <td className="px-4 py-3 text-gray-700">
        {product.category.name}
      </td>

      <td className="px-4 py-3 text-gray-700">
        {product.brand?.name ?? "—"}
      </td>

      <td className="px-4 py-3 font-medium text-black">
        {money(product.price)}

        {product.compareAtPrice !== null && (
          <p className="mt-1 text-xs text-gray-400 line-through">
            {money(product.compareAtPrice)}
          </p>
        )}
      </td>

      <td
        className={`px-4 py-3 ${
          product.stockQuantity === 0
            ? "font-semibold text-red-600"
            : "text-gray-700"
        }`}
      >
        {product.stockQuantity}
      </td>

      <td className="px-4 py-3 text-gray-500">—</td>

      <td className="px-4 py-3">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle(status)}`}
        >
          {statusLabel(status)}
        </span>
      </td>

      <td className="px-4 py-3">
        <div className="text-xs">
          <span
            className={`inline-flex rounded-full px-2.5 py-1 ${statusStyle(product.listingStatus)}`}
          >
            {statusLabel(product.listingStatus)}
          </span>

          {product.listingNote && (
            <p className="mt-1 max-w-48 text-red-600">
              {product.listingNote}
            </p>
          )}
        </div>
      </td>
    </tr>
  );
}
