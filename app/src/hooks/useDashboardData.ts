import { useEffect, useState } from "react";
import {
  fetchDashboardCustomers,
  fetchDashboardSales,
} from "../lib/api";
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
  const [sales, setSales] = useState<DashboardSale[]>([]);
  const [salesSummary, setSalesSummary] =
    useState<DashboardSalesSummary>(emptySalesSummary);
  const [customerSummary, setCustomerSummary] = useState<DashboardCustomerSummary>(
    emptyCustomerSummary,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const load = async (isManualRefresh = false) => {
    const accessToken = session?.tokens.accessToken;

    if (!accessToken) {
      setError("Session expired. Please sign in again.");
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      setError(null);
      const [salesResponse, customersResponse] = await Promise.all([
        fetchDashboardSales(accessToken),
        fetchDashboardCustomers(accessToken),
      ]);

      setSales(salesResponse.sales ?? []);
      setSalesSummary(salesResponse.summary ?? emptySalesSummary);
      setCustomerSummary(customersResponse.summary ?? emptyCustomerSummary);
      setLastUpdated(new Date().toISOString());
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load dashboard",
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, [session?.tokens.accessToken]);

  return {
    customerSummary,
    error,
    isLoading,
    isRefreshing,
    lastUpdated,
    refetch: () => load(true),
    sales,
    salesSummary,
  };
};
