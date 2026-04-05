import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CreditCard,
  Eye,
  Filter,
  Package,
  Plus,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";
import { useSales } from "../hooks/useSales";

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
        className: "bg-emerald-100 text-emerald-700",
      };
    case "partial":
      return {
        icon: Clock3,
        label: "Partial",
        className: "bg-amber-100 text-amber-700",
      };
    case "pending":
    default:
      return {
        icon: AlertCircle,
        label: "Pending",
        className: "bg-rose-100 text-rose-700",
      };
  }
};

const Sales = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const {
    sales,
    pagination,
    summary,
    isLoading,
    error,
  } = useSales({
    page: currentPage,
    limit: 10,
    search: searchTerm,
    status: statusFilter,
  });

  const stats = useMemo(
    () => [
      {
        label: "Collected Revenue",
        value: formatCurrency(summary.totalRevenue),
        icon: CreditCard,
        tone: "bg-emerald-50 text-emerald-700",
      },
      {
        label: "Outstanding Due",
        value: formatCurrency(summary.totalOutstanding),
        icon: AlertCircle,
        tone: "bg-amber-50 text-amber-700",
      },
      {
        label: "Customers",
        value: summary.uniqueCustomers,
        icon: Users,
        tone: "bg-blue-50 text-blue-700",
      },
    ],
    [summary],
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50/20 p-4 md:ml-72 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <h1 className="text-2xl font-bold text-slate-800">
                Sales Overview
              </h1>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Track recorded sales, payments, and pending dues across customers.
            </p>
          </div>

          <button
            onClick={() => navigate("/add-transaction")}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            Record sale
          </button>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className={`rounded-2xl p-3 ${stat.tone}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-xs uppercase tracking-widest text-slate-400">
                    {stat.label}
                  </p>
                </div>
                <p className="mt-4 text-2xl font-bold text-slate-800">
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mb-4 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search customer or product"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition-colors focus:border-blue-400 focus:bg-white"
              />
            </div>

            <div className="relative md:w-56">
              <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setCurrentPage(1);
                }}
                className="w-full appearance-none rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition-colors focus:border-blue-400"
              >
                <option value="all">All statuses</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
          {isLoading ? (
            <div className="flex min-h-[320px] items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />
            </div>
          ) : error ? (
            <div className="m-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {error}
            </div>
          ) : sales.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
              <div className="rounded-full bg-slate-100 p-4 text-slate-500">
                <Package className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-slate-800">
                No sales found
              </h2>
              <p className="mt-2 max-w-md text-sm text-slate-500">
                Record your first sale to start tracking product movement,
                customer dues, and collected payments.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[880px]">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">
                        Customer
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">
                        Items
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">
                        Date
                      </th>
                      <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-widest text-slate-500">
                        Amounts
                      </th>
                      <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-widest text-slate-500">
                        Status
                      </th>
                      <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-widest text-slate-500">
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
                          className="transition-colors hover:bg-slate-50/70"
                        >
                          <td className="px-5 py-4">
                            <p className="text-sm font-semibold text-slate-800">
                              {sale.customer.name}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {sale.customer.mobile}
                              {sale.customer.email ? ` · ${sale.customer.email}` : ""}
                            </p>
                          </td>
                          <td className="px-5 py-4">
                            <div className="space-y-1">
                              {sale.items.slice(0, 2).map((item) => (
                                <p
                                  key={item.id}
                                  className="text-xs text-slate-600"
                                >
                                  {item.quantity} × {item.product.name}
                                </p>
                              ))}
                              {sale.items.length > 2 && (
                                <p className="text-xs font-medium text-slate-500">
                                  +{sale.items.length - 2} more items
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Calendar className="h-4 w-4 text-slate-400" />
                              {formatDate(sale.createdAt)}
                            </div>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <p className="text-sm font-semibold text-slate-800">
                              {formatCurrency(sale.totalAmount)}
                            </p>
                            <p className="mt-1 text-xs text-emerald-600">
                              Paid {formatCurrency(sale.paidAmount)}
                            </p>
                            {sale.dueAmount > 0 && (
                              <p className="mt-1 text-xs text-rose-600">
                                Due {formatCurrency(sale.dueAmount)}
                              </p>
                            )}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}
                            >
                              <StatusIcon className="h-3.5 w-3.5" />
                              {badge.label}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <button
                              onClick={() => navigate(`/sales/${sale.id}`)}
                              className="inline-flex items-center justify-center rounded-xl p-2 text-blue-600 transition-colors hover:bg-blue-50"
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

              <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-slate-500">
                  Page {pagination.page} of {Math.max(pagination.totalPages, 1)}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                    disabled={pagination.page <= 1}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.min(page + 1, Math.max(pagination.totalPages, 1)),
                      )
                    }
                    disabled={pagination.page >= pagination.totalPages}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sales;
