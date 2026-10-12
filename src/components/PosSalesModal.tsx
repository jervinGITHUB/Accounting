import { useState } from "react";
import type { Product, Receipt, TransactionRecord, CustomerDebt } from "../types/store";

type CartItem = {
  product: Product;
  quantity: number;
};

export function PosSalesModal({
  products,
  categories,
  onCompleteSale,
  onClose,
}: {
  products: Product[];
  categories: string[];
  onCompleteSale: (params: {
    receipt: Receipt;
    transaction: TransactionRecord;
    stockUpdates: { slug: string; quantitySold: number }[];
    newDebt?: CustomerDebt;
  }) => void;
  onClose: () => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState("All categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("Walk-in Customer");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "GCash" | "Store Credit / Utang" | "Card">("Cash");
  const [cashTendered, setCashTendered] = useState("");
  const [discount, setDiscount] = useState("0");
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split("T")[0];
  });
  const [error, setError] = useState("");

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === "All categories" || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product: Product) => {
    setError("");
    const existing = cart.find((item) => item.product.slug === product.slug);
    const currentQty = existing ? existing.quantity : 0;
    if (currentQty >= product.stock) {
      setError(`Cannot add more. Only ${product.stock} units of ${product.name} left in stock.`);
      return;
    }
    if (existing) {
      setCart(cart.map((item) => (item.product.slug === product.slug ? { ...item, quantity: item.quantity + 1 } : item)));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const updateQuantity = (slug: string, delta: number) => {
    setError("");
    const item = cart.find((i) => i.product.slug === slug);
    if (!item) return;
    const nextQty = item.quantity + delta;
    if (nextQty <= 0) {
      setCart(cart.filter((i) => i.product.slug !== slug));
    } else if (nextQty > item.product.stock) {
      setError(`Maximum available stock for ${item.product.name} is ${item.product.stock}.`);
    } else {
      setCart(cart.map((i) => (i.product.slug === slug ? { ...i, quantity: nextQty } : i)));
    }
  };

  const removeFromCart = (slug: string) => {
    setCart(cart.filter((i) => i.product.slug !== slug));
  };

  const subtotal = cart.reduce((sum, item) => {
    const unitPrice = parseFloat(item.product.price.replace(/[^\d.]/g, "")) || 0;
    return sum + unitPrice * item.quantity;
  }, 0);

  const numDiscount = parseFloat(discount.replace(/[^\d.]/g, "")) || 0;
  const total = Math.max(0, subtotal - numDiscount);
  const numTendered = parseFloat(cashTendered.replace(/[^\d.]/g, "")) || 0;
  const change = paymentMethod === "Cash" && numTendered >= total ? numTendered - total : 0;

  const handleCheckout = () => {
    setError("");
    if (cart.length === 0) {
      setError("Please add at least one product to the sale.");
      return;
    }

    if (paymentMethod === "Cash" && numTendered < total) {
      setError(`Cash tendered (₱${numTendered.toFixed(2)}) is less than total amount due (₱${total.toFixed(2)}).`);
      return;
    }

    if (paymentMethod === "Store Credit / Utang" && (!customerName.trim() || customerName.trim() === "Walk-in Customer")) {
      setError("Please provide the specific customer's name for Credit / Utang tracking.");
      return;
    }

    const receiptId = `OR-${Date.now().toString().slice(-4)}`;
    const journalRef = `JE-${Date.now().toString().slice(-4)}`;
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const receiptItems = cart.map((item) => {
      const price = parseFloat(item.product.price.replace(/[^\d.]/g, "")) || 0;
      return {
        name: item.product.name,
        quantity: item.quantity,
        unitPrice: price,
        total: price * item.quantity,
      };
    });

    const receipt: Receipt = {
      id: receiptId,
      journalRef,
      date: dateStr,
      time: timeStr,
      customerName: customerName.trim() || "Walk-in Customer",
      paymentMethod,
      items: receiptItems,
      subtotal,
      discount: numDiscount,
      total,
      cashTendered: paymentMethod === "Cash" ? numTendered : total,
      change: paymentMethod === "Cash" ? change : 0,
      cashier: "Ana Reyes",
    };

    const transaction: TransactionRecord = {
      ref: journalRef,
      title: `Sale · ${customerName.trim() || "Walk-in"}`,
      detail: `${paymentMethod} · ${cart.length} item${cart.length > 1 ? "s" : ""}`,
      amount: `₱${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      numericAmount: total,
      time: "Just now",
      kind: "sale",
      status: "Posted",
      icon: "cash",
      receiptId,
      paymentMethod,
    };

    const stockUpdates = cart.map((item) => ({
      slug: item.product.slug,
      quantitySold: item.quantity,
    }));

    let newDebt: CustomerDebt | undefined = undefined;
    if (paymentMethod === "Store Credit / Utang") {
      newDebt = {
        id: `DEBT-${Date.now().toString().slice(-4)}`,
        customerName: customerName.trim(),
        contact: customerPhone.trim() || "In-store registered",
        amount: total,
        paidAmount: 0,
        itemsSummary: cart.map((i) => `${i.quantity}x ${i.product.name}`).join(", "),
        date: dateStr,
        dueDate: dueDate || dateStr,
        status: "Active",
        notes: `Recorded via POS sale ref ${journalRef}`,
      };
    }

    onCompleteSale({
      receipt,
      transaction,
      stockUpdates,
      newDebt,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 backdrop-blur-xs">
      <div className="relative flex h-[92vh] w-full max-w-5xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-line px-6 py-4 bg-white">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-brand">
              <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="5" width="18" height="14" rx="3" />
                <circle cx="12" cy="12" r="3" />
                <path d="M7 9H6v1M17 15h1v-1" />
              </svg>
            </span>
            <div>
              <h2 className="text-lg font-bold text-ink">Record Sale / POS Register</h2>
              <p className="text-xs text-muted">Select items, choose payment method, and generate official receipt</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted hover:bg-canvas hover:text-ink">
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content area: Left catalog, Right Cart & Checkout */}
        <div className="grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[1fr_380px]">
          {/* Left: Product Selector */}
          <div className="flex flex-col border-b border-line lg:border-b-0 lg:border-r overflow-hidden bg-slate-50/40">
            {/* Filter and Search Bar */}
            <div className="p-4 border-b border-line space-y-3 bg-white">
              <div className="flex gap-2">
                <div className="flex h-10 flex-1 items-center gap-2 rounded-xl border border-line bg-canvas px-3 focus-within:border-brand">
                  <svg className="size-4 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-4-4" />
                  </svg>
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search product or SKU..."
                    className="w-full bg-transparent text-xs outline-none"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="text-xs text-muted hover:text-ink">✕</button>
                  )}
                </div>
              </div>

              {/* Categories */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`whitespace-nowrap rounded-lg px-3 py-1.5 font-bold transition ${
                      selectedCategory === cat ? "bg-brand text-white shadow-xs" : "bg-canvas text-muted hover:text-ink"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {filteredProducts.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center text-center">
                  <p className="text-sm font-bold text-muted">No products found</p>
                  <p className="mt-1 text-xs text-slate-400">Try choosing another category or clearing search</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {filteredProducts.map((product) => {
                    const inCart = cart.find((i) => i.product.slug === product.slug);
                    const isOutOfStock = product.stock <= 0;
                    return (
                      <button
                        key={product.slug}
                        disabled={isOutOfStock}
                        onClick={() => addToCart(product)}
                        className={`group relative flex flex-col justify-between rounded-xl border p-3 text-left transition ${
                          isOutOfStock
                            ? "border-slate-200 bg-slate-100 opacity-60 cursor-not-allowed"
                            : inCart
                            ? "border-brand/40 bg-emerald-50/40 shadow-xs"
                            : "border-line bg-white hover:border-brand/30 hover:shadow-sm"
                        }`}
                      >
                        {inCart && (
                          <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white shadow-xs">
                            {inCart.quantity}
                          </span>
                        )}
                        <div>
                          <span className="text-[10px] font-semibold text-muted">{product.category}</span>
                          <p className="mt-0.5 line-clamp-2 text-xs font-bold text-ink leading-snug">{product.name}</p>
                        </div>
                        <div className="mt-2.5 flex items-center justify-between border-t border-line/60 pt-2">
                          <span className="text-xs font-extrabold text-emerald-700">{product.price}</span>
                          <span className={`text-[10px] font-medium ${product.stock <= product.reorder ? "text-amber-700" : "text-slate-400"}`}>
                            {product.stock} left
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right: Cart & Checkout Form */}
          <div className="flex flex-col bg-white overflow-hidden">
            <div className="border-b border-line px-5 py-3.5 flex items-center justify-between bg-slate-50/70">
              <span className="text-xs font-bold uppercase tracking-wider text-muted">Current Sale Order</span>
              <span className="rounded-md bg-canvas px-2 py-0.5 text-xs font-bold text-ink">{cart.length} items</span>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {cart.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center text-center">
                  <span className="text-muted text-2xl">🛒</span>
                  <p className="mt-2 text-xs font-bold text-muted">Order is empty</p>
                  <p className="text-[11px] text-slate-400">Click products from the catalog to add items</p>
                </div>
              ) : (
                cart.map((item) => {
                  const unitPrice = parseFloat(item.product.price.replace(/[^\d.]/g, "")) || 0;
                  const itemTotal = unitPrice * item.quantity;
                  return (
                    <div key={item.product.slug} className="flex items-center justify-between gap-2 rounded-xl border border-line bg-canvas/40 p-2.5 text-xs">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold text-ink">{item.product.name}</p>
                        <p className="text-[10px] text-muted">₱{unitPrice.toFixed(2)} each</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateQuantity(item.product.slug, -1)}
                          className="grid size-6 place-items-center rounded-lg border border-line bg-white font-bold text-muted hover:text-ink"
                        >
                          −
                        </button>
                        <span className="w-5 text-center font-bold text-ink">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.slug, 1)}
                          className="grid size-6 place-items-center rounded-lg border border-line bg-white font-bold text-muted hover:text-ink"
                        >
                          +
                        </button>
                      </div>
                      <span className="w-16 text-right font-bold text-ink">₱{itemTotal.toFixed(2)}</span>
                      <button
                        onClick={() => removeFromCart(item.product.slug)}
                        className="text-slate-400 hover:text-rose-600 pl-1"
                        aria-label="Remove item"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Payment & Customer Settings */}
            <div className="border-t border-line p-4 space-y-3 bg-slate-50/50">
              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs font-semibold text-rose-800">
                  {error}
                </div>
              )}

              {/* Customer Name */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-ink mb-1">Customer</label>
                  <input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Customer Name"
                    className="h-9 w-full rounded-lg border border-line bg-white px-2.5 text-xs font-medium outline-none focus:border-brand"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-ink mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="h-9 w-full rounded-lg border border-line bg-white px-2 text-xs font-bold outline-none focus:border-brand"
                  >
                    <option value="Cash">Cash</option>
                    <option value="GCash">GCash</option>
                    <option value="Store Credit / Utang">Store Credit / Utang</option>
                    <option value="Card">Card</option>
                  </select>
                </div>
              </div>

              {/* Method specific fields */}
              {paymentMethod === "Cash" && (
                <div className="flex gap-2 items-center">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-muted mb-0.5">Cash Tendered (₱)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={cashTendered}
                      onChange={(e) => setCashTendered(e.target.value)}
                      placeholder={total > 0 ? total.toFixed(2) : "0.00"}
                      className="h-9 w-full rounded-lg border border-line bg-white px-2.5 text-xs font-bold outline-none focus:border-brand"
                    />
                  </div>
                  <div className="flex-1 rounded-lg bg-emerald-50 p-2 text-right">
                    <span className="block text-[10px] font-bold text-emerald-800">Change</span>
                    <span className="text-sm font-extrabold text-emerald-900">₱{change.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {paymentMethod === "Store Credit / Utang" && (
                <div className="grid grid-cols-2 gap-2 rounded-xl border border-amber-200 bg-amber-50/60 p-2.5 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-amber-900 mb-0.5">Contact / Phone</label>
                    <input
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="e.g. 0917..."
                      className="h-8 w-full rounded-md border border-amber-300 bg-white px-2 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-amber-900 mb-0.5">Due Date</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="h-8 w-full rounded-md border border-amber-300 bg-white px-2 text-xs outline-none"
                    />
                  </div>
                  <p className="col-span-2 text-[10px] text-amber-800">
                    Will be added to Customer Debts (Pautang) automatically.
                  </p>
                </div>
              )}

              {/* Totals Breakdown */}
              <div className="space-y-1 pt-2 border-t border-line text-xs">
                <div className="flex justify-between text-muted">
                  <span>Subtotal:</span>
                  <span>₱{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold text-ink pt-1 border-t border-line">
                  <span>Total Amount Due:</span>
                  <span className="text-base text-brand">₱{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                disabled={cart.length === 0}
                onClick={handleCheckout}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand py-3 text-xs font-bold text-white shadow-md shadow-brand/15 transition hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m5 12 4 4L19 6" />
                </svg>
                Complete Sale & Generate Receipt
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
