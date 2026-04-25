import { useMutation, useQuery } from "@tanstack/react-query";
import { createProduct, fetchProducts } from "../lib/api";
import { queryClient, queryKeys } from "../lib/query";
import { useAuth } from "../providers/AuthProvider";
import type {
  CreateProductPayload,
  Product,
  ProductsSummary,
} from "../types/product";

const emptySummary: ProductsSummary = {
  totalProducts: 0,
  totalValue: 0,
  totalCostValue: 0,
  projectedProfit: 0,
  lowStockCount: 0,
  outOfStockCount: 0,
  categories: [],
};

export const useProductsData = ({
  page = 1,
  limit = 10,
  category = "",
  search = "",
  lowStockOnly = false,
}: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  lowStockOnly?: boolean;
}) => {
  const { session } = useAuth();
  const accessToken = session?.tokens.accessToken;

  const query = useQuery({
    queryKey: queryKeys.products.list({
      page,
      limit,
      category,
      search,
      lowStockOnly,
    }),
    enabled: Boolean(accessToken),
    queryFn: () =>
      fetchProducts(accessToken!, {
        page,
        limit,
        category,
        search,
        lowStockOnly,
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
    products: (query.data?.products ?? []) as Product[],
    refetch: () => query.refetch(),
    summary: (query.data?.summary ?? emptySummary) as ProductsSummary,
  };
};

export const useCreateProduct = () => {
  const { session } = useAuth();
  const mutation = useMutation({
    mutationFn: async (payload: CreateProductPayload) => {
      const accessToken = session?.tokens.accessToken;
      if (!accessToken) {
        throw new Error("Session expired. Please sign in again.");
      }

      return createProduct(accessToken, payload);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.products.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
      ]);
    },
  });

  return {
    createProduct: mutation.mutateAsync,
    error: mutation.error instanceof Error ? mutation.error.message : null,
    isLoading: mutation.isPending,
  };
};
