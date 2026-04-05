import z from "zod";
import { CREATED, OK, UNAUTHORIZED } from "../constants/http";
import appAssert from "../utils/appAssert";
import catchErrors from "../utils/catchErrors";
import {
  archiveCustomer,
  createCustomer,
  getCustomerById,
  getCustomers,
  updateCustomer,
} from "../services/customer.service";
import {
  createCustomerSchema,
  getCustomersQuerySchema,
  updateCustomerSchema,
} from "./customer.schemas";

export const createCustomerHandler = catchErrors(async (req, res) => {
  const userId = req.userId;
  appAssert(userId, UNAUTHORIZED, "not authenticated");

  const request = createCustomerSchema.parse(req.body);
  const customer = await createCustomer({
    userId,
    ...request,
  });

  return res.status(CREATED).json({
    message: "customer created",
    customer,
  });
});

export const getCustomersHandler = catchErrors(async (req, res) => {
  const userId = req.userId;
  appAssert(userId, UNAUTHORIZED, "not authenticated");

  const query = getCustomersQuerySchema.parse(req.query);
  const customers = await getCustomers({
    userId,
    page: query.page,
    limit: query.limit,
    search: query.search,
    dueStatus: query.dueStatus,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
    recentOnly: query.recentOnly,
    includeArchived: query.includeArchived,
  });

  return res.status(OK).json(customers);
});

export const getCustomerHandler = catchErrors(async (req, res) => {
  const userId = req.userId;
  appAssert(userId, UNAUTHORIZED, "not authenticated");

  const customerId = z.string().uuid().parse(req.params.id);
  const customer = await getCustomerById(userId, customerId);

  return res.status(OK).json(customer);
});

export const updateCustomerHandler = catchErrors(async (req, res) => {
  const userId = req.userId;
  appAssert(userId, UNAUTHORIZED, "not authenticated");

  const customerId = z.string().uuid().parse(req.params.id);
  const request = updateCustomerSchema.parse(req.body);
  const customer = await updateCustomer({
    userId,
    customerId,
    ...request,
  });

  return res.status(OK).json({
    message: "customer updated",
    customer,
  });
});

export const archiveCustomerHandler = catchErrors(async (req, res) => {
  const userId = req.userId;
  appAssert(userId, UNAUTHORIZED, "not authenticated");

  const customerId = z.string().uuid().parse(req.params.id);
  await archiveCustomer(userId, customerId);

  return res.status(OK).json({
    message: "customer archived",
  });
});
