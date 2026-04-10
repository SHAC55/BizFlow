import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useDeferredValue } from "react";
import toast from "react-hot-toast";
import {
  adjustProductStockAPI,
  createProductAPI,
  deleteProductAPI,
  getProductAPI,
  getLowStockProductsAPI,
  getProductMovementsAPI,
  getProductsAPI,
  updateProductAPI,
} from "../api/product.api";
import { mapListItems, updateMatchingQueries } from "../lib/queryCacheUtils";
import { productKeys, saleKeys } from "../lib/queryKeys";

export const useProducts = (params = {}) => {
  const {
    page = 1,
    limit = 10,
    category = "",
    search = "",
    lowStockOnly = false,
  } = params;
  const deferredSearch = useDeferredValue(search);
  const queryParams = {
    page,
    limit,
    category,
    search: deferredSearch,
    lowStockOnly,
  };

  const query = useQuery({
    queryKey: productKeys.list(queryParams),
    queryFn: () => getProductsAPI(queryParams),
    staleTime: 2 * 60 * 1000,
  });

  return {
    products: query.data?.products ?? [],
    pagination: query.data?.pagination ?? {
      page: 1,
      limit,
      total: 0,
      totalPages: 0,
    },
    summary: query.data?.summary ?? {
      totalProducts: 0,
      totalValue: 0,
      totalCostValue: 0,
      projectedProfit: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      categories: [],
    },
    isLoading: query.isLoading,
    error: query.error?.response?.data?.message || query.error?.message || null,
    refetch: query.refetch,
  };
};

export const useProduct = (productId) => {
  const query = useQuery({
    queryKey: productKeys.detail(productId),
    queryFn: () => getProductAPI(productId),
    enabled: Boolean(productId),
    staleTime: 5 * 60 * 1000,
  });

  return {
    product: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error?.response?.data?.message || query.error?.message || null,
  };
};

export const useLowStockProducts = (params = {}) => {
  const { page = 1, limit = 10, category = "", search = "" } = params;
  const deferredSearch = useDeferredValue(search);
  const queryParams = {
    page,
    limit,
    category,
    search: deferredSearch,
  };

  const query = useQuery({
    queryKey: productKeys.lowStock(queryParams),
    queryFn: () => getLowStockProductsAPI(queryParams),
    staleTime: 45 * 1000,
  });

  return {
    products: query.data?.products ?? [],
    pagination: query.data?.pagination ?? {
      page: 1,
      limit,
      total: 0,
      totalPages: 0,
    },
    summary: query.data?.summary ?? {
      totalProducts: 0,
      totalValue: 0,
      totalCostValue: 0,
      projectedProfit: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      categories: [],
    },
    isLoading: query.isLoading,
    error: query.error?.response?.data?.message || query.error?.message || null,
  };
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createProductAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      toast.success("Product created");
    },
  });

  return {
    createProduct: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error:
      mutation.error?.response?.data?.message || mutation.error?.message || null,
  };
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ productId, data }) => updateProductAPI(productId, data),
    onMutate: async ({ productId, data }) => {
      await queryClient.cancelQueries({ queryKey: productKeys.all });

      const previousProduct = queryClient.getQueryData(productKeys.detail(productId));
      const previousLists = queryClient.getQueriesData({
        queryKey: productKeys.lists(),
      });

      if (previousProduct) {
        queryClient.setQueryData(productKeys.detail(productId), {
          ...previousProduct,
          ...data,
        });
      }

      updateMatchingQueries(queryClient, productKeys.lists(), (currentData) =>
        mapListItems(currentData, "products", (product) =>
          product.id === productId ? { ...product, ...data } : product,
        ),
      );

      return { previousProduct, previousLists };
    },
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.productId),
      });
      toast.success("Product updated");
    },
    onError: (_error, variables, context) => {
      if (context?.previousProduct) {
        queryClient.setQueryData(
          productKeys.detail(variables.productId),
          context.previousProduct,
        );
      }

      context?.previousLists?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
  });

  return {
    updateProduct: (productId, data) =>
      mutation.mutateAsync({ productId, data }),
    isLoading: mutation.isPending,
    error:
      mutation.error?.response?.data?.message || mutation.error?.message || null,
  };
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: deleteProductAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: saleKeys.all });
      toast.success("Product deleted");
    },
  });

  return {
    deleteProduct: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error:
      mutation.error?.response?.data?.message || mutation.error?.message || null,
  };
};

export const useAdjustProductStock = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ productId, data }) => adjustProductStockAPI(productId, data),
    onMutate: async ({ productId, data }) => {
      await queryClient.cancelQueries({ queryKey: productKeys.all });

      const previousProduct = queryClient.getQueryData(productKeys.detail(productId));
      const previousLists = queryClient.getQueriesData({
        queryKey: productKeys.lists(),
      });

      const getNextQuantity = (currentQuantity) => {
        if (data.type === "INCREASE") {
          return currentQuantity + data.quantity;
        }

        if (data.type === "DECREASE") {
          return currentQuantity - data.quantity;
        }

        return data.quantity;
      };

      if (previousProduct) {
        queryClient.setQueryData(productKeys.detail(productId), {
          ...previousProduct,
          quantity: getNextQuantity(previousProduct.quantity),
        });
      }

      updateMatchingQueries(queryClient, productKeys.lists(), (currentData) =>
        mapListItems(currentData, "products", (product) =>
          product.id === productId
            ? { ...product, quantity: getNextQuantity(product.quantity) }
            : product,
        ),
      );

      return { previousProduct, previousLists };
    },
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.productId),
      });
      queryClient.invalidateQueries({
        queryKey: productKeys.movements(variables.productId),
      });
      toast.success("Stock adjusted");
    },
    onError: (_error, variables, context) => {
      if (context?.previousProduct) {
        queryClient.setQueryData(
          productKeys.detail(variables.productId),
          context.previousProduct,
        );
      }

      context?.previousLists?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
  });

  return {
    adjustProductStock: (productId, data) =>
      mutation.mutateAsync({ productId, data }),
    isLoading: mutation.isPending,
    error:
      mutation.error?.response?.data?.message || mutation.error?.message || null,
  };
};

export const useProductMovements = (productId, isEnabled = true) => {
  const query = useQuery({
    queryKey: productKeys.movements(productId),
    queryFn: () => getProductMovementsAPI(productId),
    enabled: Boolean(productId) && isEnabled,
    staleTime: 30 * 1000,
  });

  return {
    movements: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error?.response?.data?.message || query.error?.message || null,
    refetch: query.refetch,
  };
};
