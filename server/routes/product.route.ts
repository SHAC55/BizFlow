import { Router } from "express";
import {
  createProductHandler,
  deleteProductHandler,
  getProductsHandler,
  updateProductHandler,
} from "../controllers/product.controller";

const productRoutes = Router();

productRoutes.get("/", getProductsHandler);
productRoutes.post("/", createProductHandler);
productRoutes.patch("/:id", updateProductHandler);
productRoutes.delete("/:id", deleteProductHandler);

export default productRoutes;
