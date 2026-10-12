import { useState } from "react";
import type { Receipt } from "../types/store";

export function ReceiptsView({
  receipts,
  onViewReceipt,
  onOpenPos,
}: {
  receipts: Receipt[];
  onViewReceipt: (receipt: Receipt) => void;
  onOpenPos: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("All");

  const totalVolume = receipts.reduce((sum, r) => sum + r.total, 0);
  const cashCount = receipts.filter((r) => r.paymentMethod === "Cash").length;
  const gcashCount = receipts.filter((r) => r.paymentMethod === "GCash").length;
  const creditCount = receipts.filter((r) => r.paymentMethod.includes("Credit") || r.paymentMethod.includes("Utang")).length;

  const filteredReceipts = receipts.filter((r) => {
    const matchesSearch =
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.items.some((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPayment = paymentFilter === "All" || r.paymentMethod === paymentFilter;
    return matchesSearch && matchesPayment;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-ink">Official Receipts & Sales Invoices</h2>
          <p className="mt-0.5 text-xs text-muted">Complete audit trail of sales slips, customer receipts, and proof of payment</p>
        </div>
        <button
          onClick={onOpenPos}
          className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-brand-dark"
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="5" width="18" height="14" rx="3" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Record Sale / POS
        </button>
      </div>

      {/* Metrics */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Receipts Issued</p>
          <p className="mt-2 text-2xl font-bold text-ink">{receipts.length}</p>
          <p className="mt-1 text-[11px] text-muted">Total sales slips</p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Total Receipts Value</p>
          <p className="mt-2 text-2xl font-extrabold text-emerald-700">
            ₱{totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="mt-1 text-[11px] text-muted">Gross sales invoiced</p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Cash vs GCash</p>
          <p className="mt-2 text-xl font-bold text-ink">
            {cashCount} Cash <span className="text-muted font-normal">/</span> {gcashCount} GCash
          </p>
          <p className="mt-1 text-[11px] text-muted">{creditCount} on store credit</p>
        </div>
        <div className="rounded-2xl bg-sidebar p-4 text-white shadow-card">
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/45">Compliance & Audit</p>
          <p className="mt-2 text-xs font-medium leading-relaxed text-white/80">Every sale generates an official receipt number tied to general journal postings.</p>
        </div>
      </section>

      {/* Receipts List */}
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
              placeholder="Search receipt #, customer, or item..."
              className="w-full bg-transparent text-xs outline-none"
            />
            {searchQuery && <button onClick={() => setSearchQuery("")} className="text-xs text-muted">✕</button>}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="h-10 rounded-xl border border-line bg-white px-3 text-xs font-semibold outline-none"
            >
              <option value="All">All payment methods</option>
              <option value="Cash">Cash</option>
              <option value="GCash">GCash</option>
              <option value="Store Credit / Utang">Store Credit / Utang</option>
              <option value="Card">Card</option>
            </select>
          </div>
        </div>

        {/* List items */}
        <div className="divide-y divide-line">
          {filteredReceipts.length === 0 ? (
            <div className="p-12 text-center text-muted">
              <p className="text-sm font-bold">No receipts found</p>
              <p className="mt-1 text-xs text-slate-400">Record a sale from the POS register to issue receipts</p>
            </div>
          ) : (
            filteredReceipts.map((receipt) => {
              const itemsCount = receipt.items.reduce((sum, i) => sum + i.quantity, 0);
              return (
                <div key={receipt.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-canvas/40 transition">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-sm font-extrabold text-brand">{receipt.id}</span>
                      <span className="font-bold text-sm text-ink">{receipt.customerName}</span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold ${
                          receipt.paymentMethod === "Cash"
                            ? "bg-emerald-50 text-emerald-700"
                            : receipt.paymentMethod === "GCash"
                            ? "bg-sky-50 text-sky-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {receipt.paymentMethod}
                      </span>
                      {receipt.journalRef && (
                        <span className="text-[10px] text-muted rounded bg-canvas px-1.5 py-0.5">{receipt.journalRef}</span>
                      )}
                    </div>

                    <p className="mt-1.5 text-xs text-slate-600 line-clamp-1">
                      {receipt.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                    </p>

                    <div className="mt-1 flex items-center gap-3 text-[11px] text-muted">
                      <span>{receipt.date} at {receipt.time}</span>
                      <span>·</span>
                      <span>{itemsCount} units sold</span>
                      <span>·</span>
                      <span>Cashier: {receipt.cashier}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-line/60 pt-2 sm:border-0 sm:pt-0">
                    <div className="text-right">
                      <p className="text-base font-extrabold text-emerald-700">₱{receipt.total.toFixed(2)}</p>
                      {receipt.discount > 0 && (
                        <p className="text-[10px] text-muted">Disc: ₱{receipt.discount.toFixed(2)}</p>
                      )}
                    </div>

                    <button
                      onClick={() => onViewReceipt(receipt)}
                      className="flex items-center gap-1.5 rounded-xl border border-line bg-white px-3.5 py-2 text-xs font-bold text-ink shadow-2xs transition hover:border-brand/40 hover:text-brand"
                    >
                      <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      View Receipt
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
