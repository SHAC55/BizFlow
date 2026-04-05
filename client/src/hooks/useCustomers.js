import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useDeferredValue } from "react";
import toast from "react-hot-toast";
import {
  archiveCustomerAPI,
  createCustomerAPI,
  getCustomerAPI,
  getCustomersAPI,
  updateCustomerAPI,
} from "../api/customer.api";
import { mapListItems, updateMatchingQueries } from "../lib/queryCacheUtils";
import { customerKeys, saleKeys } from "../lib/queryKeys";

export const useCustomers = (params = {}) => {
  const {
    page = 1,
    limit = 12,
    search = "",
    dueStatus = "all",
    sortBy = "recent",
    sortOrder = "desc",
    recentOnly = false,
    includeArchived = false,
  } = params;
  const deferredSearch = useDeferredValue(search);
  const queryParams = {
    page,
    limit,
    search: deferredSearch,
    dueStatus,
    sortBy,
    sortOrder,
    recentOnly,
    includeArchived,
  };

  const query = useQuery({
    queryKey: customerKeys.list(queryParams),
    queryFn: () => getCustomersAPI(queryParams),
    staleTime: 2 * 60 * 1000,
  });

  return {
    customers: query.data?.customers ?? [],
    pagination: query.data?.pagination ?? {
      page: 1,
      limit,
      total: 0,
      totalPages: 0,
    },
    summary: query.data?.summary ?? {
      totalCustomers: 0,
      clearedCustomers: 0,
      pendingCustomers: 0,
      totalDue: 0,
      totalRevenue: 0,
    },
    isLoading: query.isLoading,
    error: query.error?.response?.data?.message || query.error?.message || null,
    refetch: query.refetch,
  };
};

export const useCustomer = (customerId) => {
  const query = useQuery({
    queryKey: customerKeys.detail(customerId),
    queryFn: () => getCustomerAPI(customerId),
    enabled: Boolean(customerId),
    staleTime: 2 * 60 * 1000,
  });

  return {
    customer: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error?.response?.data?.message || query.error?.message || null,
  };
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createCustomerAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
      toast.success("Customer created");
    },
  });

  return {
    createCustomer: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error:
      mutation.error?.response?.data?.message || mutation.error?.message || null,
  };
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ customerId, data }) => updateCustomerAPI(customerId, data),
    onMutate: async ({ customerId, data }) => {
      await queryClient.cancelQueries({ queryKey: customerKeys.all });

      const previousCustomer = queryClient.getQueryData(customerKeys.detail(customerId));
      const previousLists = queryClient.getQueriesData({
        queryKey: customerKeys.lists(),
      });

      if (previousCustomer) {
        queryClient.setQueryData(customerKeys.detail(customerId), {
          ...previousCustomer,
          ...data,
        });
      }

      updateMatchingQueries(queryClient, customerKeys.lists(), (currentData) =>
        mapListItems(currentData, "customers", (customer) =>
          customer.id === customerId ? { ...customer, ...data } : customer,
        ),
      );

      return { previousCustomer, previousLists };
    },
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
      queryClient.invalidateQueries({
        queryKey: customerKeys.detail(variables.customerId),
      });
      queryClient.invalidateQueries({ queryKey: saleKeys.all });
      toast.success("Customer updated");
    },
    onError: (_error, variables, context) => {
      if (context?.previousCustomer) {
        queryClient.setQueryData(
          customerKeys.detail(variables.customerId),
          context.previousCustomer,
        );
      }

      context?.previousLists?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
  });

  return {
    updateCustomer: (customerId, data) =>
      mutation.mutateAsync({ customerId, data }),
    isLoading: mutation.isPending,
    error:
      mutation.error?.response?.data?.message || mutation.error?.message || null,
  };
};

export const useArchiveCustomer = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: archiveCustomerAPI,
    onMutate: async (customerId) => {
      await queryClient.cancelQueries({ queryKey: customerKeys.all });

      const previousCustomer = queryClient.getQueryData(customerKeys.detail(customerId));
      const previousLists = queryClient.getQueriesData({
        queryKey: customerKeys.lists(),
      });
      const archivedAt = new Date().toISOString();

      if (previousCustomer) {
        queryClient.setQueryData(customerKeys.detail(customerId), {
          ...previousCustomer,
          archivedAt,
        });
      }

      updateMatchingQueries(queryClient, customerKeys.lists(), (currentData) =>
        mapListItems(currentData, "customers", (customer) =>
          customer.id === customerId ? { ...customer, archivedAt } : customer,
        ),
      );

      return { previousCustomer, previousLists };
    },
    onSuccess: (_response, customerId) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(customerId) });
      toast.success("Customer archived");
    },
    onError: (_error, customerId, context) => {
      if (context?.previousCustomer) {
        queryClient.setQueryData(
          customerKeys.detail(customerId),
          context.previousCustomer,
        );
      }

      context?.previousLists?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
  });

  return {
    archiveCustomer: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error:
      mutation.error?.response?.data?.message || mutation.error?.message || null,
  };
};
