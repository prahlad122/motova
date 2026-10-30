
import type { Product } from "../../inventory/inventory.types";
import ProductRow from "./ProductRow";
import InventoryEmptyState from "./InventoryEmptyState";

interface ProductTableProps {
  products: Product[];
  totalProducts: number;
  loading: boolean;
  error: string;
  onAddProduct: () => void;
  onRetry: () => void;
}

export default function ProductTable({
  products,
  totalProducts,
  loading,
  error,
  onAddProduct,
  onRetry,
}: ProductTableProps) {
  return (
    <div className="mt-5 overflow-hidden rounded-xl border border-gray-200 bg-white">
      {loading ? (
        <div className="p-12 text-center text-sm text-gray-500">
          Loading your products...
        </div>
      ) : error ? (
        <div className="p-8 text-center">
          <p className="text-sm text-red-600">{error}</p>

          <button
            type="button"
            onClick={onRetry}
            className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm text-white"
          >
            Retry
          </button>
        </div>
      ) : products.length === 0 ? (
        <InventoryEmptyState
          hasProducts={totalProducts > 0}
          onAddProduct={onAddProduct}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase text-gray-500">
              <tr>
                <th className="px-4 py-4">Product</th>
                <th className="px-4 py-4">Category</th>
                <th className="px-4 py-4">Brand</th>
                <th className="px-4 py-4">Price</th>
                <th className="px-4 py-4">Stock</th>
                <th className="px-4 py-4">Units sold</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Listing review</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {products.map((product) => (
                <ProductRow key={product.id} product={product} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="border-t border-gray-100 px-4 py-3 text-xs text-gray-500">
          Showing {products.length} of {totalProducts} products
        </div>
      )}
    </div>
  );
}
