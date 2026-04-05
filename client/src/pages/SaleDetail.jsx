import React, { useState } from "react";
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Loader2,
  Package,
  Receipt,
  User,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useCreateSalePayment, useSale } from "../hooks/useSales";

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

const SaleDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { sale, isLoading, error, refetch } = useSale(id);
  const { createSalePayment, isLoading: isSavingPayment } =
    useCreateSalePayment();
  const [paymentAmount, setPaymentAmount] = useState("");

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />
      </div>
    );
  }

  const handleAddPayment = async (event) => {
    event.preventDefault();

    if (!paymentAmount) {
      return;
    }

    await createSalePayment(sale.id, {
      amount: Number(paymentAmount),
    });

    setPaymentAmount("");
    refetch();
  };

  if (error || !sale) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:ml-72 md:p-8">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error || "Sale not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:ml-72 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate("/sales")}
            className="inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sales
          </button>

          <button
            onClick={() => navigate("/add-transaction")}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            <Receipt className="h-4 w-4" />
            Record another sale
          </button>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
                    Sale #{sale.id.slice(0, 8)}
                  </h1>
                  <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                    <Calendar className="h-4 w-4" />
                    {formatDate(sale.createdAt)}
                  </div>
                </div>

                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700">
                  {sale.status}
                </span>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <User className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-400">
                      Customer
                    </p>
                    <p className="text-sm font-medium text-slate-700">
                      {sale.customer.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {sale.customer.mobile}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <CreditCard className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-400">
                      Payment Snapshot
                    </p>
                    <p className="text-sm font-medium text-slate-700">
                      Paid {formatCurrency(sale.paidAmount)}
                    </p>
                    <p className="text-xs text-slate-500">
                      Due {formatCurrency(sale.dueAmount)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-slate-800">
                  Sold Items
                </h2>
              </div>

              <div className="space-y-3">
                {sale.items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {item.product.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {item.product.category}
                          {item.product.sku ? ` · SKU ${item.product.sku}` : ""}
                        </p>
                      </div>

                      <div className="text-left md:text-right">
                        <p className="text-sm font-semibold text-slate-800">
                          {formatCurrency(item.totalAmount)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {item.quantity} × {formatCurrency(item.unitPrice)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Receipt className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-slate-800">
                  Payment Activity
                </h2>
              </div>

              {sale.payments.length > 0 ? (
                <div className="space-y-3">
                  {sale.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-700">
                          Payment received
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatDate(payment.createdAt)}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-emerald-700">
                        {formatCurrency(payment.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                  No payments recorded yet for this sale.
                </div>
              )}

              {sale.dueAmount > 0 && (
                <form onSubmit={handleAddPayment} className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-800">
                    Record pending payment
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Remaining due: {formatCurrency(sale.dueAmount)}
                  </p>

                  <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                    <input
                      type="number"
                      min="0.01"
                      max={sale.dueAmount}
                      step="0.01"
                      value={paymentAmount}
                      onChange={(event) => setPaymentAmount(event.target.value)}
                      placeholder="Enter payment amount"
                      className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition-colors focus:border-blue-400"
                    />
                    <button
                      type="submit"
                      disabled={
                        isSavingPayment ||
                        !paymentAmount ||
                        Number(paymentAmount) <= 0 ||
                        Number(paymentAmount) > sale.dueAmount
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSavingPayment && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      Save payment
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          <aside className="space-y-4">
            {[
              {
                label: "Subtotal",
                value: formatCurrency(sale.subtotalAmount),
                tone: "bg-slate-50 text-slate-700 border-slate-100",
              },
              {
                label: "Discount",
                value: formatCurrency(sale.discountAmount),
                tone: "bg-amber-50 text-amber-700 border-amber-100",
              },
              {
                label: "Final Amount",
                value: formatCurrency(sale.totalAmount),
                tone: "bg-blue-50 text-blue-700 border-blue-100",
              },
              {
                label: "Paid",
                value: formatCurrency(sale.paidAmount),
                tone: "bg-emerald-50 text-emerald-700 border-emerald-100",
              },
              {
                label: "Due",
                value: formatCurrency(sale.dueAmount),
                tone:
                  sale.dueAmount > 0
                    ? "bg-rose-50 text-rose-700 border-rose-100"
                    : "bg-emerald-50 text-emerald-700 border-emerald-100",
              },
            ].map((item) => (
              <div
                key={item.label}
                className={`rounded-2xl border p-4 ${item.tone}`}
              >
                <p className="text-[11px] uppercase tracking-widest opacity-70">
                  {item.label}
                </p>
                <p className="mt-2 text-2xl font-bold">{item.value}</p>
              </div>
            ))}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default SaleDetail;
