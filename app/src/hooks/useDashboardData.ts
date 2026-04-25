import { useQuery } from "@tanstack/react-query";
import {
  fetchDashboardCustomers,
  fetchDashboardSales,
} from "../lib/api";
import { queryKeys } from "../lib/query";
import { useAuth } from "../providers/AuthProvider";
import type {
  DashboardCustomerSummary,
  DashboardSale,
  DashboardSalesSummary,
} from "../types/dashboard";

const emptySalesSummary: DashboardSalesSummary = {
  totalSales: 0,
  totalRevenue: 0,
  totalOutstanding: 0,
  totalInvoiced: 0,
  todaySalesAmount: 0,
  todaySalesCount: 0,
  monthlySalesAmount: 0,
  monthlyRevenue: 0,
  uniqueCustomers: 0,
};

const emptyCustomerSummary: DashboardCustomerSummary = {
  totalCustomers: 0,
  clearedCustomers: 0,
  pendingCustomers: 0,
  totalDue: 0,
  totalRevenue: 0,
};

export const useDashboardData = () => {
  const { session } = useAuth();
  const accessToken = session?.tokens.accessToken;

  const query = useQuery({
    queryKey: queryKeys.dashboard.summary,
    enabled: Boolean(accessToken),
    queryFn: async () => {
      const [salesResponse, customersResponse] = await Promise.all([
        fetchDashboardSales(accessToken!),
        fetchDashboardCustomers(accessToken!),
      ]);

      return {
        sales: salesResponse.sales ?? [],
        salesSummary: salesResponse.summary ?? emptySalesSummary,
        customerSummary: customersResponse.summary ?? emptyCustomerSummary,
        lastUpdated: new Date().toISOString(),
      };
    },
  });

  return {
    customerSummary: (query.data?.customerSummary ??
      emptyCustomerSummary) as DashboardCustomerSummary,
    error: accessToken
      ? query.error instanceof Error
        ? query.error.message
        : null
      : "Session expired. Please sign in again.",
    isLoading: query.isPending,
    isRefreshing: query.isRefetching && !query.isPending,
    lastUpdated: query.data?.lastUpdated ?? null,
    refetch: () => query.refetch(),
    sales: (query.data?.sales ?? []) as DashboardSale[],
    salesSummary: (query.data?.salesSummary ??
      emptySalesSummary) as DashboardSalesSummary,
  };
};
