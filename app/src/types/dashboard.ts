export type DashboardSalesSummary = {
  totalSales: number;
  totalRevenue: number;
  totalOutstanding: number;
  totalInvoiced: number;
  todaySalesAmount: number;
  todaySalesCount: number;
  monthlySalesAmount: number;
  monthlyRevenue: number;
  uniqueCustomers: number;
};

export type DashboardCustomerSummary = {
  totalCustomers: number;
  clearedCustomers: number;
  pendingCustomers: number;
  totalDue: number;
  totalRevenue: number;
};

export type DashboardSaleStatus = "paid" | "partial" | "pending";

export type DashboardSaleItem = {
  id: string;
  quantity: number;
  unitPrice: number;
  product: {
    id: string;
    name: string;
  };
};

export type DashboardSale = {
  id: string;
  businessId?: string;
  status: DashboardSaleStatus;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  reminderDate?: string | null;
  subtotalAmount?: number;
  discountAmount?: number;
  estimatedCostAmount?: number;
  estimatedProfitAmount?: number;
  createdAt: string;
  customer: {
    id: string;
    name: string;
    mobile?: string | null;
    email?: string | null;
  };
  items: DashboardSaleItem[];
  payments?: Array<{
    id: string;
    amount: number;
    createdAt: string;
  }>;
  business?: {
    id: string;
    name: string | null;
    gstNumber?: string | null;
    address?: string | null;
  };
};

export type CreateSalePayload = {
  customerId: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
  totalAmount: number;
  paidAmount?: number;
  reminderDate?: string;
};

export type DashboardSalesResponse = {
  sales: DashboardSale[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: DashboardSalesSummary;
};

export type DashboardCustomersResponse = {
  customers: Array<{
    id: string;
    name: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: DashboardCustomerSummary;
};
