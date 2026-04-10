import { Router } from "express";
import {
  createSalePaymentHandler,
  createSaleHandler,
  getSaleHandler,
  getSaleReminderHandler,
  getSalesHandler,
} from "../controllers/sale.controller";

const saleRoutes = Router();

saleRoutes.get("/", getSalesHandler);
saleRoutes.get("/:id", getSaleHandler);
saleRoutes.get("/:id/reminder", getSaleReminderHandler);
saleRoutes.post("/", createSaleHandler);
saleRoutes.post("/:id/payments", createSalePaymentHandler);

export default saleRoutes;
