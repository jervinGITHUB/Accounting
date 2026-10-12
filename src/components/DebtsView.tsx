import { useState } from "react";
import type { CustomerDebt, PendingPayment } from "../types/store";

export function DebtsView({
  debts,
  pendingPayments,
  onAddDebt,
  onRecordDebtPayment,
  onAddPendingPayment,
  onSettlePayment,
}: {
  debts: CustomerDebt[];
  pendingPayments: PendingPayment[];
  onAddDebt: (debt: CustomerDebt) => void;
  onRecordDebtPayment: (debtId: string, amount: number, paymentMethod: string) => void;
  onAddPendingPayment: (payment: PendingPayment) => void;
  onSettlePayment: (paymentId: string, source: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<"customer-debts" | "pending-bills">("customer-debts");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modals state
  const [showAddDebtModal, setShowAddDebtModal] = useState(false);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [selectedDebtForPayment, setSelectedDebtForPayment] = useState<CustomerDebt | null>(null);
  const [paymentAmountInput, setPaymentAmountInput] = useState("");
  const [paymentMethodChoice, setPaymentMethodChoice] = useState("Cash");

  // New Debt Form State
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newDebtAmount, setNewDebtAmount] = useState("");
  const [newDebtItems, setNewDebtItems] = useState("");
  const [newDebtDueDate, setNewDebtDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split("T")[0];
  });
  const [newDebtNotes, setNewDebtNotes] = useState("");

  // New Pending Payment Form State
  const [newVendor, setNewVendor] = useState("");
  const [newInvoiceRef, setNewInvoiceRef] = useState("");
  const [newBillAmount, setNewBillAmount] = useState("");
  const [newBillDueDate, setNewBillDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split("T")[0];
  });
  const [newBillCategory, setNewBillCategory] = useState<PendingPayment["category"]>("Inventory restock");
  const [newBillNotes, setNewBillNotes] = useState("");

  // Metrics
  const totalCustomerDebts = debts.filter((d) => d.status !== "Settled").reduce((sum, d) => sum + (d.amount - d.paidAmount), 0);
  const activeDebtorsCount = debts.filter((d) => d.status !== "Settled").length;
  const settledDebtsCount = debts.filter((d) => d.status === "Settled").length;

  const totalUnpaidBills = pendingPayments.filter((p) => p.status !== "Paid").reduce((sum, p) => sum + p.amount, 0);
  const dueSoonBillsCount = pendingPayments.filter((p) => p.status === "Due soon").length;

  const filteredDebts = debts.filter((d) => {
    const matchesSearch = d.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || d.itemsSummary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredPayments = pendingPayments.filter((p) => {
    const matchesSearch = p.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) || p.invoiceRef.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim() || !newDebtAmount) return;
    const numAmount = parseFloat(newDebtAmount.replace(/[^\d.]/g, "")) || 0;
    if (numAmount <= 0) return;

    const newDebt: CustomerDebt = {
      id: `DEBT-${Date.now().toString().slice(-4)}`,
      customerName: newCustomerName.trim(),
      contact: newCustomerPhone.trim() || "N/A",
      amount: numAmount,
      paidAmount: 0,
      itemsSummary: newDebtItems.trim() || "Retail goods",
      date: new Date().toISOString().split("T")[0],
      dueDate: newDebtDueDate,
      status: "Active",
      notes: newDebtNotes.trim(),
    };

    onAddDebt(newDebt);
    setShowAddDebtModal(false);
    setNewCustomerName("");
    setNewCustomerPhone("");
    setNewDebtAmount("");
    setNewDebtItems("");
    setNewDebtNotes("");
  };

  const handleCreatePendingPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendor.trim() || !newBillAmount) return;
    const numAmount = parseFloat(newBillAmount.replace(/[^\d.]/g, "")) || 0;
    if (numAmount <= 0) return;

    const newPayment: PendingPayment = {
      id: `PAY-${Date.now().toString().slice(-4)}`,
      vendorName: newVendor.trim(),
      invoiceRef: newInvoiceRef.trim() || `BILL-${Date.now().toString().slice(-4)}`,
      amount: numAmount,
      dueDate: newBillDueDate,
      status: "Unpaid",
      category: newBillCategory,
      notes: newBillNotes.trim(),
    };

    onAddPendingPayment(newPayment);
    setShowAddPaymentModal(false);
    setNewVendor("");
    setNewInvoiceRef("");
    setNewBillAmount("");
    setNewBillNotes("");
  };

  const handleConfirmDebtPayment = () => {
    if (!selectedDebtForPayment) return;
    const numPay = parseFloat(paymentAmountInput.replace(/[^\d.]/g, "")) || 0;
    if (numPay <= 0) return;

    onRecordDebtPayment(selectedDebtForPayment.id, numPay, paymentMethodChoice);
    setSelectedDebtForPayment(null);
    setPaymentAmountInput("");
  };

  return (
    <div className="space-y-6">
      {/* Tab Switch & Action Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex rounded-xl border border-line bg-white p-1 shadow-xs">
          <button
            onClick={() => { setActiveTab("customer-debts"); setStatusFilter("All"); }}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition ${
              activeTab === "customer-debts" ? "bg-brand text-white shadow-xs" : "text-muted hover:text-ink"
            }`}
          >
            <span>Customer Debts (Pautang)</span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] ${activeTab === "customer-debts" ? "bg-white/20 text-white" : "bg-canvas text-muted"}`}>
              {debts.filter((d) => d.status !== "Settled").length}
            </span>
          </button>
          <button
            onClick={() => { setActiveTab("pending-bills"); setStatusFilter("All"); }}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition ${
              activeTab === "pending-bills" ? "bg-brand text-white shadow-xs" : "text-muted hover:text-ink"
            }`}
          >
            <span>Pending Payments & Bills</span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] ${activeTab === "pending-bills" ? "bg-white/20 text-white" : "bg-canvas text-muted"}`}>
              {pendingPayments.filter((p) => p.status !== "Paid").length}
            </span>
          </button>
        </div>

        <div>
          {activeTab === "customer-debts" ? (
            <button
              onClick={() => setShowAddDebtModal(true)}
              className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-brand-dark"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Record Customer Debt
            </button>
          ) : (
            <button
              onClick={() => setShowAddPaymentModal(true)}
              className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-brand-dark"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add Pending Bill / Payable
            </button>
          )}
        </div>
      </div>

      {/* Top Metrics Cards */}
      {activeTab === "customer-debts" ? (
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Total Outstanding Debts</p>
            <p className="mt-2 text-2xl font-extrabold text-amber-700">₱{totalCustomerDebts.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            <p className="mt-1 text-[11px] text-muted">Customer credit balances</p>
          </div>
          <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Active Customers with Debt</p>
            <p className="mt-2 text-2xl font-bold text-ink">{activeDebtorsCount}</p>
            <p className="mt-1 text-[11px] text-muted">Neighbors & regular buyers</p>
          </div>
          <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Fully Settled Debts</p>
            <p className="mt-2 text-2xl font-bold text-emerald-700">{settledDebtsCount}</p>
            <p className="mt-1 text-[11px] text-muted">Completed audit accounts</p>
          </div>
          <div className="rounded-2xl bg-sidebar p-4 text-white shadow-card">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/45">Pautang Policy</p>
            <p className="mt-2 text-xs font-medium leading-relaxed text-white/80">Keep debts recorded with item lists and agreed due dates for clean retail books.</p>
          </div>
        </section>
      ) : (
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Pending Bills Total</p>
            <p className="mt-2 text-2xl font-extrabold text-rose-700">₱{totalUnpaidBills.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            <p className="mt-1 text-[11px] text-muted">Accounts payable to suppliers & rent</p>
          </div>
          <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Due Soon / Immediate</p>
            <p className="mt-2 text-2xl font-bold text-amber-700">{dueSoonBillsCount}</p>
            <p className="mt-1 text-[11px] text-muted">Due within 7 days</p>
          </div>
          <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Paid This Period</p>
            <p className="mt-2 text-2xl font-bold text-emerald-700">
              {pendingPayments.filter((p) => p.status === "Paid").length}
            </p>
            <p className="mt-1 text-[11px] text-muted">Recorded & posted entries</p>
          </div>
          <div className="rounded-2xl bg-sidebar p-4 text-white shadow-card">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/45">Accounts Payable</p>
            <p className="mt-2 text-xs font-medium leading-relaxed text-white/80">Settling supplier invoices updates cash flow and trial balance automatically.</p>
          </div>
        </section>
      )}

      {/* Main Table / List Container */}
      <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        {/* Search & Filters */}
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between bg-white">
          <div className="flex h-10 flex-1 items-center gap-2 rounded-xl border border-line bg-canvas px-3 sm:max-w-md focus-within:border-brand">
            <svg className="size-4 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === "customer-debts" ? "Search customer name or item..." : "Search supplier, vendor, invoice..."}
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
              {activeTab === "customer-debts" ? (
                <>
                  <option value="Active">Active</option>
                  <option value="Partially paid">Partially paid</option>
                  <option value="Settled">Settled</option>
                </>
              ) : (
                <>
                  <option value="Unpaid">Unpaid</option>
                  <option value="Due soon">Due soon</option>
                  <option value="Paid">Paid</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* List Content */}
        {activeTab === "customer-debts" ? (
          <div className="divide-y divide-line">
            {filteredDebts.length === 0 ? (
              <div className="p-12 text-center text-muted">
                <p className="text-sm font-bold">No customer debts found</p>
                <p className="mt-1 text-xs text-slate-400">All customer accounts are clear or match no query</p>
              </div>
            ) : (
              filteredDebts.map((debt) => {
                const balance = debt.amount - debt.paidAmount;
                const isSettled = debt.status === "Settled";
                return (
                  <div key={debt.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-canvas/40 transition">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-ink">{debt.customerName}</span>
                        <span className="text-[10px] text-muted">{debt.contact}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                            isSettled
                              ? "bg-emerald-50 text-emerald-700"
                              : debt.status === "Partially paid"
                              ? "bg-sky-50 text-sky-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {debt.status}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600 line-clamp-1">Items: {debt.itemsSummary}</p>
                      <div className="mt-1 flex items-center gap-3 text-[10px] text-muted">
                        <span>Incurred: {debt.date}</span>
                        <span>·</span>
                        <span className="text-amber-800 font-semibold">Due: {debt.dueDate}</span>
                        {debt.notes && (
                          <>
                            <span>·</span>
                            <span className="italic">{debt.notes}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-line/60 pt-2 sm:border-0 sm:pt-0">
                      <div className="text-right">
                        <p className="text-xs text-muted">Total: ₱{debt.amount.toFixed(2)}</p>
                        <p className="text-sm font-bold text-ink">
                          Balance: <span className={balance > 0 ? "text-amber-700 font-extrabold" : "text-emerald-700"}>₱{balance.toFixed(2)}</span>
                        </p>
                      </div>

                      {!isSettled ? (
                        <button
                          onClick={() => {
                            setSelectedDebtForPayment(debt);
                            setPaymentAmountInput(balance.toFixed(2));
                          }}
                          className="rounded-xl bg-brand px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-brand-dark"
                        >
                          Pay / Settle
                        </button>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 px-3 py-1 bg-emerald-50 rounded-lg">
                          ✓ Settled
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="divide-y divide-line">
            {filteredPayments.length === 0 ? (
              <div className="p-12 text-center text-muted">
                <p className="text-sm font-bold">No pending bills found</p>
                <p className="mt-1 text-xs text-slate-400">All vendor payments are settled</p>
              </div>
            ) : (
              filteredPayments.map((payment) => {
                const isPaid = payment.status === "Paid";
                return (
                  <div key={payment.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-canvas/40 transition">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-ink">{payment.vendorName}</span>
                        <span className="text-[10px] rounded bg-canvas px-1.5 py-0.5 font-semibold text-muted">{payment.invoiceRef}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                            isPaid
                              ? "bg-emerald-50 text-emerald-700"
                              : payment.status === "Due soon"
                              ? "bg-rose-50 text-rose-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {payment.status}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted">{payment.category} {payment.notes ? `· ${payment.notes}` : ""}</p>
                      <div className="mt-1 text-[10px] text-muted">
                        Due Date: <span className="font-bold text-slate-700">{payment.dueDate}</span>
                        {payment.paidDate && ` · Paid on ${payment.paidDate}`}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-line/60 pt-2 sm:border-0 sm:pt-0">
                      <div className="text-right">
                        <p className="text-base font-extrabold text-ink">₱{payment.amount.toFixed(2)}</p>
                      </div>

                      {!isPaid ? (
                        <button
                          onClick={() => onSettlePayment(payment.id, "Cash on hand")}
                          className="rounded-xl border border-brand bg-emerald-50 px-3.5 py-2 text-xs font-bold text-brand transition hover:bg-brand hover:text-white"
                        >
                          Mark Paid
                        </button>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 px-3 py-1 bg-emerald-50 rounded-lg">
                          ✓ Paid
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </section>

      {/* Record Debt Payment Modal */}
      {selectedDebtForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-bold text-ink">Record Customer Debt Payment</h3>
            <p className="mt-1 text-xs text-muted">
              Customer: <span className="font-bold text-ink">{selectedDebtForPayment.customerName}</span>
            </p>
            <div className="mt-3 rounded-xl bg-canvas p-3 text-xs">
              <div className="flex justify-between text-muted">
                <span>Original debt:</span>
                <span>₱{selectedDebtForPayment.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted mt-1">
                <span>Already paid:</span>
                <span>₱{selectedDebtForPayment.paidAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-ink mt-2 pt-2 border-t border-line text-sm">
                <span>Current balance due:</span>
                <span className="text-amber-800">₱{(selectedDebtForPayment.amount - selectedDebtForPayment.paidAmount).toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-ink mb-1">Amount to Pay (₱)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={selectedDebtForPayment.amount - selectedDebtForPayment.paidAmount}
                  value={paymentAmountInput}
                  onChange={(e) => setPaymentAmountInput(e.target.value)}
                  className="h-10 w-full rounded-xl border border-line bg-canvas px-3 text-sm font-bold outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1">Payment Method</label>
                <select
                  value={paymentMethodChoice}
                  onChange={(e) => setPaymentMethodChoice(e.target.value)}
                  className="h-10 w-full rounded-xl border border-line bg-canvas px-3 text-xs font-semibold outline-none"
                >
                  <option value="Cash">Cash</option>
                  <option value="GCash">GCash</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setSelectedDebtForPayment(null)}
                className="rounded-xl border border-line px-4 py-2 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDebtPayment}
                className="rounded-xl bg-brand px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-dark"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Debt Modal */}
      {showAddDebtModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-bold text-ink">Record Customer Debt (Pautang)</h3>
            <p className="mt-1 text-xs text-muted">Add a customer credit record to the debt ledger</p>

            <form onSubmit={handleCreateDebt} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-ink mb-1">Customer Full Name *</label>
                <input
                  required
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  placeholder="e.g. Aling Susan Ramos"
                  className="h-10 w-full rounded-xl border border-line bg-canvas px-3 text-xs outline-none focus:border-brand"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-ink mb-1">Contact / Phone</label>
                  <input
                    value={newCustomerPhone}
                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                    placeholder="0918..."
                    className="h-10 w-full rounded-xl border border-line bg-canvas px-3 text-xs outline-none focus:border-brand"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink mb-1">Debt Amount (₱) *</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="1"
                    value={newDebtAmount}
                    onChange={(e) => setNewDebtAmount(e.target.value)}
                    placeholder="0.00"
                    className="h-10 w-full rounded-xl border border-line bg-canvas px-3 text-xs font-bold outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1">Items Taken / Reason *</label>
                <input
                  required
                  value={newDebtItems}
                  onChange={(e) => setNewDebtItems(e.target.value)}
                  placeholder="e.g. 5kg rice, 2 oil, canned tuna"
                  className="h-10 w-full rounded-xl border border-line bg-canvas px-3 text-xs outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1">Promised Due Date</label>
                <input
                  type="date"
                  value={newDebtDueDate}
                  onChange={(e) => setNewDebtDueDate(e.target.value)}
                  className="h-10 w-full rounded-xl border border-line bg-canvas px-3 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1">Notes / Address</label>
                <input
                  value={newDebtNotes}
                  onChange={(e) => setNewDebtNotes(e.target.value)}
                  placeholder="e.g. Block 3 Lot 8, promised to pay on 15th"
                  className="h-10 w-full rounded-xl border border-line bg-canvas px-3 text-xs outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setShowAddDebtModal(false)}
                  className="rounded-xl border border-line px-4 py-2 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-dark"
                >
                  Save Debt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Pending Payment Modal */}
      {showAddPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-bold text-ink">Add Pending Bill or Payable</h3>
            <p className="mt-1 text-xs text-muted">Track upcoming payments to suppliers, rent, or utilities</p>

            <form onSubmit={handleCreatePendingPayment} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-ink mb-1">Vendor / Payee Name *</label>
                <input
                  required
                  value={newVendor}
                  onChange={(e) => setNewVendor(e.target.value)}
                  placeholder="e.g. Davao Wholesale Trading"
                  className="h-10 w-full rounded-xl border border-line bg-canvas px-3 text-xs outline-none focus:border-brand"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-ink mb-1">Invoice / Ref #</label>
                  <input
                    value={newInvoiceRef}
                    onChange={(e) => setNewInvoiceRef(e.target.value)}
                    placeholder="INV-9921"
                    className="h-10 w-full rounded-xl border border-line bg-canvas px-3 text-xs outline-none focus:border-brand"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink mb-1">Amount (₱) *</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="1"
                    value={newBillAmount}
                    onChange={(e) => setNewBillAmount(e.target.value)}
                    placeholder="0.00"
                    className="h-10 w-full rounded-xl border border-line bg-canvas px-3 text-xs font-bold outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-ink mb-1">Category</label>
                  <select
                    value={newBillCategory}
                    onChange={(e) => setNewBillCategory(e.target.value as any)}
                    className="h-10 w-full rounded-xl border border-line bg-canvas px-3 text-xs outline-none"
                  >
                    <option value="Inventory restock">Inventory restock</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Rent">Rent</option>
                    <option value="Supplies">Supplies</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newBillDueDate}
                    onChange={(e) => setNewBillDueDate(e.target.value)}
                    className="h-10 w-full rounded-xl border border-line bg-canvas px-3 text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1">Notes / Description</label>
                <input
                  value={newBillNotes}
                  onChange={(e) => setNewBillNotes(e.target.value)}
                  placeholder="e.g. Terms 15 days net"
                  className="h-10 w-full rounded-xl border border-line bg-canvas px-3 text-xs outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setShowAddPaymentModal(false)}
                  className="rounded-xl border border-line px-4 py-2 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-dark"
                >
                  Save Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
