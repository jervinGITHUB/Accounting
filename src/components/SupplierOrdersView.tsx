import { useState } from "react";
import type { SupplierOrder, Product } from "../types/store";

export function SupplierOrdersView({
  orders,
  products,
  onCreateOrder,
  onMarkReceived,
}: {
  orders: SupplierOrder[];
  products: Product[];
  onCreateOrder: (order: SupplierOrder) => void;
  onMarkReceived: (orderId: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Order Form state
  const [supplierName, setSupplierName] = useState("Davao Wholesale Trading");
  const [customSupplier, setCustomSupplier] = useState("");
  const [supplierContact, setSupplierContact] = useState("+63 82 221 4455");
  const [expectedDate, setExpectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split("T")[0];
  });
  const [orderItems, setOrderItems] = useState<{ productSlug: string; quantity: number; unitCost: number }[]>([
    {
      productSlug: products[0]?.slug || "bottled-water-500ml",
      quantity: 24,
      unitCost: parseFloat(products[0]?.costPrice?.replace(/[^\d.]/g, "") || "18"),
    },
  ]);

  const activeOrdersCount = orders.filter((o) => o.status !== "Received").length;
  const inTransitCount = orders.filter((o) => o.status === "In transit").length;
  const receivedCount = orders.filter((o) => o.status === "Received").length;
  const totalVolume = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((i) => i.productName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "All" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddItem = () => {
    const defaultProd = products[0];
    const cost = parseFloat(defaultProd?.costPrice?.replace(/[^\d.]/g, "") || "20");
    setOrderItems([...orderItems, { productSlug: defaultProd?.slug || "", quantity: 12, unitCost: cost }]);
  };

  const handleRemoveItem = (index: number) => {
    if (orderItems.length > 1) {
      setOrderItems(orderItems.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, slug: string) => {
    const prod = products.find((p) => p.slug === slug);
    const cost = parseFloat(prod?.costPrice?.replace(/[^\d.]/g, "") || "20");
    setOrderItems(
      orderItems.map((item, i) => (i === index ? { ...item, productSlug: slug, unitCost: cost } : item))
    );
  };

  const handleQtyChange = (index: number, qty: number) => {
    setOrderItems(orderItems.map((item, i) => (i === index ? { ...item, quantity: Math.max(1, qty) } : item)));
  };

  const handleCostChange = (index: number, cost: number) => {
    setOrderItems(orderItems.map((item, i) => (i === index ? { ...item, unitCost: Math.max(0, cost) } : item)));
  };

  const totalCalculated = orderItems.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);

  const handleCreateOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalSupplier = supplierName === "custom" ? customSupplier.trim() : supplierName;
    if (!finalSupplier) return;

    const formattedItems = orderItems.map((item) => {
      const prod = products.find((p) => p.slug === item.productSlug);
      return {
        productSlug: item.productSlug,
        productName: prod ? prod.name : "Product item",
        quantity: item.quantity,
        unitCost: item.unitCost,
      };
    });

    const newOrder: SupplierOrder = {
      id: `PO-${Date.now().toString().slice(-4)}`,
      supplierName: finalSupplier,
      supplierContact: supplierContact.trim() || "+63 82 000 0000",
      orderDate: new Date().toISOString().split("T")[0],
      expectedDate,
      items: formattedItems,
      totalAmount: totalCalculated,
      status: "Ordered",
      paymentStatus: "Pending",
    };

    onCreateOrder(newOrder);
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-ink">Supplier Orders & Restocking</h2>
          <p className="mt-0.5 text-xs text-muted">Manage supplier purchases, track shipments, and restock inventory</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-brand-dark"
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Supplier Order
        </button>
      </div>

      {/* Metrics */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Active Purchase Orders</p>
          <p className="mt-2 text-2xl font-bold text-ink">{activeOrdersCount}</p>
          <p className="mt-1 text-[11px] text-muted">Awaiting fulfillment or transit</p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Shipments In Transit</p>
          <p className="mt-2 text-2xl font-bold text-sky-700">{inTransitCount}</p>
          <p className="mt-1 text-[11px] text-muted">Expected to arrive soon</p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Received & Stocked</p>
          <p className="mt-2 text-2xl font-bold text-emerald-700">{receivedCount}</p>
          <p className="mt-1 text-[11px] text-muted">Inventory counts credited</p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Total Restock Value</p>
          <p className="mt-2 text-2xl font-extrabold text-ink">₱{totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          <p className="mt-1 text-[11px] text-muted">All recorded orders</p>
        </div>
      </section>

      {/* Orders Table Container */}
      <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        {/* Search & Filter Toolbar */}
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between bg-white">
          <div className="flex h-10 flex-1 items-center gap-2 rounded-xl border border-line bg-canvas px-3 sm:max-w-md focus-within:border-brand">
            <svg className="size-4 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search PO #, supplier, or product..."
              className="w-full bg-transparent text-xs outline-none"
            />
            {searchQuery && <button onClick={() => setSearchQuery("")} className="text-xs text-muted">✕</button>}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-xl border border-line bg-white px-3 text-xs font-semibold outline-none"
            >
              <option value="All">All statuses</option>
              <option value="Ordered">Ordered</option>
              <option value="In transit">In transit</option>
              <option value="Received">Received</option>
            </select>
          </div>
        </div>

        {/* Orders list */}
        <div className="divide-y divide-line">
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-muted">
              <p className="text-sm font-bold">No supplier orders found</p>
              <p className="mt-1 text-xs text-slate-400">Click &ldquo;New Supplier Order&rdquo; to start restocking</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const isReceived = order.status === "Received";
              return (
                <div key={order.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between hover:bg-canvas/40 transition">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-brand">{order.id}</span>
                      <span className="text-sm font-bold text-ink">{order.supplierName}</span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold ${
                          isReceived
                            ? "bg-emerald-50 text-emerald-700"
                            : order.status === "In transit"
                            ? "bg-sky-50 text-sky-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {order.status}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                          order.paymentStatus === "Paid" ? "bg-slate-100 text-slate-700" : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        Payment: {order.paymentStatus}
                      </span>
                    </div>

                    {/* Items description */}
                    <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                      {order.items.map((item, idx) => (
                        <span key={idx} className="rounded-md bg-canvas px-2 py-0.5 text-[11px] font-medium text-slate-700 border border-line">
                          {item.quantity}x {item.productName} (@ ₱{item.unitCost.toFixed(2)})
                        </span>
                      ))}
                    </div>

                    <div className="mt-2 flex items-center gap-3 text-[11px] text-muted">
                      <span>Ordered: {order.orderDate}</span>
                      <span>·</span>
                      <span>Expected: {order.expectedDate}</span>
                      {order.receivedDate && <span>· Received on: {order.receivedDate}</span>}
                      <span>·</span>
                      <span>Contact: {order.supplierContact}</span>
                    </div>
                  </div>

                  {/* Actions & Total */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-line/60 pt-3 sm:border-0 sm:pt-0">
                    <div className="text-right">
                      <span className="block text-[10px] font-bold uppercase text-muted">Total Cost</span>
                      <span className="text-base font-extrabold text-ink">₱{order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>

                    {!isReceived ? (
                      <button
                        onClick={() => onMarkReceived(order.id)}
                        className="flex items-center gap-1.5 rounded-xl bg-brand px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-brand-dark"
                      >
                        <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="m5 12 4 4L19 6" />
                        </svg>
                        Mark Received & Restock
                      </button>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 px-3 py-1.5 bg-emerald-50 rounded-lg">
                        ✓ Restocked in Inventory
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* New Supplier Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative flex max-h-[92vh] w-full max-w-xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <div className="flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-lg bg-emerald-50 text-brand">
                  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 7H6" />
                  </svg>
                </span>
                <div>
                  <h3 className="text-base font-bold text-ink">Create Supplier Purchase Order</h3>
                  <p className="text-xs text-muted">Restock items from wholesale distributors</p>
                </div>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="rounded-lg p-1 text-muted hover:bg-canvas">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrderSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-ink mb-1">Supplier Distributor *</label>
                  <select
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    className="h-10 w-full rounded-xl border border-line bg-canvas px-3 text-xs font-semibold outline-none focus:border-brand"
                  >
                    <option value="Davao Wholesale Trading">Davao Wholesale Trading</option>
                    <option value="Coca-Cola Beverages Phils">Coca-Cola Beverages Phils</option>
                    <option value="Universal Robina Corp">Universal Robina Corp</option>
                    <option value="Monde Nissin Corp.">Monde Nissin Corp.</option>
                    <option value="San Miguel Foods">San Miguel Foods</option>
                    <option value="custom">+ Other supplier</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-1">Supplier Contact Phone</label>
                  <input
                    value={supplierContact}
                    onChange={(e) => setSupplierContact(e.target.value)}
                    placeholder="+63 82 221..."
                    className="h-10 w-full rounded-xl border border-line bg-canvas px-3 text-xs outline-none focus:border-brand"
                  />
                </div>

                {supplierName === "custom" && (
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-ink mb-1">Custom Supplier Name *</label>
                    <input
                      required
                      value={customSupplier}
                      onChange={(e) => setCustomSupplier(e.target.value)}
                      placeholder="Enter supplier company name"
                      className="h-10 w-full rounded-xl border border-line bg-canvas px-3 text-xs outline-none focus:border-brand"
                    />
                  </div>
                )}

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-ink mb-1">Expected Delivery Date</label>
                  <input
                    type="date"
                    value={expectedDate}
                    onChange={(e) => setExpectedDate(e.target.value)}
                    className="h-10 w-full rounded-xl border border-line bg-canvas px-3 text-xs outline-none focus:border-brand"
                  />
                </div>
              </div>

              {/* Order Items Section */}
              <div className="space-y-2 pt-2 border-t border-line">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink">Items to Order & Restock</span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs font-bold text-brand hover:underline"
                  >
                    + Add Item
                  </button>
                </div>

                <div className="space-y-2">
                  {orderItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 rounded-xl border border-line bg-canvas/40 p-2.5">
                      <div className="flex-1">
                        <select
                          value={item.productSlug}
                          onChange={(e) => handleItemChange(index, e.target.value)}
                          className="h-9 w-full rounded-lg border border-line bg-white px-2 text-xs font-semibold outline-none"
                        >
                          {products.map((p) => (
                            <option key={p.slug} value={p.slug}>
                              {p.name} ({p.stock} on hand)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-20">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleQtyChange(index, parseInt(e.target.value, 10) || 1)}
                          placeholder="Qty"
                          className="h-9 w-full rounded-lg border border-line bg-white px-2 text-center text-xs font-bold outline-none"
                        />
                      </div>

                      <div className="w-24">
                        <div className="flex h-9 items-center rounded-lg border border-line bg-white px-2">
                          <span className="text-[10px] text-muted mr-1">₱</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.unitCost}
                            onChange={(e) => handleCostChange(index, parseFloat(e.target.value) || 0)}
                            placeholder="Cost"
                            className="w-full text-xs font-bold outline-none"
                          />
                        </div>
                      </div>

                      <span className="w-20 text-right text-xs font-bold text-ink">
                        ₱{(item.quantity * item.unitCost).toFixed(2)}
                      </span>

                      {orderItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-muted hover:text-rose-600 px-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Calculation */}
              <div className="flex justify-between items-center rounded-xl bg-slate-100 p-3 text-sm font-bold">
                <span>Total PO Cost:</span>
                <span className="text-base text-brand">₱{totalCalculated.toFixed(2)}</span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-line px-4 py-2 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-dark"
                >
                  Create & Send Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
