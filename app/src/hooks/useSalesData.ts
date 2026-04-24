import { useEffect, useState } from "react";
import { fetchSales } from "../lib/api";
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
  const [sales, setSales] = useState<DashboardSale[]>([]);
  const [summary, setSummary] = useState<DashboardSalesSummary>(emptySummary);
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
      const response = await fetchSales(accessToken, {
        page,
        limit,
        search,
        status,
      });
      setSales(response.sales ?? []);
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
        loadError instanceof Error ? loadError.message : "Failed to load sales",
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, [session?.tokens.accessToken, page, limit, search, status]);

  return {
    error,
    isLoading,
    isRefreshing,
    pagination,
    refetch: () => load(true),
    sales,
    summary,
  };
};
