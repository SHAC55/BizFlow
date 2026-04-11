import React, { useMemo, useState } from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock3,
  CreditCard,
  Download,
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

const getStatusBadge = (status) => {
  switch (status) {
    case "paid":
      return {
        icon: CheckCircle2,
        label: "Paid",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
        dotColor: "bg-emerald-500",
      };
    case "partial":
      return {
        icon: Clock3,
        label: "Partial",
        className: "bg-amber-50 text-amber-700 border-amber-200",
        dotColor: "bg-amber-500",
      };
    default:
      return {
        icon: AlertCircle,
        label: "Pending",
        className: "bg-rose-50 text-rose-700 border-rose-200",
        dotColor: "bg-rose-500",
      };
  }
};

const Sales = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

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
        tone: "from-emerald-500 to-teal-500",
        bgLight: "bg-emerald-50",
        textColor: "text-emerald-700",
        trend: "+12.5%",
      },
      {
        label: "Collected Amount",
        value: formatCurrency(
          summary.totalCollected ||
            summary.totalRevenue - summary.totalOutstanding,
        ),
        icon: CreditCard,
        tone: "from-blue-500 to-indigo-500",
        bgLight: "bg-blue-50",
        textColor: "text-blue-700",
        trend: "+8.2%",
      },
      {
        label: "Outstanding Due",
        value: formatCurrency(summary.totalOutstanding),
        icon: AlertCircle,
        tone: "from-amber-500 to-orange-500",
        bgLight: "bg-amber-50",
        textColor: "text-amber-700",
        trend: "-3.1%",
      },
      {
        label: "Active Customers",
        value: summary.uniqueCustomers,
        icon: Users,
        tone: "from-purple-500 to-pink-500",
        bgLight: "bg-purple-50",
        textColor: "text-purple-700",
        trend: "+5",
      },
    ],
    [summary],
  );

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm !== "" || statusFilter !== "all";

  if (isLoading && !sales?.length) return <PageLoader />;

  if (error) {
    return (
      <div className="bg-white text-black mb-3 mr-3 w-full rounded-3xl p-2 md:ml-20 md:mt-2 mt-14 h-screen overflow-hidden">
        <Header
          title="Sales"
          para="Manage, Track and keep records of every sale"
        />
        <div className="flex flex-col items-center justify-center h-[60vh] p-6">
          <div className="rounded-full bg-rose-100 p-4 mb-4">
            <AlertCircle className="h-8 w-8 text-rose-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            Failed to Load Sales
          </h3>
          <p className="text-sm text-slate-500 text-center max-w-md mb-4">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 to-white text-black mb-3 mr-3 w-full rounded-3xl md:ml-20 md:mt-2 mt-14 h-screen overflow-hidden shadow-xl">
      <Header
        title="Sales Dashboard"
        para="Track, analyze and manage all your sales transactions"
      />

      <div className="p-4 md:p-6 space-y-6 overflow-y-auto h-[calc(100%-80px)]">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={`p-2.5 rounded-xl ${stat.bgLight} transition-all group-hover:scale-110`}
                    >
                      <Icon className={`h-5 w-5 ${stat.textColor}`} />
                    </div>
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                      {stat.trend}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-slate-800">
                    {stat.value}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    {stat.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Search and Filters Section */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                placeholder="Search by customer name, mobile or product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200 outline-none transition text-sm"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2.5 rounded-xl border transition-all flex items-center gap-2 text-sm font-medium ${
                  showFilters || hasActiveFilters
                    ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Filter className="h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-1 h-5 w-5 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center">
                    {(searchTerm ? 1 : 0) + (statusFilter !== "all" ? 1 : 0)}
                  </span>
                )}
              </button>

              {/* <button className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2 text-sm font-medium">
                <Download className="h-4 w-4" />
                Export
              </button> */}
            </div>
          </div>

          {/* Expanded Filters Panel */}
          {showFilters && (
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm animate-in slide-in-from-top-2">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-slate-700">
                  Filter Options
                </h4>
                {hasActiveFilters && (
                  <button
                    onClick={handleClearFilters}
                    className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    <X className="h-3 w-3" />
                    Clear all
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">
                    Payment Status
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {["all", "paid", "partial", "pending"].map((status) => {
                      const badge = getStatusBadge(status);
                      return (
                        <button
                          key={status}
                          onClick={() => setStatusFilter(status)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                            statusFilter === status
                              ? badge.className +
                                " ring-2 ring-offset-1 ring-indigo-400"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {status === "all" ? "All Status" : status}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">
                    Date Range
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm"
                    />
                    <input
                      type="date"
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Active Filters Tags */}
          {hasActiveFilters && !showFilters && (
            <div className="flex gap-2 flex-wrap">
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs">
                  Search: {searchTerm}
                  <button
                    onClick={() => setSearchTerm("")}
                    className="hover:text-indigo-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {statusFilter !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs capitalize">
                  Status: {statusFilter}
                  <button
                    onClick={() => setStatusFilter("all")}
                    className="hover:text-indigo-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Sales Table */}
        <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm">
          {sales.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="rounded-full bg-slate-100 p-4 mb-4">
                <Package className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">No sales found</p>
              <p className="text-sm text-slate-400 mt-1">
                {hasActiveFilters
                  ? "Try adjusting your filters"
                  : "Start by creating your first sale"}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="text-left p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="text-left p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="text-right p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="text-right p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-center p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {sales.map((sale) => {
                      const badge = getStatusBadge(sale.status);
                      const StatusIcon = badge.icon;

                      return (
                        <tr
                          key={sale.id}
                          className="hover:bg-slate-50 transition-colors cursor-pointer group"
                          onClick={() => navigate(`/sales/${sale.id}`)}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center text-indigo-700 font-semibold text-sm">
                                {sale.customer.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-800 text-sm">
                                  {sale.customer.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {sale.customer.mobile}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="p-4">
                            <p className="text-sm text-slate-700 font-medium">
                              {sale.items[0]?.product.name}
                            </p>
                            {sale.items.length > 1 && (
                              <p className="text-xs text-slate-400 mt-0.5">
                                +{sale.items.length - 1} more item
                                {sale.items.length > 2 ? "s" : ""}
                              </p>
                            )}
                          </td>

                          <td className="p-4">
                            <div className="flex items-center gap-1.5 text-sm text-slate-600">
                              <Calendar className="h-3.5 w-3.5 text-slate-400" />
                              {formatDate(sale.createdAt)}
                            </div>
                          </td>

                          <td className="p-4 text-right">
                            <p className="font-bold text-slate-800">
                              {formatCurrency(sale.totalAmount)}
                            </p>
                            {sale.status === "partial" && (
                              <p className="text-xs text-amber-600 mt-0.5">
                                Paid: {formatCurrency(sale.paidAmount)}
                              </p>
                            )}
                          </td>

                          <td className="p-4 text-right">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize border ${badge.className}`}
                            >
                              <div
                                className={`h-1.5 w-1.5 rounded-full ${badge.dotColor}`}
                              />
                              {badge.label}
                            </span>
                          </td>

                          <td className="p-4 text-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/sales/${sale.id}`);
                              }}
                              className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
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
                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
                  <p className="text-sm text-slate-600">
                    Showing {(currentPage - 1) * 10 + 1} to{" "}
                    {Math.min(currentPage * 10, pagination.total)} of{" "}
                    {pagination.total} sales
                  </p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <div className="flex gap-1">
                      {Array.from(
                        { length: Math.min(5, pagination.totalPages) },
                        (_, i) => {
                          let pageNum;
                          if (pagination.totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= pagination.totalPages - 2) {
                            pageNum = pagination.totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`h-8 w-8 rounded-lg text-sm font-medium transition ${
                                currentPage === pageNum
                                  ? "bg-indigo-600 text-white"
                                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
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
                      className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
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
