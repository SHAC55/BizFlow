import type { Prisma } from "../generated/prisma/client";
import { prisma } from "../config/db";
import { customerSelect } from "../constants/customer";
import { NOT_FOUND } from "../constants/http";
import appAssert from "../utils/appAssert";

export type CreateCustomerParams = {
  userId: number;
  name: string;
  mobile: string;
  email?: string;
  address?: string;
  notes?: string;
  openingBalance?: number;
};

export type GetCustomersParams = {
  userId: number;
  page?: number;
  limit?: number;
  search?: string;
  dueStatus?: "all" | "pending" | "cleared" | "high_due";
  sortBy?: "recent" | "name" | "due" | "revenue" | "orders";
  sortOrder?: "asc" | "desc";
  recentOnly?: boolean;
  includeArchived?: boolean;
};

export type UpdateCustomerParams = {
  userId: number;
  customerId: string;
  name?: string;
  mobile?: string;
  email?: string;
  address?: string;
  notes?: string;
  openingBalance?: number;
};

const getBusinessByOwnerId = async (userId: number) => {
  const business = await prisma.business.findUnique({
    where: { ownerId: userId },
    select: { id: true },
  });
  appAssert(business, NOT_FOUND, "business not found");
  return business;
};

const getOwnedCustomer = async (userId: number, customerId: string) => {
  const business = await getBusinessByOwnerId(userId);

  const customer = await prisma.customer.findFirst({
    where: {
      id: customerId,
      businessId: business.id,
    },
    select: {
      id: true,
      businessId: true,
      archivedAt: true,
    },
  });
  appAssert(customer, NOT_FOUND, "customer not found");

  return customer;
};

const customerListSelect = {
  ...customerSelect,
  sales: {
    select: {
      id: true,
      totalAmount: true,
      payments: {
        select: {
          amount: true,
        },
      },
    },
  },
} satisfies Prisma.CustomerSelect;

type CustomerListItem = Prisma.CustomerGetPayload<{
  select: typeof customerListSelect;
}>;

const mapCustomerMetrics = (customer: CustomerListItem) => {
  const totalInvoiced = customer.sales.reduce(
    (sum, sale) => sum + sale.totalAmount,
    0,
  );
  const totalPayment = customer.sales.reduce(
    (sum, sale) =>
      sum +
      sale.payments.reduce(
        (paymentSum, payment) => paymentSum + payment.amount,
        0,
      ),
    0,
  );
  const due = customer.openingBalance + totalInvoiced - totalPayment;

  return {
    id: customer.id,
    businessId: customer.businessId,
    name: customer.name,
    mobile: customer.mobile,
    email: customer.email,
    address: customer.address,
    notes: customer.notes,
    openingBalance: customer.openingBalance,
    archivedAt: customer.archivedAt,
    createdAt: customer.createdAt,
    orders: customer.sales.length,
    totalInvoiced,
    totalPayment,
    due,
  };
};

const detailCustomerSelect = {
  ...customerSelect,
  sales: {
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      totalAmount: true,
      createdAt: true,
      invoice: {
        select: {
          id: true,
          pdfUrl: true,
        },
      },
      payments: {
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          amount: true,
          createdAt: true,
        },
      },
    },
  },
} satisfies Prisma.CustomerSelect;

type CustomerDetailItem = Prisma.CustomerGetPayload<{
  select: typeof detailCustomerSelect;
}>;

const mapCustomerDetail = (customer: CustomerDetailItem) => {
  const base = mapCustomerMetrics(customer);
  const sales = customer.sales.map((sale) => {
    const paidAmount = sale.payments.reduce(
      (sum, payment) => sum + payment.amount,
      0,
    );

    return {
      id: sale.id,
      totalAmount: sale.totalAmount,
      paidAmount,
      dueAmount: sale.totalAmount - paidAmount,
      createdAt: sale.createdAt,
      invoice: sale.invoice,
      payments: sale.payments,
    };
  });

  const payments = customer.sales.flatMap((sale) =>
    sale.payments.map((payment) => ({
      ...payment,
      saleId: sale.id,
    })),
  );

  return {
    ...base,
    sales,
    payments: payments.sort(
      (left, right) =>
        right.createdAt.getTime() - left.createdAt.getTime(),
    ),
  };
};

export const createCustomer = async (data: CreateCustomerParams) => {
  const business = await getBusinessByOwnerId(data.userId);

  const customer = await prisma.customer.create({
    data: {
      businessId: business.id,
      name: data.name,
      mobile: data.mobile,
      email: data.email,
      address: data.address,
      notes: data.notes,
      openingBalance: data.openingBalance ?? 0,
    },
    select: customerSelect,
  });

  return customer;
};

export const getCustomers = async (data: GetCustomersParams) => {
  const business = await getBusinessByOwnerId(data.userId);
  const page = data.page ?? 1;
  const limit = data.limit ?? 12;
  const skip = (page - 1) * limit;

  const where: Prisma.CustomerWhereInput = {
    businessId: business.id,
    ...(data.includeArchived ? {} : { archivedAt: null }),
    ...(data.search && {
      OR: [
        {
          name: {
            contains: data.search,
            mode: "insensitive",
          },
        },
        {
          mobile: {
            contains: data.search,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: data.search,
            mode: "insensitive",
          },
        },
      ],
    }),
    ...(data.recentOnly && {
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    }),
  };

  const [customers, total, allMatchingCustomers] = await prisma.$transaction([
    prisma.customer.findMany({
      where,
      select: customerListSelect,
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.customer.count({ where }),
    prisma.customer.findMany({
      where,
      select: customerListSelect,
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  const filteredAndSortedCustomers = allMatchingCustomers
    .map(mapCustomerMetrics)
    .filter((customer) => {
      switch (data.dueStatus) {
        case "pending":
          return customer.due > 0;
        case "cleared":
          return customer.due <= 0;
        case "high_due":
          return customer.due >= 10000;
        default:
          return true;
      }
    })
    .sort((left, right) => {
      const direction = data.sortOrder === "asc" ? 1 : -1;

      switch (data.sortBy) {
        case "name":
          return left.name.localeCompare(right.name) * direction;
        case "due":
          return (left.due - right.due) * direction;
        case "revenue":
          return (left.totalPayment - right.totalPayment) * direction;
        case "orders":
          return (left.orders - right.orders) * direction;
        case "recent":
        default:
          return (
            (left.createdAt.getTime() - right.createdAt.getTime()) * direction
          );
      }
    });

  const totalFiltered = filteredAndSortedCustomers.length;
  const paginatedCustomers = filteredAndSortedCustomers.slice(skip, skip + limit);
  const summary = filteredAndSortedCustomers.reduce(
    (accumulator, customer) => {
      accumulator.totalCustomers += 1;
      accumulator.totalDue += customer.due;
      accumulator.totalRevenue += customer.totalPayment;

      if (customer.due <= 0) {
        accumulator.clearedCustomers += 1;
      } else {
        accumulator.pendingCustomers += 1;
      }

      return accumulator;
    },
    {
      totalCustomers: 0,
      clearedCustomers: 0,
      pendingCustomers: 0,
      totalDue: 0,
      totalRevenue: 0,
    },
  );

  return {
    customers: paginatedCustomers,
    pagination: {
      page,
      limit,
      total: totalFiltered,
      totalPages: Math.ceil(totalFiltered / limit),
    },
    summary,
  };
};

export const getCustomerById = async (userId: number, customerId: string) => {
  const customer = await getOwnedCustomer(userId, customerId);

  const detail = await prisma.customer.findUnique({
    where: {
      id: customer.id,
    },
    select: detailCustomerSelect,
  });
  appAssert(detail, NOT_FOUND, "customer not found");

  return mapCustomerDetail(detail);
};

export const updateCustomer = async (data: UpdateCustomerParams) => {
  const customer = await getOwnedCustomer(data.userId, data.customerId);

  const updatedCustomer = await prisma.customer.update({
    where: { id: customer.id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.mobile !== undefined && { mobile: data.mobile }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.address !== undefined && { address: data.address }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.openingBalance !== undefined && {
        openingBalance: data.openingBalance,
      }),
    },
    select: customerSelect,
  });

  return updatedCustomer;
};

export const archiveCustomer = async (userId: number, customerId: string) => {
  const customer = await getOwnedCustomer(userId, customerId);

  if (customer.archivedAt) {
    return;
  }

  await prisma.customer.update({
    where: { id: customer.id },
    data: {
      archivedAt: new Date(),
    },
  });
};
