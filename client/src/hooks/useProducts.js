import { useEffect, useState } from "react";
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

export const useProducts = (params) => {
  const {
    page = 1,
    limit = 10,
    category = "",
    search = "",
    lowStockOnly = false,
  } = params;
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [summary, setSummary] = useState({
    totalProducts: 0,
    totalValue: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getProductsAPI({
          page,
          limit,
          category,
          search,
          lowStockOnly,
        });

        if (ignore) {
          return;
        }

        setProducts(response.products);
        setPagination(response.pagination);
        setSummary(response.summary);
      } catch (err) {
        if (ignore) {
          return;
        }

        const message =
          err.response?.data?.message || "Failed to load inventory";
        setError(message);
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      ignore = true;
    };
  }, [page, limit, category, search, lowStockOnly, reloadKey]);

  return {
    products,
    pagination,
    summary,
    isLoading,
    error,
    refetch: () => setReloadKey((current) => current + 1),
  };
};

export const useProduct = (productId) => {
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(productId));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!productId) {
      setProduct(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    let ignore = false;

    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getProductAPI(productId);

        if (!ignore) {
          setProduct(response);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.response?.data?.message || "Failed to load product");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      ignore = true;
    };
  }, [productId]);

  return { product, isLoading, error };
};

export const useLowStockProducts = (params) => {
  const { page = 1, limit = 10, category = "", search = "" } = params;
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [summary, setSummary] = useState({
    totalProducts: 0,
    totalValue: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    categories: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getLowStockProductsAPI({
          page,
          limit,
          category,
          search,
        });

        if (ignore) {
          return;
        }

        setProducts(response.products);
        setPagination(response.pagination);
        setSummary(response.summary);
      } catch (err) {
        if (!ignore) {
          setError(
            err.response?.data?.message || "Failed to load low-stock products",
          );
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      ignore = true;
    };
  }, [page, limit, category, search]);

  return { products, pagination, summary, isLoading, error };
};

export const useCreateProduct = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const createProduct = async (data) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await createProductAPI(data);
      toast.success("Product created");
      return response;
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to create product";
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { createProduct, isLoading, error };
};

export const useUpdateProduct = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateProduct = async (productId, data) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await updateProductAPI(productId, data);
      toast.success("Product updated");
      return response;
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to update product";
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateProduct, isLoading, error };
};

export const useDeleteProduct = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteProduct = async (productId) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await deleteProductAPI(productId);
      toast.success("Product deleted");
      return response;
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to delete product";
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { deleteProduct, isLoading, error };
};

export const useAdjustProductStock = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const adjustProductStock = async (productId, data) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await adjustProductStockAPI(productId, data);
      toast.success("Stock adjusted");
      return response;
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to adjust stock";
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { adjustProductStock, isLoading, error };
};

export const useProductMovements = (productId, isEnabled = true) => {
  const [movements, setMovements] = useState([]);
  const [isLoading, setIsLoading] = useState(Boolean(productId) && isEnabled);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!productId || !isEnabled) {
      setMovements([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    let ignore = false;

    const fetchMovements = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getProductMovementsAPI(productId);

        if (!ignore) {
          setMovements(response);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err.response?.data?.message || "Failed to load inventory history",
          );
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    fetchMovements();

    return () => {
      ignore = true;
    };
  }, [productId, isEnabled, reloadKey]);

  return {
    movements,
    isLoading,
    error,
    refetch: () => setReloadKey((current) => current + 1),
  };
};
