
interface InventoryHeaderProps {
  onAddProduct: () => void;
  onImportCSV: () => void;
}

export default function InventoryHeader({
  onAddProduct,
  onImportCSV,
}: InventoryHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-[#25282d]">
          My Items
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Every product you sell. New and edited products are reviewed
          before buyers see them.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onImportCSV}
          className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium"
        >
          Import CSV
        </button>

        <button
          type="button"
          onClick={onAddProduct}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + Add product
        </button>
      </div>
    </div>
  );
}
