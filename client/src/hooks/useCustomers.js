import { useDeferredValue, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  archiveCustomerAPI,
  createCustomerAPI,
  getCustomerAPI,
  getCustomersAPI,
  updateCustomerAPI,
} from "../api/customer.api";

export const useCustomers = (params) => {
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
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit,
    total: 0,
    totalPages: 0,
  });
  const [summary, setSummary] = useState({
    totalCustomers: 0,
    clearedCustomers: 0,
    pendingCustomers: 0,
    totalDue: 0,
    totalRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    const fetchCustomers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getCustomersAPI({
          page,
          limit,
          search: deferredSearch,
          dueStatus,
          sortBy,
          sortOrder,
          recentOnly,
          includeArchived,
        });

        if (ignore) {
          return;
        }

        setCustomers(response.customers);
        setPagination(response.pagination);
        setSummary(response.summary);
      } catch (err) {
        if (ignore) {
          return;
        }

        const message =
          err.response?.data?.message || "Failed to load customers";
        setError(message);
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    fetchCustomers();

    return () => {
      ignore = true;
    };
  }, [
    deferredSearch,
    dueStatus,
    includeArchived,
    limit,
    page,
    recentOnly,
    reloadKey,
    sortBy,
    sortOrder,
  ]);

  return {
    customers,
    pagination,
    summary,
    isLoading,
    error,
    refetch: () => setReloadKey((current) => current + 1),
  };
};

export const useCustomer = (customerId) => {
  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(customerId));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!customerId) {
      setCustomer(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    let ignore = false;

    const fetchCustomer = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getCustomerAPI(customerId);

        if (!ignore) {
          setCustomer(response);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.response?.data?.message || "Failed to load customer");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    fetchCustomer();

    return () => {
      ignore = true;
    };
  }, [customerId]);

  return { customer, isLoading, error };
};

export const useCreateCustomer = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const createCustomer = async (data) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await createCustomerAPI(data);
      toast.success("Customer created");
      return response;
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to create customer";
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createCustomer,
    isLoading,
    error,
  };
};

export const useUpdateCustomer = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateCustomer = async (customerId, data) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await updateCustomerAPI(customerId, data);
      toast.success("Customer updated");
      return response;
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to update customer";
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateCustomer, isLoading, error };
};

export const useArchiveCustomer = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const archiveCustomer = async (customerId) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await archiveCustomerAPI(customerId);
      toast.success("Customer archived");
      return response;
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to archive customer";
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { archiveCustomer, isLoading, error };
};
