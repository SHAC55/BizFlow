import React from "react";
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
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useArchiveCustomer, useCustomer } from "../hooks/useCustomers";

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const CustomerDetails = () => {
  const navigate = useNavigate();
  const { customerId } = useParams();
  const { customer, isLoading, error } = useCustomer(customerId);
  const { archiveCustomer, isLoading: isArchiving } = useArchiveCustomer();

  const handleArchive = async () => {
    const confirmed = window.confirm(
      "Archive this customer? Archived customers are hidden from the default list.",
    );

    if (!confirmed) {
      return;
    }

    await archiveCustomer(customerId);
    navigate("/customers");
  };
if (isLoading) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 z-50">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-slate-600" />
    </div>
  );
}
  if (error || !customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:ml-72 md:p-8">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error || "Customer not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:ml-72 md:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <button
          onClick={() => navigate("/customers")}
          className="inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to customers
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/add-customer?customerId=${customer.id}`)}
            className="inline-flex items-center gap-2 rounded-xl border border-blue-100 bg-white px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-50"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </button>
          {!customer.archivedAt && (
            <button
              onClick={handleArchive}
              disabled={isArchiving}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:opacity-60"
            >
              <ShieldAlert className="h-4 w-4" />
              {isArchiving ? "Archiving..." : "Archive"}
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
                  {customer.name}
                </h1>
                <p className="mt-1 text-sm text-slate-400">
                  Customer since {formatDate(customer.createdAt)}
                </p>
              </div>
              {customer.archivedAt && (
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  Archived {formatDate(customer.archivedAt)}
                </span>
              )}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <Phone className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400">
                    Phone
                  </p>
                  <p className="text-sm font-medium text-slate-700">
                    {customer.mobile}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <Mail className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400">
                    Email
                  </p>
                  <p className="text-sm font-medium text-slate-700">
                    {customer.email || "No email added"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 md:col-span-2">
                <MapPin className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400">
                    Address
                  </p>
                  <p className="text-sm font-medium text-slate-700">
                    {customer.address || "No address added"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="mb-2 text-xs uppercase tracking-widest text-slate-400">
                Notes
              </p>
              <p className="text-sm leading-6 text-slate-600">
                {customer.notes || "No notes for this customer yet."}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <ScrollText className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-800">
                Sales History
              </h2>
            </div>

            {customer.sales.length > 0 ? (
              <div className="space-y-3">
                {customer.sales.map((sale) => (
                  <div
                    key={sale.id}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-700">
                          Sale #{sale.id.slice(0, 8)}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {formatDate(sale.createdAt)}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-semibold text-slate-800">
                          {formatCurrency(sale.totalAmount)}
                        </p>
                        <p className="text-xs text-slate-500">
                          Due {formatCurrency(sale.dueAmount)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      <div className="rounded-xl bg-white px-3 py-2">
                        <p className="text-[10px] uppercase tracking-widest text-slate-400">
                          Total
                        </p>
                        <p className="text-sm font-semibold text-slate-700">
                          {formatCurrency(sale.totalAmount)}
                        </p>
                      </div>
                      <div className="rounded-xl bg-white px-3 py-2">
                        <p className="text-[10px] uppercase tracking-widest text-slate-400">
                          Paid
                        </p>
                        <p className="text-sm font-semibold text-emerald-700">
                          {formatCurrency(sale.paidAmount)}
                        </p>
                      </div>
                      <div className="rounded-xl bg-white px-3 py-2">
                        <p className="text-[10px] uppercase tracking-widest text-slate-400">
                          Invoice
                        </p>
                        <p className="text-sm font-semibold text-slate-700">
                          {sale.invoice ? "Available" : "Not generated"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                No sales recorded for this customer yet.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {[
              {
                label: "Outstanding Due",
                value: formatCurrency(customer.due),
                tone:
                  customer.due > 0
                    ? "bg-red-50 text-red-600 border-red-100"
                    : "bg-emerald-50 text-emerald-600 border-emerald-100",
              },
              {
                label: "Revenue Collected",
                value: formatCurrency(customer.totalPayment),
                tone: "bg-yellow-50 text-yellow-700 border-yellow-100",
              },
              {
                label: "Opening Balance",
                value: formatCurrency(customer.openingBalance),
                tone: "bg-blue-50 text-blue-700 border-blue-100",
              },
              {
                label: "Orders",
                value: String(customer.orders),
                tone: "bg-indigo-50 text-indigo-700 border-indigo-100",
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
          </div>

          <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Receipt className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-800">
                Payment History
              </h2>
            </div>

            {customer.payments.length > 0 ? (
              <div className="space-y-3">
                {customer.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        Payment #{payment.id.slice(0, 8)}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Sale #{payment.saleId.slice(0, 8)} on{" "}
                        {formatDate(payment.createdAt)}
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                      <CreditCard className="h-4 w-4" />
                      {formatCurrency(payment.amount)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                No payments recorded for this customer yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;
