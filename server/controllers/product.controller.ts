import z from "zod";
import { CREATED, OK, UNAUTHORIZED } from "../constants/http";
import {
  adjustProductStock,
  createProduct,
  deleteProduct,
  getLowStockProducts,
  getProductById,
  getProductMovements,
  getProducts,
  updateProduct,
} from "../services/product.service";
import appAssert from "../utils/appAssert";
import catchErrors from "../utils/catchErrors";
import {
  adjustStockSchema,
  createProductSchema,
  getProductsQuerySchema,
  updateProductSchema,
} from "./product.schemas";

export const createProductHandler = catchErrors(async (req, res) => {
  const userId = req.userId;
  appAssert(userId, UNAUTHORIZED, "not authenticated");

  const request = createProductSchema.parse(req.body);
  const product = await createProduct({
    userId,
    ...request,
  });

  return res.status(CREATED).json({
    message: "product created",
    product,
  });
});

export const getProductsHandler = catchErrors(async (req, res) => {
  const userId = req.userId;
  appAssert(userId, UNAUTHORIZED, "not authenticated");
  const query = getProductsQuerySchema.parse(req.query);

  const products = await getProducts({
    userId,
    page: query.page,
    limit: query.limit,
    category: query.category,
    search: query.search,
    lowStockOnly: query.lowStockOnly,
  });

  return res.status(OK).json(products);
});

export const getLowStockProductsHandler = catchErrors(async (req, res) => {
  const userId = req.userId;
  appAssert(userId, UNAUTHORIZED, "not authenticated");
  const query = getProductsQuerySchema.parse(req.query);

  const products = await getLowStockProducts({
    userId,
    page: query.page,
    limit: query.limit,
    category: query.category,
    search: query.search,
  });

  return res.status(OK).json(products);
});

export const getProductHandler = catchErrors(async (req, res) => {
  const userId = req.userId;
  appAssert(userId, UNAUTHORIZED, "not authenticated");

  const productId = z.string().uuid().parse(req.params.id);
  const product = await getProductById(userId, productId);

  return res.status(OK).json(product);
});

export const updateProductHandler = catchErrors(async (req, res) => {
  const userId = req.userId;
  appAssert(userId, UNAUTHORIZED, "not authenticated");

  const productId = z.string().uuid().parse(req.params.id);
  const request = updateProductSchema.parse(req.body);
  const product = await updateProduct({
    userId,
    productId,
    ...request,
  });

  return res.status(OK).json({
    message: "product updated",
    product,
  });
});

export const adjustProductStockHandler = catchErrors(async (req, res) => {
  const userId = req.userId;
  appAssert(userId, UNAUTHORIZED, "not authenticated");

  const productId = z.string().uuid().parse(req.params.id);
  const request = adjustStockSchema.parse(req.body);
  const result = await adjustProductStock({
    userId,
    productId,
    ...request,
  });

  return res.status(OK).json({
    message: "stock adjusted",
    ...result,
  });
});

export const getProductMovementsHandler = catchErrors(async (req, res) => {
  const userId = req.userId;
  appAssert(userId, UNAUTHORIZED, "not authenticated");

  const productId = z.string().uuid().parse(req.params.id);
  const movements = await getProductMovements(userId, productId);

  return res.status(OK).json(movements);
});

export const deleteProductHandler = catchErrors(async (req, res) => {
  const userId = req.userId;
  appAssert(userId, UNAUTHORIZED, "not authenticated");

  const productId = z.string().uuid().parse(req.params.id);
  await deleteProduct(userId, productId);

  return res.status(OK).json({
    message: "product deleted",
  });
});
