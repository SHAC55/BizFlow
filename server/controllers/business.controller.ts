import { CREATED, OK, UNAUTHORIZED } from "../constants/http";
import {
  createBusiness,
  getBusiness,
  updateBusiness,
} from "../services/business.service";
import appAssert from "../utils/appAssert";
import catchErrors from "../utils/catchErrors";
import {
  createBusinessSchema,
  updateBusinessSchema,
} from "./business.schemas";

export const getBusinessHandler = catchErrors(async (req, res) => {
  const userId = req.userId;
  appAssert(userId, UNAUTHORIZED, "not authenticated");

  const business = await getBusiness(userId);

  return res.status(OK).json(business);
});

export const createBusinessHandler = catchErrors(async (req, res) => {
  const userId = req.userId;
  appAssert(userId, UNAUTHORIZED, "not authenticated");

  const request = createBusinessSchema.parse(req.body);
  const business = await createBusiness({
    userId,
    ...request,
  });

  return res.status(CREATED).json({
    message: "business created",
    business,
  });
});

export const updateBusinessHandler = catchErrors(async (req, res) => {
  const userId = req.userId;
  appAssert(userId, UNAUTHORIZED, "not authenticated");

  const request = updateBusinessSchema.parse(req.body);
  const business = await updateBusiness({
    userId,
    ...request,
  });

  return res.status(OK).json({
    message: "business updated",
    business,
  });
});
