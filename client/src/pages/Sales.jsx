import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock3,
  CreditCard,
  Eye,
  Filter,
  Package,
  Search,
  TrendingUp,
  Users,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useSales } from "../hooks/useSales";
import Header from "../components/Header";
import PageLoader from "../components/loaders/PageLoader";

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

// Debounce hook
function useDebounce(value, delay = 4000) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

const STATUS_CONFIG = {
  paid: {
    label: "Paid",
    dotClass: "bg-[#16A34A]",
    badgeClass: "bg-[#F0FDF4] text-[#15803D]",
  },
  partial: {
    label: "Partial",
    dotClass: "bg-[#B45309]",
    badgeClass: "bg-[#FFFBEB] text-[#B45309]",
  },
  pending: {
    label: "Pending",
    dotClass: "bg-[#BE123C]",
    badgeClass: "bg-[#FFF1F2] text-[#BE123C]",
  },
};

const getStatusConfig = (status) =>
  STATUS_CONFIG[status] || STATUS_CONFIG.pending;

const Sales = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Debounced search — API is only called 400ms after the user stops typing
  const searchTerm = useDebounce(searchInput, 400);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const { sales, pagination, summary, isLoading, error } = useSales({
    page: currentPage,
    limit: 10,
    search: searchTerm,
    status: statusFilter,
  });

  const stats = useMemo(
    () => [
      {
        label: "Total Revenue",
        value: formatCurrency(summary.totalRevenue),
        icon: TrendingUp,
        accentBg: "bg-[#EFF6FF]",
        accentText: "text-[#1D4ED8]",
        circleBg: "bg-[#BFDBFE]",
        trend: "+12.5%",
        trendUp: true,
      },
      {
        label: "Collected",
        value: formatCurrency(
          summary.totalCollected ||
            summary.totalRevenue - summary.totalOutstanding,
        ),
        icon: CreditCard,
        accentBg: "bg-[#F0FDF4]",
        accentText: "text-[#15803D]",
        circleBg: "bg-[#BBF7D0]",
        trend: "+8.2%",
        trendUp: true,
      },
      {
        label: "Outstanding",
        value: formatCurrency(summary.totalOutstanding),
        icon: AlertCircle,
        accentBg: "bg-[#FFF1F2]",
        accentText: "text-[#BE123C]",
        circleBg: "bg-[#FECDD3]",
        trend: "-3.1%",
        trendUp: false,
      },
      {
        label: "Customers",
        value: summary.uniqueCustomers,
        icon: Users,
        accentBg: "bg-[#FFFBEB]",
        accentText: "text-[#B45309]",
        circleBg: "bg-[#FDE68A]",
        trend: "+5",
        trendUp: true,
      },
    ],
    [summary],
  );

  const handleClearFilters = useCallback(() => {
    setSearchInput("");
    setStatusFilter("all");
    setCurrentPage(1);
  }, []);

  const hasActiveFilters = searchInput !== "" || statusFilter !== "all";
  const isSearching = searchInput !== searchTerm; // typing but not yet debounced

  if (isLoading && !sales?.length) return <PageLoader />;

  if (error) {
    return (
      <div className="bg-white text-black mb-3 mr-3 w-full rounded-3xl p-2 md:ml-20 md:mt-2 mt-14 h-screen overflow-hidden">
        <Header
          title="Sales"
          para="Manage, track and keep records of every sale"
        />
        <div className="flex flex-col items-center justify-center h-[60vh] p-6">
          <div className="w-14 h-14 rounded-full bg-[#FFF1F2] flex items-center justify-center mb-4">
            <AlertCircle className="h-7 w-7 text-[#BE123C]" />
          </div>
          <h3 className="text-base font-semibold text-black mb-1">
            Failed to load sales
          </h3>
          <p className="text-sm text-black/40 text-center max-w-sm mb-5">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-black/80 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white text-black mb-3 mr-3 w-full rounded-3xl md:ml-20 md:mt-2 mt-14 h-screen overflow-hidden border border-black/8">
      <Header
        title="Sales"
        para="Track, analyze and manage all your sales transactions"
      />

      <div className="px-4 md:px-6 pb-6 space-y-5 overflow-y-auto h-[calc(100%-80px)]">
        {/* Stats Grid */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4  mt-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`relative overflow-hidden rounded-2xl p-4 border border-black/8 ${stat.accentBg}`}
              >
                {/* decorative circle */}
                <div
                  className={`absolute top-0 right-0 w-16 h-16 rounded-full ${stat.circleBg} opacity-50 translate-x-4 -translate-y-4`}
                />
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                      <Icon className={`h-4 w-4 ${stat.accentText}`} />
                    </div>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/60 ${
                        stat.trendUp ? "text-[#15803D]" : "text-[#BE123C]"
                      }`}
                    >
                      {stat.trend}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-black tracking-tight leading-tight">
                    {stat.value}
                  </p>
                  <p className={`text-xs font-medium mt-1 ${stat.accentText}`}>
                    {stat.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Search & Filters */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" />
              <input
                placeholder="Search by name, mobile or product…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-black/10 bg-white text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black/30 focus:ring-2 focus:ring-black/5 transition-all"
              />
              {/* Spinner while debounce is pending */}
              {isSearching && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  <div className="w-3.5 h-3.5 border-2 border-black/20 border-t-black/60 rounded-full animate-spin" />
                </div>
              )}
              {/* Clear search */}
              {searchInput && !isSearching && (
                <button
                  onClick={() => setSearchInput("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-black/30 hover:text-black/60 transition"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                showFilters || hasActiveFilters
                  ? "bg-black text-white border-black"
                  : "bg-white border-black/10 text-black/60 hover:border-black/20 hover:text-black"
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="w-5 h-5 rounded-full bg-white text-black text-[10px] font-bold flex items-center justify-center">
                  {(searchInput ? 1 : 0) + (statusFilter !== "all" ? 1 : 0)}
                </span>
              )}
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-white rounded-xl border border-black/8 p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-black/40">
                  Filter Options
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={handleClearFilters}
                    className="text-xs text-black/50 hover:text-black flex items-center gap-1 transition"
                  >
                    <X className="h-3 w-3" />
                    Clear all
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="text-xs font-medium text-black/40 mb-2 block">
                    Payment Status
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {["all", "paid", "partial", "pending"].map((status) => {
                      const cfg = STATUS_CONFIG[status];
                      const isActive = statusFilter === status;
                      return (
                        <button
                          key={status}
                          onClick={() => setStatusFilter(status)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all border ${
                            isActive
                              ? status === "all"
                                ? "bg-black text-white border-black"
                                : `${cfg.badgeClass} border-transparent ring-2 ring-black/20`
                              : "bg-white border-black/10 text-black/50 hover:border-black/20 hover:text-black"
                          }`}
                        >
                          {status === "all" ? "All" : cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Date Range */}
                <div>
                  <label className="text-xs font-medium text-black/40 mb-2 block">
                    Date Range
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      className="flex-1 px-3 py-1.5 rounded-lg border border-black/10 text-sm text-black focus:outline-none focus:border-black/30 transition"
                    />
                    <input
                      type="date"
                      className="flex-1 px-3 py-1.5 rounded-lg border border-black/10 text-sm text-black focus:outline-none focus:border-black/30 transition"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Active filter tags */}
          {hasActiveFilters && !showFilters && (
            <div className="flex gap-2 flex-wrap">
              {searchInput && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/5 text-black/60 rounded-lg text-xs">
                  Search:{" "}
                  <span className="font-medium text-black">{searchInput}</span>
                  <button
                    onClick={() => setSearchInput("")}
                    className="hover:text-black transition"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {statusFilter !== "all" && (
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs ${getStatusConfig(statusFilter).badgeClass}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${getStatusConfig(statusFilter).dotClass}`}
                  />
                  {getStatusConfig(statusFilter).label}
                  <button
                    onClick={() => setStatusFilter("all")}
                    className="hover:opacity-70 transition"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-black/8 overflow-hidden bg-white">
          {sales.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center mb-3">
                <Package className="h-5 w-5 text-black/25" />
              </div>
              <p className="text-sm font-medium text-black/50">
                No sales found
              </p>
              <p className="text-xs text-black/30 mt-1">
                {hasActiveFilters
                  ? "Try adjusting your filters"
                  : "Start by creating your first sale"}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="mt-4 text-xs font-medium text-black underline-offset-2 hover:underline transition"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-black text-white">
                      <th className="text-left px-5 py-3.5 text-[11px] font-semibold uppercase tracking-widest">
                        Customer
                      </th>
                      <th className="text-left px-5 py-3.5 text-[11px] font-semibold uppercase tracking-widest">
                        Items
                      </th>
                      <th className="text-left px-5 py-3.5 text-[11px] font-semibold uppercase tracking-widest">
                        Date
                      </th>
                      <th className="text-right px-5 py-3.5 text-[11px] font-semibold uppercase tracking-widest">
                        Amount
                      </th>
                      <th className="text-right px-5 py-3.5 text-[11px] font-semibold uppercase tracking-widest">
                        Status
                      </th>
                      <th className="text-center px-5 py-3.5 text-[11px] font-semibold uppercase tracking-widest">
                        View
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-black/5">
                    {sales.map((sale) => {
                      const cfg = getStatusConfig(sale.status);
                      return (
                        <tr
                          key={sale.id}
                          onClick={() => navigate(`/sales/${sale.id}`)}
                          className="hover:bg-black/[0.02] transition-colors duration-100 cursor-pointer group"
                        >
                          {/* Customer */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                                {sale.customer.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-black leading-tight">
                                  {sale.customer.name}
                                </p>
                                <p className="text-xs text-black/40 mt-0.5">
                                  {sale.customer.mobile}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Items */}
                          <td className="px-5 py-3.5">
                            <p className="text-sm text-black font-medium">
                              {sale.items[0]?.product.name}
                            </p>
                            {sale.items.length > 1 && (
                              <p className="text-xs text-black/35 mt-0.5">
                                +{sale.items.length - 1} more
                              </p>
                            )}
                          </td>

                          {/* Date */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1.5 text-sm text-black/50">
                              <Calendar className="h-3.5 w-3.5" />
                              {formatDate(sale.createdAt)}
                            </div>
                          </td>

                          {/* Amount */}
                          <td className="px-5 py-3.5 text-right">
                            <p className="text-sm font-bold text-black">
                              {formatCurrency(sale.totalAmount)}
                            </p>
                            {sale.status === "partial" && (
                              <p className="text-xs text-[#B45309] mt-0.5">
                                Paid: {formatCurrency(sale.paidAmount)}
                              </p>
                            )}
                          </td>

                          {/* Status */}
                          <td className="px-5 py-3.5 text-right">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.badgeClass}`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass}`}
                              />
                              {cfg.label}
                            </span>
                          </td>

                          {/* Action */}
                          <td className="px-5 py-3.5 text-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/sales/${sale.id}`);
                              }}
                              className="p-2 rounded-lg text-black/25 hover:text-black hover:bg-black/5 transition-all"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-black/5 bg-black/[0.02]">
                  <p className="text-xs text-black/40">
                    {(currentPage - 1) * 10 + 1}–
                    {Math.min(currentPage * 10, pagination.total)} of{" "}
                    {pagination.total} sales
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 rounded-lg border border-black/10 bg-white text-black/40 hover:text-black hover:border-black/20 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <div className="flex gap-1">
                      {Array.from(
                        { length: Math.min(5, pagination.totalPages) },
                        (_, i) => {
                          let pageNum;
                          if (pagination.totalPages <= 5) pageNum = i + 1;
                          else if (currentPage <= 3) pageNum = i + 1;
                          else if (currentPage >= pagination.totalPages - 2)
                            pageNum = pagination.totalPages - 4 + i;
                          else pageNum = currentPage - 2 + i;
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`h-8 w-8 rounded-lg text-xs font-medium transition ${
                                currentPage === pageNum
                                  ? "bg-black text-white"
                                  : "bg-white border border-black/10 text-black/50 hover:border-black/20 hover:text-black"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        },
                      )}
                    </div>
                    <button
                      onClick={() =>
                        setCurrentPage((p) =>
                          Math.min(pagination.totalPages, p + 1),
                        )
                      }
                      disabled={currentPage === pagination.totalPages}
                      className="p-1.5 rounded-lg border border-black/10 bg-white text-black/40 hover:text-black hover:border-black/20 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sales;
