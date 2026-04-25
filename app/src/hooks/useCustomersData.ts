import { useQuery } from "@tanstack/react-query";
import { fetchCustomers } from "../lib/api";
import { queryKeys } from "../lib/query";
import { useAuth } from "../providers/AuthProvider";
import type { Customer, CustomersSummary } from "../types/customer";

const emptySummary: CustomersSummary = {
  totalCustomers: 0,
  clearedCustomers: 0,
  pendingCustomers: 0,
  totalDue: 0,
  totalRevenue: 0,
};

export const useCustomersData = ({
  page = 1,
  limit = 10,
  search = "",
  dueStatus = "all",
  sortBy = "recent",
  sortOrder = "desc",
  recentOnly = false,
}: {
  page?: number;
  limit?: number;
  search?: string;
  dueStatus?: "all" | "pending" | "cleared" | "high_due";
  sortBy?: "recent" | "name" | "due" | "revenue" | "orders";
  sortOrder?: "asc" | "desc";
  recentOnly?: boolean;
}) => {
  const { session } = useAuth();
  const accessToken = session?.tokens.accessToken;

  const query = useQuery({
    queryKey: queryKeys.customers.list({
      page,
      limit,
      search,
      dueStatus,
      sortBy,
      sortOrder,
      recentOnly,
    }),
    enabled: Boolean(accessToken),
    queryFn: () =>
      fetchCustomers(accessToken!, {
        page,
        limit,
        search,
        dueStatus,
        sortBy,
        sortOrder,
        recentOnly,
        includeArchived: false,
      }),
  });

  return {
    customers: (query.data?.customers ?? []) as Customer[],
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
    summary: (query.data?.summary ?? emptySummary) as CustomersSummary,
  };
};
