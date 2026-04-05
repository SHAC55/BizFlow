import { Router } from "express";
import {
  createSalePaymentHandler,
  createSaleHandler,
  getSaleHandler,
  getSalesHandler,
} from "../controllers/sale.controller";

const saleRoutes = Router();

saleRoutes.get("/", getSalesHandler);
saleRoutes.get("/:id", getSaleHandler);
saleRoutes.post("/", createSaleHandler);
saleRoutes.post("/:id/payments", createSalePaymentHandler);

export default saleRoutes;
