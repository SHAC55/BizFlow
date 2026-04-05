import { getCustomersAPI } from "../api/customer.api";
import { getProductsAPI } from "../api/product.api";
import { getSalesAPI } from "../api/sale.api";
import { customerKeys, productKeys, saleKeys } from "./queryKeys";

const dashboardSalesParams = {
  page: 1,
  limit: 5,
  search: "",
  status: "all",
};

const dashboardSalesSummaryParams = {
  page: 1,
  limit: 1,
  search: "",
  status: "all",
};

const dashboardCustomerSummaryParams = {
  page: 1,
  limit: 1,
  search: "",
  dueStatus: "all",
  sortBy: "recent",
  sortOrder: "desc",
  recentOnly: false,
  includeArchived: false,
};

const inventoryParams = {
  page: 1,
  limit: 10,
  category: "",
  search: "",
  lowStockOnly: false,
};

const salesParams = {
  page: 1,
  limit: 10,
  search: "",
  status: "all",
};

const paymentsParams = {
  page: 1,
  limit: 100,
  search: "",
  status: "all",
};

const customersParams = {
  page: 1,
  limit: 12,
  search: "",
  dueStatus: "all",
  sortBy: "recent",
  sortOrder: "desc",
  recentOnly: false,
  includeArchived: false,
};

export const prefetchRouteData = (queryClient, path) => {
  switch (path) {
    case "/dashboard":
      queryClient.prefetchQuery({
        queryKey: saleKeys.list(dashboardSalesParams),
        queryFn: () => getSalesAPI(dashboardSalesParams),
        staleTime: 30 * 1000,
      });
      queryClient.prefetchQuery({
        queryKey: saleKeys.list(dashboardSalesSummaryParams),
        queryFn: () => getSalesAPI(dashboardSalesSummaryParams),
        staleTime: 30 * 1000,
      });
      queryClient.prefetchQuery({
        queryKey: customerKeys.list(dashboardCustomerSummaryParams),
        queryFn: () => getCustomersAPI(dashboardCustomerSummaryParams),
        staleTime: 2 * 60 * 1000,
      });
      break;
    case "/inventory":
      queryClient.prefetchQuery({
        queryKey: productKeys.list(inventoryParams),
        queryFn: () => getProductsAPI(inventoryParams),
        staleTime: 2 * 60 * 1000,
      });
      break;
    case "/customers":
      queryClient.prefetchQuery({
        queryKey: customerKeys.list(customersParams),
        queryFn: () => getCustomersAPI(customersParams),
        staleTime: 2 * 60 * 1000,
      });
      break;
    case "/sales":
      queryClient.prefetchQuery({
        queryKey: saleKeys.list(salesParams),
        queryFn: () => getSalesAPI(salesParams),
        staleTime: 45 * 1000,
      });
      break;
    case "/payments":
      queryClient.prefetchQuery({
        queryKey: saleKeys.list(paymentsParams),
        queryFn: () => getSalesAPI(paymentsParams),
        staleTime: 45 * 1000,
      });
      break;
    default:
      break;
  }
};
