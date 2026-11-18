
"use client";

import { useEffect, useState } from "react";

import type {
  ProductFormState,
  Category,
  Brand,
} from "../../inventory/inventory.types";

interface AddProductModalProps {
  open: boolean;
  title?: string;
  existingImages?: { id: string; imageUrl: string; altText: string | null }[];
  saving: boolean;
  formError: string;
  form: ProductFormState;
  categories: Category[];
  brands: Brand[];
  onChange: (field: keyof ProductFormState, value: string) => void;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>, images: File[], clearExistingImages: boolean) => void;
}

export default function AddProductModal({
  open,
  title = "Add product",
  existingImages = [],
  saving,
  formError,
  form,
  categories,
  brands,
  onChange,
  onClose,
  onSubmit,
}: AddProductModalProps) {
  const [images, setImages] = useState<File[]>([]);
  const [imageError, setImageError] = useState("");
  const [previews, setPreviews] = useState<string[]>([]);
  const [clearExistingImages, setClearExistingImages] = useState(false);
  useEffect(() => {
    const urls = images.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [images]);
  if (!open) return null;
  const selectedCategory = categories.find((category) => category.id === form.categoryId);
  const selectedParentId = selectedCategory?.parent?.id ?? "";
  const parentCategories = categories
    .flatMap((category) => category.parent ? [category.parent] : [])
    .filter((parent, index, all) => all.findIndex((item) => item.id === parent.id) === index);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
      <div className="my-6 w-full max-w-2xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {title}
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

        <form onSubmit={(event) => onSubmit(event, images, clearExistingImages)} className="space-y-4 p-6">
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
              Parent category *
              <select
                required
                value={selectedParentId}
                onChange={(event) => {
                  const firstSubcategory = categories.find((category) => category.parent?.id === event.target.value);
                  onChange("categoryId", firstSubcategory?.id ?? "");
                }}
                className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 font-normal"
              >
                <option value="">Select parent category</option>
                {parentCategories.map((parent) => (
                  <option key={parent.id} value={parent.id}>
                    {parent.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-gray-700">
              Subcategory *
              <select
                required
                disabled={!selectedParentId}
                value={form.categoryId}
                onChange={(event) => onChange("categoryId", event.target.value)}
                className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 font-normal disabled:bg-gray-50"
              >
                <option value="">Select subcategory</option>
                {categories.filter((category) => category.parent?.id === selectedParentId).map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
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
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-700">Product images <span className="font-normal text-gray-400">(up to 6, JPG/PNG/WebP, max 5 MB each)</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => {
                  const selected = Array.from(event.currentTarget.files ?? []);
                  const valid = selected.length <= 6 && selected.every((file) => file.size <= 5 * 1024 * 1024 && ["image/jpeg", "image/png", "image/webp"].includes(file.type));
                  setImageError(valid ? "" : "Choose up to 6 JPG, PNG, or WebP images, each no larger than 5 MB.");
                  if (valid) setImages(selected);
                  event.currentTarget.value = "";
                }} className="mt-1.5 block w-full rounded-lg border border-gray-200 p-2 text-sm" />
              </label>
              {imageError && <p role="alert" className="mt-2 text-xs text-red-700">{imageError}</p>}
              {saving && images.length > 0 && <p role="status" className="mt-2 text-xs text-blue-700">Uploading {images.length} image{images.length === 1 ? "" : "s"}…</p>}
              {existingImages.length > 0 && !clearExistingImages && images.length === 0 && <div className="mt-3 flex flex-wrap items-center gap-2">{existingImages.map((image) => <img key={image.id} src={image.imageUrl} alt={image.altText ?? "Current product image"} className="h-16 w-16 rounded-md border object-cover"/>)}<button type="button" onClick={() => setClearExistingImages(true)} className="rounded border border-rose-200 px-3 py-2 text-xs text-rose-700">Remove current images</button></div>}
              {clearExistingImages && <p className="mt-2 text-xs text-amber-700">Current product images will be removed when you save.</p>}
              {previews.length > 0 && <div className="mt-3 flex flex-wrap gap-3">{previews.map((src, index) => <div key={src} className="relative"><img src={src} alt={images[index]?.name ?? "Product preview"} className="h-16 w-16 rounded-md border object-cover" /><button type="button" onClick={() => setImages((current) => current.filter((_, imageIndex) => imageIndex !== index))} className="absolute -right-2 -top-2 rounded-full bg-white px-1 text-red-600 shadow" aria-label="Remove image">×</button></div>)}</div>}
            </div>
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
              disabled={saving || categories.length === 0 || Boolean(imageError)}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : title === "Edit product" ? "Save changes" : "Create product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
