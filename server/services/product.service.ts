import type { Prisma } from "../generated/prisma/client";
import { prisma } from "../config/db";
import { productSelect } from "../constants/product";
import { CONFLICT, NOT_FOUND } from "../constants/http";
import appAssert from "../utils/appAssert";

export type CreateProductParams = {
  userId: number;
  name: string;
  price: number;
  quantity: number;
  minimumQuantity: number;
  sku?: string;
};

export type UpdateProductParams = {
  userId: number;
  productId: string;
  name?: string;
  price?: number;
  quantity?: number;
  minimumQuantity?: number;
  sku?: string;
};

export type GetProductsParams = {
  userId: number;
  page?: number;
  limit?: number;
  search?: string;
  lowStockOnly?: boolean;
};

const getBusinessByOwnerId = async (userId: number) => {
  const business = await prisma.business.findUnique({
    where: { ownerId: userId },
    select: { id: true },
  });
  appAssert(business, NOT_FOUND, "business not found");
  return business;
};

export const createProduct = async (data: CreateProductParams) => {
  const business = await getBusinessByOwnerId(data.userId);

  if (data.sku) {
    const existingProduct = await prisma.product.findUnique({
      where: { sku: data.sku },
      select: { id: true },
    });
    appAssert(!existingProduct, CONFLICT, "sku already in use");
  }

  return prisma.product.create({
    data: {
      businessId: business.id,
      name: data.name,
      price: data.price,
      quantity: data.quantity,
      minimumQuantity: data.minimumQuantity,
      sku: data.sku,
    },
    select: productSelect,
  });
};

export const getProducts = async (data: GetProductsParams) => {
  const business = await getBusinessByOwnerId(data.userId);
  const page = data.page ?? 1;
  const limit = data.limit ?? 10;
  const skip = (page - 1) * limit;

  const where: Prisma.ProductWhereInput = {
    businessId: business.id,
    ...(data.search && {
      OR: [
        {
          name: {
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

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const updateProduct = async (data: UpdateProductParams) => {
  const business = await getBusinessByOwnerId(data.userId);

  const product = await prisma.product.findFirst({
    where: {
      id: data.productId,
      businessId: business.id,
    },
    select: {
      id: true,
      sku: true,
    },
  });
  appAssert(product, NOT_FOUND, "product not found");

  if (data.sku) {
    const existingProduct = await prisma.product.findUnique({
      where: { sku: data.sku },
      select: { id: true },
    });
    appAssert(
      !existingProduct || existingProduct.id === product.id,
      CONFLICT,
      "sku already in use",
    );
  }

  return prisma.product.update({
    where: { id: product.id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.quantity !== undefined && { quantity: data.quantity }),
      ...(data.minimumQuantity !== undefined && {
        minimumQuantity: data.minimumQuantity,
      }),
      ...(data.sku !== undefined && { sku: data.sku }),
    },
    select: productSelect,
  });
};

export const deleteProduct = async (userId: number, productId: string) => {
  const business = await getBusinessByOwnerId(userId);

  const deleted = await prisma.product.deleteMany({
    where: {
      id: productId,
      businessId: business.id,
    },
  });
  appAssert(deleted.count > 0, NOT_FOUND, "product not found");
};
