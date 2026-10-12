import { useState, type FormEvent, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router";
import type { Product, CustomerDebt, PendingPayment, SupplierOrder, Receipt, TransactionRecord } from "./types/store";
import {
  INITIAL_PRODUCTS,
  DEFAULT_CATEGORIES,
  INITIAL_CUSTOMER_DEBTS,
  INITIAL_PENDING_PAYMENTS,
  INITIAL_SUPPLIER_ORDERS,
  INITIAL_RECEIPTS,
  INITIAL_TRANSACTIONS,
} from "./data/initialStoreData";
import { ReceiptModal } from "./components/ReceiptModal";
import { AddProductModal, EditProductModal } from "./components/ProductModals";
import { PosSalesModal } from "./components/PosSalesModal";
import { DebtsView } from "./components/DebtsView";
import { SupplierOrdersView } from "./components/SupplierOrdersView";
import { ReceiptsView } from "./components/ReceiptsView";

type IconName =
  | "grid"
  | "ledger"
  | "box"
  | "chart"
  | "users"
  | "history"
  | "settings"
  | "search"
  | "bell"
  | "plus"
  | "arrow"
  | "check"
  | "alert"
  | "cash"
  | "cart"
  | "receipt"
  | "wallet"
  | "more"
  | "chevron"
  | "spark";

function Icon({ name, className = "size-5" }: { name: IconName; className?: string }) {
  const paths: Record<IconName, ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></>,
    ledger: <><path d="M6 3h12v18H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Z" /><path d="M6 3v18M10 8h5M10 12h5" /></>,
    box: <><path d="m21 8-9 5-9-5 9-5 9 5Z" /><path d="m3 8 9 5 9-5v8l-9 5-9-5V8Z" /><path d="M12 13v8" /></>,
    chart: <><path d="M4 19V9M10 19V5M16 19v-7M22 19H2" /></>,
    users: <><circle cx="9" cy="8" r="4" /><path d="M2 21a7 7 0 0 1 14 0M16 4.5a4 4 0 0 1 0 7.5M17 15a7 7 0 0 1 5 6" /></>,
    history: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5M12 7v5l3 2" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    arrow: <><path d="M5 12h14M14 7l5 5-5 5" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    alert: <><path d="M10.3 3.7 2.5 17.2A2 2 0 0 0 4.2 20h15.6a2 2 0 0 0 1.7-2.8L13.7 3.7a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 17h.01" /></>,
    cash: <><rect x="3" y="5" width="18" height="14" rx="3" /><circle cx="12" cy="12" r="3" /><path d="M7 9H6v1M17 15h1v-1" /></>,
    cart: <><path d="M3 3h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 7H6" /><circle cx="10" cy="20" r="1" /><circle cx="18" cy="20" r="1" /></>,
    receipt: <><path d="M6 3h12v19l-3-2-3 2-3-2-3 2V3Z" /><path d="M9 8h6M9 12h6M9 16h3" /></>,
    wallet: <><path d="M4 6h15a2 2 0 0 1 2 2v11H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h13v3" /><path d="M16 11h5v4h-5a2 2 0 0 1 0-4Z" /></>,
    more: <><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    spark: <><path d="m12 3 1.4 4.1L17.5 9l-4.1 1.4L12 14.5l-1.4-4.1L6.5 9l4.1-1.9L12 3Z" /><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" /></>,
  };

  return <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

const navigation: { label: string; icon: IconName; path: string }[] = [
  { label: "Overview", icon: "grid", path: "/" },
  { label: "Sales & POS", icon: "cash", path: "/pos" },
  { label: "Inventory", icon: "box", path: "/inventory" },
  { label: "Debts & Payables", icon: "wallet", path: "/debts" },
  { label: "Supplier Orders", icon: "cart", path: "/supplier-orders" },
  { label: "Receipts", icon: "receipt", path: "/receipts" },
  { label: "Journal", icon: "ledger", path: "/journal" },
  { label: "Reports", icon: "chart", path: "/reports" },
  { label: "Team", icon: "users", path: "/team" },
  { label: "History", icon: "history", path: "/history" },
];

const transactions = [
  { ref: "JE-1048", title: "Morning POS sales", detail: "Cash & GCash · Sales revenue", amount: "₱18,420.00", time: "Today, 10:32 AM", kind: "sale", status: "Posted", icon: "cash" as IconName },
  { ref: "JE-1047", title: "Coca-Cola restock", detail: "Inventory · Accounts payable", amount: "₱6,850.00", time: "Today, 9:14 AM", kind: "purchase", status: "For review", icon: "cart" as IconName },
  { ref: "JE-1046", title: "Meralco electric bill", detail: "Utilities expense · Cash", amount: "₱4,235.50", time: "Yesterday, 4:48 PM", kind: "expense", status: "Posted", icon: "receipt" as IconName },
  { ref: "JE-1045", title: "Cash drawer top-up", detail: "Cash on hand · Owner's capital", amount: "₱2,000.00", time: "Yesterday, 8:02 AM", kind: "cash", status: "Posted", icon: "wallet" as IconName },
];

const teamMembers = [
  { slug: "ana-reyes", name: "Ana Reyes", initials: "AR", role: "Owner", access: "Full access", email: "ana@cornermarket.ph", lastActive: "Active now" },
  { slug: "miguel-santos", name: "Miguel Santos", initials: "MS", role: "Store manager", access: "Sales & inventory", email: "miguel@cornermarket.ph", lastActive: "Today, 8:12 AM" },
  { slug: "liza-cruz", name: "Liza Cruz", initials: "LC", role: "Cashier", access: "Sales only", email: "liza@cornermarket.ph", lastActive: "Yesterday, 6:04 PM" },
];

type ActivityRecord = {
  id: string;
  action: string;
  category: "Inventory" | "Journal" | "Settings" | "Team" | "Reports" | "Shift" | "System";
  actor: string;
  timestamp: string;
};

type AccountingPeriod = {
  id: string;
  label: string;
  shortLabel: string;
  status: "Closed" | "In progress" | "Upcoming";
  checks: boolean[];
};

type BusinessProfile = {
  name: string;
  taxId: string;
  address: string;
  email: string;
  phone: string;
  businessType: string;
  timezone: string;
};

const initialBusinessProfile: BusinessProfile = {
  name: "Corner Market",
  taxId: "487-219-630-000",
  address: "Davao City, Philippines",
  email: "hello@cornermarket.ph",
  phone: "+63 917 555 0142",
  businessType: "Sole proprietorship",
  timezone: "Philippine Time (UTC+8)",
};

const initialPeriods: AccountingPeriod[] = [
  { id: "2025-11", label: "November 2025", shortLabel: "November close", status: "In progress", checks: [true, true, true, false, false] },
  { id: "2025-10", label: "October 2025", shortLabel: "October close", status: "Closed", checks: [true, true, true, true, true] },
  { id: "2025-09", label: "September 2025", shortLabel: "September close", status: "Closed", checks: [true, true, true, true, true] },
  { id: "2025-08", label: "August 2025", shortLabel: "August close", status: "Closed", checks: [true, true, true, true, true] },
  { id: "2025-12", label: "December 2025", shortLabel: "December close", status: "Upcoming", checks: [false, false, false, false, false] },
];

const initialActivity: ActivityRecord[] = [
  { id: "activity-1", action: "Morning POS sales JE-1048 posted", category: "Journal", actor: "Ana Reyes", timestamp: "2025-11-18T10:32:00" },
  { id: "activity-2", action: "Bottled drinks stock count completed", category: "Inventory", actor: "Miguel Santos", timestamp: "2025-11-18T09:44:00" },
  { id: "activity-3", action: "Workspace accounting settings updated", category: "Settings", actor: "Ana Reyes", timestamp: "2025-11-17T16:18:00" },
  { id: "activity-4", action: "Cashier permissions updated for Liza Cruz", category: "Team", actor: "Ana Reyes", timestamp: "2025-11-17T14:05:00" },
  { id: "activity-5", action: "November trial balance generated", category: "Reports", actor: "Ana Reyes", timestamp: "2025-11-16T17:30:00" },
];

const activityContext: Record<ActivityRecord["category"], { area: string; source: string; impact: string; icon: IconName }> = {
  Inventory: { area: "Stock ledger and inventory valuation", source: "Inventory control workflow", impact: "Inventory quantities and audit records were updated.", icon: "box" },
  Journal: { area: "General journal and account balances", source: "Accounting workflow", impact: "The transaction record is included in the accounting cycle.", icon: "ledger" },
  Settings: { area: "Corner Market workspace", source: "Workspace administration", impact: "The updated configuration now applies across the system.", icon: "settings" },
  Team: { area: "Team access and permissions", source: "Access administration", impact: "The member’s access and security audit trail were updated.", icon: "users" },
  Reports: { area: "Financial reporting", source: "Reports workspace", impact: "A report artifact or reporting record was created.", icon: "chart" },
  Shift: { area: "Cash drawer and daily close", source: "Shift reconciliation", impact: "The shift record and related journal activity were updated.", icon: "cash" },
  System: { area: "SariLedger workspace", source: "System workflow", impact: "The action was recorded in the workspace audit trail.", icon: "history" },
};

const financialStatementData: Record<string, { rows: [string, string][]; totalLabel: string; total: string; note: string }> = {
  "Income statement": { rows: [["Sales revenue", "₱412,680"], ["Cost of goods sold", "−₱241,940"], ["Gross profit", "₱170,740"], ["Operating expenses", "−₱68,420"], ["Taxes and adjustments", "−₱68,410"]], totalLabel: "Net income", total: "₱33,910", note: "Profit increased 9.6% compared with October." },
  "Balance sheet": { rows: [["Cash and cash equivalents", "₱84,250"], ["Inventory", "₱126,480"], ["Other current assets", "₱18,900"], ["Accounts payable", "−₱72,340"], ["Owner’s equity", "−₱123,380"]], totalLabel: "Balance check", total: "₱0 difference", note: "Assets equal liabilities plus equity." },
  "Cash flow": { rows: [["Opening cash", "₱71,790"], ["Cash from sales", "₱284,620"], ["Supplier payments", "−₱216,400"], ["Operating expenses", "−₱53,760"], ["Owner transactions", "−₱2,000"]], totalLabel: "Closing cash", total: "₱84,250", note: "Cash increased ₱12,460 during November." },
};

const ledgerAccounts: Record<string, { code: string; type: string; opening: string; rows: [string, string, string, string, string, string][] }> = {
  "Cash on hand": { code: "1010", type: "Current asset", opening: "₱61,915.50", rows: [["Nov 18","PR-1048","JE-1048","Morning POS sales","₱18,420.00","₱80,335.50"],["Nov 18","PR-1047","JE-1047","Coca-Cola restock","−₱6,850.00","₱73,485.50"],["Nov 17","PR-1046","JE-1046","Meralco electric bill","−₱4,235.50","₱69,250.00"],["Nov 17","PR-1045","JE-1045","Cash drawer top-up","₱2,000.00","₱71,250.00"]] },
  "Sales revenue": { code: "4010", type: "Revenue", opening: "₱394,260.00", rows: [["Nov 18","PR-1048","JE-1048","Morning POS sales","₱18,420.00","₱412,680.00"],["Nov 17","PR-1044","JE-1044","Evening POS sales","₱16,880.00","₱394,260.00"],["Nov 16","PR-1041","JE-1041","Daily POS sales","₱15,420.00","₱377,380.00"]] },
  "Inventory": { code: "1200", type: "Current asset", opening: "₱119,630.00", rows: [["Nov 18","PR-1047","JE-1047","Coca-Cola restock","₱6,850.00","₱126,480.00"],["Nov 16","PR-1040","JE-1040","Snack restock","₱4,220.00","₱119,630.00"],["Nov 15","PR-1038","JE-1038","Cost of goods sold","−₱8,940.00","₱115,410.00"]] },
  "Accounts payable": { code: "2010", type: "Current liability", opening: "₱65,490.00", rows: [["Nov 18","PR-1047","JE-1047","Coca-Cola restock","₱6,850.00","₱72,340.00"],["Nov 16","PR-1040","JE-1040","Snack restock","₱4,220.00","₱65,490.00"]] },
};

const productCatalog: Product[] = INITIAL_PRODUCTS;

function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid size-9 place-items-center rounded-xl bg-brand text-white shadow-sm shadow-brand/20">
        <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24" fill="none">
          <path d="M5 11v8h14v-8M3 8l2-4h14l2 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3 8c0 2 3 3 4.5 1.2C9 11 12 10 12 8c0 2 3 3 4.5 1.2C18 11 21 10 21 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <div>
        <p className={`text-[15px] font-bold tracking-tight ${dark ? "text-ink" : "text-white"}`}>SariLedger</p>
        <p className={`text-[10px] font-medium uppercase tracking-[0.16em] ${dark ? "text-muted" : "text-white/45"}`}>Retail books</p>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, note, onClick, tone = "green" }: { icon: IconName; label: string; value: string; note: string; onClick: () => void; tone?: "green" | "amber" | "blue" | "ink" }) {
  const toneClasses = {
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-sky-50 text-sky-700",
    ink: "bg-slate-100 text-slate-700",
  };
  return (
    <button onClick={onClick} className="group rounded-2xl border border-line bg-white p-4 text-left shadow-card transition hover:-translate-y-0.5 hover:border-brand/25 hover:shadow-lg lg:p-5">
      <div className="mb-4 flex items-start justify-between">
        <div className={`grid size-10 place-items-center rounded-xl ${toneClasses[tone]}`}><Icon name={icon} className="size-5" /></div>
        <span className="rounded-lg p-1.5 text-muted transition group-hover:bg-canvas group-hover:text-ink"><Icon name="more" className="size-4" /></span>
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">{label}</p>
      <p className="mt-1.5 text-2xl font-bold tracking-tight text-ink">{value}</p>
      <p className="mt-1 text-xs font-medium text-muted">{note}</p>
    </button>
  );
}

function Shortcut({ icon, label, description, onClick }: { icon: IconName; label: string; description: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 rounded-xl border border-line bg-white p-3 text-left transition hover:border-brand/30 hover:bg-emerald-50/50">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-canvas text-brand"><Icon name={icon} className="size-5" /></span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-ink">{label}</span>
        <span className="block truncate text-xs text-muted">{description}</span>
      </span>
      <Icon name="chevron" className="size-4 text-muted" />
    </button>
  );
}

function AnimatedActionButton({
  children,
  workingLabel = "Saving...",
  successLabel = "Saved",
  className,
  formId,
  onValidationError,
  onConfirm,
}: {
  children: ReactNode;
  workingLabel?: string;
  successLabel?: string;
  className: string;
  formId?: string;
  onValidationError?: (message: string) => void;
  onConfirm: () => void;
}) {
  const [phase, setPhase] = useState<"idle" | "working" | "success">("idle");

  const runAction = () => {
    if (phase !== "idle") return;
    if (formId) {
      const form = document.getElementById(formId) as HTMLFormElement | null;
      if (form) {
        form.querySelectorAll(".field-invalid").forEach((field) => field.classList.remove("field-invalid"));
        const controls = Array.from(form.elements) as Array<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
        const invalidControl = controls.find((control) => typeof control.checkValidity === "function" && !control.checkValidity());
        if (invalidControl) {
          invalidControl.classList.add("field-invalid");
          invalidControl.focus();
          onValidationError?.(invalidControl.dataset.validationMessage ?? "Complete this required field before continuing.");
          return;
        }
        onValidationError?.("");
      }
    }
    setPhase("working");
    window.setTimeout(() => {
      onConfirm();
      setPhase("success");
      window.setTimeout(() => setPhase("idle"), 1400);
    }, 650);
  };

  return (
    <button
      type="button"
      disabled={phase !== "idle"}
      onClick={runAction}
      className={`${className} min-w-28 transition-all duration-200 disabled:cursor-default ${phase === "working" ? "scale-[0.98] opacity-90" : ""} ${phase === "success" ? "animate-action-pop" : ""}`}
    >
      <span className="flex items-center justify-center gap-2">
        {phase === "working" && <span className="size-3.5 animate-spin rounded-full border-2 border-current border-r-transparent" />}
        {phase === "success" && <span className="grid size-4 place-items-center rounded-full bg-white/20"><Icon name="check" className="size-3 animate-check-draw" /></span>}
        <span>{phase === "working" ? workingLabel : phase === "success" ? successLabel : children}</span>
      </span>
    </button>
  );
}

function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div role="alert" className="mt-4 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-left">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-rose-100 text-rose-700"><Icon name="alert" className="size-4" /></span>
      <span>
        <span className="block text-xs font-bold text-rose-950">This form needs your attention</span>
        <span className="mt-0.5 block text-[11px] leading-relaxed text-rose-700">{message}</span>
      </span>
    </div>
  );
}

function SettingToggle({ enabled, label, description, onToggle }: { enabled: boolean; label: string; description: string; onToggle: () => void }) {
  return (
    <div className="flex items-center gap-4 py-4">
      <div className="min-w-0 flex-1"><p className="text-sm font-bold">{label}</p><p className="mt-1 text-xs leading-relaxed text-muted">{description}</p></div>
      <button type="button" aria-pressed={enabled} aria-label={`${enabled ? "Disable" : "Enable"} ${label}`} onClick={onToggle} className={`relative h-6 w-11 shrink-0 rounded-full transition ${enabled ? "bg-brand" : "bg-slate-200"}`}><span className={`absolute top-1 size-4 rounded-full bg-white shadow-sm transition ${enabled ? "left-6" : "left-1"}`} /></button>
    </div>
  );
}

type StoredCredential = {
  email: string;
  name: string;
  salt: string;
  passwordHash: string;
};

async function hashPassword(password: string, salt: string) {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function AuthScreen({ businessName, defaultEmail, onAuthenticated }: { businessName: string; defaultEmail: string; onAuthenticated: () => void }) {
  const storedCredentials = (() => {
    try {
      const savedAccounts = window.localStorage.getItem("sariledger-credentials");
      if (savedAccounts) return JSON.parse(savedAccounts) as StoredCredential[];
      const legacyAccount = window.localStorage.getItem("sariledger-credential");
      return legacyAccount ? [JSON.parse(legacyAccount) as StoredCredential] : [];
    } catch {
      return [];
    }
  })();
  const [isSetup, setIsSetup] = useState(storedCredentials.length === 0);
  const [name, setName] = useState("Ana Reyes");
  const [email, setEmail] = useState(storedCredentials[0]?.email ?? defaultEmail);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);
  const [attempts, setAttempts] = useState(() => Number(window.localStorage.getItem("sariledger-login-attempts") ?? 0));
  const [lockUntil, setLockUntil] = useState(() => Number(window.localStorage.getItem("sariledger-lock-until") ?? 0));
  const passwordChecks = [
    ["At least 10 characters", password.length >= 10],
    ["Upper and lowercase letters", /[A-Z]/.test(password) && /[a-z]/.test(password)],
    ["A number and symbol", /\d/.test(password) && /[^A-Za-z0-9]/.test(password)],
  ] as const;
  const isLocked = lockUntil > Date.now();

  const establishSession = (sessionEmail: string) => {
    const duration = remember ? 30 * 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000;
    window.localStorage.setItem("sariledger-session", JSON.stringify({ email: sessionEmail, expiresAt: Date.now() + duration }));
    window.localStorage.removeItem("sariledger-login-attempts");
    window.localStorage.removeItem("sariledger-lock-until");
    onAuthenticated();
  };

  const submit = async () => {
    setError("");
    if (isLocked) {
      setError("Sign-in is temporarily locked after repeated attempts. Try again in a few minutes.");
      return;
    }
    if (!email.trim() || !password) {
      setError("Enter your email and password to continue.");
      return;
    }
    if (isSetup && (!name.trim() || !passwordChecks.every(([, valid]) => valid) || password !== confirmPassword)) {
      setError(password !== confirmPassword ? "Passwords do not match." : "Complete the owner name and all password requirements.");
      return;
    }
    setWorking(true);
    await new Promise((resolve) => window.setTimeout(resolve, 500));
    if (isSetup) {
      if (storedCredentials.some((credential) => credential.email === email.trim().toLowerCase())) {
        setError("An account already uses this email. Choose Sign in to continue.");
        setWorking(false);
        return;
      }
      const saltBytes = window.crypto.getRandomValues(new Uint8Array(16));
      const salt = Array.from(saltBytes).map((byte) => byte.toString(16).padStart(2, "0")).join("");
      const credential: StoredCredential = { email: email.trim().toLowerCase(), name: name.trim(), salt, passwordHash: await hashPassword(password, salt) };
      window.localStorage.setItem("sariledger-credentials", JSON.stringify([...storedCredentials, credential]));
      establishSession(credential.email);
    } else {
      const matchingCredential = storedCredentials.find((credential) => credential.email === email.trim().toLowerCase());
      if (!matchingCredential) {
        setError("No account was found for this email. Check the address or choose Create account.");
        setWorking(false);
        return;
      }
      const candidateHash = await hashPassword(password, matchingCredential.salt);
      if (candidateHash === matchingCredential.passwordHash) {
        establishSession(matchingCredential.email);
      } else {
        const nextAttempts = attempts + 1;
        setAttempts(nextAttempts);
        window.localStorage.setItem("sariledger-login-attempts", String(nextAttempts));
        if (nextAttempts >= 5) {
          const until = Date.now() + 5 * 60 * 1000;
          setLockUntil(until);
          window.localStorage.setItem("sariledger-lock-until", String(until));
          setError("Too many unsuccessful attempts. Sign-in is locked for five minutes.");
        } else {
          setError(`Email or password is incorrect. ${5 - nextAttempts} attempts remaining.`);
        }
      }
    }
    setWorking(false);
  };

  return (
    <main className="grid min-h-screen bg-canvas lg:grid-cols-[minmax(0,1fr)_520px]">
      <section className="relative hidden overflow-hidden bg-sidebar p-12 text-white lg:flex lg:flex-col">
        <div className="absolute -top-24 -left-24 size-80 rounded-full bg-brand/20 blur-3xl" />
        <div className="relative"><Logo /><div className="mt-20 max-w-lg"><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Protected workspace</p><h1 className="mt-4 text-4xl font-bold leading-tight">Your store’s books,<br />kept private and accountable.</h1><p className="mt-5 max-w-md text-sm leading-relaxed text-white/55">Secure access protects journal entries, inventory records, financial reports, and the complete audit history for {businessName}.</p></div></div>
        <div className="relative mt-auto grid grid-cols-3 gap-3">{[["Encrypted","Password record"],["Timed","Secure session"],["Tracked","Audit activity"]].map(([value,label]) => <div key={value} className="rounded-2xl border border-white/8 bg-white/5 p-4"><Icon name="check" className="size-4 text-emerald-300" /><p className="mt-3 text-xs font-bold">{value}</p><p className="mt-1 text-[10px] text-white/40">{label}</p></div>)}</div>
      </section>
      <section className="flex items-center justify-center p-5 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden"><Logo dark /></div>
          <div className="rounded-3xl border border-line bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
            <div className="mb-6 grid grid-cols-2 rounded-xl bg-canvas p-1">
              <button onClick={() => { setIsSetup(false); setError(""); setPassword(""); setConfirmPassword(""); setEmail(storedCredentials[0]?.email ?? ""); }} className={`rounded-lg py-2.5 text-xs font-bold transition ${!isSetup ? "bg-white text-ink shadow-sm" : "text-muted"}`}>Sign in</button>
              <button onClick={() => { setIsSetup(true); setError(""); setPassword(""); setConfirmPassword(""); setEmail(""); }} className={`rounded-lg py-2.5 text-xs font-bold transition ${isSetup ? "bg-white text-ink shadow-sm" : "text-muted"}`}>Create account</button>
            </div>
            <span className="grid size-11 place-items-center rounded-2xl bg-emerald-50 text-brand"><Icon name={isSetup ? "settings" : "ledger"} className="size-5" /></span>
            <h2 className="mt-5 text-2xl font-bold tracking-tight">{isSetup ? "Secure your workspace" : "Welcome back"}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{isSetup ? "Create the owner account used to protect this SariLedger workspace." : `Sign in to continue to ${businessName}.`}</p>
            <div className="mt-6 space-y-4">
              {isSetup && <label className="block"><span className="mb-2 block text-xs font-bold">Owner name</span><input value={name} onChange={(event) => setName(event.target.value)} maxLength={80} className="h-12 w-full rounded-xl border border-line bg-canvas px-4 text-sm outline-none focus:border-brand" placeholder="Full name" /></label>}
              <label className="block"><span className="mb-2 block text-xs font-bold">Email address</span><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" maxLength={120} autoComplete="username" className="h-12 w-full rounded-xl border border-line bg-canvas px-4 text-sm outline-none focus:border-brand" placeholder="owner@store.com" /></label>
              <label className="block"><span className="mb-2 block text-xs font-bold">Password</span><div className="flex h-12 items-center rounded-xl border border-line bg-canvas px-4 focus-within:border-brand"><input value={password} onChange={(event) => setPassword(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void submit(); }} type={showPassword ? "text" : "password"} maxLength={72} autoComplete={isSetup ? "new-password" : "current-password"} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Enter your password" /><button onClick={() => setShowPassword((current) => !current)} className="text-[10px] font-bold text-brand">{showPassword ? "Hide" : "Show"}</button></div></label>
              {isSetup && <><label className="block"><span className="mb-2 block text-xs font-bold">Confirm password</span><input value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void submit(); }} type={showPassword ? "text" : "password"} maxLength={72} autoComplete="new-password" className="h-12 w-full rounded-xl border border-line bg-canvas px-4 text-sm outline-none focus:border-brand" placeholder="Repeat your password" /></label><div className="grid gap-2 sm:grid-cols-3">{passwordChecks.map(([label,valid]) => <div key={label} className={`flex items-center gap-1.5 text-[9px] font-semibold ${valid ? "text-emerald-700" : "text-muted"}`}><span className={`grid size-3.5 place-items-center rounded-full ${valid ? "bg-emerald-100" : "bg-slate-100"}`}>{valid && <Icon name="check" className="size-2.5" />}</span>{label}</div>)}</div></>}
              <label className="flex cursor-pointer items-center gap-2 text-xs text-muted"><input checked={remember} onChange={(event) => setRemember(event.target.checked)} type="checkbox" className="size-4 accent-emerald-600" />Keep me signed in on this device</label>
              {error && <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800"><Icon name="alert" className="size-4 shrink-0" />{error}</div>}
              <button disabled={working || isLocked} onClick={() => void submit()} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand text-sm font-bold text-white shadow-lg shadow-brand/15 transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60">{working && <span className="size-4 animate-spin rounded-full border-2 border-white border-r-transparent" />}{working ? isSetup ? "Securing workspace..." : "Signing in..." : isSetup ? "Create secure account" : "Sign in securely"}</button>
            </div>
            <div className="mt-6 flex items-center justify-center gap-2 border-t border-line pt-5 text-[10px] text-muted"><Icon name="check" className="size-3.5 text-brand" />Session protected with automatic expiration</div>
          </div>
          <p className="mt-5 text-center text-[10px] leading-relaxed text-muted">Only authorized team members should access financial and inventory records.</p>
        </div>
      </section>
    </main>
  );
}

function validateMeaningfulText(event: FormEvent<HTMLInputElement | HTMLTextAreaElement>) {
  const field = event.currentTarget;
  field.setCustomValidity(field.value.trim() ? "" : "Please enter text instead of spaces.");
}

const pageMeta: Record<string, { eyebrow: string; title: string; description: string }> = {
  "/pos": { eyebrow: "Sales & POS", title: "Sales register & POS", description: "Record daily customer transactions, compute change, update inventory, and issue official receipts." },
  "/debts": { eyebrow: "Credit & Accounts", title: "Debts & pending payments", description: "Track customer credit balances (pautang) and upcoming supplier bills." },
  "/supplier-orders": { eyebrow: "Procurement", title: "Supplier orders & restock", description: "Order from wholesale distributors and restock inventory directly." },
  "/receipts": { eyebrow: "Sales audit", title: "Customer receipts & sales slips", description: "Search, print, and audit customer official receipts and payment proof." },
  "/journal": { eyebrow: "Accounting", title: "General journal", description: "Review, filter, and manage every transaction recorded for Corner Market." },
  "/ledger": { eyebrow: "Accounting", title: "General ledger", description: "Review posted transactions by account, posting reference, and running balance." },
  "/trial-balance": { eyebrow: "Accounting control", title: "Trial balance", description: "Confirm that total debits and credits remain balanced for the selected period." },
  "/inventory": { eyebrow: "Store operations", title: "Inventory", description: "Track stock on hand, cost, and reorder levels across the store." },
  "/inventory/products": { eyebrow: "Inventory", title: "Products", description: "Browse every product, price, category, and current stock record." },
  "/inventory/stocks": { eyebrow: "Inventory control", title: "Stock levels", description: "Monitor quantities, reorder points, and products that need attention." },
  "/reports": { eyebrow: "Financial insights", title: "Reports", description: "Understand store performance and prepare accurate financial statements." },
  "/reports/products": { eyebrow: "Product report", title: "Product performance", description: "Compare product sales, revenue, stock health, and category contribution." },
  "/team": { eyebrow: "Administration", title: "Team access", description: "Manage staff roles, permissions, and accountability." },
  "/history": { eyebrow: "Accountability", title: "System history", description: "Review every recorded update, adjustment, and administrative action." },
  "/settings": { eyebrow: "Workspace", title: "Settings", description: "Configure business details, accounting rules, and integrations." },
  "/close": { eyebrow: "November close", title: "Accounting cycle checklist", description: "Complete every control before generating final statements." },
  "/inventory/variance": { eyebrow: "Correctness check", title: "Inventory variance review", description: "Investigate the difference between recorded sales and physical stock." },
  "/shift/close": { eyebrow: "Cash control", title: "Close today’s shift", description: "Confirm the drawer count and create the closing journal entry." },
  "/search": { eyebrow: "Workspace", title: "Search", description: "Find entries, products, suppliers, or reports." },
  "/notifications": { eyebrow: "Activity", title: "Notifications", description: "Review items that need your attention." },
  "/reports/cash": { eyebrow: "Report", title: "Cash position", description: "Monitor available cash across payment channels." },
  "/reports/sales": { eyebrow: "Report", title: "Sales summary", description: "Review sales performance by day and payment method." },
  "/reports/statements": { eyebrow: "Report", title: "Financial statements", description: "Review close controls and generate November’s financial statements." },
};

function BasicSectionPage({ pathname, navigate, activityLog, products, transactions }: { pathname: string; navigate: (path: string) => void; activityLog: ActivityRecord[]; products: Product[]; transactions: TransactionRecord[] }) {
  const section = pathname.startsWith("/inventory") ? "products" : pathname.slice(1);
  const titles: Record<string, [string, string]> = {
    journal: ["Record money", "Choose what happened in the store. SariLedger will guide the accounting."],
    products: ["Products and stock", "Find products, check quantities, and see what needs to be reordered."],
    reports: ["Money reports", "Choose a simple report to understand how the store is doing."],
    team: ["People", "See who can use the system and manage their access."],
    history: ["Activity", "Review important changes made in the system."],
  };
  const [title, description] = titles[section] || ["Section", "Manage your store records."];
  return (
    <div className="mx-auto max-w-5xl px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
      <button onClick={() => navigate("/")} className="mb-5 flex items-center gap-1.5 text-sm font-bold text-muted"><Icon name="chevron" className="size-4 rotate-180" />Back to Home</button>
      <section className="rounded-3xl bg-sidebar p-6 text-white shadow-xl sm:p-8"><p className="text-sm font-semibold text-emerald-300">Basic mode</p><h1 className="mt-2 text-3xl font-bold">{title}</h1><p className="mt-2 max-w-2xl text-base leading-relaxed text-white/60">{description}</p></section>

      {section === "journal" && <><section className="mt-5 grid gap-4 sm:grid-cols-3">{[["Record a sale","Customer paid by cash, GCash, or credit","cash","/pos","bg-emerald-50 text-emerald-700"],["Record a purchase","Stock arrived from a supplier","cart","/supplier-orders","bg-sky-50 text-sky-700"],["Record an expense","The store paid a bill or other cost","receipt","/journal/new?type=expense-entry","bg-amber-50 text-amber-700"]].map(([label,note,icon,path,tone]) => <button key={label} onClick={() => navigate(path)} className="flex min-h-40 flex-col items-start rounded-2xl border border-line bg-white p-5 text-left shadow-card transition hover:border-brand/30"><span className={`grid size-12 place-items-center rounded-2xl ${tone}`}><Icon name={icon as IconName} className="size-6" /></span><span className="mt-4 text-lg font-bold">{label}</span><span className="mt-1 text-sm leading-relaxed text-muted">{note}</span></button>)}</section><section className="mt-5 overflow-hidden rounded-2xl border border-line bg-white shadow-card"><div className="flex items-center justify-between border-b border-line p-5"><h2 className="text-lg font-bold">Recent records</h2><button onClick={() => navigate("/ledger")} className="flex items-center gap-1.5 text-sm font-bold text-brand">Ledger details <Icon name="arrow" className="size-4" /></button></div>{transactions.slice(0,3).map((item) => <button key={item.ref} onClick={() => navigate(`/journal/${item.ref}`)} className="flex w-full items-center gap-3 border-b border-line p-4 text-left last:border-0"><span className="grid size-11 place-items-center rounded-xl bg-canvas text-brand"><Icon name={item.icon as IconName} className="size-5" /></span><span className="flex-1"><span className="block text-base font-bold">{item.title}</span><span className="mt-1 block text-sm text-muted">{item.detail}</span></span><span className="text-base font-bold">{item.amount}</span><Icon name="chevron" className="size-5 text-muted" /></button>)}</section></>}

      {section === "products" && <><section className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-line bg-white p-5 shadow-card"><p className="text-sm text-muted">All products</p><p className="mt-2 text-2xl font-bold">{products.length}</p></div><button onClick={() => navigate("/inventory/stocks?filter=low")} className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-left shadow-card"><p className="text-sm text-amber-800">Need restocking</p><p className="mt-2 text-2xl font-bold text-amber-900">{products.filter((product) => product.stock <= product.reorder).length}</p></button><button onClick={() => navigate("/inventory/count/new")} className="col-span-2 flex items-center justify-center gap-2 rounded-2xl bg-brand p-5 text-base font-bold text-white sm:col-span-1"><Icon name="box" className="size-5" />Count stock</button></section><section className="mt-5 grid gap-3 sm:grid-cols-2">{products.map((product) => <button key={product.slug} onClick={() => navigate(`/inventory/products/${product.slug}`)} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4 text-left shadow-card"><span className="grid size-12 place-items-center rounded-xl bg-canvas text-brand"><Icon name="box" className="size-6" /></span><span className="min-w-0 flex-1"><span className="block truncate text-base font-bold">{product.name}</span><span className="mt-1 block text-sm text-muted">{product.stock} in stock · {product.price}</span></span><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${product.stock <= product.reorder ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{product.stock <= product.reorder ? "Low" : "Good"}</span></button>)}</section></>}

      {section === "reports" && <section className="mt-5 grid gap-4 sm:grid-cols-2">{[["Sales report","See how much the store sold","chart","/reports/sales","bg-sky-50 text-sky-700"],["Cash report","See available cash and GCash","wallet","/reports/cash","bg-emerald-50 text-emerald-700"],["Product report","See top products and low stock","box","/reports/products","bg-amber-50 text-amber-700"],["Financial statements","See profit, position, and cash flow","ledger","/reports/statements","bg-violet-50 text-violet-700"]].map(([label,note,icon,path,tone]) => <button key={label} onClick={() => navigate(path)} className="flex min-h-32 items-center gap-4 rounded-2xl border border-line bg-white p-5 text-left shadow-card transition hover:border-brand/30"><span className={`grid size-14 shrink-0 place-items-center rounded-2xl ${tone}`}><Icon name={icon as IconName} className="size-7" /></span><span className="flex-1"><span className="block text-lg font-bold">{label}</span><span className="mt-1 block text-sm leading-relaxed text-muted">{note}</span></span><Icon name="chevron" className="size-5 text-muted" /></button>)}</section>}

      {section === "team" && <section className="mt-5 grid gap-4 sm:grid-cols-2">{teamMembers.map((member) => <button key={member.slug} onClick={() => navigate(`/team/${member.slug}`)} className="flex items-center gap-4 rounded-2xl border border-line bg-white p-5 text-left shadow-card"><span className="grid size-12 place-items-center rounded-full bg-emerald-50 text-sm font-bold text-brand">{member.initials}</span><span className="flex-1"><span className="block text-lg font-bold">{member.name}</span><span className="mt-1 block text-sm text-muted">{member.role} · {member.access}</span></span><span className="text-sm font-bold text-brand">Manage</span></button>)}</section>}

      {section === "history" && <section className="mt-5 overflow-hidden rounded-2xl border border-line bg-white shadow-card"><div className="border-b border-line p-5"><h2 className="text-lg font-bold">Recent activity</h2><p className="mt-1 text-sm text-muted">Newest changes appear first.</p></div>{activityLog.slice(0,8).map((record) => <button key={record.id} onClick={() => navigate(`/history/${record.id}`)} className="flex w-full items-center gap-3 border-b border-line p-4 text-left last:border-0"><span className="grid size-11 place-items-center rounded-xl bg-canvas text-brand"><Icon name="history" className="size-5" /></span><span className="min-w-0 flex-1"><span className="block text-base font-bold">{record.action}</span><span className="mt-1 block text-sm text-muted">{record.actor} · {new Date(record.timestamp).toLocaleDateString()}</span></span><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">{record.category}</span><Icon name="chevron" className="size-5 text-muted" /></button>)}</section>}
    </div>
  );
}

function BasicPageGuide({ pathname, navigate }: { pathname: string; navigate: (path: string) => void }) {
  const [showSteps, setShowSteps] = useState(false);
  const section = pathname.startsWith("/journal") || pathname === "/ledger" || pathname === "/trial-balance"
    ? "accounting"
    : pathname.startsWith("/inventory")
      ? "inventory"
      : pathname.startsWith("/reports")
        ? "reports"
        : pathname.startsWith("/settings")
          ? "settings"
          : pathname.startsWith("/team")
            ? "team"
            : pathname.startsWith("/history")
              ? "history"
              : pathname === "/close"
                ? "close"
                : pathname.startsWith("/shift")
                  ? "shift"
                  : "workspace";
  const guides: Record<string, { intro: string; steps: string[]; links: [string, string, IconName][] }> = {
    accounting: { intro: "Record the transaction, check where it was posted, then confirm the books balance.", steps: ["Check the description, amount, and date.", "Review the debit and credit accounts.", "Save the record, then review its ledger posting."], links: [["Journal records", "/journal", "ledger"], ["Ledger details", "/ledger", "history"], ["Balance check", "/trial-balance", "check"]] },
    inventory: { intro: "Use these pages to understand a product, count stock, or fix a quantity difference.", steps: ["Choose the product or stock task.", "Check the recorded and physical quantities.", "Save the result so Inventory and History update together."], links: [["All products", "/inventory/products", "box"], ["Stock levels", "/inventory/stocks", "chart"], ["Product report", "/reports/products", "receipt"]] },
    reports: { intro: "Start with the summary, then open the report that answers your question.", steps: ["Choose the correct reporting period.", "Review totals and unusual changes.", "Open the supporting records or export the report."], links: [["All reports", "/reports", "chart"], ["Financial statements", "/reports/statements", "ledger"], ["Trial balance", "/trial-balance", "check"]] },
    settings: { intro: "Settings control how the whole workspace behaves. Saved changes are recorded in History.", steps: ["Choose the settings category.", "Review the current value before changing it.", "Save changes and confirm the success message."], links: [["Business settings", "/settings", "settings"], ["Accounting lock", "/settings/accounting/lock-date", "ledger"], ["Backups", "/settings/security/backups", "history"], ["Data export", "/settings/security/data-export", "receipt"]] },
    team: { intro: "Manage what each person can see and change without losing their audit history.", steps: ["Review the person’s role.", "Turn only the permissions they need on.", "Save changes or review their activity."], links: [["All people", "/team", "users"], ["Activity history", "/history", "history"], ["Security settings", "/settings?section=security", "settings"]] },
    history: { intro: "History explains who changed something, when it happened, and what part of the system was affected.", steps: ["Read the action and person responsible.", "Open the record for full context.", "Use the related section to review the affected data."], links: [["All activity", "/history", "history"], ["Journal records", "/journal", "ledger"], ["Inventory records", "/inventory/products", "box"]] },
    close: { intro: "Complete each accounting step in order before finalizing the selected month.", steps: ["Confirm journal entries are recorded and posted.", "Check the trial balance and review adjustments.", "Generate and export the financial statements."], links: [["Close checklist", "/close", "check"], ["Trial balance", "/trial-balance", "ledger"], ["Statements", "/reports/statements", "chart"]] },
    shift: { intro: "Compare expected cash with the drawer count, add a note, then close the shift.", steps: ["Check the expected and counted totals.", "Explain any difference in the closing note.", "Confirm the close to create the journal record."], links: [["Close shift", "/shift/close", "cash"], ["Cash report", "/reports/cash", "wallet"], ["Journal records", "/journal", "ledger"]] },
    workspace: { intro: "Use the related pages below to continue this task.", steps: ["Choose the information you need.", "Review the details shown.", "Use Back when the task is complete."], links: [["Home", "/", "grid"], ["Products", "/inventory/products", "box"], ["Reports", "/reports", "chart"]] },
  };
  const guide = guides[section];
  return (
    <section className="mb-5 overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50 shadow-sm">
      <div className="flex flex-col gap-4 p-4 sm:p-5">
        <div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-brand shadow-sm"><Icon name="spark" className="size-5" /></span><div className="min-w-0 flex-1"><p className="text-base font-bold text-emerald-950">Simple guide for this page</p><p className="mt-1 text-sm leading-relaxed text-emerald-800">{guide.intro}</p></div><button onClick={() => setShowSteps((current) => !current)} aria-expanded={showSteps} className="shrink-0 rounded-xl bg-white px-3 py-2 text-xs font-bold text-brand shadow-sm">{showSteps ? "Hide steps" : "Show steps"}</button></div>
        {showSteps && <div className="animate-search-results grid gap-2 border-t border-emerald-200 pt-4 sm:grid-cols-3">{guide.steps.map((step,index) => <div key={step} className="flex gap-2 rounded-xl bg-white/70 p-3"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand text-[10px] font-bold text-white">{index + 1}</span><p className="text-xs leading-relaxed text-emerald-950">{step}</p></div>)}</div>}
        <div className="flex max-w-full gap-2 overflow-x-auto border-t border-emerald-200 pt-4">{guide.links.map(([label,path,icon]) => <button key={`${label}-${path}`} onClick={() => navigate(path)} className="flex min-w-fit items-center gap-2 whitespace-nowrap rounded-xl bg-white px-4 py-3 text-sm font-bold text-ink shadow-sm transition hover:text-brand"><Icon name={icon} className="size-4 text-brand" />{label}<Icon name="chevron" className="size-3.5 text-muted" /></button>)}</div>
      </div>
    </section>
  );
}

function WorkspacePage({
  pathname,
  search,
  navigate,
  notify,
  activityLog,
  periods,
  selectedPeriod,
  onSelectPeriod,
  onUpdatePeriodCheck,
  businessProfile,
  onSaveBusiness,
  onSignOut,
  basicMode,
  products,
  categories,
  debts,
  pendingPayments,
  supplierOrders,
  receipts,
  storeTransactions,
  onOpenPos,
  onOpenAddProduct,
  onEditProduct,
  onViewReceipt,
  onAddDebt,
  onRecordDebtPayment,
  onAddPendingPayment,
  onSettlePayment,
  onCreateSupplierOrder,
  onMarkSupplierOrderReceived,
}: {
  pathname: string;
  search: string;
  navigate: (path: string) => void;
  notify: (message: string) => void;
  activityLog: ActivityRecord[];
  periods: AccountingPeriod[];
  selectedPeriod: AccountingPeriod;
  onSelectPeriod: (id: string) => void;
  onUpdatePeriodCheck: (index: number, complete: boolean) => void;
  businessProfile: BusinessProfile;
  onSaveBusiness: (profile: BusinessProfile) => void;
  onSignOut: () => void;
  basicMode: boolean;
  products: Product[];
  categories: string[];
  debts: CustomerDebt[];
  pendingPayments: PendingPayment[];
  supplierOrders: SupplierOrder[];
  receipts: Receipt[];
  storeTransactions: TransactionRecord[];
  onOpenPos: () => void;
  onOpenAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onViewReceipt: (receipt: Receipt) => void;
  onAddDebt: (debt: CustomerDebt) => void;
  onRecordDebtPayment: (debtId: string, amount: number, paymentMethod: string) => void;
  onAddPendingPayment: (payment: PendingPayment) => void;
  onSettlePayment: (paymentId: string, source: string) => void;
  onCreateSupplierOrder: (order: SupplierOrder) => void;
  onMarkSupplierOrderReceived: (orderId: string) => void;
}) {
  const isNewEntry = pathname === "/journal/new";
  const entryDetail = pathname.match(/^\/journal\/(JE-\d+)$/i)?.[1]?.toUpperCase();
  const memberSlug = pathname.match(/^\/team\/([^/]+)$/)?.[1];
  const teamMember = teamMembers.find((member) => member.slug === memberSlug);
  const activityId = pathname.match(/^\/history\/([^/]+)$/)?.[1];
  const activityRecord = activityLog.find((record) => record.id === activityId);
  const productSlug = pathname.match(/^\/inventory\/products\/([^/]+)$/)?.[1];
  const selectedProduct = products.find((product) => product.slug === productSlug);
  const compareReport = pathname.match(/^\/reports\/(cash|sales)\/compare$/)?.[1];
  const workflowMeta = pathname === "/inventory/count/new"
    ? { eyebrow: "Inventory control", title: "Start stock count", description: "Create a physical count session and reconcile it with recorded inventory." }
    : pathname === "/settings/accounting/lock-date"
      ? { eyebrow: "Accounting control", title: "Review lock date", description: "Control which accounting periods can be edited without owner approval." }
      : pathname === "/settings/security/backups"
        ? { eyebrow: "Security & data", title: "Workspace backups", description: "Create, review, and restore protected copies of business records." }
        : pathname === "/settings/security/data-export"
          ? { eyebrow: "Security & data", title: "Export business data", description: "Choose which records to include in a secure business-data export." }
          : compareReport
            ? { eyebrow: "Report comparison", title: `${compareReport === "cash" ? "Cash position" : "Sales"} comparison`, description: "Compare the selected reporting period with prior performance." }
            : null;
  const [permissionOverrides, setPermissionOverrides] = useState<Record<string, boolean>>({});
  const [accountActive, setAccountActive] = useState(true);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [historyQuery, setHistoryQuery] = useState(() => new URLSearchParams(search).get("member")?.replaceAll("-", " ") ?? "");
  const [historyCategory, setHistoryCategory] = useState("All activity");
  const [reportRange, setReportRange] = useState("This month");
  const [reportView, setReportView] = useState<"chart" | "table">("chart");
  const [statementTab, setStatementTab] = useState("Income statement");
  const [settingsTab, setSettingsTab] = useState("Business profile");
  const [businessDraft, setBusinessDraft] = useState<BusinessProfile>(businessProfile);
  const [ledgerAccount, setLedgerAccount] = useState("Cash on hand");
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [inventorySearch, setInventorySearch] = useState("");
  const [inventoryCategory, setInventoryCategory] = useState("All categories");
  const [settingToggles, setSettingToggles] = useState<Record<string, boolean>>({
    autoPostSales: true,
    stockAccounting: true,
    varianceAlerts: true,
    lowStockAlerts: true,
    approvalAlerts: true,
    dailySummary: false,
    twoFactor: true,
    gcash: true,
    pos: true,
  });
  const toggleSetting = (key: string) => setSettingToggles((current) => ({ ...current, [key]: !current[key] }));
  const periodProgress = Math.round((selectedPeriod.checks.filter(Boolean).length / selectedPeriod.checks.length) * 100);
  const statementsReady = selectedPeriod.checks[4];
  const productSuggestions = globalSearchQuery.trim()
    ? products
      .filter((product) => product.name.toLowerCase().startsWith(globalSearchQuery.trim().toLowerCase()))
      .slice(0, 6)
    : [];
  const setFormError = (formId: string, message: string) => setFormErrors((current) => ({ ...current, [formId]: message }));
  const filteredActivity = activityLog.filter((record) => {
    const matchesCategory = historyCategory === "All activity" || record.category === historyCategory;
    const matchesQuery = `${record.action} ${record.actor} ${record.category}`.toLowerCase().includes(historyQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });
  const meta = isNewEntry
    ? { eyebrow: "Journal", title: `Record ${new URLSearchParams(search).get("type") ?? "journal entry"}`, description: "Enter the transaction once. SariLedger will validate both sides before posting." }
    : entryDetail
      ? { eyebrow: "Journal entry", title: entryDetail, description: "Complete transaction record and audit history." }
      : teamMember
        ? { eyebrow: "Team member", title: teamMember.name, description: `Manage ${teamMember.name}’s role, access, security, and account activity.` }
        : activityRecord
          ? { eyebrow: `${activityRecord.category} record`, title: activityRecord.action, description: "Review the complete audit record and system context for this action." }
          : selectedProduct
            ? { eyebrow: selectedProduct.category, title: selectedProduct.name, description: `Product record, stock activity, and purchasing details for ${selectedProduct.sku}.` }
          : workflowMeta
            ? workflowMeta
            : pathname === "/close"
              ? { eyebrow: selectedPeriod.shortLabel, title: "Accounting cycle checklist", description: `Complete every control for ${selectedPeriod.label} before generating final statements.` }
              : pathname === "/reports/statements"
                ? { eyebrow: "Report", title: "Financial statements", description: `Review close controls and generate financial statements for ${selectedPeriod.label}.` }
                : pathname === "/journal"
                  ? { eyebrow: "Accounting", title: "General journal", description: `Review, filter, and manage every transaction recorded for ${businessProfile.name}.` }
      : pageMeta[pathname] ?? { eyebrow: "SariLedger", title: "Page not found", description: "This workspace directory does not exist." };

  const complete = (message: string, destination?: string) => {
    notify(message);
    if (destination) window.setTimeout(() => navigate(destination), 500);
  };
  const settingsReturnPath = new URLSearchParams(search).get("from");
  const backPath = pathname === "/settings" && settingsReturnPath
    ? settingsReturnPath
    : pathname.startsWith("/reports/")
    ? compareReport ? `/reports/${compareReport}` : "/reports"
    : pathname.startsWith("/journal/")
      ? "/journal"
    : selectedProduct
      ? "/inventory/products"
    : pathname.startsWith("/inventory/")
      ? "/inventory"
      : pathname.startsWith("/settings/")
        ? `/settings${search}`
      : pathname.startsWith("/team/")
        ? "/team"
        : pathname.startsWith("/history/")
          ? "/history"
        : pathname === "/ledger" || pathname === "/trial-balance"
          ? "/journal"
        : "/";
  const focusedLayout = isNewEntry
    || Boolean(entryDetail)
    || Boolean(activityRecord)
    || Boolean(selectedProduct)
    || Boolean(workflowMeta)
    || ["/settings", "/search", "/notifications", "/inventory/variance", "/shift/close", "/close"].includes(pathname);
  const pageWidth = pathname === "/shift/close" ? "max-w-3xl" : focusedLayout ? "max-w-5xl" : "max-w-[1180px]";
  const isCashReport = pathname === "/reports/cash";
  const reportMetrics = isCashReport
    ? [["Cash on hand", "₱24,860", "29.5% of total"], ["GCash wallet", "₱31,420", "37.3% of total"], ["Bank account", "₱27,970", "33.2% of total"]]
    : [["Gross sales", "₱412,680", "+8.4% vs October"], ["Average transaction", "₱129.80", "+₱8.20 this month"], ["Transactions", "3,179", "142 recorded today"]];
  const reportRows = isCashReport
    ? [["Morning POS sales", "Cash inflow", "+₱18,420", "Today, 10:32 AM"], ["Coca-Cola restock", "Supplier payment", "−₱6,850", "Today, 9:14 AM"], ["Cash drawer top-up", "Owner contribution", "+₱2,000", "Yesterday, 8:02 AM"]]
    : [["Bottled water 500ml", "38 units", "₱1,140", "Cash & GCash"], ["Instant noodles", "31 units", "₱930", "Cash"], ["3-in-1 coffee", "27 units", "₱675", "GCash"]];
  const currentLedger = ledgerAccounts[ledgerAccount];
  const inventoryDirectory = ["/inventory", "/inventory/products", "/inventory/stocks"].includes(pathname);
  const inventoryView = pathname === "/inventory/stocks" ? "stocks" : "products";
  const lowStockProducts = products.filter((product) => product.stock <= product.reorder);
  const totalStockUnits = products.reduce((total, product) => total + product.stock, 0);
  const displayedProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      product.sku.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      product.category.toLowerCase().includes(inventorySearch.toLowerCase());
    const matchesCat = inventoryCategory === "All categories" || product.category === inventoryCategory;
    return matchesSearch && matchesCat;
  });
  const basicSectionRoute = ["/journal", "/inventory", "/inventory/products", "/inventory/stocks", "/reports", "/team", "/history"].includes(pathname);

  if (basicMode && basicSectionRoute) {
    return <BasicSectionPage pathname={pathname} navigate={navigate} activityLog={activityLog} products={products} transactions={storeTransactions} />;
  }

  return (
    <div className={`workspace-page mx-auto w-full ${pageWidth} px-4 py-6 sm:px-6 lg:px-8 lg:py-10`}>
      <button onClick={() => navigate(backPath)} className="mb-5 flex items-center gap-1 text-xs font-bold text-muted transition hover:text-brand">
        <Icon name="chevron" className="size-3 rotate-180" /> Back
      </button>
      {basicMode && <BasicPageGuide pathname={pathname} navigate={navigate} />}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand">{meta.eyebrow}</p><h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{meta.title}</h1><p className="mt-1 max-w-2xl text-sm text-muted">{meta.description}</p></div>
        {pathname === "/journal" && <button onClick={() => navigate("/journal/new?type=journal-entry")} className="flex items-center gap-2 rounded-xl bg-brand px-4 py-3 text-xs font-bold text-white"><Icon name="plus" className="size-4" />New journal entry</button>}
        {inventoryDirectory && (
          <div className="flex items-center gap-2">
            <button onClick={onOpenAddProduct} className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-brand-dark">
              <Icon name="plus" className="size-4" />Add product
            </button>
            <button onClick={() => navigate("/inventory/count/new")} className="flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-xs font-bold text-ink shadow-sm transition hover:bg-canvas">
              <Icon name="box" className="size-4" />Start stock count
            </button>
          </div>
        )}
        {pathname === "/pos" && (
          <button onClick={onOpenPos} className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-brand-dark">
            <Icon name="cash" className="size-4" />Launch POS Register
          </button>
        )}
        {pathname === "/receipts" && (
          <button onClick={onOpenPos} className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-brand-dark">
            <Icon name="cash" className="size-4" />Record sale / POS
          </button>
        )}
        {pathname === "/history" && <AnimatedActionButton onConfirm={() => complete("System history exported")} workingLabel="Preparing..." successLabel="Exported" className="rounded-xl border border-line bg-white px-4 py-3 text-xs font-bold text-ink"><span className="flex items-center gap-2"><Icon name="receipt" className="size-4" />Export history</span></AnimatedActionButton>}
      </div>

      {["/journal", "/ledger", "/trial-balance"].includes(pathname) && (
        <nav className="mt-6 flex max-w-full gap-1 overflow-x-auto rounded-xl border border-line bg-white p-1 shadow-card">
          {[["Journal entries","/journal","ledger"],["Ledger posting","/ledger","history"],["Trial balance","/trial-balance","check"]].map(([label,path,icon]) => <button key={path} onClick={() => navigate(path)} className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-xs font-bold transition ${pathname === path ? "bg-brand text-white" : "text-muted hover:bg-canvas hover:text-ink"}`}><Icon name={icon as IconName} className="size-4" />{label}</button>)}
        </nav>
      )}

      {isNewEntry && (
        <form noValidate id="journal-entry-form" onSubmit={(event) => event.preventDefault()} className="mt-6 w-full rounded-2xl border border-line bg-white p-5 shadow-card sm:p-7">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block sm:col-span-2"><span className="mb-2 flex justify-between text-xs font-bold"><span>Description</span><span className="font-medium text-muted">Required · max 120</span></span><input autoFocus required maxLength={120} data-validation-message="Add a short description of this transaction." onInput={validateMeaningfulText} className="h-12 w-full rounded-xl border border-line bg-canvas px-4 text-sm outline-none focus:border-brand" placeholder="e.g. Afternoon cash sales" /></label>
            <label className="block"><span className="mb-2 block text-xs font-bold">Debit account</span><select className="h-12 w-full rounded-xl border border-line bg-canvas px-3 text-sm outline-none"><option>Cash on hand</option><option>Inventory</option><option>Utilities expense</option></select></label>
            <label className="block"><span className="mb-2 block text-xs font-bold">Credit account</span><select className="h-12 w-full rounded-xl border border-line bg-canvas px-3 text-sm outline-none"><option>Sales revenue</option><option>Accounts payable</option><option>Owner's capital</option></select></label>
            <label className="block"><span className="mb-2 block text-xs font-bold">Amount</span><div className="flex h-12 items-center rounded-xl border border-line bg-canvas px-3"><span className="mr-2 text-sm font-bold text-muted">₱</span><input required maxLength={12} data-validation-message="Enter an amount greater than zero with up to two decimal places." pattern="^(?!0+(?:\.0{1,2})?$)\d+(?:\.\d{1,2})?$" title="Enter an amount greater than zero with up to two decimal places." className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none" inputMode="decimal" placeholder="0.00" /></div></label>
            <label className="block"><span className="mb-2 block text-xs font-bold">Transaction date</span><input required data-validation-message="Choose the date when this transaction occurred." type="date" defaultValue="2025-11-18" className="h-12 w-full rounded-xl border border-line bg-canvas px-3 text-sm outline-none" /></label>
          </div>
          <div className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-800"><Icon name="check" className="size-4" />Debit and credit totals will be checked before posting.</div>
          <FormError message={formErrors["journal-entry-form"]} />
          <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => navigate("/journal")} className="rounded-xl border border-line px-5 py-3 text-xs font-bold">Cancel</button><AnimatedActionButton formId="journal-entry-form" onValidationError={(message) => setFormError("journal-entry-form", message)} onConfirm={() => { onUpdatePeriodCheck(0, true); complete("Journal entry saved and queued for review", "/journal"); }} successLabel="Entry saved" className="rounded-xl bg-brand px-5 py-3 text-xs font-bold text-white">Save entry</AnimatedActionButton></div>
        </form>
      )}

      {(pathname === "/journal" || entryDetail) && !isNewEntry && (
        <section className="mt-6 overflow-hidden rounded-2xl border border-line bg-white shadow-card">
          {entryDetail ? (
            <div className="p-5 sm:p-7">
              <div className="grid gap-4 sm:grid-cols-3"><div className="rounded-xl bg-canvas p-4"><p className="text-[10px] font-bold uppercase text-muted">Status</p><p className="mt-2 text-sm font-bold text-emerald-700">Posted</p></div><div className="rounded-xl bg-canvas p-4"><p className="text-[10px] font-bold uppercase text-muted">Amount</p><p className="mt-2 text-sm font-bold">₱18,420.00</p></div><div className="rounded-xl bg-canvas p-4"><p className="text-[10px] font-bold uppercase text-muted">Created by</p><p className="mt-2 text-sm font-bold">Ana Reyes</p></div></div>
              <div className="mt-6 border-t border-line pt-5"><h2 className="text-sm font-bold">Account lines</h2><div className="mt-3 grid grid-cols-3 rounded-xl bg-canvas p-4 text-xs"><span className="font-semibold">Cash & GCash</span><span className="text-right font-bold">Debit ₱18,420</span><span className="text-right text-muted">Credit —</span></div><div className="mt-2 grid grid-cols-3 rounded-xl bg-canvas p-4 text-xs"><span className="font-semibold">Sales revenue</span><span className="text-right text-muted">Debit —</span><span className="text-right font-bold">Credit ₱18,420</span></div></div>
              <div className="mt-6 flex flex-wrap gap-3"><button onClick={() => { setLedgerAccount("Cash on hand"); navigate("/ledger"); }} className="flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-xs font-bold text-white">View posting PR-1048 <Icon name="arrow" className="size-3.5" /></button><AnimatedActionButton onConfirm={() => complete("Entry exported as PDF")} workingLabel="Preparing..." successLabel="Downloaded" className="rounded-xl border border-line px-5 py-3 text-xs font-bold">Export entry</AnimatedActionButton></div>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row"><input maxLength={80} className="h-10 flex-1 rounded-xl bg-canvas px-4 text-xs outline-none" placeholder="Search entries..." /><select className="h-10 rounded-xl border border-line px-3 text-xs font-semibold"><option>All statuses</option><option>Posted</option><option>For review</option></select></div>
              {storeTransactions.map((item) => <button key={item.ref} onClick={() => navigate(`/journal/${item.ref}`)} className="flex w-full items-center gap-3 border-b border-line p-4 text-left last:border-0 hover:bg-canvas"><span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-brand"><Icon name={item.icon as IconName} className="size-5" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-bold">{item.title}</span><span className="block text-xs text-muted">{item.ref} · {item.detail}</span></span><span className="text-right"><span className="block text-sm font-bold">{item.amount}</span><span className="text-[10px] text-muted">{item.status}</span></span><Icon name="chevron" className="size-4 text-muted" /></button>)}
            </>
          )}
        </section>
      )}

      {pathname === "/ledger" && (
        <div className="mt-5 space-y-5">
          <section className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-4 shadow-card sm:flex-row sm:items-end">
            <label className="block flex-1"><span className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-muted">Ledger account</span><select value={ledgerAccount} onChange={(event) => setLedgerAccount(event.target.value)} className="h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm font-bold">{Object.keys(ledgerAccounts).map((account) => <option key={account}>{account}</option>)}</select></label>
            <label className="block sm:w-52"><span className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-muted">Accounting period</span><select value={selectedPeriod.id} onChange={(event) => onSelectPeriod(event.target.value)} className="h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm font-bold">{periods.map((period) => <option key={period.id} value={period.id}>{period.label}</option>)}</select></label>
            <div className="flex gap-2"><AnimatedActionButton onConfirm={() => { onUpdatePeriodCheck(1, true); complete(`${selectedPeriod.label} reviewed entries posted to ledger`); }} workingLabel="Posting..." successLabel="Entries posted" className="h-11 rounded-xl bg-brand px-4 text-xs font-bold text-white">Post reviewed entries</AnimatedActionButton><AnimatedActionButton onConfirm={() => complete(`${ledgerAccount} ledger exported`)} workingLabel="Preparing..." successLabel="Exported" className="h-11 rounded-xl border border-line px-4 text-xs font-bold">Export ledger</AnimatedActionButton></div>
          </section>
          <section className="grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-line bg-white p-4 shadow-card"><p className="text-[10px] font-bold uppercase tracking-wider text-muted">Account code</p><p className="mt-2 text-xl font-bold">{currentLedger.code}</p></div><div className="rounded-2xl border border-line bg-white p-4 shadow-card"><p className="text-[10px] font-bold uppercase tracking-wider text-muted">Account type</p><p className="mt-2 text-xl font-bold">{currentLedger.type}</p></div><div className="rounded-2xl bg-sidebar p-4 text-white shadow-card"><p className="text-[10px] font-bold uppercase tracking-wider text-white/45">Current balance</p><p className="mt-2 text-xl font-bold">{currentLedger.rows[0]?.[5] ?? currentLedger.opening}</p></div></section>
          <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
            <div className="flex items-center justify-between border-b border-line p-5"><div><h2 className="text-sm font-bold">{ledgerAccount}</h2><p className="mt-1 text-xs text-muted">{selectedPeriod.label} · Opening balance {currentLedger.opening}</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700">Posted entries only</span></div>
            <div className="overflow-x-auto"><div className="min-w-[760px]"><div className="grid grid-cols-[80px_90px_90px_1fr_120px_130px] bg-canvas px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-muted"><span>Date</span><span>PR no.</span><span>Journal ref.</span><span>Description</span><span className="text-right">Movement</span><span className="text-right">Running balance</span></div>{currentLedger.rows.map(([date,postingRef,journalRef,description,movement,balance]) => <button key={postingRef} onClick={() => navigate(`/journal/${journalRef}`)} className="grid w-full grid-cols-[80px_90px_90px_1fr_120px_130px] items-center border-t border-line px-5 py-4 text-left text-xs transition hover:bg-canvas"><span className="text-muted">{date}</span><span className="font-bold text-brand">{postingRef}</span><span className="font-semibold">{journalRef}</span><span>{description}</span><span className={`text-right font-semibold ${movement.startsWith("−") ? "text-rose-700" : "text-emerald-700"}`}>{movement}</span><span className="text-right font-bold tabular-nums">{balance}</span></button>)}</div></div>
          </section>
        </div>
      )}

      {pathname === "/trial-balance" && (
        <div className="mt-5 space-y-5">
          <section className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-4 shadow-card sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-emerald-50 text-brand"><Icon name="check" className="size-5" /></span><div><p className="text-sm font-bold">Books are balanced</p><p className="mt-1 text-xs text-muted">Debits and credits agree for {selectedPeriod.label}.</p></div></div><div className="flex gap-2"><select value={selectedPeriod.id} onChange={(event) => onSelectPeriod(event.target.value)} className="h-10 rounded-xl border border-line bg-canvas px-3 text-xs font-bold">{periods.map((period) => <option key={period.id} value={period.id}>{period.label}</option>)}</select><AnimatedActionButton onConfirm={() => complete(`${selectedPeriod.label} trial balance exported`)} workingLabel="Preparing..." successLabel="Exported" className="h-10 rounded-xl border border-line px-3 text-xs font-bold">Export</AnimatedActionButton></div></section>
          <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
            <div className="grid grid-cols-[90px_1fr_130px_130px] bg-canvas px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-muted"><span>Account</span><span>Name</span><span className="text-right">Debit</span><span className="text-right">Credit</span></div>
            {[["1010","Cash on hand","₱84,250.00","—"],["1100","GCash receivable","₱31,420.00","—"],["1150","Accounts receivable","₱32,000.00","—"],["1200","Inventory","₱126,480.00","—"],["1500","Store equipment","₱42,800.00","—"],["2010","Accounts payable","—","₱72,340.00"],["3010","Owner’s capital","—","₱123,380.00"],["4010","Sales revenue","—","₱412,680.00"],["5010","Cost of goods sold","₱241,940.00","—"],["6010","Operating expenses","₱68,420.00","—"],["2100","Taxes payable","—","₱18,910.00"]].map(([code,name,debit,credit]) => <button key={code} onClick={() => ledgerAccounts[name] && (setLedgerAccount(name), navigate("/ledger"))} className={`grid w-full grid-cols-[90px_1fr_130px_130px] border-t border-line px-5 py-3.5 text-left text-xs ${ledgerAccounts[name] ? "transition hover:bg-canvas" : "cursor-default"}`}><span className="font-bold text-muted">{code}</span><span className="font-semibold">{name}</span><span className="text-right tabular-nums">{debit}</span><span className="text-right tabular-nums">{credit}</span></button>)}
            <div className="grid grid-cols-[90px_1fr_130px_130px] border-t-2 border-sidebar bg-emerald-50 px-5 py-4 text-sm font-bold"><span /><span>Totals</span><span className="text-right tabular-nums">₱627,310.00</span><span className="text-right tabular-nums">₱627,310.00</span></div>
          </section>
          <div className="grid gap-4 lg:grid-cols-[1fr_300px]"><section className="rounded-2xl border border-line bg-white p-5 shadow-card"><h2 className="text-sm font-bold">Correctness checks</h2><div className="mt-4 grid gap-3 sm:grid-cols-3">{[["Debit / credit difference","₱0.00"],["Unposted entries","0"],["Accounts reviewed","11 of 11"]].map(([label,value]) => <div key={label} className="rounded-xl bg-canvas p-3"><p className="text-[10px] text-muted">{label}</p><p className="mt-1 text-sm font-bold text-emerald-700">{value}</p></div>)}</div></section><aside className="rounded-2xl bg-sidebar p-5 text-white"><p className="text-[10px] font-bold uppercase tracking-wider text-white/45">Next step</p><p className="mt-2 text-sm font-bold">Prepare financial statements</p><p className="mt-1 text-xs leading-relaxed text-white/55">The balanced totals are ready to flow into reports.</p><button onClick={() => { onUpdatePeriodCheck(2, true); navigate("/reports/statements"); }} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-xs font-bold text-sidebar">Open statements <Icon name="arrow" className="size-3.5" /></button></aside></div>
        </div>
      )}

      {inventoryDirectory && (
        <div className="mt-6 space-y-5">
          <nav className="flex w-fit rounded-xl border border-line bg-white p-1 shadow-card">
            <button onClick={() => navigate("/inventory/products")} className={`rounded-lg px-4 py-2.5 text-xs font-bold ${inventoryView === "products" ? "bg-brand text-white" : "text-muted"}`}>Products</button>
            <button onClick={() => navigate("/inventory/stocks")} className={`rounded-lg px-4 py-2.5 text-xs font-bold ${inventoryView === "stocks" ? "bg-brand text-white" : "text-muted"}`}>Stock levels</button>
          </nav>
          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
              <p className="text-[10px] font-bold uppercase text-muted">Products</p>
              <p className="mt-2 text-xl font-bold">{products.length}</p>
            </div>
            <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
              <p className="text-[10px] font-bold uppercase text-muted">Units on hand</p>
              <p className="mt-2 text-xl font-bold">{totalStockUnits}</p>
            </div>
            <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
              <p className="text-[10px] font-bold uppercase text-muted">Low stock</p>
              <p className="mt-2 text-xl font-bold text-amber-700">{lowStockProducts.length}</p>
            </div>
            <button onClick={() => navigate("/reports/products")} className="rounded-2xl bg-sidebar p-4 text-left text-white shadow-card">
              <p className="text-[10px] font-bold uppercase text-white/45">Product report</p>
              <p className="mt-2 flex items-center gap-2 text-sm font-bold">View performance <Icon name="arrow" className="size-3.5" /></p>
            </button>
          </section>
          <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
            <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center">
              <div className="flex h-10 flex-1 items-center gap-2 rounded-xl bg-canvas px-3 focus-within:border-brand">
                <Icon name="search" className="size-4 text-muted" />
                <input
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  maxLength={80}
                  className="min-w-0 flex-1 bg-transparent text-xs outline-none"
                  placeholder="Search products by name, SKU, or category..."
                />
                {inventorySearch && (
                  <button onClick={() => setInventorySearch("")} className="text-xs text-muted hover:text-ink">✕</button>
                )}
              </div>
              <select
                value={inventoryCategory}
                onChange={(e) => setInventoryCategory(e.target.value)}
                className="h-10 rounded-xl border border-line bg-white px-3 text-xs font-semibold outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <button
                onClick={onOpenAddProduct}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-brand-dark"
              >
                <Icon name="plus" className="size-3.5" />
                Add Product
              </button>
            </div>

            {displayedProducts.length === 0 ? (
              <div className="p-12 text-center text-muted">
                <Icon name="box" className="mx-auto size-8 text-slate-300" />
                <p className="mt-2 text-sm font-bold text-ink">No matching products</p>
                <p className="mt-1 text-xs">Try selecting a different category or clearing the search.</p>
                <button
                  onClick={() => { setInventorySearch(""); setInventoryCategory("All categories"); }}
                  className="mt-3 rounded-lg border border-line px-3 py-1.5 text-xs font-bold text-brand"
                >
                  Clear filters
                </button>
              </div>
            ) : inventoryView === "products" ? (
              <div className="divide-y divide-line">
                {displayedProducts.map((product) => (
                  <div
                    key={product.slug}
                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between transition hover:bg-canvas/50"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-brand">
                        <Icon name="box" className="size-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <button
                          onClick={() => navigate(`/inventory/products/${product.slug}`)}
                          className="block truncate text-sm font-bold text-ink hover:text-brand transition text-left"
                        >
                          {product.name}
                        </button>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-muted">
                          <span className="font-mono">{product.sku}</span>
                          <span>·</span>
                          <span className="rounded bg-canvas px-1.5 py-0.5 font-bold text-ink text-[10px]">
                            {product.category}
                          </span>
                          <span>·</span>
                          <span>{product.stock} in stock</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 border-t border-line/60 pt-2 sm:border-0 sm:pt-0">
                      <div className="text-right">
                        <p className="text-sm font-extrabold text-ink">{product.price}</p>
                        {product.costPrice && (
                          <p className="text-[10px] text-muted">Cost: {product.costPrice}</p>
                        )}
                      </div>

                      <span className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${
                        product.stock <= product.reorder ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
                      }`}>
                        {product.stock <= product.reorder ? "Low stock" : "Healthy"}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEditProduct(product)}
                          className="rounded-xl border border-line bg-white px-3 py-1.5 text-xs font-bold text-ink shadow-2xs hover:border-brand/40 hover:text-brand transition"
                        >
                          Edit Price
                        </button>
                        <button
                          onClick={() => navigate(`/inventory/products/${product.slug}`)}
                          className="rounded-xl p-1.5 text-muted hover:bg-canvas hover:text-ink"
                        >
                          <Icon name="chevron" className="size-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-line">
                {displayedProducts.map((product) => {
                  const percent = Math.min(100, Math.round((product.stock / Math.max(product.reorder * 2, 1)) * 100));
                  return (
                    <div key={product.slug} className="grid grid-cols-[1fr_70px_80px] items-center gap-3 p-4 sm:grid-cols-[1fr_90px_90px_150px_auto] sm:px-5">
                      <button onClick={() => navigate(`/inventory/products/${product.slug}`)} className="min-w-0 text-left">
                        <span className="block truncate text-sm font-bold hover:text-brand">{product.name}</span>
                        <span className="mt-0.5 block text-[10px] text-muted">{product.sku} · {product.price}</span>
                      </button>
                      <span className={`text-center text-sm font-bold ${product.stock <= product.reorder ? "text-amber-700" : ""}`}>{product.stock}</span>
                      <span className="text-center text-xs text-muted">{product.reorder}</span>
                      <span className="hidden sm:block">
                        <span className="block h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <span className={`block h-full rounded-full ${product.stock <= product.reorder ? "bg-amber-400" : "bg-brand"}`} style={{ width: `${percent}%` }} />
                        </span>
                        <span className="mt-1 block text-right text-[9px] text-muted">{product.stock <= product.reorder ? "Reorder needed" : "Stock healthy"}</span>
                      </span>
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => onEditProduct(product)} className="rounded-lg border border-line px-2.5 py-1 text-[11px] font-bold text-ink hover:text-brand">Edit Price</button>
                        <button onClick={() => navigate("/inventory/count/new")} className="text-[10px] font-bold text-brand">Count</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}

      {selectedProduct && (
        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-5">
            <section className="rounded-2xl border border-line bg-white p-5 shadow-card sm:p-7">
              <div className="flex items-start gap-4">
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-brand"><Icon name="box" className="size-7" /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold">{selectedProduct.name}</h2>
                    <span className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${selectedProduct.stock <= selectedProduct.reorder ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{selectedProduct.stock <= selectedProduct.reorder ? "Low stock" : "In stock"}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted">{selectedProduct.sku} · {selectedProduct.category}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => onEditProduct(selectedProduct)} className="rounded-xl bg-brand px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-brand-dark">Edit Price & Info</button>
                  <button onClick={() => navigate("/inventory/count/new")} className="rounded-xl border border-line px-3 py-2 text-xs font-bold">Count stock</button>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ["On hand", `${selectedProduct.stock} units`],
                  ["Reorder point", `${selectedProduct.reorder} units`],
                  ["Selling price", selectedProduct.price],
                  ["Cost price", selectedProduct.costPrice || "—"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-canvas p-3">
                    <p className="text-[10px] text-muted">{label}</p>
                    <p className="mt-1 text-sm font-bold">{value}</p>
                  </div>
                ))}
              </div>
            </section>
            <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
              <div className="flex items-center justify-between border-b border-line p-5">
                <div><h2 className="text-sm font-bold">Recent stock activity</h2><p className="mt-1 text-xs text-muted">Purchases, sales, counts, and adjustments</p></div>
                <button onClick={() => navigate("/history")} className="text-xs font-bold text-brand">View history</button>
              </div>
              {[["Sale", "−2 units", "Today, 10:32 AM"], ["Physical count", "48 units confirmed", "Yesterday, 5:48 PM"], ["Supplier delivery", "+24 units", "Nov 15, 9:20 AM"]].map(([event, quantity, time]) => (
                <div key={`${event}-${time}`} className="grid grid-cols-[1fr_100px_120px] border-b border-line p-4 text-xs last:border-0">
                  <span className="font-bold">{event}</span>
                  <span className="text-right font-semibold">{quantity}</span>
                  <span className="text-right text-muted">{time}</span>
                </div>
              ))}
            </section>
          </div>
          <aside className="space-y-5">
            <section className="rounded-2xl bg-sidebar p-5 text-white">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/45">Stock health</p>
              <p className="mt-2 text-lg font-bold">{selectedProduct.stock <= selectedProduct.reorder ? "Reorder recommended" : "Healthy stock level"}</p>
              <p className="mt-2 text-xs leading-relaxed text-white/55">{selectedProduct.stock <= selectedProduct.reorder ? `Current stock is below the ${selectedProduct.reorder}-unit reorder point.` : `${selectedProduct.stock - selectedProduct.reorder} units available above the reorder point.`}</p>
              <button onClick={() => onEditProduct(selectedProduct)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-xs font-bold text-sidebar">Update Product Price <Icon name="arrow" className="size-3.5" /></button>
            </section>
            <section className="rounded-2xl border border-line bg-white p-5 shadow-card">
              <h2 className="text-sm font-bold">Supplier Ordering</h2>
              <p className="mt-3 text-xs font-bold">Davao Wholesale Trading</p>
              <p className="mt-1 text-[10px] text-muted">Direct wholesale procurement</p>
              <button onClick={() => navigate("/supplier-orders")} className="mt-4 w-full rounded-xl border border-line py-2.5 text-xs font-bold hover:border-brand/30 hover:text-brand transition">
                Create purchase order
              </button>
            </section>
          </aside>
        </div>
      )}

      {pathname === "/pos" && (
        <div className="mt-6 space-y-6">
          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Receipts Issued</p>
              <p className="mt-2 text-2xl font-bold text-ink">{receipts.length}</p>
              <p className="mt-1 text-[11px] text-muted">Sales slips recorded</p>
            </div>
            <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Total Sales Volume</p>
              <p className="mt-2 text-2xl font-extrabold text-emerald-700">
                ₱{receipts.reduce((sum, r) => sum + r.total, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
              <p className="mt-1 text-[11px] text-muted">Gross recorded sales</p>
            </div>
            <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Pending Customer Debts</p>
              <p className="mt-2 text-2xl font-bold text-amber-700">
                ₱{debts.filter((d) => d.status !== "Settled").reduce((sum, d) => sum + (d.amount - d.paidAmount), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
              <p className="mt-1 text-[11px] text-muted">{debts.filter((d) => d.status !== "Settled").length} customers with utang</p>
            </div>
            <div className="rounded-2xl bg-sidebar p-4 text-white shadow-card">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/45">Quick POS Actions</p>
              <button
                onClick={onOpenPos}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-2 text-xs font-bold text-white shadow transition hover:bg-brand-dark"
              >
                <Icon name="cash" className="size-4" />
                Launch POS Register
              </button>
            </div>
          </section>

          <div className="relative overflow-hidden rounded-2xl border border-brand/20 bg-sidebar p-6 text-white shadow-xl">
            <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                  Corner Market POS Terminal
                </span>
                <h2 className="mt-2 text-xl font-bold">Ring up customer sales & print receipts</h2>
                <p className="mt-1 max-w-xl text-xs text-white/70 leading-relaxed">
                  Support Cash, GCash, and Store Credit / Utang payments. Calculates change, updates inventory, and posts sales directly to the journal.
                </p>
              </div>
              <button
                onClick={onOpenPos}
                className="flex items-center gap-2 rounded-xl bg-brand px-6 py-3.5 text-xs font-extrabold text-white shadow-lg transition hover:bg-brand-dark shrink-0"
              >
                <Icon name="cash" className="size-4.5" />
                Open POS Register Now
              </button>
            </div>
          </div>

          <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
            <div className="flex items-center justify-between border-b border-line p-5">
              <div>
                <h3 className="text-base font-bold text-ink">Recent Sales Transactions</h3>
                <p className="text-xs text-muted">Itemized customer sales, payment method, and receipts</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate("/receipts")}
                  className="flex items-center gap-1.5 text-xs font-bold text-brand hover:underline"
                >
                  All receipts <Icon name="arrow" className="size-3.5" />
                </button>
              </div>
            </div>

            <div className="divide-y divide-line">
              {receipts.length === 0 ? (
                <div className="p-12 text-center text-muted">
                  <p className="text-sm font-bold">No sales records yet</p>
                  <p className="mt-1 text-xs">Click "Launch POS Register" to record your first sale.</p>
                </div>
              ) : (
                receipts.slice(0, 10).map((receipt) => (
                  <div key={receipt.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-canvas/50 transition">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-extrabold text-brand">{receipt.id}</span>
                        <span className="text-xs font-bold text-ink">{receipt.customerName}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                          receipt.paymentMethod === "Cash" ? "bg-emerald-50 text-emerald-700" :
                          receipt.paymentMethod === "GCash" ? "bg-sky-50 text-sky-700" : "bg-amber-50 text-amber-700"
                        }`}>
                          {receipt.paymentMethod}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600 truncate">
                        {receipt.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted">
                        <span>{receipt.date} at {receipt.time}</span>
                        <span>·</span>
                        <span>Cashier: {receipt.cashier}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <div className="text-right">
                        <p className="text-sm font-extrabold text-emerald-700">₱{receipt.total.toFixed(2)}</p>
                        {receipt.discount > 0 && <p className="text-[10px] text-muted">Disc: ₱{receipt.discount.toFixed(2)}</p>}
                      </div>
                      <button
                        onClick={() => onViewReceipt(receipt)}
                        className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-bold text-ink shadow-2xs hover:border-brand/40 hover:text-brand transition"
                      >
                        Receipt
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      )}

      {pathname === "/debts" && (
        <div className="mt-6">
          <DebtsView
            debts={debts}
            pendingPayments={pendingPayments}
            onAddDebt={onAddDebt}
            onRecordDebtPayment={onRecordDebtPayment}
            onAddPendingPayment={onAddPendingPayment}
            onSettlePayment={onSettlePayment}
          />
        </div>
      )}

      {pathname === "/supplier-orders" && (
        <div className="mt-6">
          <SupplierOrdersView
            orders={supplierOrders}
            products={products}
            onCreateOrder={onCreateSupplierOrder}
            onMarkReceived={onMarkSupplierOrderReceived}
          />
        </div>
      )}

      {pathname === "/receipts" && (
        <div className="mt-6">
          <ReceiptsView
            receipts={receipts}
            onViewReceipt={onViewReceipt}
            onOpenPos={onOpenPos}
          />
        </div>
      )}

      {pathname === "/reports" && (
        <div className="mt-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[["cash","Cash position","₱84,250","Available across cash, bank, and GCash"],["sales","Sales summary","₱412,680","+8.4% from last month"],["products","Product performance",`${products.length} products`,"Sales, revenue, and stock health"],["statements","Financial statements",selectedPeriod.label,selectedPeriod.checks[2] ? "Trial balance is ready" : "Trial balance pending"]].map(([slug,label,value,note]) => <button key={slug} onClick={() => navigate(`/reports/${slug}`)} className="group rounded-2xl border border-line bg-white p-5 text-left shadow-card transition hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-lg"><div className="flex items-start justify-between"><Icon name={slug === "cash" ? "wallet" : slug === "sales" ? "chart" : slug === "products" ? "box" : "ledger"} className="size-6 text-brand" /><Icon name="arrow" className="size-4 text-muted transition group-hover:translate-x-1 group-hover:text-brand" /></div><p className="mt-5 text-xs font-bold uppercase tracking-wider text-muted">{label}</p><p className="mt-2 text-xl font-bold">{value}</p><p className="mt-1 text-xs text-muted">{note}</p></button>)}</div>
          <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
            <section className="rounded-2xl border border-line bg-white p-5 shadow-card"><div className="flex items-center justify-between"><div><h2 className="text-sm font-bold">{selectedPeriod.label} performance</h2><p className="mt-1 text-xs text-muted">Key movements compared with the prior period</p></div><button onClick={() => navigate("/reports/sales")} className="text-xs font-bold text-brand">View analysis</button></div><div className="mt-5 grid grid-cols-3 gap-3"><div className="rounded-xl bg-canvas p-3"><p className="text-[10px] text-muted">Gross margin</p><p className="mt-1 text-lg font-bold">24.8%</p><p className="mt-1 text-[9px] font-bold text-emerald-700">+1.2 pts</p></div><div className="rounded-xl bg-canvas p-3"><p className="text-[10px] text-muted">Operating costs</p><p className="mt-1 text-lg font-bold">₱68.4K</p><p className="mt-1 text-[9px] font-bold text-amber-700">+3.1%</p></div><div className="rounded-xl bg-canvas p-3"><p className="text-[10px] text-muted">Net income</p><p className="mt-1 text-lg font-bold">₱33.9K</p><p className="mt-1 text-[9px] font-bold text-emerald-700">+9.6%</p></div></div></section>
            <aside className="rounded-2xl bg-sidebar p-5 text-white shadow-card"><p className="text-[10px] font-bold uppercase tracking-wider text-white/45">Close readiness</p><div className="mt-3 flex items-end justify-between"><p className="text-2xl font-bold">80%</p><p className="text-[10px] text-emerald-300">On track</p></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full w-4/5 rounded-full bg-emerald-400" /></div><p className="mt-3 text-xs leading-relaxed text-white/55">Review three adjustments before generating final statements.</p><button onClick={() => navigate("/reports/statements")} className="mt-4 flex items-center gap-2 text-xs font-bold text-white">Continue close <Icon name="arrow" className="size-3.5" /></button></aside>
          </div>
        </div>
      )}

      {pathname === "/reports/products" && (
        <div className="mt-6 space-y-5">
          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[["Products tracked",String(products.length),"box"],["Units sold","2,384","cart"],["Product revenue","₱62,322","cash"],["Low-stock risks",String(lowStockProducts.length),"alert"]].map(([label,value,icon]) => <div key={label} className="rounded-2xl border border-line bg-white p-4 shadow-card"><span className="grid size-9 place-items-center rounded-xl bg-emerald-50 text-brand"><Icon name={icon as IconName} className="size-4" /></span><p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-muted">{label}</p><p className="mt-1 text-xl font-bold">{value}</p></div>)}</section>
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
            <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-card"><div className="flex items-center justify-between border-b border-line p-5"><div><h2 className="text-sm font-bold">Product ranking</h2><p className="mt-1 text-xs text-muted">Sales and stock performance for {selectedPeriod.label}</p></div><AnimatedActionButton onConfirm={() => complete("Product performance report exported")} workingLabel="Preparing..." successLabel="Exported" className="rounded-xl border border-line px-3 py-2 text-[10px] font-bold">Export report</AnimatedActionButton></div><div className="grid grid-cols-[1fr_80px_100px_100px] bg-canvas px-5 py-3 text-[10px] font-bold uppercase text-muted"><span>Product</span><span className="text-right">Sold</span><span className="text-right">Revenue</span><span className="text-right">Stock</span></div>{[...products].sort((a,b) => b.unitsSold - a.unitsSold).map((product,index) => <button key={product.slug} onClick={() => navigate(`/inventory/products/${product.slug}`)} className="grid w-full grid-cols-[1fr_80px_100px_100px] items-center border-t border-line px-5 py-3.5 text-left text-xs transition hover:bg-canvas"><span className="min-w-0"><span className="block truncate font-bold">{index + 1}. {product.name}</span><span className="mt-0.5 block text-[9px] text-muted">{product.category}</span></span><span className="text-right font-semibold">{product.unitsSold}</span><span className="text-right font-bold">{product.revenue}</span><span className={`text-right font-bold ${product.stock <= product.reorder ? "text-amber-700" : "text-emerald-700"}`}>{product.stock}</span></button>)}</section>
            <aside className="space-y-5"><section className="rounded-2xl border border-line bg-white p-5 shadow-card"><h2 className="text-sm font-bold">Revenue by category</h2><div className="mt-5 space-y-4">{[["Beverages","50%"],["Dry goods","16%"],["Snacks","19%"],["Canned goods","11%"],["Household","4%"]].map(([category,share]) => <div key={category}><div className="mb-1.5 flex justify-between text-xs"><span className="font-semibold">{category}</span><span className="text-muted">{share}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-brand" style={{ width: share }} /></div></div>)}</div></section><section className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><Icon name="alert" className="size-5 text-amber-700" /><h2 className="mt-3 text-sm font-bold text-amber-950">{lowStockProducts.length} products need stock</h2><p className="mt-1 text-xs leading-relaxed text-amber-800">Coca-Cola, canned sardines, chocolate biscuits, and powdered milk are below reorder points.</p><button onClick={() => navigate("/inventory/stocks?filter=low")} className="mt-4 flex items-center gap-1.5 text-xs font-bold text-amber-900">Review stock levels <Icon name="arrow" className="size-3.5" /></button></section></aside>
          </div>
        </div>
      )}

      {pathname === "/team" && <section className="mt-6 rounded-2xl border border-line bg-white p-5 shadow-card">{teamMembers.map((member) => <div key={member.slug} className="flex items-center gap-3 border-b border-line py-4 last:border-0"><span className="grid size-10 place-items-center rounded-full bg-canvas text-xs font-bold">{member.initials}</span><span className="flex-1"><span className="block text-sm font-bold">{member.name}</span><span className="block text-xs text-muted">{member.role} · {member.access}</span></span><button onClick={() => navigate(`/team/${member.slug}`)} className="rounded-lg border border-line px-3 py-2 text-xs font-bold transition hover:border-brand/30 hover:text-brand">Manage</button></div>)}</section>}

      {pathname === "/history" && (
        <div className="mt-6 space-y-5">
          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[["All records", activityLog.length, "history"], ["Inventory", activityLog.filter((item) => item.category === "Inventory").length, "box"], ["Journal", activityLog.filter((item) => item.category === "Journal").length, "ledger"], ["Administration", activityLog.filter((item) => ["Settings", "Team"].includes(item.category)).length, "settings"]].map(([label, value, icon]) => (
              <div key={String(label)} className="rounded-2xl border border-line bg-white p-4 shadow-card"><span className="grid size-9 place-items-center rounded-xl bg-emerald-50 text-brand"><Icon name={icon as IconName} className="size-4" /></span><p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-muted">{label}</p><p className="mt-1 text-xl font-bold">{value}</p></div>
            ))}
          </section>
          <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
            <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:p-5">
              <div className="flex h-10 flex-1 items-center gap-2 rounded-xl bg-canvas px-3"><Icon name="search" className="size-4 text-muted" /><input value={historyQuery} onChange={(event) => setHistoryQuery(event.target.value)} maxLength={100} className="min-w-0 flex-1 bg-transparent text-xs outline-none" placeholder="Search actions, people, or categories..." /></div>
              <select value={historyCategory} onChange={(event) => setHistoryCategory(event.target.value)} className="h-10 rounded-xl border border-line bg-white px-3 text-xs font-semibold"><option>All activity</option><option>Inventory</option><option>Journal</option><option>Settings</option><option>Team</option><option>Reports</option><option>Shift</option></select>
            </div>
            <div className="divide-y divide-line">
              {filteredActivity.length > 0 ? filteredActivity.map((record) => {
                const categoryIcon: IconName = record.category === "Inventory" ? "box" : record.category === "Journal" ? "ledger" : record.category === "Team" ? "users" : record.category === "Reports" ? "chart" : record.category === "Shift" ? "cash" : "settings";
                return (
                  <button key={record.id} onClick={() => navigate(`/history/${record.id}`)} className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-canvas sm:gap-4 sm:p-5">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-canvas text-brand"><Icon name={categoryIcon} className="size-5" /></span>
                    <span className="min-w-0 flex-1"><span className="block text-sm font-bold">{record.action}</span><span className="mt-1 block text-xs text-muted">Performed by {record.actor}</span></span>
                    <span className="grid w-28 shrink-0 justify-items-end gap-1.5 text-right sm:w-32"><span className="inline-flex min-w-20 justify-center whitespace-nowrap rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold text-emerald-700">{record.category}</span><span className="whitespace-nowrap text-[10px] tabular-nums text-muted">{new Date(record.timestamp).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span></span>
                    <Icon name="chevron" className="hidden size-4 shrink-0 text-muted sm:block" />
                  </button>
                );
              }) : <div className="p-10 text-center"><Icon name="search" className="mx-auto size-6 text-muted" /><p className="mt-3 text-sm font-bold">No matching history</p><p className="mt-1 text-xs text-muted">Try a different search or category.</p></div>}
            </div>
          </section>
        </div>
      )}

      {activityRecord && (
        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-5">
            <section className="rounded-2xl border border-line bg-white p-5 shadow-card sm:p-7">
              <div className="flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-center">
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-emerald-50 text-brand"><Icon name={activityContext[activityRecord.category].icon} className="size-6" /></span>
                <div className="min-w-0 flex-1"><p className="text-[10px] font-bold uppercase tracking-wider text-muted">Audit event</p><h2 className="mt-1 text-base font-bold">{activityRecord.action}</h2></div>
                <span className="inline-flex w-fit shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-700"><span className="size-1.5 rounded-full bg-emerald-500" />Completed</span>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[["Performed by", activityRecord.actor], ["Category", activityRecord.category], ["Date and time", new Date(activityRecord.timestamp).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })], ["Record ID", activityRecord.id]].map(([label, value]) => <div key={label} className="min-w-0 rounded-xl bg-canvas p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-muted">{label}</p><p className="mt-2 break-words text-sm font-bold">{value}</p></div>)}
              </div>
            </section>
            <section className="rounded-2xl border border-line bg-white p-5 shadow-card sm:p-7">
              <h2 className="text-sm font-bold">Action details</h2>
              <div className="mt-4 divide-y divide-line">
                {[["Affected area", activityContext[activityRecord.category].area], ["Source", activityContext[activityRecord.category].source], ["System impact", activityContext[activityRecord.category].impact]].map(([label, value]) => <div key={label} className="grid gap-1 py-4 sm:grid-cols-[150px_1fr] sm:gap-4"><p className="text-xs font-semibold text-muted">{label}</p><p className="text-sm font-medium">{value}</p></div>)}
              </div>
            </section>
          </div>
          <aside className="space-y-5">
            <section className="rounded-2xl border border-line bg-white p-5 shadow-card">
              <h2 className="text-sm font-bold">Record timeline</h2>
              <div className="mt-5 space-y-5">
                {[["Action completed", activityRecord.timestamp], ["Audit record secured", activityRecord.timestamp]].map(([label, timestamp], index) => <div key={label} className="flex gap-3"><span className={`mt-1 grid size-5 shrink-0 place-items-center rounded-full ${index === 0 ? "bg-brand text-white" : "bg-emerald-50 text-brand"}`}><Icon name="check" className="size-3" /></span><div><p className="text-xs font-bold">{label}</p><p className="mt-1 whitespace-nowrap text-[10px] tabular-nums text-muted">{new Date(timestamp).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</p></div></div>)}
              </div>
            </section>
            <AnimatedActionButton onConfirm={() => complete("Audit record exported")} workingLabel="Preparing..." successLabel="Record exported" className="w-full rounded-xl border border-line bg-white py-3 text-xs font-bold">Export this record</AnimatedActionButton>
          </aside>
        </div>
      )}

      {pathname === "/inventory/count/new" && (
        <form noValidate id="stock-count-form" onSubmit={(event) => event.preventDefault()} className="mt-6 rounded-2xl border border-line bg-white p-5 shadow-card sm:p-7">
          <div className="grid gap-4 sm:grid-cols-3"><label className="block"><span className="mb-2 block text-xs font-bold">Store location</span><select className="h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm"><option>{businessProfile.name} · Main</option></select></label><label className="block"><span className="mb-2 block text-xs font-bold">Count date</span><input required type="date" defaultValue="2025-11-18" data-validation-message="Choose the date of this stock count." className="h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm" /></label><label className="block"><span className="mb-2 block text-xs font-bold">Assigned to</span><select className="h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm"><option>Miguel Santos</option><option>Ana Reyes</option><option>Liza Cruz</option></select></label></div>
          <div className="mt-6 overflow-hidden rounded-xl border border-line"><div className="grid grid-cols-[1fr_80px_90px] bg-canvas p-3 text-[10px] font-bold uppercase text-muted"><span>Product</span><span className="text-center">Recorded</span><span className="text-center">Counted</span></div>{products.map((product) => <div key={product.slug} className="grid grid-cols-[1fr_80px_90px] items-center border-t border-line p-3"><div><p className="text-xs font-bold">{product.name}</p><p className="mt-0.5 text-[9px] text-muted">{product.sku}</p></div><p className="text-center text-xs text-muted">{product.stock}</p><input required min="0" max="9999" data-validation-message={`Enter the physical count for ${product.name}.`} type="number" className="h-9 w-full rounded-lg border border-line bg-canvas px-2 text-center text-xs font-bold" placeholder="0" /></div>)}</div>
          <label className="mt-5 block"><span className="mb-2 flex justify-between text-xs font-bold"><span>Count note</span><span className="font-medium text-muted">Required · max 240</span></span><textarea required maxLength={240} data-validation-message="Add a note describing this physical count." onInput={validateMeaningfulText} className="min-h-24 w-full rounded-xl border border-line p-3 text-sm" placeholder="Describe the count conditions or discrepancies..." /></label>
          <FormError message={formErrors["stock-count-form"]} /><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => navigate("/inventory")} className="rounded-xl border border-line px-5 py-3 text-xs font-bold">Cancel</button><AnimatedActionButton formId="stock-count-form" onValidationError={(message) => setFormError("stock-count-form", message)} onConfirm={() => complete("Physical stock count recorded", "/inventory")} workingLabel="Saving count..." successLabel="Count recorded" className="rounded-xl bg-brand px-5 py-3 text-xs font-bold text-white">Complete stock count</AnimatedActionButton></div>
        </form>
      )}

      {pathname === "/settings/accounting/lock-date" && (
        <form noValidate id="lock-date-form" onSubmit={(event) => event.preventDefault()} className="mt-6 space-y-5">
          <section className="grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-line bg-white p-4 shadow-card"><p className="text-[10px] font-bold uppercase text-muted">Current lock date</p><p className="mt-2 text-lg font-bold">October 31, 2025</p></div><div className="rounded-2xl border border-line bg-white p-4 shadow-card"><p className="text-[10px] font-bold uppercase text-muted">Locked entries</p><p className="mt-2 text-lg font-bold">1,248</p></div><div className="rounded-2xl border border-line bg-white p-4 shadow-card"><p className="text-[10px] font-bold uppercase text-muted">Last changed by</p><p className="mt-2 text-lg font-bold">Ana Reyes</p></div></section>
          <section className="rounded-2xl border border-line bg-white p-5 shadow-card sm:p-7"><div className="grid gap-5 sm:grid-cols-2"><label className="block"><span className="mb-2 block text-xs font-bold">New lock date</span><input required type="date" defaultValue="2025-10-31" data-validation-message="Choose the final date that should be locked." className="h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm" /></label><label className="block"><span className="mb-2 block text-xs font-bold">Approval policy</span><select className="h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm"><option>Owner approval required</option><option>Owner or bookkeeper approval</option><option>No changes allowed</option></select></label><label className="block sm:col-span-2"><span className="mb-2 flex justify-between text-xs font-bold"><span>Reason for change</span><span className="font-medium text-muted">Required · max 240</span></span><textarea required maxLength={240} data-validation-message="Explain why the accounting lock date is being changed." onInput={validateMeaningfulText} className="min-h-24 w-full rounded-xl border border-line p-3 text-sm" placeholder="Provide a reason for the audit history..." /></label></div><div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4"><Icon name="alert" className="size-5 shrink-0 text-amber-700" /><div><p className="text-xs font-bold text-amber-950">This is an accounting control</p><p className="mt-1 text-[10px] leading-relaxed text-amber-800">Changing the date affects which historical entries can be edited. The change and reason will be permanently recorded in History.</p></div></div><FormError message={formErrors["lock-date-form"]} /><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => navigate(`/settings${search}`)} className="rounded-xl border border-line px-5 py-3 text-xs font-bold">Cancel</button><AnimatedActionButton formId="lock-date-form" onValidationError={(message) => setFormError("lock-date-form", message)} onConfirm={() => complete("Accounting lock date updated", `/settings${search}`)} workingLabel="Updating..." successLabel="Lock date updated" className="rounded-xl bg-brand px-5 py-3 text-xs font-bold text-white">Update lock date</AnimatedActionButton></div></section>
        </form>
      )}

      {pathname === "/settings/security/backups" && (
        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_300px]"><section className="overflow-hidden rounded-2xl border border-line bg-white shadow-card"><div className="border-b border-line p-5"><h2 className="text-sm font-bold">Available backups</h2><p className="mt-1 text-xs text-muted">Encrypted copies of journal, inventory, settings, and history.</p></div>{[["Automatic backup","Today, 2:00 AM","18.4 MB"],["Automatic backup","Nov 17, 2:00 AM","18.2 MB"],["Before October close","Oct 31, 8:42 PM","17.6 MB"]].map(([label,date,size]) => <div key={date} className="flex items-center gap-3 border-b border-line p-4 last:border-0"><span className="grid size-9 place-items-center rounded-xl bg-canvas text-brand"><Icon name="history" className="size-4" /></span><div className="flex-1"><p className="text-xs font-bold">{label}</p><p className="mt-1 text-[10px] text-muted">{date} · {size}</p></div><AnimatedActionButton onConfirm={() => complete(`Backup from ${date} downloaded`)} workingLabel="Preparing..." successLabel="Downloaded" className="rounded-lg border border-line px-3 py-2 text-[10px] font-bold">Download</AnimatedActionButton></div>)}</section><aside className="h-fit rounded-2xl bg-sidebar p-5 text-white"><Icon name="history" className="size-6 text-emerald-300" /><h2 className="mt-4 text-base font-bold">Create a fresh backup</h2><p className="mt-2 text-xs leading-relaxed text-white/55">Capture the current workspace before making major accounting or inventory changes.</p><AnimatedActionButton onConfirm={() => complete("Workspace backup created")} workingLabel="Backing up..." successLabel="Backup ready" className="mt-5 w-full rounded-xl bg-white py-3 text-xs font-bold text-sidebar">Create backup now</AnimatedActionButton></aside></div>
      )}

      {pathname === "/settings/security/data-export" && (
        <form className="mt-6 rounded-2xl border border-line bg-white p-5 shadow-card sm:p-7" onSubmit={(event) => event.preventDefault()}><div className="grid gap-3 sm:grid-cols-2">{[["Journal and ledger","Entries, account lines, and posting status"],["Inventory","Products, counts, costs, and adjustments"],["Financial reports","Statements and reporting summaries"],["System history","Complete audit records and actors"]].map(([label,note]) => <label key={label} className="flex cursor-pointer items-start gap-3 rounded-xl border border-line p-4"><input type="checkbox" defaultChecked className="mt-1 size-4 accent-emerald-600" /><span><span className="block text-sm font-bold">{label}</span><span className="mt-1 block text-xs text-muted">{note}</span></span></label>)}</div><div className="mt-5 grid gap-4 sm:grid-cols-2"><label><span className="mb-2 block text-xs font-bold">File format</span><select className="h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm"><option>Excel workbook (.xlsx)</option><option>CSV archive (.zip)</option><option>PDF package</option></select></label><label><span className="mb-2 block text-xs font-bold">Reporting period</span><select className="h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm"><option>All available records</option><option>This fiscal year</option><option>This month</option></select></label></div><div className="mt-5 flex items-start gap-3 rounded-xl bg-emerald-50 p-4"><Icon name="check" className="size-5 shrink-0 text-brand" /><p className="text-xs leading-relaxed text-emerald-800">The export will be encrypted and its creation will be recorded in System History.</p></div><div className="mt-6 flex justify-end"><AnimatedActionButton onConfirm={() => complete("Business data export prepared")} workingLabel="Preparing export..." successLabel="Export ready" className="rounded-xl bg-brand px-5 py-3 text-xs font-bold text-white">Prepare export</AnimatedActionButton></div></form>
      )}

      {compareReport && (
        <div className="mt-6 space-y-5"><section className="grid gap-3 sm:grid-cols-3">{[["Current period",compareReport === "cash" ? "₱84,250" : "₱412,680"],["Previous period",compareReport === "cash" ? "₱77,730" : "₱380,710"],["Change","+8.4%"]].map(([label,value],index) => <div key={label} className={`rounded-2xl border p-5 shadow-card ${index === 2 ? "border-emerald-200 bg-emerald-50" : "border-line bg-white"}`}><p className="text-[10px] font-bold uppercase tracking-wider text-muted">{label}</p><p className={`mt-2 text-2xl font-bold ${index === 2 ? "text-emerald-700" : ""}`}>{value}</p></div>)}</section><section className="overflow-hidden rounded-2xl border border-line bg-white shadow-card"><div className="border-b border-line p-5"><h2 className="text-sm font-bold">Period breakdown</h2><p className="mt-1 text-xs text-muted">{new URLSearchParams(search).get("period") ?? "This month"} compared with the previous matching period.</p></div><div className="grid grid-cols-4 bg-canvas p-3 text-[10px] font-bold uppercase text-muted"><span>Metric</span><span className="text-right">Current</span><span className="text-right">Previous</span><span className="text-right">Change</span></div>{[["Week 1","₱92,420","₱88,700","+4.2%"],["Week 2","₱101,680","₱94,320","+7.8%"],["Week 3","₱106,240","₱97,380","+9.1%"],["Week 4","₱112,340","₱100,840","+11.4%"]].map(([label,current,previous,change]) => <div key={label} className="grid grid-cols-4 border-t border-line p-4 text-xs"><span className="font-bold">{label}</span><span className="text-right">{current}</span><span className="text-right text-muted">{previous}</span><span className="text-right font-bold text-emerald-700">{change}</span></div>)}</section><div className="flex justify-end"><AnimatedActionButton onConfirm={() => complete(`${compareReport === "cash" ? "Cash" : "Sales"} comparison exported`)} workingLabel="Preparing..." successLabel="Exported" className="rounded-xl bg-brand px-5 py-3 text-xs font-bold text-white">Export comparison</AnimatedActionButton></div></div>
      )}

      {teamMember && (
        <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-5">
            <form noValidate id="team-profile-form" onSubmit={(event) => event.preventDefault()} className="rounded-2xl border border-line bg-white p-5 shadow-card sm:p-6">
              <div className="flex items-center gap-4 border-b border-line pb-5">
                <span className="grid size-14 place-items-center rounded-full bg-emerald-50 text-sm font-bold text-brand">{teamMember.initials}</span>
                <div className="min-w-0 flex-1"><h2 className="text-base font-bold">{teamMember.name}</h2><p className="mt-1 text-xs text-muted">{teamMember.email}</p></div>
                <span className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${accountActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-muted"}`}>{accountActive ? "Active" : "Suspended"}</span>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="block"><span className="mb-2 flex justify-between text-xs font-bold"><span>Full name</span><span className="font-medium text-muted">Max 80</span></span><input required maxLength={80} data-validation-message="Enter the team member’s full name." onInput={validateMeaningfulText} defaultValue={teamMember.name} className="h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm outline-none focus:border-brand" /></label>
                <label className="block"><span className="mb-2 flex justify-between text-xs font-bold"><span>Email address</span><span className="font-medium text-muted">Max 120</span></span><input required maxLength={120} data-validation-message="Enter a valid email address for this team member." onInput={validateMeaningfulText} type="email" defaultValue={teamMember.email} className="h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm outline-none focus:border-brand" /></label>
                <label className="block"><span className="mb-2 block text-xs font-bold">Role</span><select defaultValue={teamMember.role} className="h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm outline-none"><option>Owner</option><option>Store manager</option><option>Bookkeeper</option><option>Cashier</option><option>Inventory clerk</option></select></label>
                <label className="block"><span className="mb-2 block text-xs font-bold">Assigned location</span><select className="h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm outline-none"><option>{businessProfile.name} · Main</option><option>All locations</option></select></label>
              </div>
              <FormError message={formErrors["team-profile-form"]} />
              <div className="mt-6 flex justify-end"><AnimatedActionButton formId="team-profile-form" onValidationError={(message) => setFormError("team-profile-form", message)} onConfirm={() => complete(`${teamMember.name}'s profile saved`)} successLabel="Profile saved" className="rounded-xl bg-brand px-5 py-3 text-xs font-bold text-white">Save profile</AnimatedActionButton></div>
            </form>

            <section className="rounded-2xl border border-line bg-white p-5 shadow-card sm:p-6">
              <div><h2 className="text-base font-bold">Permissions</h2><p className="mt-1 text-xs text-muted">Choose exactly what this person can view and change.</p></div>
              <div className="mt-5 divide-y divide-line">
                {[
                  ["sales", "Record sales and refunds", "Create transactions and process customer refunds", true],
                  ["inventory", "Manage inventory", "Update quantities, costs, and stock counts", teamMember.role !== "Cashier"],
                  ["reports", "View financial reports", "Access sales, cash, and financial statements", teamMember.role !== "Cashier"],
                  ["journal", "Post and approve journal entries", "Review entries and post them to the ledger", teamMember.role === "Owner"],
                  ["team", "Manage team access", "Invite members and change permissions", teamMember.role === "Owner"],
                ].map(([key, label, description, defaultEnabled]) => {
                  const permissionKey = `${teamMember.slug}-${key}`;
                  const enabled = permissionOverrides[permissionKey] ?? Boolean(defaultEnabled);
                  return (
                    <div key={String(key)} className="flex items-center gap-4 py-4">
                      <div className="min-w-0 flex-1"><p className="text-sm font-bold">{label}</p><p className="mt-1 text-xs leading-relaxed text-muted">{description}</p></div>
                      <button aria-label={`${enabled ? "Disable" : "Enable"} ${label}`} aria-pressed={enabled} onClick={() => setPermissionOverrides((current) => ({ ...current, [permissionKey]: !enabled }))} className={`relative h-6 w-11 shrink-0 rounded-full transition ${enabled ? "bg-brand" : "bg-slate-200"}`}><span className={`absolute top-1 size-4 rounded-full bg-white shadow-sm transition ${enabled ? "left-6" : "left-1"}`} /></button>
                    </div>
                  );
                })}
              </div>
              <div className="mt-5 flex justify-end"><AnimatedActionButton onConfirm={() => complete(`${teamMember.name}'s permissions updated`)} workingLabel="Updating..." successLabel="Updated" className="rounded-xl bg-brand px-5 py-3 text-xs font-bold text-white">Update permissions</AnimatedActionButton></div>
            </section>
          </div>

          <aside className="space-y-5">
            <section className="rounded-2xl border border-line bg-white p-5 shadow-card">
              <h2 className="text-sm font-bold">Account security</h2>
              <p className="mt-1 text-xs text-muted">Last active: {teamMember.lastActive}</p>
              <div className="mt-4 space-y-2">
                <AnimatedActionButton onConfirm={() => complete(`Password reset link sent to ${teamMember.email}`)} workingLabel="Sending..." successLabel="Reset sent" className="w-full rounded-xl border border-line p-3 text-xs font-bold hover:border-brand/30">Send password reset</AnimatedActionButton>
                <AnimatedActionButton onConfirm={() => complete(`New cashier PIN created for ${teamMember.name}`)} workingLabel="Resetting..." successLabel="PIN reset" className="w-full rounded-xl border border-line p-3 text-xs font-bold hover:border-brand/30">Reset cashier PIN</AnimatedActionButton>
                <AnimatedActionButton onConfirm={() => complete(`${teamMember.name} signed out from all devices`)} workingLabel="Signing out..." successLabel="Signed out" className="w-full rounded-xl border border-line p-3 text-xs font-bold hover:border-brand/30">Sign out all devices</AnimatedActionButton>
              </div>
            </section>

            <section className="rounded-2xl border border-line bg-white p-5 shadow-card">
              <h2 className="text-sm font-bold">Recent activity</h2>
              <div className="mt-4 space-y-4">
                {[["Posted morning sales", "Today, 10:32 AM"], ["Completed stock count", "Yesterday, 5:48 PM"], ["Signed in on mobile", "Yesterday, 8:01 AM"]].map(([activity, time]) => <div key={activity} className="flex gap-3"><span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand" /><div><p className="text-xs font-bold">{activity}</p><p className="mt-1 text-[10px] text-muted">{time}</p></div></div>)}
              </div>
              <button onClick={() => navigate(`/history?member=${teamMember.slug}`)} className="mt-5 flex items-center gap-1.5 text-xs font-bold text-brand">View full audit log <Icon name="arrow" className="size-3.5" /></button>
            </section>

            <section className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
              <h2 className="text-sm font-bold text-rose-950">Account controls</h2>
              <p className="mt-1 text-xs leading-relaxed text-rose-800">Suspending access preserves this member’s audit history.</p>
              <AnimatedActionButton onConfirm={() => { setAccountActive((current) => !current); complete(`${teamMember.name}'s account ${accountActive ? "suspended" : "reactivated"}`); }} workingLabel="Updating..." successLabel="Account updated" className="mt-4 w-full rounded-xl border border-rose-200 bg-white py-2.5 text-xs font-bold text-rose-800">{accountActive ? "Suspend account" : "Reactivate account"}</AnimatedActionButton>
              {!confirmRemove ? <button onClick={() => setConfirmRemove(true)} className="mt-2 w-full py-2 text-xs font-bold text-rose-700">Remove team member</button> : <div className="mt-3 rounded-xl bg-white p-3"><p className="text-xs font-bold text-rose-900">Remove {teamMember.name}?</p><p className="mt-1 text-[10px] text-rose-700">This cannot be undone.</p><div className="mt-3 flex gap-2"><button onClick={() => setConfirmRemove(false)} className="flex-1 rounded-lg border border-line py-2 text-[10px] font-bold">Cancel</button><AnimatedActionButton onConfirm={() => complete(`${teamMember.name} removed from the team`, "/team")} workingLabel="Removing..." successLabel="Removed" className="flex-1 rounded-lg bg-rose-700 py-2 text-[10px] font-bold text-white">Remove</AnimatedActionButton></div></div>}
            </section>
          </aside>
        </div>
      )}

      {pathname === "/settings" && (
        <div className="mt-6 grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="h-fit rounded-2xl border border-line bg-white p-2 shadow-card">
            {[
              ["Business profile", "grid"],
              ["Accounting rules", "ledger"],
              ["Payments & integrations", "wallet"],
              ["Notifications", "bell"],
              ["Security & data", "settings"],
            ].map(([tab, icon]) => <button key={tab} onClick={() => { setSettingsTab(tab); setFormError("settings-form", ""); }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-bold transition ${settingsTab === tab ? "bg-emerald-50 text-brand" : "text-muted hover:bg-canvas hover:text-ink"}`}><Icon name={icon as IconName} className="size-4" />{tab}</button>)}
            <div className="mx-2 my-2 border-t border-line" />
            <button onClick={() => navigate("/team")} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-bold text-muted transition hover:bg-canvas hover:text-ink"><Icon name="users" className="size-4" />Team access</button>
            <button onClick={() => navigate("/history")} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-bold text-muted transition hover:bg-canvas hover:text-ink"><Icon name="history" className="size-4" />Settings history</button>
          </aside>
          <form noValidate id="settings-form" onSubmit={(event) => event.preventDefault()} className="w-full rounded-2xl border border-line bg-white shadow-card">
            <div className="flex flex-col gap-3 border-b border-line p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div><h2 className="text-base font-bold">{settingsTab}</h2><p className="mt-1 text-xs text-muted">{settingsTab === "Business profile" ? "Details used on reports, receipts, and tax records." : settingsTab === "Accounting rules" ? "Control how transactions are classified and posted." : settingsTab === "Payments & integrations" ? "Connect the tools and payment channels used by your store." : settingsTab === "Notifications" ? "Choose which events need attention and who gets notified." : "Protect workspace access and manage your business data."}</p></div>
              <span className="flex w-fit items-center gap-1.5 whitespace-nowrap rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-700"><span className="size-1.5 rounded-full bg-emerald-500" />Audit tracking on</span>
            </div>

            <div className="p-5 sm:p-6">
              {settingsTab === "Business profile" && (
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block"><span className="mb-2 flex justify-between text-xs font-bold"><span>Business name</span><span className="font-medium text-muted">Max 100</span></span><input required maxLength={100} data-validation-message="Enter the registered or trading name of the business." onInput={validateMeaningfulText} value={businessDraft.name} onChange={(event) => setBusinessDraft((current) => ({ ...current, name: event.target.value }))} className="h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm outline-none focus:border-brand" /></label>
                  <label className="block"><span className="mb-2 flex justify-between text-xs font-bold"><span>Tax identification no.</span><span className="font-medium text-muted">Max 30</span></span><input required maxLength={30} data-validation-message="Enter the business tax identification number." onInput={validateMeaningfulText} value={businessDraft.taxId} onChange={(event) => setBusinessDraft((current) => ({ ...current, taxId: event.target.value }))} className="h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm outline-none focus:border-brand" /></label>
                  <label className="block sm:col-span-2"><span className="mb-2 flex justify-between text-xs font-bold"><span>Store address</span><span className="font-medium text-muted">Max 160</span></span><input required maxLength={160} data-validation-message="Enter the store’s complete business address." onInput={validateMeaningfulText} value={businessDraft.address} onChange={(event) => setBusinessDraft((current) => ({ ...current, address: event.target.value }))} className="h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm outline-none focus:border-brand" /></label>
                  <label className="block"><span className="mb-2 flex justify-between text-xs font-bold"><span>Business email</span><span className="font-medium text-muted">Max 120</span></span><input required type="email" maxLength={120} data-validation-message="Enter a valid email for receipts and reports." onInput={validateMeaningfulText} value={businessDraft.email} onChange={(event) => setBusinessDraft((current) => ({ ...current, email: event.target.value }))} className="h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm outline-none focus:border-brand" /></label>
                  <label className="block"><span className="mb-2 flex justify-between text-xs font-bold"><span>Contact number</span><span className="font-medium text-muted">Max 20</span></span><input required maxLength={20} data-validation-message="Enter a contact number for the store." onInput={validateMeaningfulText} value={businessDraft.phone} onChange={(event) => setBusinessDraft((current) => ({ ...current, phone: event.target.value }))} className="h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm outline-none focus:border-brand" /></label>
                  <label className="block"><span className="mb-2 block text-xs font-bold">Business type</span><select value={businessDraft.businessType} onChange={(event) => setBusinessDraft((current) => ({ ...current, businessType: event.target.value }))} className="h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm"><option>Sole proprietorship</option><option>Partnership</option><option>Corporation</option></select></label>
                  <label className="block"><span className="mb-2 block text-xs font-bold">Timezone</span><select value={businessDraft.timezone} onChange={(event) => setBusinessDraft((current) => ({ ...current, timezone: event.target.value }))} className="h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm"><option>Philippine Time (UTC+8)</option><option>Singapore Time (UTC+8)</option></select></label>
                </div>
              )}

              {settingsTab === "Accounting rules" && (
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block"><span className="mb-2 block text-xs font-bold">Accounting basis</span><select className="h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm"><option>Accrual basis</option><option>Cash basis</option></select><span className="mt-2 block text-[10px] text-muted">Controls when income and expenses are recognized.</span></label>
                    <label className="block"><span className="mb-2 block text-xs font-bold">Inventory costing</span><select className="h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm"><option>Weighted average</option><option>FIFO</option></select><span className="mt-2 block text-[10px] text-muted">Used to calculate cost of goods sold.</span></label>
                    <label className="block"><span className="mb-2 block text-xs font-bold">Fiscal year starts</span><select className="h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm"><option>January</option><option>April</option><option>July</option></select></label>
                    <label className="block"><span className="mb-2 block text-xs font-bold">Default sales tax</span><select className="h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm"><option>12% VAT</option><option>Non-VAT</option><option>Tax exempt</option></select></label>
                  </div>
                  <div className="divide-y divide-line rounded-xl border border-line px-4"><SettingToggle enabled={settingToggles.autoPostSales} onToggle={() => toggleSetting("autoPostSales")} label="Automatically post daily sales" description="Create and post a summarized journal entry when a shift closes." /><SettingToggle enabled={settingToggles.stockAccounting} onToggle={() => toggleSetting("stockAccounting")} label="Real-time inventory accounting" description="Update inventory value and cost of goods sold with every sale." /></div>
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4"><p className="text-xs font-bold text-amber-950">Books locked through October 31, 2025</p><p className="mt-1 text-[10px] text-amber-800">Changes before this date require owner approval and are added to History.</p><button type="button" onClick={() => navigate(`/settings/accounting/lock-date${search}`)} className="mt-3 flex items-center gap-1.5 text-xs font-bold text-amber-900 underline">Review lock date <Icon name="arrow" className="size-3.5" /></button></div>
                </div>
              )}

              {settingsTab === "Payments & integrations" && (
                <div className="space-y-3">
                  {[["GCash for Business","Collect payments and reconcile GCash deposits.","gcash","wallet"],["Point-of-sale sync","Import daily sales and payment methods automatically.","pos","cash"],["Business bank account","Match bank transactions with recorded entries.","bank","chart"]].map(([label,description,key,icon]) => {
                    const connected = Boolean(settingToggles[key]);
                    return <div key={key} className="flex flex-col gap-4 rounded-xl border border-line p-4 sm:flex-row sm:items-center"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-canvas text-brand"><Icon name={icon as IconName} className="size-5" /></span><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="text-sm font-bold">{label}</p><span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${connected ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-muted"}`}>{connected ? "Connected" : "Not connected"}</span></div><p className="mt-1 text-xs text-muted">{description}</p></div>{connected ? <div className="flex gap-2"><AnimatedActionButton onConfirm={() => complete(`${label} synced`)} workingLabel="Syncing..." successLabel="Synced" className="rounded-lg border border-line px-3 py-2 text-[10px] font-bold">Sync now</AnimatedActionButton><button type="button" onClick={() => { toggleSetting(key); complete(`${label} disconnected`); }} className="rounded-lg px-3 py-2 text-[10px] font-bold text-rose-700">Disconnect</button></div> : <AnimatedActionButton onConfirm={() => { toggleSetting(key); complete(`${label} connected`); }} workingLabel="Connecting..." successLabel="Connected" className="rounded-lg bg-brand px-3 py-2 text-[10px] font-bold text-white">Connect</AnimatedActionButton>}</div>;
                  })}
                </div>
              )}

              {settingsTab === "Notifications" && (
                <div className="space-y-5">
                  <div className="divide-y divide-line rounded-xl border border-line px-4"><SettingToggle enabled={settingToggles.varianceAlerts} onToggle={() => toggleSetting("varianceAlerts")} label="Inventory variance alerts" description="Notify owners when physical stock differs from recorded quantity." /><SettingToggle enabled={settingToggles.lowStockAlerts} onToggle={() => toggleSetting("lowStockAlerts")} label="Low-stock alerts" description="Alert store managers when an item reaches its reorder point." /><SettingToggle enabled={settingToggles.approvalAlerts} onToggle={() => toggleSetting("approvalAlerts")} label="Journal approval reminders" description="Notify approvers when entries are waiting for review." /><SettingToggle enabled={settingToggles.dailySummary} onToggle={() => toggleSetting("dailySummary")} label="Daily store summary" description="Email sales, cash, and inventory highlights after shift close." /></div>
                  <div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-2 block text-xs font-bold">Variance alert threshold</span><div className="flex h-11 items-center rounded-xl border border-line bg-canvas px-3"><span className="mr-2 text-xs text-muted">₱</span><input required defaultValue="500" maxLength={8} data-validation-message="Enter the amount that should trigger a variance alert." className="min-w-0 flex-1 bg-transparent text-sm outline-none" inputMode="numeric" /></div></label><label className="block"><span className="mb-2 block text-xs font-bold">Summary delivery time</span><input required type="time" defaultValue="21:00" data-validation-message="Choose when the daily summary should be sent." className="h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm" /></label></div>
                </div>
              )}

              {settingsTab === "Security & data" && (
                <div className="space-y-5">
                  <div className="divide-y divide-line rounded-xl border border-line px-4"><SettingToggle enabled={settingToggles.twoFactor} onToggle={() => toggleSetting("twoFactor")} label="Two-factor authentication" description="Require an additional verification code for owner accounts." /></div>
                  <div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-2 block text-xs font-bold">Session timeout</span><select className="h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm"><option>30 minutes</option><option>1 hour</option><option>4 hours</option></select></label><label className="block"><span className="mb-2 block text-xs font-bold">Audit history retention</span><select className="h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm"><option>7 years</option><option>5 years</option><option>3 years</option></select></label></div>
                  <div className="grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-canvas p-4"><p className="text-xs font-bold">Workspace backup</p><p className="mt-1 text-[10px] leading-relaxed text-muted">Last automatic backup: Today, 2:00 AM</p><button type="button" onClick={() => navigate(`/settings/security/backups${search}`)} className="mt-4 flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-2 text-[10px] font-bold">Manage backups <Icon name="arrow" className="size-3" /></button></div><div className="rounded-xl bg-canvas p-4"><p className="text-xs font-bold">Export business data</p><p className="mt-1 text-[10px] leading-relaxed text-muted">Download journal, inventory, reports, and audit history.</p><button type="button" onClick={() => navigate(`/settings/security/data-export${search}`)} className="mt-4 flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-2 text-[10px] font-bold">Configure export <Icon name="arrow" className="size-3" /></button></div></div>
                  <div className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold text-rose-950">End this secure session</p><p className="mt-1 text-[10px] text-rose-700">Sign out on this device and return to the protected login screen.</p></div><button type="button" onClick={onSignOut} className="rounded-lg bg-white px-4 py-2.5 text-xs font-bold text-rose-700 shadow-sm">Sign out</button></div>
                </div>
              )}

              <FormError message={formErrors["settings-form"]} />
              <div className="mt-6 flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between"><p className="text-[10px] text-muted">All saved changes are recorded in System History.</p><AnimatedActionButton formId="settings-form" onValidationError={(message) => setFormError("settings-form", message)} onConfirm={() => { if (settingsTab === "Business profile") onSaveBusiness(businessDraft); complete(`${settingsTab} settings saved`); }} successLabel="Changes saved" className="rounded-xl bg-brand px-5 py-3 text-xs font-bold text-white">Save changes</AnimatedActionButton></div>
            </div>
          </form>
        </div>
      )}

      {pathname === "/close" && (
        <div className="mt-6 space-y-5">
          <section className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-5 shadow-card sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-brand"><Icon name="history" className="size-5" /></span><div><p className="text-[10px] font-bold uppercase tracking-wider text-muted">Active accounting period</p><p className="mt-1 text-sm font-bold">{selectedPeriod.label}</p></div></div>
            <select value={selectedPeriod.id} onChange={(event) => onSelectPeriod(event.target.value)} className="h-11 rounded-xl border border-line bg-canvas px-4 text-xs font-bold">{periods.map((period) => <option key={period.id} value={period.id}>{period.label} · {period.status}</option>)}</select>
          </section>
          <section className="grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-line bg-white p-4 shadow-card"><p className="text-[10px] font-bold uppercase tracking-wider text-muted">Cycle progress</p><p className="mt-2 text-2xl font-bold">{periodProgress}%</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-brand transition-all" style={{ width: `${periodProgress}%` }} /></div></div><div className="rounded-2xl border border-line bg-white p-4 shadow-card"><p className="text-[10px] font-bold uppercase tracking-wider text-muted">Completed controls</p><p className="mt-2 text-2xl font-bold">{selectedPeriod.checks.filter(Boolean).length} of 5</p><p className="mt-2 text-[10px] text-muted">Updates automatically as tasks finish</p></div><div className="rounded-2xl border border-line bg-white p-4 shadow-card"><p className="text-[10px] font-bold uppercase tracking-wider text-muted">Period status</p><p className={`mt-2 text-lg font-bold ${selectedPeriod.status === "Closed" ? "text-emerald-700" : "text-amber-700"}`}>{periodProgress === 100 ? "Closed" : selectedPeriod.status}</p><p className="mt-2 text-[10px] text-muted">{5 - selectedPeriod.checks.filter(Boolean).length} controls remaining</p></div></section>
          <section className="rounded-2xl border border-line bg-white p-5 shadow-card">
            {["Journal entries recorded","Entries posted to ledger","Trial balance confirmed","Adjustments reviewed","Financial statements generated"].map((step,index) => {
              const done = selectedPeriod.checks[index];
              return <div key={step} className="flex items-center gap-4 border-b border-line py-4 last:border-0"><span className={`grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold ${done ? "bg-brand text-white" : "bg-canvas text-muted"}`}>{done ? <Icon name="check" className="size-4" /> : index + 1}</span><span className="min-w-0 flex-1"><span className="block text-sm font-bold">{step}</span><span className="mt-1 block text-[10px] text-muted">{done ? "Completed for this period" : index === 3 ? "Review pending entries before close" : index === 4 ? "Generate the final reporting package" : "Waiting for completion"}</span></span>{index === 3 && !done ? <div className="flex gap-2"><button onClick={() => navigate("/journal?status=review")} className="rounded-lg border border-line px-3 py-2 text-[10px] font-bold">Review entries</button><button onClick={() => { onUpdatePeriodCheck(index, true); complete(`${selectedPeriod.label} adjustments marked reviewed`); }} className="rounded-lg bg-emerald-50 px-3 py-2 text-[10px] font-bold text-brand">Mark reviewed</button></div> : index === 4 && !done ? <button onClick={() => navigate("/reports/statements")} className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-[10px] font-bold text-brand">Open statements <Icon name="arrow" className="size-3" /></button> : <button onClick={() => { onUpdatePeriodCheck(index, !done); complete(`${step} ${done ? "reopened" : "completed"} for ${selectedPeriod.label}`); }} className="text-[10px] font-bold text-muted">{done ? "Reopen" : "Mark complete"}</button>}</div>;
            })}
          </section>
          <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-card"><div className="border-b border-line p-5"><h2 className="text-sm font-bold">Accounting period history</h2><p className="mt-1 text-xs text-muted">Switch between current, previous, and upcoming close cycles.</p></div><div className="divide-y divide-line">{periods.map((period) => { const progress = Math.round((period.checks.filter(Boolean).length / period.checks.length) * 100); return <button key={period.id} onClick={() => onSelectPeriod(period.id)} className={`grid w-full grid-cols-[1fr_90px_100px] items-center p-4 text-left transition hover:bg-canvas ${period.id === selectedPeriod.id ? "bg-emerald-50/50" : ""}`}><span><span className="block text-xs font-bold">{period.label}</span><span className="mt-1 block text-[10px] text-muted">{period.status}</span></span><span className="text-center text-xs font-bold">{progress}%</span><span className="h-1.5 overflow-hidden rounded-full bg-slate-100"><span className="block h-full rounded-full bg-brand" style={{ width: `${progress}%` }} /></span></button>; })}</div></section>
        </div>
      )}

      {pathname === "/reports/statements" && (
        <div className="mt-6 space-y-5">
          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[["Trial balance",selectedPeriod.checks[2] ? "Balanced" : "Pending","check"],["Adjustments",selectedPeriod.checks[3] ? "Reviewed" : "3 to review","receipt"],["Reporting period",selectedPeriod.label,"chart"],["Close status",statementsReady ? "Generated" : `${periodProgress}% ready`,"history"]].map(([label,value,icon]) => <div key={label} className="rounded-2xl border border-line bg-white p-4 shadow-card"><span className="grid size-9 place-items-center rounded-xl bg-emerald-50 text-brand"><Icon name={icon as IconName} className="size-4" /></span><p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-muted">{label}</p><p className="mt-1 text-sm font-bold">{value}</p></div>)}
          </section>
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
            <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
              <div className="flex flex-col gap-4 border-b border-line p-5 sm:flex-row sm:items-center sm:justify-between">
                <div><h2 className="text-base font-bold">Statement preview</h2><p className="mt-1 text-xs text-muted">Draft values based on the current trial balance.</p></div>
                <div className="flex max-w-full overflow-x-auto rounded-xl bg-canvas p-1">{Object.keys(financialStatementData).map((tab) => <button key={tab} onClick={() => setStatementTab(tab)} className={`whitespace-nowrap rounded-lg px-3 py-2 text-[10px] font-bold transition ${statementTab === tab ? "bg-white text-ink shadow-sm" : "text-muted"}`}>{tab}</button>)}</div>
              </div>
              <div className="p-5 sm:p-6">
                <div className="flex items-center justify-between border-b border-line pb-4"><div><p className="text-xs font-bold text-muted">{businessProfile.name}</p><h3 className="mt-1 text-lg font-bold">{statementTab}</h3><p className="mt-1 text-[10px] text-muted">TIN {businessProfile.taxId} · {selectedPeriod.label}</p></div><span className={`rounded-full px-3 py-1 text-[10px] font-bold ${statementsReady ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{statementsReady ? "Final" : "Draft"}</span></div>
                <div className="mt-3 divide-y divide-line">{financialStatementData[statementTab].rows.map(([label,value]) => <div key={label} className="flex items-center justify-between py-3 text-sm"><span className={label.includes("Gross") ? "font-bold" : "text-muted"}>{label}</span><span className="font-semibold tabular-nums">{value}</span></div>)}</div>
                <div className="mt-2 flex items-center justify-between rounded-xl bg-sidebar p-4 text-white"><span className="text-sm font-bold">{financialStatementData[statementTab].totalLabel}</span><span className="text-lg font-bold tabular-nums">{financialStatementData[statementTab].total}</span></div>
                <div className="mt-4 flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800"><Icon name="spark" className="mt-0.5 size-4 shrink-0" /><p>{financialStatementData[statementTab].note}</p></div>
              </div>
            </section>
            <aside className="space-y-5">
              <section className="rounded-2xl border border-line bg-white p-5 shadow-card"><div className="flex items-center justify-between"><h2 className="text-sm font-bold">Close checklist</h2><span className="text-xs font-bold text-brand">{selectedPeriod.checks.filter(Boolean).length} of 5</span></div><div className="mt-4 space-y-3">{[["Journal recorded",selectedPeriod.checks[0]],["Entries posted",selectedPeriod.checks[1]],["Trial balance",selectedPeriod.checks[2]],["Adjustments reviewed",selectedPeriod.checks[3]],["Statements generated",statementsReady]].map(([label,done]) => <div key={String(label)} className="flex items-center gap-2"><span className={`grid size-5 place-items-center rounded-full ${done ? "bg-brand text-white" : "bg-canvas text-muted"}`}>{done ? <Icon name="check" className="size-3" /> : <span className="size-1.5 rounded-full bg-current" />}</span><span className={`text-xs font-semibold ${done ? "text-ink" : "text-muted"}`}>{label}</span></div>)}</div><button onClick={() => navigate("/close")} className="mt-5 flex items-center gap-1.5 text-xs font-bold text-brand">Manage {selectedPeriod.label} close <Icon name="arrow" className="size-3.5" /></button></section>
              <section className="rounded-2xl bg-sidebar p-5 text-white"><p className="text-[10px] font-bold uppercase tracking-wider text-white/45">Finalize {selectedPeriod.label}</p><p className="mt-2 text-sm font-bold">{statementsReady ? "Statements are ready" : `${5 - selectedPeriod.checks.filter(Boolean).length} steps remain`}</p><p className="mt-1 text-xs leading-relaxed text-white/55">{statementsReady ? "Download or export the completed statement package." : "You can generate a draft now and finalize after review."}</p><AnimatedActionButton onConfirm={() => { onUpdatePeriodCheck(4, true); complete(`${selectedPeriod.label} financial statements generated`); }} workingLabel="Generating..." successLabel="Statements ready" className="mt-4 w-full rounded-xl bg-white py-3 text-xs font-bold text-sidebar">{statementsReady ? "Regenerate statements" : "Generate statements"}</AnimatedActionButton><div className="mt-2 grid grid-cols-2 gap-2"><AnimatedActionButton onConfirm={() => complete(`${selectedPeriod.label} financial statements downloaded`)} workingLabel="Preparing..." successLabel="Downloaded" className="rounded-xl border border-white/15 py-2.5 text-[10px] font-bold text-white">Download PDF</AnimatedActionButton><AnimatedActionButton onConfirm={() => complete(`${selectedPeriod.label} financial statements exported`)} workingLabel="Exporting..." successLabel="Exported" className="rounded-xl border border-white/15 py-2.5 text-[10px] font-bold text-white">Export Excel</AnimatedActionButton></div></section>
            </aside>
          </div>
        </div>
      )}

      {pathname === "/inventory/variance" && <form noValidate id="variance-form" onSubmit={(event) => event.preventDefault()} className="mt-6 w-full rounded-2xl border border-amber-200 bg-white p-5 shadow-card sm:p-7"><div className="grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-canvas p-4"><p className="text-xs text-muted">Recorded quantity</p><p className="mt-2 text-xl font-bold">126 units</p></div><div className="rounded-xl bg-canvas p-4"><p className="text-xs text-muted">Physical count</p><p className="mt-2 text-xl font-bold">118 units</p></div><div className="rounded-xl bg-amber-50 p-4"><p className="text-xs text-amber-800">Variance</p><p className="mt-2 text-xl font-bold text-amber-900">−₱1,280</p></div></div><label className="mt-5 block"><span className="mb-2 flex justify-between text-xs font-bold"><span>Resolution note</span><span className="font-medium text-muted">Required · max 400</span></span><textarea required maxLength={400} data-validation-message="Explain the variance or describe the corrective action before posting." onInput={validateMeaningfulText} className="min-h-28 w-full rounded-xl border border-line p-3 text-sm" placeholder="Explain the difference or corrective action..." /></label><FormError message={formErrors["variance-form"]} /><AnimatedActionButton formId="variance-form" onValidationError={(message) => setFormError("variance-form", message)} onConfirm={() => complete("Variance adjustment recorded", "/inventory")} workingLabel="Posting..." successLabel="Adjustment posted" className="mt-4 rounded-xl bg-brand px-5 py-3 text-xs font-bold text-white">Post inventory adjustment</AnimatedActionButton></form>}

      {pathname === "/shift/close" && <form noValidate id="shift-close-form" onSubmit={(event) => event.preventDefault()} className="mt-6 w-full rounded-2xl border border-line bg-white p-5 shadow-card sm:p-7"><div className="grid grid-cols-2 gap-3"><div className="rounded-xl bg-canvas p-4"><p className="text-xs text-muted">Expected cash</p><p className="mt-2 text-xl font-bold">₱24,860</p></div><div className="rounded-xl bg-emerald-50 p-4"><p className="text-xs text-emerald-700">Counted cash</p><p className="mt-2 text-xl font-bold">₱24,860</p></div></div><label className="mt-5 block"><span className="mb-2 flex justify-between text-xs font-bold"><span>Closing note</span><span className="font-medium text-muted">Required · max 240</span></span><input required maxLength={240} data-validation-message="Add a closing note so this shift has a complete audit trail." onInput={validateMeaningfulText} className="h-12 w-full rounded-xl border border-line px-3 text-sm" placeholder="Add a note for the audit trail" /></label><FormError message={formErrors["shift-close-form"]} /><AnimatedActionButton formId="shift-close-form" onValidationError={(message) => setFormError("shift-close-form", message)} onConfirm={() => complete("Shift closed and journal entry posted", "/")} workingLabel="Closing shift..." successLabel="Shift closed" className="mt-5 w-full rounded-xl bg-brand py-3 text-xs font-bold text-white">Confirm and close shift</AnimatedActionButton></form>}

      {pathname === "/search" && (
        <section className="mt-6 w-full rounded-2xl border border-line bg-white p-5 shadow-card sm:p-7">
          <div className="relative">
            <div className={`flex items-center gap-3 rounded-xl border bg-canvas px-4 transition ${globalSearchQuery ? "border-brand ring-4 ring-emerald-50" : "border-brand"}`}><Icon name="search" className="size-5 text-muted" /><input autoFocus value={globalSearchQuery} onChange={(event) => setGlobalSearchQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && productSuggestions[0]) navigate(`/inventory/products/${productSuggestions[0].slug}`); }} maxLength={100} className="h-14 min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Start typing a product name..." aria-label="Search products" aria-controls="predictive-results" aria-expanded={Boolean(globalSearchQuery)} />{globalSearchQuery && <button onClick={() => setGlobalSearchQuery("")} aria-label="Clear search" className="grid size-8 place-items-center rounded-lg text-muted transition hover:bg-white hover:text-ink"><Icon name="plus" className="size-4 rotate-45" /></button>}</div>
            {globalSearchQuery && <div id="predictive-results" className="animate-search-results mt-2 overflow-hidden rounded-2xl border border-line bg-white shadow-xl"><div className="flex items-center justify-between border-b border-line px-4 py-3"><p className="text-[10px] font-bold uppercase tracking-wider text-muted">Products starting with “{globalSearchQuery.trim().charAt(0).toUpperCase()}”</p><p className="text-[10px] text-muted">{productSuggestions.length} suggestions</p></div>{productSuggestions.length ? <div className="divide-y divide-line">{productSuggestions.map((product) => <button key={product.slug} onClick={() => navigate(`/inventory/products/${product.slug}`)} className="group flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-emerald-50"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-canvas text-brand transition group-hover:bg-white"><Icon name="box" className="size-5" /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold">{product.name}</span><span className="mt-0.5 block text-[10px] text-muted">{product.sku} · {product.category}</span></span><span className="hidden text-right sm:block"><span className={`block text-xs font-bold ${product.stock <= product.reorder ? "text-amber-700" : "text-ink"}`}>{product.stock} in stock</span><span className="mt-0.5 block text-[10px] text-muted">{product.price}</span></span><Icon name="chevron" className="size-4 shrink-0 text-muted" /></button>)}</div> : <div className="p-7 text-center"><span className="mx-auto grid size-10 place-items-center rounded-xl bg-canvas text-muted"><Icon name="search" className="size-5" /></span><p className="mt-3 text-sm font-bold">No products start with “{globalSearchQuery.trim()}”</p><p className="mt-1 text-xs text-muted">Try another product name or a shorter prefix.</p></div>}<div className="border-t border-line bg-canvas px-4 py-2 text-[9px] text-muted">Press Enter to open the first suggestion</div></div>}
          </div>
          <p className="mt-4 text-xs text-muted">Suggestions update instantly from the first letter. Search is limited to 100 characters.</p>
          <div className="mt-6 grid gap-3 border-t border-line pt-5 sm:grid-cols-3">{[["Journal entries","Search references and descriptions","ledger"],["Products","Find stock and suppliers","box"],["Reports","Open financial insights","chart"]].map(([label,note,icon]) => <button key={label} onClick={() => navigate(label === "Journal entries" ? "/journal" : label === "Products" ? "/inventory/products" : "/reports")} className="rounded-xl bg-canvas p-4 text-left transition hover:bg-emerald-50"><Icon name={icon as IconName} className="size-5 text-brand" /><span className="mt-3 block text-xs font-bold">{label}</span><span className="mt-1 block text-[10px] text-muted">{note}</span></button>)}</div>
        </section>
      )}

      {pathname === "/notifications" && <section className="mt-6 w-full overflow-hidden rounded-2xl border border-line bg-white shadow-card">{[["Inventory variance needs review","Bottled drinks are short by ₱1,280.","/inventory/variance"],["Three journal entries need approval",`Review before ${selectedPeriod.shortLabel.toLowerCase()}.`,"/journal?status=review"],["12 products are low in stock","Create a restocking list.","/inventory"]].map(([title,note,path]) => <button key={title} onClick={() => navigate(path)} className="flex w-full items-start gap-3 border-b border-line p-5 text-left last:border-0 hover:bg-canvas sm:p-6"><span className="mt-1 size-2 rounded-full bg-brand" /><span className="flex-1"><span className="block text-sm font-bold">{title}</span><span className="mt-1 block text-xs text-muted">{note}</span></span><Icon name="chevron" className="size-4 text-muted" /></button>)}</section>}

      {(pathname === "/reports/cash" || pathname === "/reports/sales") && (
        <div className="mt-6 space-y-5">
          <div className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-3 shadow-card sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2"><select value={reportRange} onChange={(event) => setReportRange(event.target.value)} className="h-10 rounded-xl border border-line bg-white px-3 text-xs font-bold"><option>This month</option><option>Last month</option><option>This quarter</option><option>Year to date</option></select><button onClick={() => navigate(`/reports/${isCashReport ? "cash" : "sales"}/compare?period=${encodeURIComponent(reportRange)}`)} className="flex h-10 items-center gap-1.5 rounded-xl border border-line px-3 text-xs font-bold text-muted">Compare period <Icon name="arrow" className="size-3.5" /></button></div>
            <div className="flex items-center gap-2"><div className="flex rounded-xl bg-canvas p-1"><button onClick={() => setReportView("chart")} className={`rounded-lg px-3 py-2 text-[10px] font-bold ${reportView === "chart" ? "bg-white text-ink shadow-sm" : "text-muted"}`}>Chart</button><button onClick={() => setReportView("table")} className={`rounded-lg px-3 py-2 text-[10px] font-bold ${reportView === "table" ? "bg-white text-ink shadow-sm" : "text-muted"}`}>Table</button></div><AnimatedActionButton onConfirm={() => complete(`${isCashReport ? "Cash" : "Sales"} report downloaded`)} workingLabel="Preparing..." successLabel="Downloaded" className="h-10 rounded-xl bg-brand px-4 text-xs font-bold text-white">Download</AnimatedActionButton></div>
          </div>
          <section className="grid gap-3 sm:grid-cols-3">{reportMetrics.map(([label,value,note]) => <div key={label} className="rounded-2xl border border-line bg-white p-4 shadow-card"><p className="text-[10px] font-bold uppercase tracking-wider text-muted">{label}</p><p className="mt-2 text-xl font-bold">{value}</p><p className="mt-1 text-[10px] font-medium text-emerald-700">{note}</p></div>)}</section>
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
            <section className="rounded-2xl border border-line bg-white p-5 shadow-card">
              <div className="flex items-center justify-between"><div><h2 className="text-sm font-bold">{isCashReport ? "Daily cash position" : "Daily sales trend"}</h2><p className="mt-1 text-xs text-muted">{reportRange} · compared with previous period</p></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">+8.4%</span></div>
              {reportView === "chart" ? <><div className="mt-6 flex h-56 items-end gap-2 border-b border-line">{[45,62,54,78,66,88,74,92,68,84,95,82].map((height,index) => <div key={index} className="group relative flex-1 rounded-t-md bg-brand/80 transition hover:bg-brand" style={{ height: `${height}%` }}><span className="absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-sidebar px-2 py-1 text-[8px] text-white group-hover:block">₱{(height * (isCashReport ? 72 : 184)).toLocaleString()}</span></div>)}</div><div className="mt-3 flex justify-between text-[10px] text-muted"><span>Nov 1</span><span>Nov 15</span><span>Nov 30</span></div></> : <div className="mt-5 overflow-hidden rounded-xl border border-line"><div className="grid grid-cols-3 bg-canvas p-3 text-[10px] font-bold uppercase text-muted"><span>Period</span><span className="text-right">Amount</span><span className="text-right">Change</span></div>{[["Nov 1–7","₱92,420","+4.2%"],["Nov 8–14","₱101,680","+7.8%"],["Nov 15–21","₱106,240","+9.1%"],["Nov 22–30","₱112,340","+11.4%"]].map(([period,amount,change]) => <div key={period} className="grid grid-cols-3 border-t border-line p-3 text-xs"><span>{period}</span><span className="text-right font-bold">{amount}</span><span className="text-right font-bold text-emerald-700">{change}</span></div>)}</div>}
            </section>
            <aside className="space-y-5">
              <section className="rounded-2xl bg-sidebar p-5 text-white"><p className="text-[10px] font-bold uppercase tracking-wider text-white/45">{reportRange} total</p><p className="mt-2 text-3xl font-bold">{isCashReport ? "₱84,250" : "₱412,680"}</p><p className="mt-2 text-xs text-emerald-300">Up 8.4% from previous period</p><div className="mt-5 border-t border-white/10 pt-4"><p className="text-[10px] text-white/45">{isCashReport ? "Available liquidity" : "Projected month end"}</p><p className="mt-1 text-sm font-bold">{isCashReport ? "Strong · 1.8 months" : "₱438,000"}</p></div></section>
              <section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5"><div className="flex items-start gap-3"><Icon name="spark" className="size-5 shrink-0 text-brand" /><div><h2 className="text-xs font-bold text-emerald-950">SariLedger insight</h2><p className="mt-1 text-xs leading-relaxed text-emerald-800">{isCashReport ? "GCash is now your largest cash channel at 37.3%. Reconcile it before month close." : "Weekend sales are 18% higher than weekdays. Bottled drinks lead the increase."}</p></div></div></section>
            </aside>
          </div>
          <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
            <div className="flex items-center justify-between border-b border-line p-5"><div><h2 className="text-sm font-bold">{isCashReport ? "Recent cash movements" : "Top-selling products"}</h2><p className="mt-1 text-xs text-muted">{isCashReport ? "Transactions affecting available cash" : "Products ranked by current-period revenue"}</p></div><button onClick={() => navigate(isCashReport ? "/journal" : "/inventory")} className="flex items-center gap-1.5 text-xs font-bold text-brand">View all <Icon name="arrow" className="size-3.5" /></button></div>
            <div className="divide-y divide-line">{reportRows.map(([label,type,amount,time],index) => <button key={label} onClick={() => navigate(isCashReport ? `/journal/${transactions[index]?.ref ?? "JE-1048"}` : "/inventory")} className="grid w-full grid-cols-[1fr_auto] items-center gap-4 p-4 text-left transition hover:bg-canvas sm:grid-cols-[1fr_150px_120px] sm:px-5"><div><p className="text-sm font-bold">{label}</p><p className="mt-1 text-xs text-muted">{type}</p></div><p className="hidden text-xs text-muted sm:block">{time}</p><div className="flex items-center justify-end gap-2"><p className={`text-sm font-bold ${amount.startsWith("+") ? "text-emerald-700" : ""}`}>{amount}</p><Icon name="chevron" className="size-4 text-muted" /></div></button>)}</div>
          </section>
        </div>
      )}
    </div>
  );
}

function BasicDashboard({ navigate, businessName, lowStockCount, selectedPeriod }: { navigate: (path: string) => void; businessName: string; lowStockCount: number; selectedPeriod: AccountingPeriod }) {
  const progress = Math.round((selectedPeriod.checks.filter(Boolean).length / selectedPeriod.checks.length) * 100);
  return (
    <div className="mx-auto max-w-5xl px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
      <section className="rounded-3xl bg-sidebar p-6 text-white shadow-xl sm:p-8">
        <p className="text-sm font-semibold text-emerald-300">Welcome, Ana</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">What would you like to do?</h1>
        <p className="mt-2 text-base text-white/60">Choose one of the common tasks below for {businessName}.</p>
      </section>
      <section className="mt-5 grid gap-4 sm:grid-cols-2">
        {[
          ["Record a sale", "Add today’s cash or GCash sale", "cash", "/journal/new?type=sales-entry", "bg-emerald-50 text-emerald-700"],
          ["Check products", "See stock and items to reorder", "box", "/inventory/stocks", "bg-amber-50 text-amber-700"],
          ["View money reports", "Understand sales, cash, and profit", "chart", "/reports", "bg-sky-50 text-sky-700"],
          ["Close today’s shift", "Confirm the cash drawer and finish the day", "check", "/shift/close", "bg-violet-50 text-violet-700"],
        ].map(([label, description, icon, path, tone]) => <button key={label} onClick={() => navigate(path)} className="group flex min-h-32 items-center gap-4 rounded-2xl border border-line bg-white p-5 text-left shadow-card transition hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-lg"><span className={`grid size-14 shrink-0 place-items-center rounded-2xl ${tone}`}><Icon name={icon as IconName} className="size-7" /></span><span className="min-w-0 flex-1"><span className="block text-lg font-bold">{label}</span><span className="mt-1 block text-sm leading-relaxed text-muted">{description}</span></span><Icon name="chevron" className="size-5 shrink-0 text-muted transition group-hover:translate-x-1" /></button>)}
      </section>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_320px]">
        <section className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="flex items-center justify-between"><div><h2 className="text-lg font-bold">Today at a glance</h2><p className="mt-1 text-sm text-muted">Simple store summary</p></div><span className="grid size-10 place-items-center rounded-full bg-emerald-50 text-brand"><Icon name="check" className="size-5" /></span></div>
          <div className="mt-5 grid grid-cols-2 gap-3"><button onClick={() => navigate("/reports/sales")} className="rounded-xl bg-canvas p-4 text-left"><p className="text-sm text-muted">Sales today</p><p className="mt-2 text-xl font-bold">₱18,420</p></button><button onClick={() => navigate("/inventory/stocks?filter=low")} className="rounded-xl bg-canvas p-4 text-left"><p className="text-sm text-muted">Low-stock items</p><p className="mt-2 text-xl font-bold text-amber-700">{lowStockCount}</p></button></div>
        </section>
        <section className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="flex items-center justify-between"><h2 className="text-base font-bold">{selectedPeriod.shortLabel}</h2><span className="text-sm font-bold text-brand">{progress}%</span></div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-brand" style={{ width: `${progress}%` }} /></div>
          <p className="mt-3 text-sm leading-relaxed text-muted">{5 - selectedPeriod.checks.filter(Boolean).length} steps remain before reports are final.</p>
          <button onClick={() => navigate("/close")} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-line py-3 text-sm font-bold">Continue checklist <Icon name="arrow" className="size-4" /></button>
        </section>
      </div>
      <section className="mt-5 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700"><Icon name="alert" className="size-5" /></span><div className="flex-1"><p className="text-base font-bold text-amber-950">A stock difference needs review</p><p className="mt-1 text-sm text-amber-800">Bottled drinks are short by ₱1,280.</p></div><button onClick={() => navigate("/inventory/variance")} className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-amber-900 shadow-sm">Review now</button></section>
    </div>
  );
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [authenticated, setAuthenticated] = useState(() => {
    try {
      const saved = window.localStorage.getItem("sariledger-session");
      if (!saved) return false;
      const session = JSON.parse(saved) as { expiresAt: number };
      if (session.expiresAt <= Date.now()) {
        window.localStorage.removeItem("sariledger-session");
        return false;
      }
      return true;
    } catch {
      return false;
    }
  });
  const [uiMode, setUiMode] = useState<"standard" | "basic">(() => window.localStorage.getItem("sariledger-ui-mode") === "basic" ? "basic" : "standard");
  const routeSection = navigation.find((item) => item.path !== "/" && location.pathname.startsWith(item.path));
  const accountingSubRoute = location.pathname === "/ledger" || location.pathname === "/trial-balance";
  const inSettings = location.pathname.startsWith("/settings");
  const settingsContextPath = inSettings ? new URLSearchParams(location.search).get("from") : null;
  const settingsContext = navigation.find((item) => item.path === settingsContextPath);
  const active = inSettings ? settingsContext?.label ?? "Overview" : accountingSubRoute ? "Journal" : routeSection?.label ?? "Overview";
  const breadcrumbLabel = location.pathname === "/ledger" ? "Ledger" : location.pathname === "/trial-balance" ? "Trial balance" : location.pathname === "/inventory/products" ? "Products" : location.pathname === "/inventory/stocks" ? "Stock levels" : location.pathname === "/reports/products" ? "Product report" : active;
  const [notice, setNotice] = useState("");
  const [activityLog, setActivityLog] = useState<ActivityRecord[]>(() => {
    try {
      const saved = window.localStorage.getItem("sariledger-activity");
      return saved ? JSON.parse(saved) as ActivityRecord[] : initialActivity;
    } catch {
      return initialActivity;
    }
  });
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(() => {
    try {
      const saved = window.localStorage.getItem("sariledger-business-profile");
      return saved ? JSON.parse(saved) as BusinessProfile : initialBusinessProfile;
    } catch {
      return initialBusinessProfile;
    }
  });
  const [periods, setPeriods] = useState<AccountingPeriod[]>(() => {
    try {
      const saved = window.localStorage.getItem("sariledger-periods");
      return saved ? JSON.parse(saved) as AccountingPeriod[] : initialPeriods;
    } catch {
      return initialPeriods;
    }
  });
  const [selectedPeriodId, setSelectedPeriodId] = useState(() => window.localStorage.getItem("sariledger-selected-period") ?? "2025-11");
  const selectedPeriod = periods.find((period) => period.id === selectedPeriodId) ?? periods[0];
  const selectedPeriodProgress = Math.round((selectedPeriod.checks.filter(Boolean).length / selectedPeriod.checks.length) * 100);
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = window.localStorage.getItem("sariledger-products");
      return saved ? (JSON.parse(saved) as Product[]) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [categories, setCategories] = useState<string[]>(() => {
    try {
      const saved = window.localStorage.getItem("sariledger-categories");
      return saved ? (JSON.parse(saved) as string[]) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  });

  const [debts, setDebts] = useState<CustomerDebt[]>(() => {
    try {
      const saved = window.localStorage.getItem("sariledger-debts");
      return saved ? (JSON.parse(saved) as CustomerDebt[]) : INITIAL_CUSTOMER_DEBTS;
    } catch {
      return INITIAL_CUSTOMER_DEBTS;
    }
  });

  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>(() => {
    try {
      const saved = window.localStorage.getItem("sariledger-pending-payments");
      return saved ? (JSON.parse(saved) as PendingPayment[]) : INITIAL_PENDING_PAYMENTS;
    } catch {
      return INITIAL_PENDING_PAYMENTS;
    }
  });

  const [supplierOrders, setSupplierOrders] = useState<SupplierOrder[]>(() => {
    try {
      const saved = window.localStorage.getItem("sariledger-supplier-orders");
      return saved ? (JSON.parse(saved) as SupplierOrder[]) : INITIAL_SUPPLIER_ORDERS;
    } catch {
      return INITIAL_SUPPLIER_ORDERS;
    }
  });

  const [receipts, setReceipts] = useState<Receipt[]>(() => {
    try {
      const saved = window.localStorage.getItem("sariledger-receipts");
      return saved ? (JSON.parse(saved) as Receipt[]) : INITIAL_RECEIPTS;
    } catch {
      return INITIAL_RECEIPTS;
    }
  });

  const [storeTransactions, setStoreTransactions] = useState<TransactionRecord[]>(() => {
    try {
      const saved = window.localStorage.getItem("sariledger-transactions");
      return saved ? (JSON.parse(saved) as TransactionRecord[]) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [showPosModal, setShowPosModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedReceiptModal, setSelectedReceiptModal] = useState<Receipt | null>(null);

  const lowStockProducts = products.filter((product) => product.stock <= product.reorder);
  const businessInitials = businessProfile.name.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]?.toUpperCase()).join("") || "CM";

  const handleSaveProduct = (updatedProduct: Product) => {
    setProducts((current) => {
      const exists = current.some((p) => p.slug === updatedProduct.slug);
      const next = exists
        ? current.map((p) => (p.slug === updatedProduct.slug ? updatedProduct : p))
        : [updatedProduct, ...current];
      window.localStorage.setItem("sariledger-products", JSON.stringify(next));
      return next;
    });

    if (updatedProduct.category && !categories.includes(updatedProduct.category)) {
      setCategories((current) => {
        const next = [...current, updatedProduct.category];
        window.localStorage.setItem("sariledger-categories", JSON.stringify(next));
        return next;
      });
    }

    showNotice(`Product "${updatedProduct.name}" saved successfully`);
    setEditingProduct(null);
    setShowAddProductModal(false);
  };

  const handleAddDebt = (debt: CustomerDebt) => {
    setDebts((current) => {
      const next = [debt, ...current];
      window.localStorage.setItem("sariledger-debts", JSON.stringify(next));
      return next;
    });
    showNotice(`Added debt record for ${debt.customerName}: ₱${debt.amount.toFixed(2)}`);
  };

  const handleRecordDebtPayment = (debtId: string, amount: number, paymentMethod: string) => {
    let customerName = "Customer";
    setDebts((current) => {
      const next = current.map((d) => {
        if (d.id !== debtId) return d;
        customerName = d.customerName;
        const newPaid = d.paidAmount + amount;
        const newStatus: CustomerDebt["status"] = newPaid >= d.amount ? "Settled" : "Partially paid";
        return { ...d, paidAmount: newPaid, status: newStatus };
      });
      window.localStorage.setItem("sariledger-debts", JSON.stringify(next));
      return next;
    });

    const txRef = `JE-${1050 + storeTransactions.length}`;
    const newTx: TransactionRecord = {
      ref: txRef,
      title: `Debt settlement: ${customerName}`,
      detail: `${paymentMethod} · Customer credit payment`,
      amount: `₱${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      numericAmount: amount,
      time: `Today, ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`,
      kind: "sale",
      status: "Posted",
      icon: "wallet",
      paymentMethod,
    };
    setStoreTransactions((current) => {
      const next = [newTx, ...current];
      window.localStorage.setItem("sariledger-transactions", JSON.stringify(next));
      return next;
    });

    showNotice(`Recorded ₱${amount.toFixed(2)} payment from ${customerName}`);
  };

  const handleAddPendingPayment = (payment: PendingPayment) => {
    setPendingPayments((current) => {
      const next = [payment, ...current];
      window.localStorage.setItem("sariledger-pending-payments", JSON.stringify(next));
      return next;
    });
    showNotice(`Added pending payable: ${payment.vendorName} (₱${payment.amount.toFixed(2)})`);
  };

  const handleSettlePayment = (paymentId: string, source: string) => {
    let vendor = "Vendor";
    let amount = 0;
    setPendingPayments((current) => {
      const next = current.map((p) => {
        if (p.id !== paymentId) return p;
        vendor = p.vendorName;
        amount = p.amount;
        return { ...p, status: "Paid" as const, paidDate: new Date().toISOString().split("T")[0] };
      });
      window.localStorage.setItem("sariledger-pending-payments", JSON.stringify(next));
      return next;
    });

    const txRef = `JE-${1050 + storeTransactions.length}`;
    const newTx: TransactionRecord = {
      ref: txRef,
      title: `Bill settled: ${vendor}`,
      detail: `${source} · Accounts payable payment`,
      amount: `₱${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      numericAmount: -amount,
      time: `Today, ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`,
      kind: "expense",
      status: "Posted",
      icon: "receipt",
    };
    setStoreTransactions((current) => {
      const next = [newTx, ...current];
      window.localStorage.setItem("sariledger-transactions", JSON.stringify(next));
      return next;
    });

    showNotice(`Paid ${vendor} bill of ₱${amount.toFixed(2)} from ${source}`);
  };

  const handleCreateSupplierOrder = (order: SupplierOrder) => {
    setSupplierOrders((current) => {
      const next = [order, ...current];
      window.localStorage.setItem("sariledger-supplier-orders", JSON.stringify(next));
      return next;
    });

    const payable: PendingPayment = {
      id: `pp-${Date.now()}`,
      vendorName: order.supplierName,
      invoiceRef: order.id,
      amount: order.totalAmount,
      dueDate: order.expectedDate,
      status: "Unpaid",
      category: "Inventory restock",
      notes: `Purchase order ${order.id} (${order.items.length} items)`,
    };
    setPendingPayments((current) => {
      const next = [payable, ...current];
      window.localStorage.setItem("sariledger-pending-payments", JSON.stringify(next));
      return next;
    });

    showNotice(`Supplier order ${order.id} placed for ${order.supplierName}`);
  };

  const handleMarkSupplierOrderReceived = (orderId: string) => {
    let targetOrder: SupplierOrder | undefined;
    setSupplierOrders((current) => {
      const next = current.map((order) => {
        if (order.id !== orderId) return order;
        targetOrder = order;
        return {
          ...order,
          status: "Received" as const,
          receivedDate: new Date().toISOString().split("T")[0],
        };
      });
      window.localStorage.setItem("sariledger-supplier-orders", JSON.stringify(next));
      return next;
    });

    if (targetOrder) {
      setProducts((current) => {
        const next = current.map((prod) => {
          const matchingItem = targetOrder?.items.find((item) => item.productSlug === prod.slug || item.productName.toLowerCase() === prod.name.toLowerCase());
          if (matchingItem) {
            return {
              ...prod,
              stock: prod.stock + matchingItem.quantity,
            };
          }
          return prod;
        });
        window.localStorage.setItem("sariledger-products", JSON.stringify(next));
        return next;
      });

      const txRef = `JE-${1050 + storeTransactions.length}`;
      const newTx: TransactionRecord = {
        ref: txRef,
        title: `${targetOrder.supplierName} restock received`,
        detail: `Inventory restocked · PO ${targetOrder.id}`,
        amount: `₱${targetOrder.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        numericAmount: targetOrder.totalAmount,
        time: `Today, ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`,
        kind: "purchase",
        status: "Posted",
        icon: "cart",
      };
      setStoreTransactions((current) => {
        const next = [newTx, ...current];
        window.localStorage.setItem("sariledger-transactions", JSON.stringify(next));
        return next;
      });

      showNotice(`PO ${orderId} received and restocked into inventory!`);
    }
  };

  const handleCompleteSale = (params: {
    receipt: Receipt;
    transaction: TransactionRecord;
    stockUpdates: { slug: string; quantitySold: number }[];
    newDebt?: CustomerDebt;
  }) => {
    setProducts((current) => {
      const next = current.map((prod) => {
        const update = params.stockUpdates.find((u) => u.slug === prod.slug);
        if (update) {
          const newUnits = prod.unitsSold + update.quantitySold;
          const priceNum = parseFloat(prod.price.replace(/[^0-9.]/g, "")) || 0;
          const currentRevNum = parseFloat(prod.revenue.replace(/[^0-9.]/g, "")) || 0;
          const newRev = currentRevNum + (priceNum * update.quantitySold);
          return {
            ...prod,
            stock: Math.max(0, prod.stock - update.quantitySold),
            unitsSold: newUnits,
            revenue: `₱${newRev.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
          };
        }
        return prod;
      });
      window.localStorage.setItem("sariledger-products", JSON.stringify(next));
      return next;
    });

    setReceipts((current) => {
      const next = [params.receipt, ...current];
      window.localStorage.setItem("sariledger-receipts", JSON.stringify(next));
      return next;
    });

    if (params.newDebt) {
      setDebts((current) => {
        const next = [params.newDebt!, ...current];
        window.localStorage.setItem("sariledger-debts", JSON.stringify(next));
        return next;
      });
    }

    setStoreTransactions((current) => {
      const next = [params.transaction, ...current];
      window.localStorage.setItem("sariledger-transactions", JSON.stringify(next));
      return next;
    });

    setShowPosModal(false);
    setSelectedReceiptModal(params.receipt);
    showNotice(`Sale recorded: Receipt #${params.receipt.id} (₱${params.receipt.total.toFixed(2)})`);
  };
  const saveBusinessProfile = (profile: BusinessProfile) => {
    setBusinessProfile(profile);
    window.localStorage.setItem("sariledger-business-profile", JSON.stringify(profile));
    document.title = `${profile.name} · SariLedger`;
  };
  const selectPeriod = (id: string) => {
    setSelectedPeriodId(id);
    window.localStorage.setItem("sariledger-selected-period", id);
  };
  const updatePeriodCheck = (index: number, complete: boolean) => {
    setPeriods((current) => {
      const updated = current.map((period) => {
        if (period.id !== selectedPeriod.id) return period;
        const checks = period.checks.map((check, checkIndex) => checkIndex === index ? complete : check);
        const status: AccountingPeriod["status"] = checks.every(Boolean) ? "Closed" : checks.some(Boolean) ? "In progress" : "Upcoming";
        return { ...period, checks, status };
      });
      window.localStorage.setItem("sariledger-periods", JSON.stringify(updated));
      return updated;
    });
  };

  const startEntry = (type = "journal") => navigate(`/journal/new?type=${encodeURIComponent(type.toLowerCase())}`);
  const openSettings = () => {
    const currentSectionPath = routeSection?.path ?? settingsContext?.path ?? "/";
    navigate(`/settings?from=${encodeURIComponent(currentSectionPath)}`);
  };
  const showNotice = (message: string) => {
    setNotice(message);
    const normalized = message.toLowerCase();
    const category: ActivityRecord["category"] = normalized.includes("variance") || normalized.includes("stock") || normalized.includes("inventory")
      ? "Inventory"
      : normalized.includes("journal") || normalized.includes("entry")
        ? "Journal"
        : normalized.includes("setting") || normalized.includes("workspace") || normalized.includes("connected") || normalized.includes("disconnected") || normalized.includes("synced")
          ? "Settings"
          : normalized.includes("profile") || normalized.includes("permission") || normalized.includes("password") || normalized.includes("pin") || normalized.includes("account") || normalized.includes("member") || normalized.includes("device")
            ? "Team"
            : normalized.includes("report") || normalized.includes("statement") || normalized.includes("export") || normalized.includes("download")
              ? "Reports"
              : normalized.includes("shift")
                ? "Shift"
                : "System";
    const record: ActivityRecord = { id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, action: message, category, actor: "Ana Reyes", timestamp: new Date().toISOString() };
    setActivityLog((current) => {
      const updated = [record, ...current].slice(0, 200);
      window.localStorage.setItem("sariledger-activity", JSON.stringify(updated));
      return updated;
    });
    window.setTimeout(() => setNotice(""), 2800);
  };
  const signOut = () => {
    window.localStorage.removeItem("sariledger-session");
    setAuthenticated(false);
  };
  const toggleUiMode = () => {
    const nextMode = uiMode === "standard" ? "basic" : "standard";
    setUiMode(nextMode);
    window.localStorage.setItem("sariledger-ui-mode", nextMode);
  };

  if (!authenticated) {
    return <AuthScreen businessName={businessProfile.name} defaultEmail={businessProfile.email} onAuthenticated={() => setAuthenticated(true)} />;
  }

  return (
    <div className={`min-h-screen bg-canvas text-ink ${uiMode === "basic" ? "basic-mode" : ""}`}>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col bg-sidebar px-4 py-5 lg:flex">
        <div className="px-2"><Logo /></div>
        <button onClick={openSettings} className="mt-8 w-full rounded-xl border border-white/8 bg-white/5 p-3 text-left transition hover:bg-white/8">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-lg bg-amber-300 text-xs font-extrabold text-sidebar">{businessInitials}</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-white">{businessProfile.name}</p>
              <p className="truncate text-[11px] text-white/45">{businessProfile.address} · Main</p>
            </div>
            <Icon name="chevron" className="size-3 rotate-90 text-white/35" />
          </div>
        </button>
        <nav className="mt-7 space-y-1">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">Workspace</p>
          {navigation.map((item) => (
            <button key={item.label} onClick={() => navigate(item.path)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${active === item.label ? "bg-brand text-white shadow-md shadow-black/10" : "text-white/55 hover:bg-white/5 hover:text-white"}`}>
              <Icon name={item.icon} className="size-[18px]" />{uiMode === "basic" ? ({ Overview: "Home", Journal: "Record money", Inventory: "Products", Reports: "Money reports", Team: "People", History: "Activity" } as Record<string, string>)[item.label] : item.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto">
          <button onClick={() => navigate("/close")} className="mb-3 w-full rounded-xl border border-white/8 bg-white/5 p-3 text-left transition hover:bg-white/8">
            <div className="mb-2 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-white/60">{selectedPeriod.shortLabel}</span><span className="font-bold text-emerald-300">{selectedPeriodProgress}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${selectedPeriodProgress}%` }} /></div>
            <p className="mt-2 text-[10px] leading-relaxed text-white/35">{5 - selectedPeriod.checks.filter(Boolean).length} checks left before statements</p>
          </button>
          <button onClick={openSettings} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${inSettings ? "bg-brand text-white" : "text-white/50 hover:bg-white/5 hover:text-white"}`}><Icon name="settings" className="size-[18px]" />Settings</button>
          <button onClick={() => navigate("/team")} className="mt-3 flex w-full items-center gap-3 border-t border-white/8 px-2 pt-4 text-left">
            <div className="grid size-9 place-items-center rounded-full bg-white/10 text-xs font-bold text-white">AR</div>
            <div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-white">Ana Reyes</p><p className="truncate text-[10px] text-white/35">Owner · Bookkeeper</p></div>
            <Icon name="more" className="size-4 text-white/30" />
          </button>
          <button onClick={signOut} className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[11px] font-semibold text-white/40 transition hover:bg-white/5 hover:text-white"><Icon name="arrow" className="size-3.5 rotate-180" />Sign out securely</button>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line bg-white/90 px-4 backdrop-blur lg:ml-60 lg:px-8">
        <div className="lg:hidden"><Logo dark /></div>
        <div className="hidden items-center gap-2 text-sm text-muted lg:flex"><span className="font-medium">{businessProfile.name}</span><span>/</span><span className="font-bold text-ink">{breadcrumbLabel}</span></div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/search")} aria-label="Search" className="grid size-9 place-items-center rounded-xl text-muted transition hover:bg-canvas hover:text-ink"><Icon name="search" className="size-[18px]" /></button>
          <button onClick={() => navigate("/notifications")} aria-label="Notifications" className="relative grid size-9 place-items-center rounded-xl text-muted transition hover:bg-canvas hover:text-ink"><Icon name="bell" className="size-[18px]" /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-rose-500 ring-2 ring-white" /></button>
          <button onClick={toggleUiMode} aria-pressed={uiMode === "basic"} title={`Switch to ${uiMode === "standard" ? "Basic" : "Standard"} mode`} className={`flex h-9 items-center gap-2 rounded-xl border px-2.5 text-[10px] font-bold transition sm:px-3 ${uiMode === "basic" ? "border-brand bg-emerald-50 text-brand" : "border-line bg-white text-muted hover:text-ink"}`}><Icon name={uiMode === "basic" ? "spark" : "grid"} className="size-4" /><span className="hidden sm:inline">{uiMode === "basic" ? "Basic mode" : "Standard mode"}</span></button>
          <button onClick={() => setShowPosModal(true)} className="ml-1 hidden items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-800/20 transition hover:bg-emerald-800 sm:flex"><Icon name="cash" className="size-4" />Record Sale (POS)</button>
          <button onClick={() => setShowPosModal(true)} aria-label="Record Sale (POS)" className="ml-1 grid size-9 place-items-center rounded-xl bg-emerald-700 text-white sm:hidden"><Icon name="cash" className="size-4" /></button>
          <button onClick={() => startEntry()} className="ml-1 hidden items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-brand/15 transition hover:bg-brand-dark sm:flex"><Icon name="plus" className="size-4" />New entry</button>
          <button onClick={() => startEntry()} aria-label="New entry" className="ml-1 grid size-9 place-items-center rounded-xl bg-brand text-white sm:hidden"><Icon name="plus" className="size-4" /></button>
        </div>
      </header>

      <main className="pb-24 lg:ml-60 lg:pb-10">
        {location.pathname === "/" ? (
        uiMode === "basic" ? (
          <BasicDashboard navigate={navigate} businessName={businessProfile.name} lowStockCount={lowStockProducts.length} selectedPeriod={selectedPeriod} />
        ) : (
        <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <section className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-brand"><span className="h-px w-5 bg-brand" />Monday, November 18</div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Good morning, Ana.</h1>
              <p className="mt-1 text-sm text-muted">Here’s how {businessProfile.name} is doing today.</p>
            </div>
            <select aria-label="Dashboard period" className="h-10 w-fit rounded-xl border border-line bg-white px-4 text-xs font-bold text-ink shadow-sm outline-none transition hover:border-brand/30"><option>This month</option><option>This week</option><option>Today</option></select>
          </section>

          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            <MetricCard icon="wallet" label="Cash balance" value="₱84,250" note="+₱12,460 this month" tone="green" onClick={() => navigate("/reports/cash")} />
            <MetricCard icon="cash" label="Today's sales" value="₱18,420" note="142 transactions" tone="blue" onClick={() => navigate("/reports/sales")} />
            <MetricCard icon="box" label="Low stock" value={`${lowStockProducts.length} items`} note="Below reorder point" tone="amber" onClick={() => navigate("/inventory/stocks?filter=low")} />
            <MetricCard icon="receipt" label="For review" value="3 entries" note="₱8,945 total" tone="ink" onClick={() => navigate("/journal?status=review")} />
          </section>

          <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-5">
              <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
                <div className="flex flex-col justify-between gap-3 border-b border-line p-5 sm:flex-row sm:items-center">
                  <div>
                    <div className="flex items-center gap-2"><h2 className="text-base font-bold">{selectedPeriod.label} accounting cycle</h2><span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">{selectedPeriod.status}</span></div>
                    <p className="mt-1 text-xs text-muted">Complete each stage to keep your books accurate.</p>
                  </div>
                  <button onClick={() => navigate("/close")} className="flex items-center gap-1.5 text-xs font-bold text-brand transition hover:text-brand-dark">Open checklist <Icon name="arrow" className="size-3.5" /></button>
                </div>
                <div className="overflow-x-auto p-5">
                  <div className="flex min-w-[600px] items-start">
                    {[
                      ["1", "Journal entries", "184 recorded"],
                      ["2", "Posting", "184 posted"],
                      ["3", "Trial balance", "Balanced"],
                      ["4", "Adjustments", "3 to review"],
                      ["5", "Statements", "Not started"],
                    ].map(([number, label, detail], index) => {
                      const done = selectedPeriod.checks[index];
                      return (
                      <div key={String(label)} className="flex flex-1 items-start">
                        <div className="min-w-[96px]">
                          <div className={`grid size-8 place-items-center rounded-full border-2 text-xs font-bold ${done ? "border-brand bg-brand text-white" : index === 3 ? "border-amber-400 bg-amber-50 text-amber-700" : "border-line bg-canvas text-muted"}`}>{done ? <Icon name="check" className="size-4" /> : number}</div>
                          <p className="mt-2 text-xs font-bold text-ink">{label}</p>
                          <p className={`mt-0.5 text-[10px] font-medium ${!done && index === 3 ? "text-amber-700" : "text-muted"}`}>{done && selectedPeriod.status === "Closed" ? "Completed" : detail}</p>
                        </div>
                        {index < 4 && <div className={`mt-4 h-0.5 flex-1 ${selectedPeriod.checks[index] ? "bg-brand" : "bg-line"}`} />}
                      </div>
                    );})}
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:flex sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700"><Icon name="alert" className="size-4" /></div>
                  <div><p className="text-sm font-bold text-amber-950">Unusual inventory variance detected</p><p className="mt-1 text-xs leading-relaxed text-amber-800">Bottled drinks are short by ₱1,280 versus recorded sales. Review today’s count before closing.</p></div>
                </div>
                <button onClick={() => navigate("/inventory/variance")} className="mt-3 ml-12 whitespace-nowrap text-xs font-bold text-amber-900 underline decoration-amber-400 underline-offset-4 sm:mt-0 sm:ml-4">Review variance</button>
              </section>

              <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
                <div className="flex items-center justify-between border-b border-line p-5">
                  <div><h2 className="text-base font-bold">Recent journal entries</h2><p className="mt-1 text-xs text-muted">Latest activity across all payment channels</p></div>
                  <button onClick={() => navigate("/journal")} className="hidden items-center gap-1.5 text-xs font-bold text-brand sm:flex">View journal <Icon name="arrow" className="size-3.5" /></button>
                </div>
                <div className="divide-y divide-line">
                  {transactions.map((transaction) => (
                    <div key={transaction.ref} className="flex items-center gap-3 p-4 transition hover:bg-canvas/60 sm:gap-4 sm:px-5">
                      <div className={`grid size-10 shrink-0 place-items-center rounded-xl ${transaction.kind === "sale" ? "bg-emerald-50 text-emerald-700" : transaction.kind === "purchase" ? "bg-sky-50 text-sky-700" : transaction.kind === "expense" ? "bg-amber-50 text-amber-700" : "bg-violet-50 text-violet-700"}`}><Icon name={transaction.icon} className="size-5" /></div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2"><p className="truncate text-sm font-bold">{transaction.title}</p><span className="hidden text-[10px] font-semibold text-muted sm:inline">{transaction.ref}</span></div>
                        <p className="mt-0.5 truncate text-xs text-muted">{transaction.detail}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{transaction.amount}</p>
                        <div className="mt-1 flex items-center justify-end gap-2"><span className="hidden text-[10px] text-muted md:inline">{transaction.time}</span><span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${transaction.status === "Posted" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{transaction.status}</span></div>
                      </div>
                      <button onClick={() => navigate(`/journal/${transaction.ref}`)} aria-label={`Open ${transaction.title}`} className="hidden rounded-lg p-1 text-muted hover:bg-canvas sm:block"><Icon name="more" className="size-4" /></button>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <aside className="space-y-5">
              <section className="rounded-2xl border border-line bg-white p-5 shadow-card">
                <div className="mb-4 flex items-center justify-between"><div><h2 className="text-base font-bold">Quick record</h2><p className="mt-1 text-xs text-muted">Create a balanced entry fast.</p></div><div className="grid size-8 place-items-center rounded-xl bg-brand text-white"><Icon name="spark" className="size-4" /></div></div>
                <div className="space-y-2">
                  <Shortcut icon="cash" label="Record a sale" description="Cash, GCash, or credit" onClick={() => startEntry("Sales entry")} />
                  <Shortcut icon="cart" label="Record a purchase" description="Stock and supplier bills" onClick={() => startEntry("Purchase entry")} />
                  <Shortcut icon="receipt" label="Record an expense" description="Utilities and store costs" onClick={() => startEntry("Expense entry")} />
                </div>
              </section>
              <section className="rounded-2xl bg-sidebar p-5 text-white shadow-xl shadow-slate-900/10">
                <div className="flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">Shift snapshot</p><h2 className="mt-2 text-lg font-bold">Drawer is balanced</h2></div><div className="grid size-9 place-items-center rounded-full bg-emerald-400/15 text-emerald-300"><Icon name="check" className="size-4" /></div></div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white/5 p-3"><p className="text-[10px] text-white/40">Expected</p><p className="mt-1 text-sm font-bold">₱24,860</p></div>
                  <div className="rounded-xl bg-white/5 p-3"><p className="text-[10px] text-white/40">Counted</p><p className="mt-1 text-sm font-bold">₱24,860</p></div>
                </div>
                <button onClick={() => navigate("/shift/close")} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-xs font-bold text-sidebar transition hover:bg-emerald-50">Close today’s shift <Icon name="arrow" className="size-3.5" /></button>
              </section>
              <section className="rounded-2xl border border-line bg-white p-5 shadow-card">
                <div className="flex items-center justify-between"><h2 className="text-sm font-bold">Top-selling this month</h2><button onClick={() => navigate("/reports/products")} className="text-[10px] font-bold text-brand">Product report</button></div>
                <div className="mt-4 space-y-3">
                  {[...products].sort((a,b) => b.unitsSold - a.unitsSold).slice(0,3).map((product,index) => (
                    <button key={product.slug} onClick={() => navigate(`/inventory/products/${product.slug}`)} className="flex w-full items-center gap-3 text-left"><span className="grid size-7 place-items-center rounded-lg bg-canvas text-[10px] font-bold text-muted">{index + 1}</span><p className="min-w-0 flex-1 truncate text-xs font-semibold">{product.name}</p><p className="text-[10px] text-muted">{product.unitsSold} sold</p></button>
                  ))}
                </div>
              </section>
            </aside>
          </div>
        </div>
        )
        ) : (
          <WorkspacePage
            pathname={location.pathname}
            search={location.search}
            navigate={navigate}
            notify={showNotice}
            activityLog={activityLog}
            periods={periods}
            selectedPeriod={selectedPeriod}
            onSelectPeriod={selectPeriod}
            onUpdatePeriodCheck={updatePeriodCheck}
            businessProfile={businessProfile}
            onSaveBusiness={saveBusinessProfile}
            onSignOut={signOut}
            basicMode={uiMode === "basic"}
            products={products}
            categories={categories}
            debts={debts}
            pendingPayments={pendingPayments}
            supplierOrders={supplierOrders}
            receipts={receipts}
            storeTransactions={storeTransactions}
            onOpenPos={() => setShowPosModal(true)}
            onOpenAddProduct={() => setShowAddProductModal(true)}
            onEditProduct={(p) => setEditingProduct(p)}
            onViewReceipt={(r) => setSelectedReceiptModal(r)}
            onAddDebt={handleAddDebt}
            onRecordDebtPayment={handleRecordDebtPayment}
            onAddPendingPayment={handleAddPendingPayment}
            onSettlePayment={handleSettlePayment}
            onCreateSupplierOrder={handleCreateSupplierOrder}
            onMarkSupplierOrderReceived={handleMarkSupplierOrderReceived}
          />
        )}
      </main>

      {showPosModal && (
        <PosSalesModal
          products={products}
          onClose={() => setShowPosModal(false)}
          onCompleteSale={handleCompleteSale}
          categories={categories}
        />
      )}

      {showAddProductModal && (
        <AddProductModal
          categories={categories}
          onClose={() => setShowAddProductModal(false)}
          onSave={handleSaveProduct}
        />
      )}

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          categories={categories}
          onClose={() => setEditingProduct(null)}
          onSave={handleSaveProduct}
        />
      )}

      {selectedReceiptModal && (
        <ReceiptModal
          receipt={selectedReceiptModal}
          storeName={businessProfile.name}
          storeAddress={businessProfile.address}
          storePhone={businessProfile.phone}
          storeTaxId={businessProfile.taxId}
          onClose={() => setSelectedReceiptModal(null)}
        />
      )}

      <nav className="fixed inset-x-0 bottom-0 z-30 flex h-17 items-center justify-around border-t border-line bg-white/95 px-2 backdrop-blur lg:hidden">
        {navigation.filter((item) => item.label !== "Team").map((item) => (
          <button key={item.label} onClick={() => navigate(item.path)} className={`flex min-w-16 flex-col items-center gap-1 py-2 text-[9px] font-bold ${active === item.label ? "text-brand" : "text-muted"}`}><Icon name={item.icon} className="size-5" />{uiMode === "basic" ? ({ Overview: "Home", Journal: "Record", Inventory: "Products", Reports: "Reports", History: "Activity" } as Record<string, string>)[item.label] : item.label}</button>
        ))}
      </nav>

      {notice && <div className="animate-toast-in fixed right-4 bottom-21 z-[60] flex items-center gap-2 rounded-xl bg-sidebar px-4 py-3 text-xs font-bold text-white shadow-2xl lg:bottom-6"><span className="grid size-5 place-items-center rounded-full bg-emerald-400 text-sidebar"><Icon name="check" className="size-3" /></span>{notice}</div>}
    </div>
  );
}
