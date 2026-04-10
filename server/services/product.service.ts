import type { Prisma } from "../generated/prisma/client";
import { prisma } from "../config/db";
import { inventoryMovementSelect } from "../constants/inventoryMovement";
import { productSelect } from "../constants/product";
import { CONFLICT, NOT_FOUND } from "../constants/http";
import appAssert from "../utils/appAssert";

export type CreateProductParams = {
  userId: number;
  name: string;
  category: string;
  costPrice: number;
  price: number;
  quantity: number;
  minimumQuantity: number;
  sku?: string;
};

export type UpdateProductParams = {
  userId: number;
  productId: string;
  name?: string;
  category?: string;
  costPrice?: number;
  price?: number;
  quantity?: number;
  minimumQuantity?: number;
  sku?: string;
};

export type GetProductsParams = {
  userId: number;
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  lowStockOnly?: boolean;
};

export type AdjustStockParams = {
  userId: number;
  productId: string;
  type: "INCREASE" | "DECREASE" | "SET";
  quantity: number;
  reason: string;
  notes?: string;
};

const getBusinessByOwnerId = async (userId: number) => {
  const business = await prisma.business.findUnique({
    where: { ownerId: userId },
    select: { id: true },
  });
  appAssert(business, NOT_FOUND, "business not found");
  return business;
};

const getOwnedProduct = async (userId: number, productId: string) => {
  const business = await getBusinessByOwnerId(userId);

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      businessId: business.id,
    },
    select: {
      id: true,
      businessId: true,
      quantity: true,
      sku: true,
    },
  });
  appAssert(product, NOT_FOUND, "product not found");

  return product;
};

const createInventoryMovementData = ({
  productId,
  businessId,
  userId,
  type,
  quantityBefore,
  quantityAfter,
  reason,
  notes,
}: {
  productId: string;
  businessId: string;
  userId: number;
  type: "INITIAL" | "INCREASE" | "DECREASE" | "SET";
  quantityBefore: number;
  quantityAfter: number;
  reason: string;
  notes?: string;
}) => ({
  productId,
  businessId,
  userId,
  type,
  quantityBefore,
  quantityAfter,
  quantityChange: quantityAfter - quantityBefore,
  reason,
  notes,
});

const normalizeSkuBase = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 4)
    .map((word) => word.replace(/[^a-zA-Z0-9]/g, "").slice(0, 3))
    .filter(Boolean)
    .join("-")
    .toUpperCase()
    .slice(0, 20) || "ITEM";

const generateUniqueSku = async (businessId: string, name: string) => {
  const base = normalizeSkuBase(name);

  for (let attempt = 1; attempt <= 50; attempt += 1) {
    const suffix = attempt.toString().padStart(3, "0");
    const candidate = `${base}-${suffix}`;
    const existingProduct = await prisma.product.findFirst({
      where: {
        businessId,
        sku: candidate,
      },
      select: { id: true },
    });

    if (!existingProduct) {
      return candidate;
    }
  }

  appAssert(false, CONFLICT, "failed to generate unique sku");
};

export const createProduct = async (data: CreateProductParams) => {
  const business = await getBusinessByOwnerId(data.userId);
  const sku = data.sku ?? (await generateUniqueSku(business.id, data.name));

  if (sku) {
    const existingProduct = await prisma.product.findFirst({
      where: {
        businessId: business.id,
        sku,
      },
      select: { id: true },
    });
    appAssert(!existingProduct, CONFLICT, "sku already in use");
  }

  const result = await prisma.$transaction(async (transaction) => {
    const product = await transaction.product.create({
      data: {
        businessId: business.id,
        name: data.name,
        category: data.category,
        costPrice: data.costPrice,
        price: data.price,
        quantity: data.quantity,
        minimumQuantity: data.minimumQuantity,
        sku,
      },
      select: productSelect,
    });

    await transaction.inventoryMovement.create({
      data: createInventoryMovementData({
        productId: product.id,
        businessId: business.id,
        userId: data.userId,
        type: "INITIAL",
        quantityBefore: 0,
        quantityAfter: data.quantity,
        reason: "product created",
      }),
    });

    return product;
  });

  return result;
};

export const getProducts = async (data: GetProductsParams) => {
  const business = await getBusinessByOwnerId(data.userId);
  const page = data.page ?? 1;
  const limit = data.limit ?? 10;
  const skip = (page - 1) * limit;

  const where: Prisma.ProductWhereInput = {
    businessId: business.id,
    ...(data.category && {
      category: data.category,
    }),
    ...(data.search && {
      OR: [
        {
          name: {
            contains: data.search,
            mode: "insensitive",
          },
        },
        {
          category: {
            contains: data.search,
            mode: "insensitive",
          },
        },
        {
          sku: {
            contains: data.search,
            mode: "insensitive",
          },
        },
      ],
    }),
    ...(data.lowStockOnly && {
      quantity: {
        lte: prisma.product.fields.minimumQuantity,
      },
    }),
  };

  const [products, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      select: productSelect,
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  const inventoryItems = await prisma.product.findMany({
    where: {
      businessId: business.id,
    },
    select: {
      price: true,
      costPrice: true,
      quantity: true,
      minimumQuantity: true,
    },
  });

  const summary = inventoryItems.reduce(
    (accumulator, item) => {
      accumulator.totalValue += item.price * item.quantity;
      accumulator.totalCostValue += item.costPrice * item.quantity;
      accumulator.projectedProfit +=
        (item.price - item.costPrice) * item.quantity;

      if (item.quantity === 0) {
        accumulator.outOfStockCount += 1;
      } else if (item.quantity <= item.minimumQuantity) {
        accumulator.lowStockCount += 1;
      }

      return accumulator;
    },
    {
      totalValue: 0,
      totalCostValue: 0,
      projectedProfit: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
    },
  );

  const categoryCounts = await prisma.product.groupBy({
    by: ["category"],
    where: {
      businessId: business.id,
    },
    _count: {
      category: true,
    },
    orderBy: {
      category: "asc",
    },
  });

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
      summary: {
      totalProducts: inventoryItems.length,
      totalValue: summary.totalValue,
      totalCostValue: summary.totalCostValue,
      projectedProfit: summary.projectedProfit,
      lowStockCount: summary.lowStockCount,
      outOfStockCount: summary.outOfStockCount,
      categories: categoryCounts.map((item) => ({
        category: item.category,
        count: item._count.category,
      })),
    },
  };
};

export const getProductById = async (userId: number, productId: string) => {
  const ownedProduct = await getOwnedProduct(userId, productId);

  const product = await prisma.product.findUnique({
    where: {
      id: ownedProduct.id,
    },
    select: productSelect,
  });
  appAssert(product, NOT_FOUND, "product not found");

  return product;
};

export const updateProduct = async (data: UpdateProductParams) => {
  const product = await getOwnedProduct(data.userId, data.productId);

  if (data.sku) {
    const existingProduct = await prisma.product.findFirst({
      where: {
        businessId: product.businessId,
        sku: data.sku,
      },
      select: { id: true },
    });
    appAssert(
      !existingProduct || existingProduct.id === product.id,
      CONFLICT,
      "sku already in use",
    );
  }

  return prisma.$transaction(async (transaction) => {
    const updatedProduct = await transaction.product.update({
      where: { id: product.id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.costPrice !== undefined && { costPrice: data.costPrice }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.quantity !== undefined && { quantity: data.quantity }),
        ...(data.minimumQuantity !== undefined && {
          minimumQuantity: data.minimumQuantity,
        }),
        ...(data.sku !== undefined && { sku: data.sku }),
      },
      select: productSelect,
    });

    if (data.quantity !== undefined && data.quantity !== product.quantity) {
      await transaction.inventoryMovement.create({
        data: createInventoryMovementData({
          productId: product.id,
          businessId: product.businessId,
          userId: data.userId,
          type: "SET",
          quantityBefore: product.quantity,
          quantityAfter: data.quantity,
          reason: "product quantity updated",
        }),
      });
    }

    return updatedProduct;
  });
};

export const getLowStockProducts = async (
  data: Omit<GetProductsParams, "lowStockOnly">,
) =>
  getProducts({
    ...data,
    lowStockOnly: true,
  });

export const deleteProduct = async (userId: number, productId: string) => {
  const product = await getOwnedProduct(userId, productId);
  const saleItem = await prisma.saleItem.findFirst({
    where: {
      productId: product.id,
    },
    select: {
      id: true,
    },
  });
  appAssert(!saleItem, CONFLICT, "product cannot be deleted after sales exist");

  const deleted = await prisma.product.deleteMany({
    where: {
      id: product.id,
      businessId: product.businessId,
    },
  });
  appAssert(deleted.count > 0, NOT_FOUND, "product not found");
};

export const adjustProductStock = async (data: AdjustStockParams) => {
  const product = await getOwnedProduct(data.userId, data.productId);

  let quantityAfter = product.quantity;

  if (data.type === "INCREASE") {
    quantityAfter = product.quantity + data.quantity;
  }

  if (data.type === "DECREASE") {
    quantityAfter = product.quantity - data.quantity;
    appAssert(quantityAfter >= 0, CONFLICT, "insufficient stock");
  }

  if (data.type === "SET") {
    quantityAfter = data.quantity;
  }

  return prisma.$transaction(async (transaction) => {
    const updatedProduct = await transaction.product.update({
      where: { id: product.id },
      data: {
        quantity: quantityAfter,
      },
      select: productSelect,
    });

    const movement = await transaction.inventoryMovement.create({
      data: createInventoryMovementData({
        productId: product.id,
        businessId: product.businessId,
        userId: data.userId,
        type: data.type,
        quantityBefore: product.quantity,
        quantityAfter,
        reason: data.reason,
        notes: data.notes,
      }),
      select: inventoryMovementSelect,
    });

    return {
      product: updatedProduct,
      movement,
    };
  });
};

export const getProductMovements = async (userId: number, productId: string) => {
  const product = await getOwnedProduct(userId, productId);

  return prisma.inventoryMovement.findMany({
    where: {
      productId: product.id,
      businessId: product.businessId,
    },
    select: inventoryMovementSelect,
    orderBy: {
      createdAt: "desc",
    },
  });
};
