import { Router } from "express";
import {
  createBusinessHandler,
  getBusinessHandler,
  updateBusinessHandler,
} from "../controllers/business.controller";

const businessRoutes = Router();

businessRoutes.get("/", getBusinessHandler);
businessRoutes.post("/", createBusinessHandler);
businessRoutes.patch("/", updateBusinessHandler);

export default businessRoutes;
