import { useEffect, useState } from "react";
import { fetchCustomers } from "../lib/api";
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
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [summary, setSummary] = useState<CustomersSummary>(emptySummary);
  const [pagination, setPagination] = useState({
    page: 1,
    limit,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async (refresh = false) => {
    const accessToken = session?.tokens.accessToken;

    if (!accessToken) {
      setError("Session expired. Please sign in again.");
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      setError(null);
      const response = await fetchCustomers(accessToken, {
        page,
        limit,
        search,
        dueStatus,
        sortBy,
        sortOrder,
        recentOnly,
        includeArchived: false,
      });
      setCustomers(response.customers ?? []);
      setSummary(response.summary ?? emptySummary);
      setPagination(
        response.pagination ?? {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      );
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load customers",
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, [
    session?.tokens.accessToken,
    page,
    limit,
    search,
    dueStatus,
    sortBy,
    sortOrder,
    recentOnly,
  ]);

  return {
    customers,
    error,
    isLoading,
    isRefreshing,
    pagination,
    refetch: () => load(true),
    summary,
  };
};
