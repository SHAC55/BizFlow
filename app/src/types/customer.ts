export type Customer = {
  id: string;
  businessId: string;
  name: string;
  mobile: string;
  email: string | null;
  address: string | null;
  notes: string | null;
  openingBalance: number;
  archivedAt: string | null;
  createdAt: string;
  orders: number;
  totalInvoiced: number;
  totalPayment: number;
  due: number;
};

export type CustomersSummary = {
  totalCustomers: number;
  clearedCustomers: number;
  pendingCustomers: number;
  totalDue: number;
  totalRevenue: number;
};

export type CustomersResponse = {
  customers: Customer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: CustomersSummary;
};

export type CustomerSale = {
  id: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  createdAt: string;
  invoice?: {
    id: string;
    pdfUrl: string | null;
  } | null;
  payments: CustomerPayment[];
};

export type CustomerPayment = {
  id: string;
  amount: number;
  createdAt: string;
  saleId?: string;
};

export type CustomerDetail = Customer & {
  sales: CustomerSale[];
  payments: CustomerPayment[];
};

export type CreateCustomerPayload = {
  name: string;
  mobile: string;
  email?: string;
  address?: string;
  notes?: string;
  openingBalance?: number;
};
