import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useDeferredValue } from "react";
import toast from "react-hot-toast";
import {
  createSaleAPI,
  createSalePaymentAPI,
  getSaleAPI,
  getSalesAPI,
} from "../api/sale.api";
import { mapListItems, updateMatchingQueries } from "../lib/queryCacheUtils";
import { customerKeys, productKeys, saleKeys } from "../lib/queryKeys";

export const useSales = (params = {}) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    status = "all",
  } = params;
  const deferredSearch = useDeferredValue(search);
  const queryParams = {
    page,
    limit,
    search: deferredSearch,
    status,
  };

  const query = useQuery({
    queryKey: saleKeys.list(queryParams),
    queryFn: () => getSalesAPI(queryParams),
    staleTime: 45 * 1000,
  });

  return {
    sales: query.data?.sales ?? [],
    pagination: query.data?.pagination ?? {
      page: 1,
      limit,
      total: 0,
      totalPages: 0,
    },
    summary: query.data?.summary ?? {
      totalSales: 0,
      totalRevenue: 0,
      totalOutstanding: 0,
      totalInvoiced: 0,
      todaySalesAmount: 0,
      todaySalesCount: 0,
      monthlySalesAmount: 0,
      monthlyRevenue: 0,
      uniqueCustomers: 0,
    },
    isLoading: query.isLoading,
    error: query.error?.response?.data?.message || query.error?.message || null,
    refetch: query.refetch,
  };
};

export const useSale = (saleId) => {
  const query = useQuery({
    queryKey: saleKeys.detail(saleId),
    queryFn: () => getSaleAPI(saleId),
    enabled: Boolean(saleId),
    staleTime: 30 * 1000,
  });

  return {
    sale: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error?.response?.data?.message || query.error?.message || null,
    refetch: query.refetch,
  };
};

export const useCreateSale = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createSaleAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: saleKeys.all });
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      toast.success("Sale recorded");
    },
  });

  return {
    createSale: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error:
      mutation.error?.response?.data?.message || mutation.error?.message || null,
  };
};

export const useCreateSalePayment = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ saleId, data }) => createSalePaymentAPI(saleId, data),
    onMutate: async ({ saleId, data }) => {
      await queryClient.cancelQueries({ queryKey: saleKeys.all });

      const previousSale = queryClient.getQueryData(saleKeys.detail(saleId));
      const previousSalesLists = queryClient.getQueriesData({
        queryKey: saleKeys.lists(),
      });

      if (previousSale) {
        const nextDueAmount = Math.max(previousSale.dueAmount - data.amount, 0);
        const nextPaidAmount = previousSale.paidAmount + data.amount;
        const nextStatus =
          nextDueAmount <= 0 ? "paid" : nextPaidAmount > 0 ? "partial" : "pending";

        queryClient.setQueryData(saleKeys.detail(saleId), {
          ...previousSale,
          paidAmount: nextPaidAmount,
          dueAmount: nextDueAmount,
          status: nextStatus,
          payments: [
            {
              id: `temp-${Date.now()}`,
              amount: data.amount,
              createdAt: new Date().toISOString(),
            },
            ...previousSale.payments,
          ],
        });
      }

      updateMatchingQueries(queryClient, saleKeys.lists(), (currentData) =>
        mapListItems(currentData, "sales", (sale) => {
          if (sale.id !== saleId) {
            return sale;
          }

          const nextDueAmount = Math.max(sale.dueAmount - data.amount, 0);
          const nextPaidAmount = sale.paidAmount + data.amount;
          const nextStatus =
            nextDueAmount <= 0 ? "paid" : nextPaidAmount > 0 ? "partial" : "pending";

          return {
            ...sale,
            paidAmount: nextPaidAmount,
            dueAmount: nextDueAmount,
            status: nextStatus,
            payments: [
              {
                id: `temp-${Date.now()}`,
                amount: data.amount,
                createdAt: new Date().toISOString(),
              },
              ...sale.payments,
            ],
          };
        }),
      );

      return {
        previousSale,
        previousSalesLists,
      };
    },
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: saleKeys.all });
      queryClient.invalidateQueries({ queryKey: saleKeys.detail(variables.saleId) });
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
      toast.success("Payment recorded");
    },
    onError: (_error, variables, context) => {
      if (context?.previousSale) {
        queryClient.setQueryData(saleKeys.detail(variables.saleId), context.previousSale);
      }

      context?.previousSalesLists?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
  });

  return {
    createSalePayment: (saleId, data) =>
      mutation.mutateAsync({ saleId, data }),
    isLoading: mutation.isPending,
    error:
      mutation.error?.response?.data?.message || mutation.error?.message || null,
  };
};
