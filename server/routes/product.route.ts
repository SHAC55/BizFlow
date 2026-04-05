import { Router } from "express";
import {
  adjustProductStockHandler,
  createProductHandler,
  deleteProductHandler,
  getLowStockProductsHandler,
  getProductHandler,
  getProductMovementsHandler,
  getProductsHandler,
  updateProductHandler,
} from "../controllers/product.controller";

const productRoutes = Router();

productRoutes.get("/", getProductsHandler);
productRoutes.get("/low-stock", getLowStockProductsHandler);
productRoutes.get("/:id", getProductHandler);
productRoutes.get("/:id/movements", getProductMovementsHandler);
productRoutes.post("/", createProductHandler);
productRoutes.post("/:id/adjust-stock", adjustProductStockHandler);
productRoutes.patch("/:id", updateProductHandler);
productRoutes.delete("/:id", deleteProductHandler);

export default productRoutes;
