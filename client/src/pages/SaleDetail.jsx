import React, { useState } from "react";
import { useRef } from "react";
import Invoice from "../components/Invoice";
import { useReactToPrint } from "react-to-print";
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Loader2,
  Package,
  Receipt,
  User,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Printer,
  Share2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useCreateSalePayment, useSale } from "../hooks/useSales";
import PageLoader from "../components/loaders/PageLoader";

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const getStatusConfig = (status) => {
  const configs = {
    paid: {
      icon: CheckCircle,
      bg: "bg-gray-100",
      text: "text-gray-900",
      border: "border-gray-300",
      label: "Fully Paid",
    },
    partial: {
      icon: Clock,
      bg: "bg-gray-100",
      text: "text-gray-900",
      border: "border-gray-300",
      label: "Partial Payment",
    },
    pending: {
      icon: AlertCircle,
      bg: "bg-gray-100",
      text: "text-gray-900",
      border: "border-gray-300",
      label: "Pending",
    },
  };
  return configs[status] || configs.pending;
};

const SaleDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { sale, isLoading, error, refetch } = useSale(id);
  const { createSalePayment, isLoading: isSavingPayment } =
    useCreateSalePayment();
  const [paymentAmount, setPaymentAmount] = useState("");
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const invoiceRef = useRef();

  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
  });

  if (isLoading) {
    return <PageLoader />;
  }

  const handleAddPayment = async (event) => {
    event.preventDefault();
    if (!paymentAmount) return;

    await createSalePayment(sale.id, {
      amount: Number(paymentAmount),
    });

    setPaymentAmount("");
    setShowPaymentForm(false);
    refetch();
  };

  if (error || !sale) {
    return (
      <div className="min-h-screen w-full bg-white p-4 md:ml-20 md:p-8">
        <div className="max-w-md mx-auto rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-600">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5" />
            <span>{error || "Sale not found"}</span>
          </div>
        </div>
      </div>
    );
  }

  const StatusIcon = getStatusConfig(sale.status).icon;
  const statusConfig = getStatusConfig(sale.status);

  return (
    <div className="min-h-screen w-full bg-white p-4 md:ml-20 md:p-8 md:mt-0 mt-14">
      <div className="mx-auto max-w-7xl">
        {/* Header Actions */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={() => navigate("/sales")}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-300 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to sales
          </button>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition-all hover:bg-gray-900"
            >
              <Printer className="h-4 w-4" />
              Generate Invoice
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_380px] xl:gap-8">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Sale Header Card */}
            <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="p-6 md:p-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
                        Sale #{sale.id.slice(0, 8)}
                      </h1>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border}`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      {formatDate(sale.createdAt)}
                    </div>
                  </div>

                  <div className="flex flex-col items-start md:items-end gap-2">
                    <div className="text-2xl md:text-3xl font-bold text-gray-900">
                      {formatCurrency(sale.totalAmount)}
                    </div>
                    <div className="text-xs text-gray-500">Total Amount</div>
                  </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                  <div className="rounded-xl bg-gray-50 p-3 border border-gray-100">
                    <p className="text-xs text-gray-500">Customer</p>
                    <p className="mt-1 font-semibold text-gray-900 truncate">
                      {sale.customer.name}
                    </p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3 border border-gray-100">
                    <p className="text-xs text-gray-500">Items</p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {sale.items.length} products
                    </p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3 border border-gray-100">
                    <p className="text-xs text-gray-500">Paid</p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {formatCurrency(sale.paidAmount)}
                    </p>
                  </div>
                  <div
                    className={`rounded-xl p-3 border ${sale.dueAmount > 0 ? "bg-gray-50 border-gray-100" : "bg-gray-50 border-gray-100"}`}
                  >
                    <p
                      className={`text-xs ${sale.dueAmount > 0 ? "text-gray-500" : "text-gray-500"}`}
                    >
                      Due
                    </p>
                    <p
                      className={`mt-1 font-semibold ${sale.dueAmount > 0 ? "text-gray-900" : "text-gray-900"}`}
                    >
                      {formatCurrency(sale.dueAmount)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sold Items Section */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-gray-700" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Sold Items
                  </h2>
                  <span className="ml-auto text-sm text-gray-500">
                    {sale.items.length} item{sale.items.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {sale.items.map((item, index) => (
                  <div
                    key={item.id}
                    className="group hover:bg-gray-50 transition-colors p-4 md:p-5"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
                            <Package className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {item.product.name}
                            </p>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                              {item.product.category && (
                                <span className="rounded-full bg-gray-100 px-2 py-0.5">
                                  {item.product.category}
                                </span>
                              )}
                              {item.product.sku && (
                                <span>SKU: {item.product.sku}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-6 md:gap-8">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {item.quantity} × {formatCurrency(item.unitPrice)}
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {formatCurrency(item.totalAmount)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Activity Section */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-gray-700" />
                    <h2 className="text-lg font-semibold text-gray-900">
                      Payment History
                    </h2>
                  </div>
                  {sale.dueAmount > 0 && !showPaymentForm && (
                    <button
                      onClick={() => setShowPaymentForm(true)}
                      className="rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50"
                    >
                      + Add Payment
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6">
                {sale.payments.length > 0 ? (
                  <div className="space-y-3">
                    {sale.payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4 transition-all hover:shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-gray-700" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              Payment received
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(payment.createdAt)}
                            </p>
                          </div>
                        </div>
                        <p className="text-lg font-bold text-gray-900">
                          {formatCurrency(payment.amount)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-12 text-center">
                    <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">
                      No payments recorded yet
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Add a payment to update the sale status
                    </p>
                  </div>
                )}

                {/* Payment Form */}
                {showPaymentForm && sale.dueAmount > 0 && (
                  <form
                    onSubmit={handleAddPayment}
                    className="mt-6 rounded-xl border-2 border-gray-200 bg-gray-50 p-5"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <p className="font-semibold text-gray-900">
                        Record Payment
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowPaymentForm(false)}
                        className="text-xs text-gray-400 hover:text-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                    <p className="text-sm text-gray-700 mb-4">
                      Remaining due: {formatCurrency(sale.dueAmount)}
                    </p>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                          ₹
                        </span>
                        <input
                          type="number"
                          min="0.01"
                          max={sale.dueAmount}
                          step="0.01"
                          value={paymentAmount}
                          onChange={(event) =>
                            setPaymentAmount(event.target.value)
                          }
                          placeholder="Enter amount"
                          className="w-full rounded-xl border border-gray-300 bg-white pl-8 pr-4 py-3 text-sm text-gray-900 outline-none transition-all focus:border-gray-500 focus:ring-1 focus:ring-gray-200"
                          autoFocus
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={
                          isSavingPayment ||
                          !paymentAmount ||
                          Number(paymentAmount) <= 0 ||
                          Number(paymentAmount) > sale.dueAmount
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSavingPayment && (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                        Process Payment
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Summary Cards */}
          <aside className="space-y-4">
            <div className="sticky top-8 space-y-4">
              {/* Customer Card */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-black flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500">
                      Customer Details
                    </p>
                    <p className="font-semibold text-gray-900">
                      {sale.customer.name}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Mobile</span>
                    <span className="font-medium text-gray-900">
                      {sale.customer.mobile}
                    </span>
                  </div>
                  {sale.customer.email && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Email</span>
                      <span className="font-medium text-gray-900 truncate">
                        {sale.customer.email}
                      </span>
                    </div>
                  )}
                  {sale.customer.address && (
                    <div className="flex justify-between py-2">
                      <span className="text-gray-500">Address</span>
                      <span className="font-medium text-gray-900 text-right">
                        {sale.customer.address}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Summary Cards */}
              <div className="space-y-3">
                <div className="rounded-xl bg-gray-50 p-5 border border-gray-200">
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Subtotal
                  </p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {formatCurrency(sale.subtotalAmount)}
                  </p>
                </div>

                {sale.discountAmount > 0 && (
                  <div className="rounded-xl bg-gray-50 p-5 border border-gray-200">
                    <p className="text-xs uppercase tracking-wider text-gray-500">
                      Discount Applied
                    </p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">
                      - {formatCurrency(sale.discountAmount)}
                    </p>
                  </div>
                )}

                {sale.gstAmount > 0 && (
                  <div className="rounded-xl bg-amber-50 p-5 border border-amber-200">
                    <p className="text-xs uppercase tracking-wider text-amber-700">
                      GST ({sale.gstRate}%)
                    </p>
                    <p className="mt-1 text-2xl font-bold text-amber-900">
                      {formatCurrency(sale.gstAmount)}
                    </p>
                  </div>
                )}

                <div className="rounded-xl bg-gray-900 p-5 text-white">
                  <p className="text-xs uppercase tracking-wider opacity-70">
                    Final Amount
                  </p>
                  <p className="mt-1 text-2xl font-bold">
                    {formatCurrency(sale.totalAmount)}
                  </p>
                </div>

                <div className="rounded-xl bg-green-700 p-5 text-white">
                  <p className="text-xs uppercase tracking-wider opacity-70">
                    Total Paid
                  </p>
                  <p className="mt-1 text-2xl font-bold">
                    {formatCurrency(sale.paidAmount)}
                  </p>
                </div>

                {sale.dueAmount > 0 && (
                  <div className="rounded-xl bg-red-200 p-5 border border-gray-200">
                    <p className="text-xs uppercase tracking-wider text-gray-500">
                      Remaining Due
                    </p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">
                      {formatCurrency(sale.dueAmount)}
                    </p>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              {sale.dueAmount > 0 && !showPaymentForm && (
                <button
                  onClick={() => setShowPaymentForm(true)}
                  className="w-full rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-gray-900"
                >
                  Record Payment
                </button>
              )}
            </div>
          </aside>
        </div>
      </div>
      <div className="print:block hidden">
        <Invoice ref={invoiceRef} sale={sale} />
      </div>
    </div>
  );
};

export default SaleDetail;
