import type { Prisma } from "../generated/prisma/client";

export const saleItemSelect = {
  id: true,
  productId: true,
  quantity: true,
  unitPrice: true,
  totalAmount: true,
  createdAt: true,
  product: {
    select: {
      id: true,
      name: true,
      category: true,
      sku: true,
    },
  },
} satisfies Prisma.SaleItemSelect;

export const salePaymentSelect = {
  id: true,
  amount: true,
  createdAt: true,
} as const;

export const saleListSelect = {
  id: true,
  businessId: true,
  customerId: true,
  totalAmount: true,
  createdAt: true,
  customer: {
    select: {
      id: true,
      name: true,
      mobile: true,
      email: true,
    },
  },
  items: {
    select: saleItemSelect,
  },
  payments: {
    select: salePaymentSelect,
  },
} satisfies Prisma.SaleSelect;

export const saleDetailSelect = {
  ...saleListSelect,
  invoice: {
    select: {
      id: true,
      pdfUrl: true,
      createdAt: true,
    },
  },
} satisfies Prisma.SaleSelect;
