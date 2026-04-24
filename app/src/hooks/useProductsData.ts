import { useEffect, useState } from "react";
import { createProduct, fetchProducts } from "../lib/api";
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
  const [products, setProducts] = useState<Product[]>([]);
  const [summary, setSummary] = useState<ProductsSummary>(emptySummary);
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
      const response = await fetchProducts(accessToken, {
        page,
        limit,
        category,
        search,
        lowStockOnly,
      });

      setProducts(response.products ?? []);
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
        loadError instanceof Error ? loadError.message : "Failed to load inventory",
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, [session?.tokens.accessToken, page, limit, category, search, lowStockOnly]);

  return {
    error,
    isLoading,
    isRefreshing,
    pagination,
    products,
    refetch: () => load(true),
    summary,
  };
};

export const useCreateProduct = () => {
  const { session } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (payload: CreateProductPayload) => {
    const accessToken = session?.tokens.accessToken;

    if (!accessToken) {
      throw new Error("Session expired. Please sign in again.");
    }

    setIsLoading(true);
    setError(null);

    try {
      return await createProduct(accessToken, payload);
    } catch (submitError) {
      const nextError =
        submitError instanceof Error ? submitError.message : "Failed to create product";
      setError(nextError);
      throw submitError;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createProduct: submit,
    error,
    isLoading,
  };
};
