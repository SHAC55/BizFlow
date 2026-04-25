import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
    },
  },
});

export const queryKeys = {
  dashboard: {
    all: ["dashboard"] as const,
    summary: ["dashboard", "summary"] as const,
  },
  sales: {
    all: ["sales"] as const,
    lists: () => ["sales", "list"] as const,
    list: (params: {
      page: number;
      limit: number;
      search: string;
      status: "all" | "paid" | "partial" | "pending";
    }) => ["sales", "list", params] as const,
    detail: (saleId: string) => ["sales", "detail", saleId] as const,
  },
  customers: {
    all: ["customers"] as const,
    lists: () => ["customers", "list"] as const,
    list: (params: {
      page: number;
      limit: number;
      search: string;
      dueStatus: "all" | "pending" | "cleared" | "high_due";
      sortBy: "recent" | "name" | "due" | "revenue" | "orders";
      sortOrder: "asc" | "desc";
      recentOnly: boolean;
    }) => ["customers", "list", params] as const,
    detail: (customerId: string) => ["customers", "detail", customerId] as const,
  },
  products: {
    all: ["products"] as const,
    lists: () => ["products", "list"] as const,
    list: (params: {
      page: number;
      limit: number;
      category: string;
      search: string;
      lowStockOnly: boolean;
    }) => ["products", "list", params] as const,
    detail: (productId: string) => ["products", "detail", productId] as const,
    movements: (productId: string) => ["products", "movements", productId] as const,
  },
} as const;
