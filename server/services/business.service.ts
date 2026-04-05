import { prisma } from "../config/db";
import { businessSelect } from "../constants/business";
import { CONFLICT, NOT_FOUND } from "../constants/http";
import appAssert from "../utils/appAssert";

export type CreateBusinessParams = {
  userId: number;
  name: string;
};

export type UpdateBusinessParams = {
  userId: number;
  name?: string;
};

export const getBusiness = async (userId: number) => {
  const business = await prisma.business.findUnique({
    where: { ownerId: userId },
    select: businessSelect,
  });
  appAssert(business, NOT_FOUND, "business not found");
  return business;
};

export const createBusiness = async (data: CreateBusinessParams) => {
  const existingBusiness = await prisma.business.findUnique({
    where: { ownerId: data.userId },
    select: { id: true },
  });
  appAssert(!existingBusiness, CONFLICT, "business already exists");

  return prisma.business.create({
    data: {
      ownerId: data.userId,
      name: data.name,
    },
    select: businessSelect,
  });
};

export const updateBusiness = async (data: UpdateBusinessParams) => {
  const business = await prisma.business.findUnique({
    where: { ownerId: data.userId },
    select: { id: true },
  });
  appAssert(business, NOT_FOUND, "business not found");

  return prisma.business.update({
    where: { id: business.id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
    },
    select: businessSelect,
  });
};
