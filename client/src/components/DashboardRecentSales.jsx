import React from "react";
import { Calendar, CreditCard, ReceiptText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });

const getStatusClasses = (status) => {
  switch (status) {
    case "paid":
      return "bg-emerald-100 text-emerald-700";
    case "partial":
      return "bg-amber-100 text-amber-700";
    case "pending":
    default:
      return "bg-rose-100 text-rose-700";
  }
};

const DashboardRecentSales = ({ sales, isLoading, error }) => {
  const navigate = useNavigate();

  return (
    <div className="mt-6 px-4 md:px-6 max-w-7xl mx-auto">
      <div className="rounded-3xl bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Recent Sales
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Latest recorded sales and payment status.
            </p>
          </div>

          <button
            onClick={() => navigate("/sales")}
            className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
          >
            View all
          </button>
        </div>

        {isLoading ? (
          <div className="flex min-h-52 items-center justify-center">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {error}
          </div>
        ) : sales.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
            No sales recorded yet.
          </div>
        ) : (
          <div className="space-y-3">
            {sales.map((sale) => (
              <button
                key={sale.id}
                onClick={() => navigate(`/sales/${sale.id}`)}
                className="flex w-full flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-left transition-colors hover:bg-slate-100"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800">
                      {sale.customer.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {sale.items
                        .slice(0, 2)
                        .map((item) => `${item.quantity} × ${item.product.name}`)
                        .join(", ")}
                      {sale.items.length > 2
                        ? ` +${sale.items.length - 2} more`
                        : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClasses(
                        sale.status,
                      )}`}
                    >
                      {sale.status}
                    </span>
                  </div>
                </div>

                <div className="grid gap-3 text-sm text-slate-600 md:grid-cols-3">
                  <div className="flex items-center gap-2">
                    <ReceiptText className="h-4 w-4 text-slate-400" />
                    <span>{formatCurrency(sale.totalAmount)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-slate-400" />
                    <span>
                      Paid {formatCurrency(sale.paidAmount)}
                      {sale.dueAmount > 0
                        ? ` · Due ${formatCurrency(sale.dueAmount)}`
                        : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span>{formatDate(sale.createdAt)}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardRecentSales;
