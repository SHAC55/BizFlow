import type { Prisma } from "../generated/prisma/client";
import { prisma } from "../config/db";
import { inventoryMovementSelect } from "../constants/inventoryMovement";
import { CONFLICT, NOT_FOUND } from "../constants/http";
import { saleDetailSelect, saleListSelect } from "../constants/sale";
import appAssert from "../utils/appAssert";

export type CreateSaleParams = {
  userId: number;
  customerId: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
  totalAmount: number;
  paidAmount?: number;
};

export type GetSalesParams = {
  userId: number;
  page?: number;
  limit?: number;
  search?: string;
  status?: "all" | "paid" | "partial" | "pending";
};

export type CreateSalePaymentParams = {
  userId: number;
  saleId: string;
  amount: number;
};

type SaleListItem = Prisma.SaleGetPayload<{
  select: typeof saleListSelect;
}>;

type SaleDetailItem = Prisma.SaleGetPayload<{
  select: typeof saleDetailSelect;
}>;

const getBusinessByOwnerId = async (userId: number) => {
  const business = await prisma.business.findUnique({
    where: { ownerId: userId },
    select: { id: true },
  });
  appAssert(business, NOT_FOUND, "business not found");
  return business;
};

const getOwnedSale = async (userId: number, saleId: string) => {
  const business = await getBusinessByOwnerId(userId);

  const sale = await prisma.sale.findFirst({
    where: {
      id: saleId,
      businessId: business.id,
    },
    select: {
      id: true,
      businessId: true,
    },
  });
  appAssert(sale, NOT_FOUND, "sale not found");

  return sale;
};

const mapSaleMetrics = (sale: SaleListItem | SaleDetailItem) => {
  const paidAmount = sale.payments.reduce(
    (sum, payment) => sum + payment.amount,
    0,
  );
  const subtotalAmount = sale.items.reduce(
    (sum, item) => sum + item.totalAmount,
    0,
  );
  const dueAmount = sale.totalAmount - paidAmount;
  const discountAmount = subtotalAmount - sale.totalAmount;

  return {
    id: sale.id,
    businessId: sale.businessId,
    customerId: sale.customerId,
    totalAmount: sale.totalAmount,
    subtotalAmount,
    discountAmount,
    paidAmount,
    dueAmount,
    status:
      dueAmount <= 0 ? "paid" : paidAmount > 0 ? "partial" : "pending",
    createdAt: sale.createdAt,
    customer: sale.customer,
    items: sale.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalAmount: item.totalAmount,
      createdAt: item.createdAt,
      product: item.product,
    })),
    payments: sale.payments,
  };
};

export const createSale = async (data: CreateSaleParams) => {
  const business = await getBusinessByOwnerId(data.userId);
  const paidAmount = data.paidAmount ?? 0;

  const result = await prisma.$transaction(async (transaction) => {
    const customer = await transaction.customer.findFirst({
      where: {
        id: data.customerId,
        businessId: business.id,
        archivedAt: null,
      },
      select: {
        id: true,
      },
    });
    appAssert(customer, NOT_FOUND, "customer not found");

    const productIds = data.items.map((item) => item.productId);
    const products = await transaction.product.findMany({
      where: {
        id: {
          in: productIds,
        },
        businessId: business.id,
      },
      select: {
        id: true,
        businessId: true,
        name: true,
        quantity: true,
      },
    });

    appAssert(products.length === data.items.length, NOT_FOUND, "product not found");

    const productMap = new Map(products.map((product) => [product.id, product]));

    data.items.forEach((item) => {
      const product = productMap.get(item.productId);
      appAssert(product, NOT_FOUND, "product not found");
      appAssert(
        product.quantity >= item.quantity,
        CONFLICT,
        `${product.name} does not have enough stock`,
      );
    });

    const sale = await transaction.sale.create({
      data: {
        businessId: business.id,
        customerId: customer.id,
        totalAmount: data.totalAmount,
      },
      select: {
        id: true,
      },
    });

    await transaction.saleItem.createMany({
      data: data.items.map((item) => ({
        saleId: sale.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalAmount: item.quantity * item.unitPrice,
      })),
    });

    for (const item of data.items) {
      const product = productMap.get(item.productId);
      appAssert(product, NOT_FOUND, "product not found");

      const quantityAfter = product.quantity - item.quantity;

      await transaction.product.update({
        where: {
          id: product.id,
        },
        data: {
          quantity: quantityAfter,
        },
      });

      await transaction.inventoryMovement.create({
        data: {
          productId: product.id,
          businessId: business.id,
          userId: data.userId,
          type: "DECREASE",
          quantityBefore: product.quantity,
          quantityAfter,
          quantityChange: quantityAfter - product.quantity,
          reason: "sale recorded",
          notes: `sale ${sale.id.slice(0, 8)}`,
        },
        select: inventoryMovementSelect,
      });
    }

    if (paidAmount > 0) {
      await transaction.payment.create({
        data: {
          saleId: sale.id,
          amount: paidAmount,
        },
      });
    }

    return sale;
  });

  return getSaleById(data.userId, result.id);
};

export const getSales = async (data: GetSalesParams) => {
  const business = await getBusinessByOwnerId(data.userId);
  const page = data.page ?? 1;
  const limit = data.limit ?? 10;
  const skip = (page - 1) * limit;

  const where: Prisma.SaleWhereInput = {
    businessId: business.id,
    ...(data.search && {
      OR: [
        {
          customer: {
            name: {
              contains: data.search,
              mode: "insensitive",
            },
          },
        },
        {
          customer: {
            mobile: {
              contains: data.search,
              mode: "insensitive",
            },
          },
        },
        {
          items: {
            some: {
              product: {
                name: {
                  contains: data.search,
                  mode: "insensitive",
                },
              },
            },
          },
        },
      ],
    }),
  };

  const [sales, total, allMatchingSales] = await prisma.$transaction([
    prisma.sale.findMany({
      where,
      select: saleListSelect,
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.sale.count({ where }),
    prisma.sale.findMany({
      where,
      select: saleListSelect,
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  const filteredSales = allMatchingSales
    .map(mapSaleMetrics)
    .filter((sale) => {
      switch (data.status) {
        case "paid":
          return sale.status === "paid";
        case "partial":
          return sale.status === "partial";
        case "pending":
          return sale.status === "pending";
        case "all":
        default:
          return true;
      }
    });

  const paginatedSales =
    data.status === "all"
      ? sales.map(mapSaleMetrics)
      : filteredSales.slice(skip, skip + limit);

  const now = new Date();
  const summary = filteredSales.reduce(
    (accumulator, sale) => {
      const saleDate = new Date(sale.createdAt);
      const isToday =
        saleDate.getFullYear() === now.getFullYear() &&
        saleDate.getMonth() === now.getMonth() &&
        saleDate.getDate() === now.getDate();
      const isCurrentMonth =
        saleDate.getFullYear() === now.getFullYear() &&
        saleDate.getMonth() === now.getMonth();

      accumulator.totalSales += 1;
      accumulator.totalRevenue += sale.paidAmount;
      accumulator.totalOutstanding += sale.dueAmount;
      accumulator.totalInvoiced += sale.totalAmount;
      accumulator.uniqueCustomers.add(sale.customer.id);

      if (isToday) {
        accumulator.todaySalesAmount += sale.totalAmount;
        accumulator.todaySalesCount += 1;
      }

      if (isCurrentMonth) {
        accumulator.monthlySalesAmount += sale.totalAmount;
      }

      sale.payments.forEach((payment) => {
        const paymentDate = new Date(payment.createdAt);
        const isCurrentPaymentMonth =
          paymentDate.getFullYear() === now.getFullYear() &&
          paymentDate.getMonth() === now.getMonth();

        if (isCurrentPaymentMonth) {
          accumulator.monthlyRevenue += payment.amount;
        }
      });

      return accumulator;
    },
    {
      totalSales: 0,
      totalRevenue: 0,
      totalOutstanding: 0,
      totalInvoiced: 0,
      todaySalesAmount: 0,
      todaySalesCount: 0,
      monthlySalesAmount: 0,
      monthlyRevenue: 0,
      uniqueCustomers: new Set<string>(),
    },
  );

  const filteredTotal = filteredSales.length;

  return {
    sales: paginatedSales,
    pagination: {
      page,
      limit,
      total: data.status === "all" ? total : filteredTotal,
      totalPages: Math.ceil((data.status === "all" ? total : filteredTotal) / limit),
    },
    summary: {
      totalSales: summary.totalSales,
      totalRevenue: summary.totalRevenue,
      totalOutstanding: summary.totalOutstanding,
      totalInvoiced: summary.totalInvoiced,
      todaySalesAmount: summary.todaySalesAmount,
      todaySalesCount: summary.todaySalesCount,
      monthlySalesAmount: summary.monthlySalesAmount,
      monthlyRevenue: summary.monthlyRevenue,
      uniqueCustomers: summary.uniqueCustomers.size,
    },
  };
};

export const getSaleById = async (userId: number, saleId: string) => {
  const sale = await getOwnedSale(userId, saleId);

  const detail = await prisma.sale.findUnique({
    where: {
      id: sale.id,
    },
    select: saleDetailSelect,
  });
  appAssert(detail, NOT_FOUND, "sale not found");

  return mapSaleMetrics(detail);
};

export const createSalePayment = async (data: CreateSalePaymentParams) => {
  const sale = await getOwnedSale(data.userId, data.saleId);

  const detail = await prisma.sale.findUnique({
    where: { id: sale.id },
    select: saleDetailSelect,
  });
  appAssert(detail, NOT_FOUND, "sale not found");

  const mappedSale = mapSaleMetrics(detail);
  appAssert(
    data.amount <= mappedSale.dueAmount,
    CONFLICT,
    "payment cannot exceed due amount",
  );

  await prisma.payment.create({
    data: {
      saleId: sale.id,
      amount: data.amount,
    },
  });

  return getSaleById(data.userId, sale.id);
};
