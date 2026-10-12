import { useState, type FormEvent } from "react";
import type { Product } from "../types/store";

export function AddProductModal({
  categories,
  onSave,
  onClose,
}: {
  categories: string[];
  onSave: (product: Product) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [sku, setSku] = useState(() => `PRD-${Math.floor(100 + Math.random() * 900)}`);
  const [category, setCategory] = useState("Food");
  const [customCategory, setCustomCategory] = useState("");
  const [price, setPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [stock, setStock] = useState("");
  const [reorder, setReorder] = useState("10");
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a product name.");
      return;
    }
    const numPrice = parseFloat(price.replace(/[^\d.]/g, ""));
    if (isNaN(numPrice) || numPrice <= 0) {
      setError("Please enter a valid selling price greater than 0.");
      return;
    }
    const numCost = parseFloat(costPrice.replace(/[^\d.]/g, "")) || numPrice * 0.75;
    const numStock = parseInt(stock, 10);
    if (isNaN(numStock) || numStock < 0) {
      setError("Please enter initial stock quantity (0 or more).");
      return;
    }
    const numReorder = parseInt(reorder, 10) || 10;
    const finalCategory = category === "custom" ? customCategory.trim() || "Food" : category;
    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") + `-${Date.now().toString().slice(-4)}`;

    const newProduct: Product = {
      slug,
      name: name.trim(),
      sku: sku.trim().toUpperCase() || `PRD-${Date.now().toString().slice(-4)}`,
      category: finalCategory,
      stock: numStock,
      reorder: numReorder,
      price: `₱${numPrice.toFixed(2)}`,
      costPrice: `₱${numCost.toFixed(2)}`,
      unitsSold: 0,
      revenue: "₱0",
    };

    onSave(newProduct);
  };

  const filteredCategories = categories.filter((c) => c !== "All categories");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-emerald-50 text-brand">
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </span>
            <div>
              <h2 className="text-base font-bold text-ink">Add New Product</h2>
              <p className="text-xs text-muted">Add a product to inventory and sales register</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-muted hover:bg-canvas hover:text-ink">
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-ink mb-1.5">Product Name *</label>
              <input
                autoFocus
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Century Tuna Flakes in Oil 155g"
                className="h-11 w-full rounded-xl border border-line bg-canvas px-3.5 text-sm outline-none focus:border-brand"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">SKU / Code *</label>
              <input
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. CAN-045"
                className="h-11 w-full rounded-xl border border-line bg-canvas px-3.5 text-sm uppercase outline-none focus:border-brand"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm font-semibold outline-none focus:border-brand"
              >
                {filteredCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="custom">+ Other / Custom category</option>
              </select>
            </div>

            {category === "custom" && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-ink mb-1.5">Custom Category Name</label>
                <input
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="e.g. Bakery / Dairy / Frozen Food"
                  className="h-11 w-full rounded-xl border border-line bg-canvas px-3.5 text-sm outline-none focus:border-brand"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">Selling Price (₱) *</label>
              <div className="flex h-11 items-center rounded-xl border border-line bg-canvas px-3 focus-within:border-brand">
                <span className="mr-1.5 text-sm font-bold text-muted">₱</span>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-transparent text-sm font-bold outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">Cost Price (₱)</label>
              <div className="flex h-11 items-center rounded-xl border border-line bg-canvas px-3 focus-within:border-brand">
                <span className="mr-1.5 text-sm font-bold text-muted">₱</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  placeholder="Estimated cost"
                  className="w-full bg-transparent text-sm font-medium outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">Initial Stock Units *</label>
              <input
                required
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="e.g. 24"
                className="h-11 w-full rounded-xl border border-line bg-canvas px-3.5 text-sm font-bold outline-none focus:border-brand"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">Reorder Alert Level</label>
              <input
                type="number"
                min="1"
                value={reorder}
                onChange={(e) => setReorder(e.target.value)}
                placeholder="e.g. 10"
                className="h-11 w-full rounded-xl border border-line bg-canvas px-3.5 text-sm outline-none focus:border-brand"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-line px-5 py-2.5 text-xs font-bold text-ink transition hover:bg-canvas"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-brand px-6 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-brand-dark"
            >
              Save Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function EditProductModal({
  product,
  categories,
  onSave,
  onClose,
}: {
  product: Product;
  categories: string[];
  onSave: (updated: Product) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(product.name);
  const [sku, setSku] = useState(product.sku);
  const [category, setCategory] = useState(product.category);
  const [price, setPrice] = useState(() => product.price.replace(/[^\d.]/g, ""));
  const [costPrice, setCostPrice] = useState(() => product.costPrice?.replace(/[^\d.]/g, "") || "");
  const [stock, setStock] = useState(String(product.stock));
  const [reorder, setReorder] = useState(String(product.reorder));
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a product name.");
      return;
    }
    const numPrice = parseFloat(price.replace(/[^\d.]/g, ""));
    if (isNaN(numPrice) || numPrice <= 0) {
      setError("Please enter a valid price greater than 0.");
      return;
    }
    const numCost = parseFloat(costPrice.replace(/[^\d.]/g, "")) || numPrice * 0.75;
    const numStock = parseInt(stock, 10);
    if (isNaN(numStock) || numStock < 0) {
      setError("Please enter a valid stock quantity.");
      return;
    }
    const numReorder = parseInt(reorder, 10) || 10;

    const updated: Product = {
      ...product,
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      category: category.trim(),
      price: `₱${numPrice.toFixed(2)}`,
      costPrice: `₱${numCost.toFixed(2)}`,
      stock: numStock,
      reorder: numReorder,
    };

    onSave(updated);
  };

  const filteredCategories = categories.filter((c) => c !== "All categories");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-emerald-50 text-brand">
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </span>
            <div>
              <h2 className="text-base font-bold text-ink">Edit Product & Update Price</h2>
              <p className="text-xs text-muted">Update selling price, cost, stock, or details</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-muted hover:bg-canvas hover:text-ink">
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-ink mb-1.5">Product Name</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 w-full rounded-xl border border-line bg-canvas px-3.5 text-sm outline-none focus:border-brand"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">SKU / Code</label>
              <input
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="h-11 w-full rounded-xl border border-line bg-canvas px-3.5 text-sm uppercase outline-none focus:border-brand"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm font-semibold outline-none focus:border-brand"
              >
                {filteredCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">
                Selling Price (₱) <span className="text-emerald-700 font-semibold">— Retail</span>
              </label>
              <div className="flex h-11 items-center rounded-xl border-2 border-emerald-500/40 bg-emerald-50/20 px-3 focus-within:border-brand">
                <span className="mr-1.5 text-sm font-bold text-emerald-800">₱</span>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-transparent text-sm font-bold text-ink outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">Cost Price (₱) — Wholesale</label>
              <div className="flex h-11 items-center rounded-xl border border-line bg-canvas px-3 focus-within:border-brand">
                <span className="mr-1.5 text-sm font-bold text-muted">₱</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">Current Stock Units</label>
              <input
                required
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="h-11 w-full rounded-xl border border-line bg-canvas px-3.5 text-sm font-bold outline-none focus:border-brand"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">Reorder Alert Level</label>
              <input
                type="number"
                min="1"
                value={reorder}
                onChange={(e) => setReorder(e.target.value)}
                className="h-11 w-full rounded-xl border border-line bg-canvas px-3.5 text-sm outline-none focus:border-brand"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-line px-5 py-2.5 text-xs font-bold text-ink transition hover:bg-canvas"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-brand px-6 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-brand-dark"
            >
              Update Price & Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
