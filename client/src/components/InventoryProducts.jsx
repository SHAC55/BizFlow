import React, { useDeferredValue, useState } from "react";
import {
  AlertTriangle,
  Edit2,
  History,
  Package,
  Search,
  ShieldPlus,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDeleteProduct, useProducts } from "../hooks/useProducts";
import AdjustStockModal from "./AdjustStockModal";
import ProductMovementsPanel from "./ProductMovementsPanel";

const InventoryProducts = () => {

  const navigate = useNavigate();
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [adjustingProduct, setAdjustingProduct] = useState(null);
  const [historyProduct, setHistoryProduct] = useState(null);
  const deferredSearch = useDeferredValue(search);
  const { products, pagination, summary, isLoading, error, refetch } =
    useProducts({
      page,
      limit: 10,
      category,
      search: deferredSearch,
      lowStockOnly,
    });
  const { deleteProduct, isLoading: isDeleting } = useDeleteProduct();

  const totalProducts = summary.totalProducts;
  const totalValue = summary.totalValue;
  const lowStockCount = summary.lowStockCount;
  const outOfStockCount = summary.outOfStockCount;
  const categories = summary.categories || [];

  const getStockStatus = (quantity, minQuantity) => {
    if (quantity === 0) {
      return { label: "Out of Stock", color: "text-red-600", bg: "bg-red-50" };
    }

    if (quantity <= minQuantity) {
      return {
        label: "Low Stock",
        color: "text-yellow-600",
        bg: "bg-yellow-50",
      };
    }

    return { label: "In Stock", color: "text-green-600", bg: "bg-green-50" };
  };

  const initialsFor = (name) =>
    name
      .split(" ")
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase() || "")
      .join("");

  const handleDeleteProduct = async (productId) => {
    const shouldDelete = window.confirm(
      "Delete this product? This action cannot be undone.",
    );

    if (!shouldDelete) {
      return;
    }

    await deleteProduct(productId);

    if (products.length === 1 && page > 1) {
      setPage((current) => current - 1);
      return;
    }

    refetch();
  };

  const handleAdjustedProduct = () => {
    refetch();
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 h-full max-w-7xl mx-auto ">
      <AdjustStockModal
        product={adjustingProduct}
        isOpen={Boolean(adjustingProduct)}
        onClose={() => setAdjustingProduct(null)}
        onAdjusted={handleAdjustedProduct}
      />
      <ProductMovementsPanel
        product={historyProduct}
        isOpen={Boolean(historyProduct)}
        onClose={() => setHistoryProduct(null)}
      />
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Inventory</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage your products</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Total Products</p>
                <p className="text-xl font-bold text-gray-800">
                  {totalProducts}
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-2">
                <Package className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Inventory Value</p>
                <p className="text-xl font-bold text-gray-800">
                  ₹{totalValue.toLocaleString()}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Low Stock</p>
                <p className="text-xl font-bold text-yellow-600">
                  {lowStockCount}
                </p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Out of Stock</p>
                <p className="text-xl font-bold text-red-600">
                  {outOfStockCount}
                </p>
              </div>
              <div className="bg-red-50 rounded-lg p-2">
                <Package className="w-4 h-4 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden  ">
          <div className="border-b border-gray-200 px-4 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search by name, category, or SKU"
                className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={category}
              onChange={(event) => {
                setCategory(event.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 outline-none focus:border-blue-500"
            >
              <option value="">All categories</option>
              {categories.map((item) => (
                <option key={item.category} value={item.category}>
                  {item.category} ({item.count})
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                setLowStockOnly((current) => !current);
                setPage(1);
              }}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                lowStockOnly
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              {lowStockOnly ? "Showing low stock" : "Low stock only"}
            </button>
          </div>

          {error && (
            <div className="px-4 py-4 text-sm text-red-600 border-b border-red-100 bg-red-50">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-4 py-10 text-center text-sm text-gray-500"
                    >
                      Loading inventory...
                    </td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const stockStatus = getStockStatus(
                      product.quantity,
                      product.minimumQuantity,
                    );

                    return (
                      <tr
                        key={product.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold">
                              {initialsFor(product.name)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-800">
                                {product.name}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <p className="text-sm text-gray-600 font-mono">
                            {product.sku || "N/A"}
                          </p>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-md">
                            {product.category}
                          </span>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <p className="text-sm font-semibold text-gray-800">
                            ₹{product.price}
                          </p>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex flex-col items-end">
                            <p
                              className={`text-sm font-medium ${
                                product.quantity <= product.minimumQuantity &&
                                product.quantity > 0
                                  ? "text-yellow-600"
                                  : product.quantity === 0
                                    ? "text-red-600"
                                    : "text-gray-800"
                              }`}
                            >
                              {product.quantity} units
                            </p>
                            {product.quantity <= product.minimumQuantity &&
                              product.quantity > 0 && (
                                <p className="text-xs text-yellow-600 mt-0.5">
                                  Min: {product.minimumQuantity}
                                </p>
                              )}
                          </div>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <span
                            className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${stockStatus.bg} ${stockStatus.color}`}
                          >
                            {stockStatus.label}
                          </span>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setAdjustingProduct(product)}
                              className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            >
                              <ShieldPlus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setHistoryProduct(product)}
                              className="p-1.5 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all"
                            >
                              <History className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                navigate(`/add-inventory?productId=${product.id}`)
                              }
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              disabled={isDeleting}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 0 && (
            <div className="flex items-center justify-between border-t border-gray-200 px-4 py-4 text-sm">
              <p className="text-gray-500">
                Page {pagination.page} of {pagination.totalPages}
              </p>

              <div className="flex items-center gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => setPage((current) => Math.max(current - 1, 1))}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-gray-600 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() =>
                    setPage((current) =>
                      Math.min(current + 1, pagination.totalPages),
                    )
                  }
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-gray-600 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {!isLoading && products.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <div className="text-gray-400 text-5xl mb-3">📦</div>
            <h3 className="text-base font-medium text-gray-600 mb-1">
              No Products Found
            </h3>
            <p className="text-sm text-gray-500">
              Add your first product to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryProducts;
