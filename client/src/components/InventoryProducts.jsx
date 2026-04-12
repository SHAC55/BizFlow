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
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDeleteProduct, useProducts } from "../hooks/useProducts";
import AdjustStockModal from "./AdjustStockModal";
import ProductMovementsPanel from "./ProductMovementsPanel";
import PageLoader from "./loaders/PageLoader";

const fmt = (v) => `₹${Number(v || 0).toLocaleString("en-IN")}`;

const STOCK_CONFIG = {
  out: {
    label: "Out of Stock",
    badge: "bg-[#FFF1F2] text-[#BE123C]",
    dot: "bg-[#BE123C]",
    qty: "text-[#BE123C]",
  },
  low: {
    label: "Low Stock",
    badge: "bg-[#FFFBEB] text-[#B45309]",
    dot: "bg-[#B45309]",
    qty: "text-[#B45309]",
  },
  ok: {
    label: "In Stock",
    badge: "bg-[#F0FDF4] text-[#15803D]",
    dot: "bg-[#16A34A]",
    qty: "text-black",
  },
};

const getStockConfig = (quantity, minQuantity) => {
  if (quantity === 0) return STOCK_CONFIG.out;
  if (quantity <= minQuantity) return STOCK_CONFIG.low;
  return STOCK_CONFIG.ok;
};

const initialsFor = (name) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");

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

  const {
    totalProducts = 0,
    totalValue = 0,
    totalCostValue = 0,
    projectedProfit = 0,
    lowStockCount = 0,
    outOfStockCount = 0,
    categories = [],
  } = summary;

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Delete this product? This action cannot be undone."))
      return;
    await deleteProduct(productId);
    if (products.length === 1 && page > 1) {
      setPage((p) => p - 1);
      return;
    }
    refetch();
  };
  const STATS = [
    {
      label: "Products",
      value: totalProducts,
      icon: Package,
      accentBg: "bg-[#EFF6FF]",
      accentText: "text-[#1D4ED8]",
      circleBg: "bg-[#BFDBFE]",
      valueColor: "text-[#1D4ED8]",
    },
    {
      label: "Inventory Value",
      value: fmt(totalValue),
      icon: TrendingUp,
      accentBg: "bg-[#F0FDF4]",
      accentText: "text-[#15803D]",
      circleBg: "bg-[#BBF7D0]",
      valueColor: "text-[#15803D]",
    },
    {
      label: "Cost Value",
      value: fmt(totalCostValue),
      icon: ShieldPlus,
      accentBg: "bg-[#F5F3FF]",
      accentText: "text-[#6D28D9]",
      circleBg: "bg-[#DDD6FE]",
      valueColor: "text-[#6D28D9]",
    },
    {
      label: "Projected P/L",
      value: fmt(projectedProfit),
      icon: TrendingUp,
      accentBg: projectedProfit >= 0 ? "bg-[#ECFDF5]" : "bg-[#FFF1F2]",
      accentText: projectedProfit >= 0 ? "text-[#065F46]" : "text-[#BE123C]",
      circleBg: projectedProfit >= 0 ? "bg-[#A7F3D0]" : "bg-[#FECDD3]",
      valueColor: projectedProfit >= 0 ? "text-[#065F46]" : "text-[#BE123C]",
    },
    {
      label: "Low Stock",
      value: lowStockCount,
      icon: AlertTriangle,
      accentBg: "bg-[#FFFBEB]",
      accentText: "text-[#B45309]",
      circleBg: "bg-[#FDE68A]",
      valueColor: "text-[#B45309]",
    },
    {
      label: "Out of Stock",
      value: outOfStockCount,
      icon: Package,
      accentBg: "bg-[#FFF1F2]",
      accentText: "text-[#BE123C]",
      circleBg: "bg-[#FECDD3]",
      valueColor: "text-[#BE123C]",
    },
  ];

  return (
    <div className="bg-white text-black min-h-screen w-full ">
      <AdjustStockModal
        product={adjustingProduct}
        isOpen={Boolean(adjustingProduct)}
        onClose={() => setAdjustingProduct(null)}
        onAdjusted={() => {
          setAdjustingProduct(null);
          refetch();
        }}
      />
      <ProductMovementsPanel
        product={historyProduct}
        isOpen={Boolean(historyProduct)}
        onClose={() => setHistoryProduct(null)}
      />

      <div className="px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 mb-7">
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`relative overflow-hidden rounded-2xl p-4 border border-black/8 ${stat.accentBg}`}
              >
                <div
                  className={`absolute top-0 right-0 w-14 h-14 rounded-full ${stat.circleBg} opacity-60 translate-x-3 -translate-y-3`}
                />
                <div className="relative">
                  <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm mb-2">
                    <Icon className={`w-3.5 h-3.5 ${stat.accentText}`} />
                  </div>
                  <p
                    className={`text-lg font-bold leading-tight ${stat.valueColor || "text-black"}`}
                  >
                    {stat.value}
                  </p>
                  <p
                    className={`text-[11px] font-medium mt-0.5 ${stat.accentText}`}
                  >
                    {stat.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Table Card */}
        <div className="border border-black/8 rounded-2xl overflow-hidden bg-white">
          {/* Toolbar */}
          <div className="px-4 py-3.5 border-b border-black/5 flex flex-col sm:flex-row gap-3 sm:items-center">
            {/* Search */}
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search name, category or SKU…"
                className="w-full pl-9 pr-8 py-2 rounded-xl border border-black/10 bg-white text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black/25 focus:ring-2 focus:ring-black/5 transition-all"
              />
              {search && (
                <button
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-black/25 hover:text-black/50 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category */}
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-black/10 bg-white text-sm text-black focus:outline-none focus:border-black/25 focus:ring-2 focus:ring-black/5 transition-all"
            >
              <option value="">All categories</option>
              {categories.map((item) => (
                <option key={item.category} value={item.category}>
                  {item.category} ({item.count})
                </option>
              ))}
            </select>

            {/* Low stock toggle */}
            <button
              onClick={() => {
                setLowStockOnly((v) => !v);
                setPage(1);
              }}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium border transition-all ${
                lowStockOnly
                  ? "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]"
                  : "bg-white text-black/50 border-black/10 hover:border-black/20 hover:text-black"
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              {lowStockOnly ? "Low stock only" : "Low stock"}
            </button>
          </div>

          {error && (
            <div className="px-5 py-3 text-sm text-[#BE123C] bg-[#FFF1F2] border-b border-[#FECDD3]">
              {error}
            </div>
          )}

          {/* Table (desktop) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-black text-white">
                  {[
                    "Product",
                    "SKU",
                    "Category",
                    "Cost",
                    "Selling",
                    "Margin",
                    "Qty",
                    "Status",
                    "Actions",
                  ].map((h, i) => (
                    <th
                      key={h}
                      className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-widest whitespace-nowrap ${
                        i >= 3 && i <= 7
                          ? i === 7
                            ? "text-center"
                            : "text-right"
                          : "text-left"
                      } ${i === 8 ? "text-right" : ""}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {isLoading ? (
                  <tr>
                    <td colSpan="9" className="py-14 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-7 h-7 rounded-full border-2 border-black/10 border-t-black/50 animate-spin" />
                        <span className="text-xs text-black/30">
                          Loading inventory…
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-16 text-center">
                      <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center mx-auto mb-3">
                        <Package className="w-5 h-5 text-black/20" />
                      </div>
                      <p className="text-sm text-black/40">No products found</p>
                      <p className="text-xs text-black/25 mt-1">
                        Try adjusting your filters
                      </p>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const sc = getStockConfig(
                      product.quantity,
                      product.minimumQuantity,
                    );
                    const margin = product.price - product.costPrice;
                    return (
                      <tr
                        key={product.id}
                        className="hover:bg-black/[0.015] transition-colors duration-100 group"
                      >
                        {/* Product */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                              {initialsFor(product.name)}
                            </div>
                            <p className="text-sm font-semibold text-black">
                              {product.name}
                            </p>
                          </div>
                        </td>

                        {/* SKU */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-xs font-mono text-black/40">
                            {product.sku || "—"}
                          </span>
                        </td>

                        {/* Category */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-black/5 text-black/50">
                            {product.category}
                          </span>
                        </td>

                        {/* Cost */}
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <span className="text-sm text-black/60">
                            ₹{product.costPrice}
                          </span>
                        </td>

                        {/* Selling */}
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <span className="text-sm font-semibold text-black">
                            ₹{product.price}
                          </span>
                        </td>

                        {/* Margin */}
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <span
                            className={`text-sm font-semibold ${margin >= 0 ? "text-[#15803D]" : "text-[#BE123C]"}`}
                          >
                            ₹{margin}
                          </span>
                        </td>

                        {/* Qty */}
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <div>
                            <p className={`text-sm font-semibold ${sc.qty}`}>
                              {product.quantity}
                            </p>
                            {product.quantity > 0 &&
                              product.quantity <= product.minimumQuantity && (
                                <p className="text-[10px] text-black/30 mt-0.5">
                                  min {product.minimumQuantity}
                                </p>
                              )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${sc.badge}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}
                            />
                            {sc.label}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setAdjustingProduct(product)}
                              className="p-1.5 rounded-lg text-black/25 hover:text-[#15803D] hover:bg-[#F0FDF4] transition-all"
                              title="Adjust stock"
                            >
                              <ShieldPlus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setHistoryProduct(product)}
                              className="p-1.5 rounded-lg text-black/25 hover:text-[#1D4ED8] hover:bg-[#EFF6FF] transition-all"
                              title="Stock history"
                            >
                              <History className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                navigate(
                                  `/add-inventory?productId=${product.id}`,
                                )
                              }
                              className="p-1.5 rounded-lg text-black/25 hover:text-black hover:bg-black/5 transition-all"
                              title="Edit product"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              disabled={isDeleting}
                              className="p-1.5 rounded-lg text-black/25 hover:text-[#BE123C] hover:bg-[#FFF1F2] transition-all disabled:opacity-30"
                              title="Delete product"
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

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-black/5">
            {isLoading ? (
              <div className="flex flex-col items-center gap-3 py-12">
                <div className="w-7 h-7 rounded-full border-2 border-black/10 border-t-black/50 animate-spin" />
                <span className="text-xs text-black/30">Loading…</span>
              </div>
            ) : products.length === 0 ? (
              <div className="py-14 text-center px-4">
                <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center mx-auto mb-3">
                  <Package className="w-5 h-5 text-black/20" />
                </div>
                <p className="text-sm text-black/40">No products found</p>
              </div>
            ) : (
              products.map((product) => {
                const sc = getStockConfig(
                  product.quantity,
                  product.minimumQuantity,
                );
                const margin = product.price - product.costPrice;
                return (
                  <div
                    key={product.id}
                    className="p-4 hover:bg-black/[0.015] transition-colors"
                  >
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                          {initialsFor(product.name)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-black leading-tight">
                            {product.name}
                          </p>
                          {product.sku && (
                            <p className="text-[11px] font-mono text-black/30 mt-0.5">
                              {product.sku}
                            </p>
                          )}
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${sc.badge}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}
                        />
                        {sc.label}
                      </span>
                    </div>

                    {/* Info row */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="bg-black/[0.02] rounded-xl p-2.5">
                        <p className="text-[10px] text-black/35 uppercase tracking-wide">
                          Selling
                        </p>
                        <p className="text-sm font-bold text-black mt-0.5">
                          ₹{product.price}
                        </p>
                      </div>
                      <div className="bg-black/[0.02] rounded-xl p-2.5">
                        <p className="text-[10px] text-black/35 uppercase tracking-wide">
                          Margin
                        </p>
                        <p
                          className={`text-sm font-bold mt-0.5 ${margin >= 0 ? "text-[#15803D]" : "text-[#BE123C]"}`}
                        >
                          ₹{margin}
                        </p>
                      </div>
                      <div className="bg-black/[0.02] rounded-xl p-2.5">
                        <p className="text-[10px] text-black/35 uppercase tracking-wide">
                          Qty
                        </p>
                        <p className={`text-sm font-bold mt-0.5 ${sc.qty}`}>
                          {product.quantity}
                        </p>
                      </div>
                    </div>

                    {/* Category + Actions */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-black/5 text-black/40">
                        {product.category}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setAdjustingProduct(product)}
                          className="p-1.5 rounded-lg text-black/25 hover:text-[#15803D] hover:bg-[#F0FDF4] transition-all"
                        >
                          <ShieldPlus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setHistoryProduct(product)}
                          className="p-1.5 rounded-lg text-black/25 hover:text-[#1D4ED8] hover:bg-[#EFF6FF] transition-all"
                        >
                          <History className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            navigate(`/add-inventory?productId=${product.id}`)
                          }
                          className="p-1.5 rounded-lg text-black/25 hover:text-black hover:bg-black/5 transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          disabled={isDeleting}
                          className="p-1.5 rounded-lg text-black/25 hover:text-[#BE123C] hover:bg-[#FFF1F2] transition-all disabled:opacity-30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-black/5 bg-black/[0.01]">
              <p className="text-xs text-black/35">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-black/10 bg-white text-xs text-black/50 hover:text-black hover:border-black/20 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Prev
                </button>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() =>
                    setPage((p) => Math.min(p + 1, pagination.totalPages))
                  }
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-black/10 bg-white text-xs text-black/50 hover:text-black hover:border-black/20 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryProducts;
