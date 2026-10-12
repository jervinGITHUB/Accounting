export type Product = {
  slug: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  reorder: number;
  price: string;
  costPrice: string;
  unitsSold: number;
  revenue: string;
};

export type CustomerDebt = {
  id: string;
  customerName: string;
  contact: string;
  amount: number;
  paidAmount: number;
  itemsSummary: string;
  date: string;
  dueDate: string;
  status: "Active" | "Partially paid" | "Settled";
  notes?: string;
};

export type PendingPayment = {
  id: string;
  vendorName: string;
  invoiceRef: string;
  amount: number;
  dueDate: string;
  status: "Unpaid" | "Due soon" | "Paid";
  category: "Inventory restock" | "Utilities" | "Rent" | "Supplies";
  notes?: string;
  paidDate?: string;
};

export type SupplierOrderItem = {
  productSlug: string;
  productName: string;
  quantity: number;
  unitCost: number;
};

export type SupplierOrder = {
  id: string;
  supplierName: string;
  supplierContact: string;
  orderDate: string;
  expectedDate: string;
  items: SupplierOrderItem[];
  totalAmount: number;
  status: "Ordered" | "In transit" | "Received";
  paymentStatus: "Pending" | "Paid";
  receivedDate?: string;
};

export type ReceiptItem = {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type Receipt = {
  id: string;
  journalRef?: string;
  date: string;
  time: string;
  customerName: string;
  paymentMethod: "Cash" | "GCash" | "Store Credit / Utang" | "Card";
  items: ReceiptItem[];
  subtotal: number;
  discount: number;
  total: number;
  cashTendered?: number;
  change?: number;
  cashier: string;
};

export type TransactionRecord = {
  ref: string;
  title: string;
  detail: string;
  amount: string;
  numericAmount: number;
  time: string;
  kind: "sale" | "purchase" | "expense" | "cash";
  status: "Posted" | "For review";
  icon: string;
  paymentMethod?: string;
  receiptId?: string;
};
