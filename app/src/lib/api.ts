import type {
  DashboardCustomersResponse,
  DashboardSale,
  DashboardSalesResponse,
  CreateSalePayload,
} from "../types/dashboard";
import type {
  CreateCustomerPayload,
  CustomerDetail,
  CustomersResponse,
} from "../types/customer";
import type {
  AdjustStockPayload,
  CreateProductPayload,
  InventoryMovement,
  Product,
  ProductsResponse,
  UpdateProductPayload,
} from "../types/product";
import type {
  LoginPayload,
  OnboardingPayload,
  RegisterPayload,
  Tokens,
  User,
} from "../types/auth";
import { assertApiUrl } from "../config";

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
};

type MobileAuthResponse = {
  user: User;
  accessToken: string;
  refreshToken: string;
};

type LoginResponse = MobileAuthResponse & {
  message: string;
};

type RefreshResponse = {
  message: string;
  accessToken: string;
  refreshToken: string;
};

const createHeaders = (headers?: Record<string, string>) => ({
  Accept: "application/json",
  ...headers,
});

const request = async <T>(path: string, options: RequestOptions = {}) => {
  const response = await fetch(`${assertApiUrl()}${path}`, {
    method: options.method ?? "GET",
    headers: createHeaders(options.headers),
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const rawText = await response.text();
  const data = rawText ? (JSON.parse(rawText) as Record<string, unknown>) : null;

  if (!response.ok) {
    throw new Error(
      typeof data?.message === "string"
        ? data.message
        : `Request failed with status ${response.status}`,
    );
  }

  return data as T;
};

const mobileHeaders = {
  "Content-Type": "application/json",
  "x-client-type": "mobile",
};

const createQueryString = (params: Record<string, string | number | boolean>) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    query.set(key, String(value));
  });

  return query.toString();
};

export const login = (payload: LoginPayload) =>
  request<LoginResponse>("/auth/login", {
    method: "POST",
    body: payload,
    headers: mobileHeaders,
  });

export const register = (payload: RegisterPayload) =>
  request<MobileAuthResponse>("/auth/register", {
    method: "POST",
    body: payload,
    headers: mobileHeaders,
  });

export const refreshSession = (refreshToken: string) =>
  request<RefreshResponse>("/auth/refresh", {
    headers: {
      "x-client-type": "mobile",
      "x-refresh-token": refreshToken,
    },
  });

export const fetchCurrentUser = (accessToken: string) =>
  request<User>("/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

export const logout = (accessToken: string) =>
  request<{ message: string }>("/auth/logout", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

export const completeOnboarding = (
  accessToken: string,
  payload: OnboardingPayload,
) =>
  request<{ message: string }>("/auth/onboarding", {
    method: "POST",
    body: payload,
    headers: {
      ...mobileHeaders,
      Authorization: `Bearer ${accessToken}`,
    },
  });

export const fetchDashboardSales = (accessToken: string) =>
  fetchSales(accessToken, {
    page: 1,
    limit: 5,
    search: "",
    status: "all",
  });

export const fetchDashboardCustomers = (accessToken: string) =>
  fetchCustomers(accessToken, {
    page: 1,
    limit: 1,
    search: "",
    dueStatus: "all",
    sortBy: "recent",
    sortOrder: "desc",
    recentOnly: false,
    includeArchived: false,
  });

export const fetchSales = (
  accessToken: string,
  params: {
    page: number;
    limit: number;
    search?: string;
    status?: "all" | "paid" | "partial" | "pending";
  },
) =>
  request<DashboardSalesResponse>(
    `/sales?${createQueryString({
      page: params.page,
      limit: params.limit,
      search: params.search ?? "",
      status: params.status ?? "all",
    })}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

export const fetchCustomers = (
  accessToken: string,
  params: {
    page: number;
    limit: number;
    search?: string;
    dueStatus?: "all" | "pending" | "cleared" | "high_due";
    sortBy?: "recent" | "name" | "due" | "revenue" | "orders";
    sortOrder?: "asc" | "desc";
    recentOnly?: boolean;
    includeArchived?: boolean;
  },
) =>
  request<CustomersResponse>(
    `/customers?${createQueryString({
      page: params.page,
      limit: params.limit,
      search: params.search ?? "",
      dueStatus: params.dueStatus ?? "all",
      sortBy: params.sortBy ?? "recent",
      sortOrder: params.sortOrder ?? "desc",
      recentOnly: params.recentOnly ?? false,
      includeArchived: params.includeArchived ?? false,
    })}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

export const fetchProducts = (
  accessToken: string,
  params: {
    page: number;
    limit: number;
    category?: string;
    search?: string;
    lowStockOnly?: boolean;
  },
) =>
  request<ProductsResponse>(
    `/products?${createQueryString({
      page: params.page,
      limit: params.limit,
      category: params.category ?? "",
      search: params.search ?? "",
      lowStockOnly: params.lowStockOnly ?? false,
    })}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

export const createProduct = (
  accessToken: string,
  payload: CreateProductPayload,
) =>
  request<Product>("/products", {
    method: "POST",
    body: payload,
    headers: {
      ...mobileHeaders,
      Authorization: `Bearer ${accessToken}`,
    },
  });

export const fetchProduct = (accessToken: string, productId: string) =>
  request<Product>(`/products/${productId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

export const updateProduct = (
  accessToken: string,
  productId: string,
  payload: UpdateProductPayload,
) =>
  request<Product>(`/products/${productId}`, {
    method: "PATCH",
    body: payload,
    headers: {
      ...mobileHeaders,
      Authorization: `Bearer ${accessToken}`,
    },
  });

export const deleteProduct = (accessToken: string, productId: string) =>
  request<{ message?: string }>(`/products/${productId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

export const adjustProductStock = (
  accessToken: string,
  productId: string,
  payload: AdjustStockPayload,
) =>
  request<{ product: Product; movement: InventoryMovement }>(
    `/products/${productId}/adjust-stock`,
    {
      method: "POST",
      body: payload,
      headers: {
        ...mobileHeaders,
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

export const fetchProductMovements = (accessToken: string, productId: string) =>
  request<InventoryMovement[]>(`/products/${productId}/movements`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

export const createCustomer = (
  accessToken: string,
  payload: CreateCustomerPayload,
) =>
  request<CreateCustomerPayload & { id: string }>("/customers", {
    method: "POST",
    body: payload,
    headers: {
      ...mobileHeaders,
      Authorization: `Bearer ${accessToken}`,
    },
  });

export const fetchCustomer = (accessToken: string, customerId: string) =>
  request<CustomerDetail>(`/customers/${customerId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

export const updateCustomer = (
  accessToken: string,
  customerId: string,
  payload: Partial<CreateCustomerPayload>,
) =>
  request<CreateCustomerPayload & { id: string }>(`/customers/${customerId}`, {
    method: "PATCH",
    body: payload,
    headers: {
      ...mobileHeaders,
      Authorization: `Bearer ${accessToken}`,
    },
  });

export const archiveCustomer = (accessToken: string, customerId: string) =>
  request<{ message?: string }>(`/customers/${customerId}/archive`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

export const createSale = (accessToken: string, payload: CreateSalePayload) =>
  request<{ message?: string; sale: DashboardSale }>("/sales", {
    method: "POST",
    body: payload,
    headers: {
      ...mobileHeaders,
      Authorization: `Bearer ${accessToken}`,
    },
  });

export const fetchSale = (accessToken: string, saleId: string) =>
  request<DashboardSale>(`/sales/${saleId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

export const createSalePayment = (
  accessToken: string,
  saleId: string,
  amount: number,
) =>
  request<DashboardSale>(`/sales/${saleId}/payments`, {
    method: "POST",
    body: { amount },
    headers: {
      ...mobileHeaders,
      Authorization: `Bearer ${accessToken}`,
    },
  });

export const buildGoogleAuthUrl = (redirectUri: string) =>
  `${assertApiUrl()}/auth/google?mobile_redirect_uri=${encodeURIComponent(
    redirectUri,
  )}`;

export const toTokens = (response: Tokens | MobileAuthResponse): Tokens => ({
  accessToken: response.accessToken,
  refreshToken: response.refreshToken,
});
