import { useQuery } from "@tanstack/react-query";
import { fetchSales } from "../lib/api";
import { queryKeys } from "../lib/query";
import { useAuth } from "../providers/AuthProvider";
import type { DashboardSale, DashboardSalesSummary } from "../types/dashboard";

const emptySummary: DashboardSalesSummary = {
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

export const useSalesData = ({
  page = 1,
  limit = 10,
  search = "",
  status = "all",
}: {
  page?: number;
  limit?: number;
  search?: string;
  status?: "all" | "paid" | "partial" | "pending";
}) => {
  const { session } = useAuth();
  const accessToken = session?.tokens.accessToken;

  const query = useQuery({
    queryKey: queryKeys.sales.list({
      page,
      limit,
      search,
      status,
    }),
    enabled: Boolean(accessToken),
    queryFn: () =>
      fetchSales(accessToken!, {
        page,
        limit,
        search,
        status,
      }),
  });

  return {
    error: accessToken
      ? query.error instanceof Error
        ? query.error.message
        : null
      : "Session expired. Please sign in again.",
    isLoading: query.isPending,
    isRefreshing: query.isRefetching && !query.isPending,
    pagination: query.data?.pagination ?? {
      page,
      limit,
      total: 0,
      totalPages: 0,
    },
    refetch: () => query.refetch(),
    sales: (query.data?.sales ?? []) as DashboardSale[],
    summary: (query.data?.summary ?? emptySummary) as DashboardSalesSummary,
  };
};
