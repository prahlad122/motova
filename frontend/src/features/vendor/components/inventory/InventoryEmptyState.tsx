
interface InventoryEmptyStateProps {
  hasProducts: boolean;
  onAddProduct: () => void;
}

export default function InventoryEmptyState({
  hasProducts,
  onAddProduct,
}: InventoryEmptyStateProps) {
  return (
    <div className="px-6 py-16 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl">
        📦
      </div>

      <h2 className="mt-4 font-semibold text-gray-900">
        {hasProducts ? "No matching products" : "No products yet"}
      </h2>

      <p className="mt-2 text-sm text-gray-500">
        {hasProducts
          ? "Try changing your search or filters."
          : "Add your first product to start building your inventory."}
      </p>

      {!hasProducts && (
        <button
          type="button"
          onClick={onAddProduct}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
        >
          + Add your first product
        </button>
      )}
    </div>
  );
}
