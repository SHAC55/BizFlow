import z from "zod";
import { CREATED, OK, UNAUTHORIZED } from "../constants/http";
import {
  createSalePayment,
  createSale,
  getSaleById,
  getSales,
} from "../services/sale.service";
import appAssert from "../utils/appAssert";
import catchErrors from "../utils/catchErrors";
import {
  createSalePaymentSchema,
  createSaleSchema,
  getSalesQuerySchema,
} from "./sale.schemas";

export const createSaleHandler = catchErrors(async (req, res) => {
  const userId = req.userId;
  appAssert(userId, UNAUTHORIZED, "not authenticated");

  const request = createSaleSchema.parse(req.body);
  const sale = await createSale({
    userId,
    ...request,
  });

  return res.status(CREATED).json({
    message: "sale created",
    sale,
  });
});

export const getSalesHandler = catchErrors(async (req, res) => {
  const userId = req.userId;
  appAssert(userId, UNAUTHORIZED, "not authenticated");

  const query = getSalesQuerySchema.parse(req.query);
  const sales = await getSales({
    userId,
    page: query.page,
    limit: query.limit,
    search: query.search,
    status: query.status,
  });

  return res.status(OK).json(sales);
});

export const getSaleHandler = catchErrors(async (req, res) => {
  const userId = req.userId;
  appAssert(userId, UNAUTHORIZED, "not authenticated");

  const saleId = z.string().uuid().parse(req.params.id);
  const sale = await getSaleById(userId, saleId);

  return res.status(OK).json(sale);
});

export const createSalePaymentHandler = catchErrors(async (req, res) => {
  const userId = req.userId;
  appAssert(userId, UNAUTHORIZED, "not authenticated");

  const saleId = z.string().uuid().parse(req.params.id);
  const request = createSalePaymentSchema.parse(req.body);
  const sale = await createSalePayment({
    userId,
    saleId,
    amount: request.amount,
  });

  return res.status(CREATED).json({
    message: "payment recorded",
    sale,
  });
});
