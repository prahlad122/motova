
import type {
  Category,
  Brand,
  ProductSort,
} from "../../inventory/inventory.types";

interface InventoryFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  brandFilter: string;
  onBrandChange: (value: string) => void;
  sortBy: ProductSort;
  onSortChange: (value: ProductSort) => void;
  categories: Category[];
  brands: Brand[];
}

export default function InventoryFilters({
  search,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  brandFilter,
  onBrandChange,
  sortBy,
  onSortChange,
  categories,
  brands,
}: InventoryFiltersProps) {
  return (
    <div className="text-black  mt-3 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_170px_170px_170px]">
      <input
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="⌕  Search by product name or SKU"
        className="min-w-0 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400"
      />

      <select
        value={categoryFilter}
        onChange={(event) => onCategoryChange(event.target.value)}
        className="rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm text-black"
      >
        <option value="ALL">All categories</option>

        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>

      <select
        value={brandFilter}
        onChange={(event) => onBrandChange(event.target.value)}
        className="rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm"
      >
        <option value="ALL">All brands</option>

        {brands.map((brand) => (
          <option key={brand.id} value={brand.id}>
            {brand.name}
          </option>
        ))}
      </select>

      <select
        value={sortBy}
        onChange={(event) =>
          onSortChange(event.target.value as ProductSort)
        }
        className="rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm"
      >
        <option value="NEWEST">Sort: Newest</option>
        <option value="PRICE_LOW">Price: Low to high</option>
        <option value="PRICE_HIGH">Price: High to low</option>
        <option value="STOCK_LOW">Stock: Low to high</option>
      </select>
    </div>
  );
}
