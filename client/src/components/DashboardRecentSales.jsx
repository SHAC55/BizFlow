import React from "react";
import { Calendar, CreditCard, ReceiptText, ChevronRight, TrendingUp, Users, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

const getStatusClasses = (status) => {
  switch (status) {
    case "paid":
      return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
    case "partial":
      return "bg-amber-500/10 text-amber-600 border-amber-500/20";
    case "pending":
    default:
      return "bg-rose-500/10 text-rose-600 border-rose-500/20";
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case "paid":
      return <TrendingUp className="h-3 w-3" />;
    case "partial":
      return <Clock className="h-3 w-3" />;
    default:
      return <Clock className="h-3 w-3" />;
  }
};

const DashboardRecentSales = ({ sales, isLoading, error }) => {
  const navigate = useNavigate();

  // Calculate summary stats
  const totalRevenue = sales?.reduce((sum, sale) => sum + sale.totalAmount, 0) || 0;
  const totalPaid = sales?.reduce((sum, sale) => sum + sale.paidAmount, 0) || 0;
  const totalDue = totalRevenue - totalPaid;

  return (
    <div className="mt-8 px-4 md:px-6 ">
      <div className="rounded-2xl bg-gradient-to-br from-white to-slate-50/80 border border-slate-200/50 overflow-hidden">
        
        {/* Header Section with Stats */}
        <div className="p-6 pb-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <ReceiptText className="h-5 w-5 text-indigo-500" />
                Recent Sales
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Latest transactions and payment insights
              </p>
            </div>

            <button
              onClick={() => navigate("/sales")}
              className="group inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-xl transition-all hover:bg-indigo-100 hover:gap-3"
            >
              View all sales
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* Stats Cards */}
          {/* {!isLoading && sales?.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-4 border border-emerald-200">
                <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide">Total Revenue</p>
                <p className="text-2xl font-bold text-emerald-700 mt-1">{formatCurrency(totalRevenue)}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200">
                <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Amount Collected</p>
                <p className="text-2xl font-bold text-blue-700 mt-1">{formatCurrency(totalPaid)}</p>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl p-4 border border-amber-200">
                <p className="text-xs font-medium text-amber-600 uppercase tracking-wide">Pending Due</p>
                <p className="text-2xl font-bold text-amber-700 mt-1">{formatCurrency(totalDue)}</p>
              </div>
            </div>
          )} */}
        </div>

        {/* Content Area */}
        <div className="p-6 pt-0">
          {isLoading ? (
            <div className="flex min-h-[320px] items-center justify-center">
              <div className="relative">
                <div className="h-12 w-12 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin" />
                <p className="text-sm text-slate-500 mt-4">Loading sales data...</p>
              </div>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50/50 backdrop-blur-sm px-4 py-6 text-center">
              <div className="text-rose-600 text-sm font-medium">{error}</div>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-3 text-xs text-rose-500 underline"
              >
                Try again
              </button>
            </div>
          ) : sales.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-4 py-12 text-center">
              <ReceiptText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-600">No sales recorded yet</p>
              <p className="text-xs text-slate-400 mt-1">Start by adding your first transaction</p>
              <button
                onClick={() => navigate("/add-transaction")}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100"
              >
                Add Sale
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {sales.map((sale, idx) => (
                <button
                  key={sale.id}
                  onClick={() => navigate(`/sales/${sale.id}`)}
                  className="group w-full text-left transition-all duration-200"
                >
                  <div className="relative bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all overflow-hidden">
                    
                    {/* Animated Hover Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/0 via-indigo-50/0 to-indigo-50/0 group-hover:from-indigo-50/30 group-hover:via-transparent group-hover:to-transparent transition-all duration-500" />
                    
                    <div className="relative p-5">
                      {/* Top Row - Customer & Status */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-bold text-slate-800">
                              {sale.customer.name}
                            </h3>
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${getStatusClasses(
                                sale.status,
                              )}`}
                            >
                              {getStatusIcon(sale.status)}
                              {sale.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1.5 line-clamp-1">
                            {sale.items
                              .slice(0, 2)
                              .map(
                                (item) => `${item.quantity} × ${item.product.name}`,
                              )
                              .join(" • ")}
                            {sale.items.length > 2
                              ? ` • +${sale.items.length - 2} more items`
                              : ""}
                          </p>
                        </div>
                        
                        {/* Amount Summary for Mobile */}
                        <div className="sm:hidden flex items-center justify-between">
                          <span className="text-lg font-bold text-slate-800">
                            {formatCurrency(sale.totalAmount)}
                          </span>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex items-center gap-3 text-sm">
                          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                            <ReceiptText className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Total Amount</p>
                            <p className="font-semibold text-slate-700">{formatCurrency(sale.totalAmount)}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                            <CreditCard className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Payment</p>
                            <p className="font-semibold text-slate-700">
                              Paid {formatCurrency(sale.paidAmount)}
                              {sale.dueAmount > 0 && (
                                <span className="text-amber-600 text-xs font-normal ml-1">
                                  (Due {formatCurrency(sale.dueAmount)})
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                          <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
                            <Calendar className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Date</p>
                            <p className="font-medium text-slate-700">{formatDate(sale.createdAt)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar for Partial Payments */}
                      {sale.status === "partial" && sale.totalAmount > 0 && (
                        <div className="mt-4">
                          <div className="flex justify-between text-xs text-slate-500 mb-1">
                            <span>Payment Progress</span>
                            <span>{Math.round((sale.paidAmount / sale.totalAmount) * 100)}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                              style={{ width: `${(sale.paidAmount / sale.totalAmount) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardRecentSales;