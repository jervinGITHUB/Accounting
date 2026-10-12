import type { Receipt } from "../types/store";

export function ReceiptModal({
  receipt,
  storeName,
  storeAddress,
  storeTaxId,
  storePhone,
  onClose,
}: {
  receipt: Receipt;
  storeName: string;
  storeAddress: string;
  storeTaxId: string;
  storePhone: string;
  onClose: () => void;
}) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="relative flex max-h-[90vh] w-full max-w-md flex-col rounded-2xl bg-white shadow-2xl">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted">Official Receipt</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg border border-line bg-canvas px-3 py-1.5 text-xs font-bold text-ink transition hover:border-brand/40 hover:text-brand"
            >
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <path d="M6 14h12v8H6z" />
              </svg>
              Print / Save
            </button>
            <button
              onClick={onClose}
              className="grid size-8 place-items-center rounded-lg text-muted transition hover:bg-canvas hover:text-ink"
              aria-label="Close"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Receipt Body (printable area) */}
        <div className="overflow-y-auto p-6 text-ink">
          <div className="mx-auto max-w-sm rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-5 font-mono text-xs">
            {/* Store Header */}
            <div className="text-center">
              <h2 className="text-base font-bold tracking-tight text-ink">{storeName}</h2>
              <p className="mt-0.5 text-[11px] text-muted">{storeAddress}</p>
              <p className="text-[10px] text-muted">TIN: {storeTaxId} · Tel: {storePhone}</p>
              <div className="my-3 border-t border-dashed border-slate-300" />
            </div>

            {/* Receipt Metadata */}
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-muted">Receipt No:</span>
                <span className="font-bold text-ink">{receipt.id}</span>
              </div>
              {receipt.journalRef && (
                <div className="flex justify-between">
                  <span className="text-muted">Journal Ref:</span>
                  <span>{receipt.journalRef}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted">Date & Time:</span>
                <span>{receipt.date} · {receipt.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Cashier:</span>
                <span>{receipt.cashier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Customer:</span>
                <span>{receipt.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Payment Method:</span>
                <span className="font-bold text-brand">{receipt.paymentMethod}</span>
              </div>
            </div>

            <div className="my-3 border-t border-dashed border-slate-300" />

            {/* Line Items */}
            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_40px_70px] text-[10px] font-bold uppercase text-muted">
                <span>Item</span>
                <span className="text-center">Qty</span>
                <span className="text-right">Total</span>
              </div>
              {receipt.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_40px_70px] items-start text-[11px]">
                  <div className="min-w-0 pr-1">
                    <p className="truncate font-medium">{item.name}</p>
                    <p className="text-[10px] text-muted">@ ₱{item.unitPrice.toFixed(2)}</p>
                  </div>
                  <span className="text-center">{item.quantity}</span>
                  <span className="text-right font-medium">₱{item.total.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="my-3 border-t border-dashed border-slate-300" />

            {/* Summary Totals */}
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal:</span>
                <span>₱{receipt.subtotal.toFixed(2)}</span>
              </div>
              {receipt.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount:</span>
                  <span>−₱{receipt.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold pt-1 border-t border-slate-200">
                <span>TOTAL AMOUNT:</span>
                <span className="text-emerald-700">₱{receipt.total.toFixed(2)}</span>
              </div>
              {receipt.cashTendered !== undefined && receipt.cashTendered > 0 && (
                <div className="flex justify-between pt-1 text-muted">
                  <span>Cash Tendered:</span>
                  <span>₱{receipt.cashTendered.toFixed(2)}</span>
                </div>
              )}
              {receipt.change !== undefined && receipt.cashTendered !== undefined && receipt.cashTendered > 0 && (
                <div className="flex justify-between font-bold text-ink">
                  <span>Change:</span>
                  <span>₱{receipt.change.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="my-4 border-t border-dashed border-slate-300" />

            {/* Footer */}
            <div className="text-center text-[10px] text-muted space-y-1">
              <p className="font-semibold text-ink">Maraming Salamat po!</p>
              <p>Thank you for shopping at {storeName}.</p>
              <p className="text-[9px] text-slate-400">Please keep this receipt for warranty and returns.</p>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end gap-2 border-t border-line px-5 py-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-line bg-white px-4 py-2 text-xs font-bold text-ink transition hover:bg-canvas"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="rounded-xl bg-brand px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-brand-dark"
          >
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
