
"use client";

import type {
  ProductFormState,
  Category,
  Brand,
} from "../../inventory/inventory.types";

interface AddProductModalProps {
  open: boolean;
  saving: boolean;
  formError: string;
  form: ProductFormState;
  categories: Category[];
  brands: Brand[];
  onChange: (field: keyof ProductFormState, value: string) => void;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export default function AddProductModal({
  open,
  saving,
  formError,
  form,
  categories,
  brands,
  onChange,
  onClose,
  onSubmit,
}: AddProductModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
      <div className="my-6 w-full max-w-2xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Add product
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              New listings are submitted for review.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
            aria-label="Close form"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-gray-700">
              Product name *
              <input
                required
                minLength={2}
                value={form.name}
                onChange={(event) => onChange("name", event.target.value)}
                className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 font-normal"
                placeholder="Brake Pads"
              />
            </label>

            <label className="text-sm font-medium text-gray-700">
              SKU *
              <input
                required
                value={form.sku}
                onChange={(event) => onChange("sku", event.target.value)}
                className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 font-normal"
                placeholder="MOT-BRAKE-002"
              />
            </label>

            <label className="text-sm font-medium text-gray-700">
              Category *
              <select
                required
                value={form.categoryId}
                onChange={(event) =>
                  onChange("categoryId", event.target.value)
                }
                className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 font-normal"
              >
                <option value="">Select category</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              {categories.length === 0 && (
                <span className="mt-1 block text-xs text-amber-700">
                  No categories are currently available. Please contact the
                  administrator.
                </span>
              )}
            </label>

            <label className="text-sm font-medium text-gray-700">
              Brand
              <select
                value={form.brandId}
                onChange={(event) =>
                  onChange("brandId", event.target.value)
                }
                className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 font-normal"
              >
                <option value="">No brand</option>

                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-gray-700">
              Price (₹) *
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={form.price}
                onChange={(event) =>
                  onChange("price", event.target.value)
                }
                className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 font-normal"
              />
            </label>

            <label className="text-sm font-medium text-gray-700">
              Compare-at price (₹)
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={form.compareAtPrice}
                onChange={(event) =>
                  onChange("compareAtPrice", event.target.value)
                }
                className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 font-normal"
              />
            </label>

            <label className="text-sm font-medium text-gray-700 sm:col-span-2">
              Initial stock quantity *
              <input
                required
                type="number"
                min="0"
                step="1"
                value={form.stockQuantity}
                onChange={(event) =>
                  onChange("stockQuantity", event.target.value)
                }
                className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 font-normal"
              />
            </label>

            <label className="text-sm font-medium text-gray-700 sm:col-span-2">
              Description
              <textarea
                rows={3}
                value={form.description}
                onChange={(event) =>
                  onChange("description", event.target.value)
                }
                className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 font-normal"
                placeholder="Describe your product..."
              />
            </label>
          </div>

          {formError && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {formError}
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving || categories.length === 0}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
