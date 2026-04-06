import React, { useState } from "react";
import {
  ArrowLeft,
  CreditCard,
  Mail,
  MapPin,
  Phone,
  Pencil,
  Receipt,
  ScrollText,
  ShieldAlert,
  User,
  Calendar,
  TrendingUp,
  Wallet,
  Package,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useArchiveCustomer, useCustomer } from "../hooks/useCustomers";

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const formatRelativeTime = (date) => {
  const now = new Date();
  const diff = now - new Date(date);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return formatDate(date);
};

const CustomerDetails = () => {
  const navigate = useNavigate();
  const { customerId } = useParams();
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const { customer, isLoading, error } = useCustomer(customerId);
  const { archiveCustomer, isLoading: isArchiving } = useArchiveCustomer();

  const handleArchive = async () => {
    await archiveCustomer(customerId);
    navigate("/customers");
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 z-50">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-3 border-slate-200 border-t-slate-700 mx-auto" />
          <p className="mt-4 text-sm text-slate-500">
            Loading customer details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:ml-72 md:p-8">
        <div className="max-w-md mx-auto rounded-2xl border border-rose-200 bg-rose-50 px-6 py-4 text-sm text-rose-600">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5" />
            <span>{error || "Customer not found"}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-4 md:ml-72 md:p-8 md:mt-0 mt-14">
      <div className="mx-auto max-w-7xl">
        {/* Header Actions */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={() => navigate("/customers")}
            className="inline-flex items-center gap-2 rounded-xl bg-white/80 backdrop-blur-sm px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-all hover:bg-white hover:text-slate-900 hover:shadow-md"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to customers
          </button>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 hover:border-slate-300"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            <button
              onClick={() =>
                navigate(`/add-customer?customerId=${customer.id}`)
              }
              className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-700 transition-all hover:bg-blue-50"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </button>
            {!customer.archivedAt && (
              <button
                onClick={() => setShowArchiveConfirm(true)}
                disabled={isArchiving}
                className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:shadow-lg disabled:opacity-60"
              >
                <ShieldAlert className="h-4 w-4" />
                {isArchiving ? "Archiving..." : "Archive"}
              </button>
            )}
          </div>
        </div>

        {/* Archive Confirmation Modal */}
        {showArchiveConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="max-w-md w-full rounded-3xl bg-white shadow-2xl p-6 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <ShieldAlert className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">
                  Archive Customer
                </h3>
              </div>
              <p className="text-slate-600 mb-6">
                Are you sure you want to archive{" "}
                <strong>{customer.name}</strong>? Archived customers will be
                hidden from the default customer list but can still be accessed
                if needed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowArchiveConfirm(false)}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleArchive}
                  className="flex-1 rounded-xl bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700"
                >
                  Archive Customer
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_380px] xl:gap-8">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Customer Profile Card */}
            <div className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-md transition-all hover:shadow-lg">
              <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 rounded-full blur-3xl -translate-y-40 translate-x-40" />

              <div className="relative p-6 md:p-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                      <User className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800">
                        {customer.name}
                      </h1>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                        <Calendar className="h-4 w-4" />
                        Customer since {formatDate(customer.createdAt)}
                      </div>
                    </div>
                  </div>

                  {customer.archivedAt && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                      <ShieldAlert className="h-3 w-3" />
                      Archived {formatRelativeTime(customer.archivedAt)}
                    </span>
                  )}
                </div>

                {/* Contact Info Grid */}
                <div className="mt-6 grid gap-3 md:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-all hover:shadow-sm">
                    <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Phone className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-400">
                        Phone Number
                      </p>
                      <p className="text-sm font-semibold text-slate-700">
                        {customer.mobile}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-all hover:shadow-sm">
                    <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-400">
                        Email Address
                      </p>
                      <p className="text-sm font-semibold text-slate-700">
                        {customer.email || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-all hover:shadow-sm md:col-span-2">
                    <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs uppercase tracking-wider text-slate-400">
                        Address
                      </p>
                      <p className="text-sm font-semibold text-slate-700">
                        {customer.address || "No address added"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                {customer.notes && (
                  <div className="mt-6 rounded-2xl bg-gradient-to-r from-amber-50 to-amber-50/30 border border-amber-100 p-4">
                    <p className="mb-2 text-xs uppercase tracking-wider text-amber-600">
                      Notes
                    </p>
                    <p className="text-sm leading-relaxed text-slate-700">
                      {customer.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Sales History Section */}
            <div className="rounded-3xl border border-slate-100 bg-white shadow-md overflow-hidden">
              <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ScrollText className="h-5 w-5 text-blue-600" />
                    <h2 className="text-lg font-semibold text-slate-800">
                      Sales History
                    </h2>
                  </div>
                  <span className="text-sm text-slate-500">
                    {customer.sales.length} order
                    {customer.sales.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              <div className="p-6">
                {customer.sales.length > 0 ? (
                  <div className="space-y-4">
                    {customer.sales.map((sale) => (
                      <div
                        key={sale.id}
                        className="group rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-all hover:shadow-md hover:bg-white cursor-pointer"
                        onClick={() => navigate(`/sales/${sale.id}`)}
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-slate-800">
                                Sale #{sale.id.slice(0, 8)}
                              </p>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${
                                  sale.dueAmount === 0
                                    ? "bg-emerald-100 text-emerald-700"
                                    : sale.paidAmount > 0
                                      ? "bg-amber-100 text-amber-700"
                                      : "bg-rose-100 text-rose-700"
                                }`}
                              >
                                {sale.dueAmount === 0
                                  ? "Paid"
                                  : sale.paidAmount > 0
                                    ? "Partial"
                                    : "Pending"}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-slate-500">
                              {formatDate(sale.createdAt)}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-3">
                              <div className="rounded-xl bg-white px-3 py-1.5 shadow-sm">
                                <p className="text-[10px] uppercase text-slate-400">
                                  Total
                                </p>
                                <p className="text-sm font-semibold text-slate-700">
                                  {formatCurrency(sale.totalAmount)}
                                </p>
                              </div>
                              <div className="rounded-xl bg-white px-3 py-1.5 shadow-sm">
                                <p className="text-[10px] uppercase text-slate-400">
                                  Paid
                                </p>
                                <p className="text-sm font-semibold text-emerald-700">
                                  {formatCurrency(sale.paidAmount)}
                                </p>
                              </div>
                              {sale.dueAmount > 0 && (
                                <div className="rounded-xl bg-white px-3 py-1.5 shadow-sm">
                                  <p className="text-[10px] uppercase text-slate-400">
                                    Due
                                  </p>
                                  <p className="text-sm font-semibold text-rose-700">
                                    {formatCurrency(sale.dueAmount)}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-slate-400 opacity-0 group-hover:opacity-100 transition-all" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center">
                    <Package className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">
                      No sales recorded yet
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Sales will appear here once the customer makes a purchase
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment History Section */}
            <div className="rounded-3xl border border-slate-100 bg-white shadow-md overflow-hidden">
              <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-4">
                <div className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-slate-800">
                    Payment History
                  </h2>
                </div>
              </div>

              <div className="p-6">
                {customer.payments.length > 0 ? (
                  <div className="space-y-3">
                    {customer.payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-all hover:shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                            <CreditCard className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-700">
                              Payment #{payment.id.slice(0, 8)}
                            </p>
                            <p className="text-xs text-slate-500">
                              For Sale #{payment.saleId.slice(0, 8)} •{" "}
                              {formatDate(payment.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-emerald-700">
                            {formatCurrency(payment.amount)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center">
                    <CreditCard className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">
                      No payments recorded
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Payments will appear here when the customer makes payments
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Stats Cards */}
          <aside className="space-y-4">
            <div className="sticky top-8 space-y-4">
              {/* Quick Stats */}
              <div className="grid gap-3">
                <div
                  className={`rounded-2xl p-5 border-2 transition-all ${
                    customer.due > 0
                      ? "bg-gradient-to-r from-rose-50 to-rose-100/30 border-rose-200"
                      : "bg-gradient-to-r from-emerald-50 to-emerald-100/30 border-emerald-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs uppercase tracking-wider opacity-70">
                      Outstanding Due
                    </p>
                    {customer.due > 0 ? (
                      <Clock className="h-4 w-4 text-rose-600" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                    )}
                  </div>
                  <p className="text-3xl font-bold">
                    {formatCurrency(customer.due)}
                  </p>
                  {customer.due === 0 && (
                    <p className="text-xs mt-2 opacity-70">
                      All payments cleared
                    </p>
                  )}
                </div>

                <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/50 p-5 border border-blue-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs uppercase tracking-wider text-blue-600">
                      Revenue Collected
                    </p>
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </div>
                  <p className="text-3xl font-bold text-blue-700">
                    {formatCurrency(customer.totalPayment)}
                  </p>
                </div>

                <div className="rounded-2xl bg-gradient-to-r from-purple-50 to-purple-100/30 p-5 border border-purple-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs uppercase tracking-wider text-purple-600">
                      Opening Balance
                    </p>
                    <Wallet className="h-4 w-4 text-purple-600" />
                  </div>
                  <p className="text-3xl font-bold text-purple-700">
                    {formatCurrency(customer.openingBalance)}
                  </p>
                </div>

                <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-emerald-100/30 p-5 border border-emerald-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs uppercase tracking-wider text-emerald-600">
                      Total Orders
                    </p>
                    <Package className="h-4 w-4 text-emerald-600" />
                  </div>
                  <p className="text-3xl font-bold text-emerald-700">
                    {customer.orders}
                  </p>
                  <p className="text-xs mt-2 opacity-70">Lifetime purchases</p>
                </div>
              </div>

              {/* Quick Action Button */}
              <button
                onClick={() =>
                  navigate(`/add-transaction?customerId=${customer.id}`)
                }
                className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:from-blue-700 hover:to-blue-600"
              >
                + New Sale for {customer.name.split(" ")[0]}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;
