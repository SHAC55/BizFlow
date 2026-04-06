import React, { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Calendar,
  CreditCard,
  Download,
  Filter,
  ReceiptText,
  Search,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
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

const formatInputDate = (value) => {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getPresetRange = (preset) => {
  const now = new Date();
  const end = formatInputDate(now);

  switch (preset) {
    case "today":
      return {
        start: end,
        end,
      };
    case "this_week": {
      const startDate = new Date(now);
      const day = startDate.getDay();
      const diff = day === 0 ? 6 : day - 1;
      startDate.setDate(startDate.getDate() - diff);
      return {
        start: formatInputDate(startDate),
        end,
      };
    }
    case "this_month": {
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        start: formatInputDate(startDate),
        end,
      };
    }
    case "last_30_days": {
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 29);
      return {
        start: formatInputDate(startDate),
        end,
      };
    }
    default:
      return {
        start: "",
        end,
      };
  }
};

const sameMonth = (date, now) =>
  date.getFullYear() === now.getFullYear() &&
  date.getMonth() === now.getMonth();

const sameDay = (date, now) =>
  sameMonth(date, now) && date.getDate() === now.getDate();

const Payments = () => {
  const today = formatInputDate(new Date());
  const defaultPreset = "last_30_days";
  const defaultRange = getPresetRange(defaultPreset);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [dueFilter, setDueFilter] = useState("all");
  const [activePreset, setActivePreset] = useState(defaultPreset);
  const [startDate, setStartDate] = useState(defaultRange.start);
  const [endDate, setEndDate] = useState(defaultRange.end || today);
  const { sales, isLoading, error } = useSales({
    page: 1,
    limit: 100,
    search: searchTerm,
    status: "all",
  });

  const analytics = useMemo(() => {
    const now = new Date();
    const payments = [];
    const rangeStart = startDate ? new Date(`${startDate}T00:00:00`) : null;
    const rangeEnd = endDate ? new Date(`${endDate}T23:59:59.999`) : null;

    const isWithinRange = (value) => {
      const date = new Date(value);

      if (rangeStart && date < rangeStart) {
        return false;
      }

      if (rangeEnd && date > rangeEnd) {
        return false;
      }

      return true;
    };

    sales.forEach((sale) => {
      sale.payments.forEach((payment) => {
        if (!isWithinRange(payment.createdAt)) {
          return;
        }

        payments.push({
          id: payment.id,
          saleId: sale.id,
          amount: payment.amount,
          createdAt: payment.createdAt,
          customer: sale.customer,
          totalAmount: sale.totalAmount,
          dueAmount: sale.dueAmount,
          status: sale.status,
        });
      });
    });

    const sortedPayments = payments.sort(
      (left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
    );

    const todayCollection = sortedPayments.reduce((sum, payment) => {
      const paymentDate = new Date(payment.createdAt);
      return sum + (sameDay(paymentDate, now) ? payment.amount : 0);
    }, 0);

    const monthlyCollection = sortedPayments.reduce((sum, payment) => {
      const paymentDate = new Date(payment.createdAt);
      return sum + (sameMonth(paymentDate, now) ? payment.amount : 0);
    }, 0);

    const dueSales = sales
      .filter((sale) => {
        if (sale.dueAmount <= 0) {
          return false;
        }

        if (!isWithinRange(sale.createdAt)) {
          return false;
        }

        switch (dueFilter) {
          case "high":
            return sale.dueAmount >= 10000;
          case "recent":
            return sameMonth(new Date(sale.createdAt), now);
          case "all":
          default:
            return true;
        }
      })
      .sort((left, right) => right.dueAmount - left.dueAmount);

    const filteredTotals = sales.reduce(
      (accumulator, sale) => {
        if (!isWithinRange(sale.createdAt)) {
          return accumulator;
        }

        accumulator.totalInvoiced += sale.totalAmount;
        accumulator.totalRevenue += sale.paidAmount;
        accumulator.totalOutstanding += sale.dueAmount;

        return accumulator;
      },
      {
        totalInvoiced: 0,
        totalRevenue: 0,
        totalOutstanding: 0,
      },
    );

    const collectionRate =
      filteredTotals.totalInvoiced > 0
        ? (filteredTotals.totalRevenue / filteredTotals.totalInvoiced) * 100
        : 0;

    return {
      sortedPayments,
      dueSales,
      todayCollection,
      monthlyCollection,
      collectionRate,
      filteredTotals,
    };
  }, [dueFilter, endDate, sales, startDate]);

  const exportPayments = () => {
    if (analytics.sortedPayments.length === 0) {
      return;
    }

    const rows = analytics.sortedPayments.map((payment) => ({
      payment_id: payment.id,
      sale_id: payment.saleId,
      customer_name: payment.customer.name,
      customer_mobile: payment.customer.mobile ?? "",
      amount: payment.amount,
      payment_date: payment.createdAt,
      sale_total: payment.totalAmount,
      remaining_due: payment.dueAmount,
      sale_status: payment.status,
    }));

    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map((header) =>
            `"${String(row[header] ?? "").replaceAll('"', '""')}"`,
          )
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `payments-${startDate || "all"}-to-${endDate || "latest"}.csv`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const applyPreset = (preset) => {
    const range = getPresetRange(preset);
    setActivePreset(preset);
    setStartDate(range.start);
    setEndDate(range.end);
  };

  const datePresets = [
    { id: "today", label: "Today" },
    { id: "this_week", label: "This Week" },
    { id: "this_month", label: "This Month" },
    { id: "last_30_days", label: "Last 30 Days" },
    { id: "all_time", label: "All Time" },
  ];

  const statCards = [
    {
      label: "Today's Collection",
      value: formatCurrency(analytics.todayCollection),
      sub: "Payments received today",
      icon: Wallet,
      tone: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Pending Payments",
      value: formatCurrency(analytics.filteredTotals.totalOutstanding),
      sub: `${analytics.dueSales.length} sales still unpaid`,
      icon: CreditCard,
      tone: "bg-amber-50 text-amber-700",
    },
    {
      label: "Monthly Revenue",
      value: formatCurrency(analytics.monthlyCollection),
      sub: "Collected in the current month",
      icon: TrendingUp,
      tone: "bg-blue-50 text-blue-700",
    },
    {
      label: "Collection Rate",
      value: `${analytics.collectionRate.toFixed(0)}%`,
      sub: `${formatCurrency(analytics.filteredTotals.totalRevenue)} collected of ${formatCurrency(analytics.filteredTotals.totalInvoiced)}`,
      icon: ReceiptText,
      tone: "bg-fuchsia-50 text-fuchsia-700",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-100 to-indigo-50 p-4 md:ml-72 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-[32px] border border-sky-100 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-500">
                Payments Console
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
                Cash flow, dues, and collection signals in one place
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
                This page is built entirely from sale-linked payments, so every
                amount here maps back to a real transaction you already record in
                the sales flow.
              </p>
            </div>

            <button
              onClick={() => navigate("/sales")}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            >
              Go to sales
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.label}
                className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.05)] backdrop-blur"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className={`rounded-2xl p-3 ${card.tone}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">
                    {card.label}
                  </p>
                </div>
                <p className="mt-5 text-3xl font-black tracking-tight text-slate-900">
                  {card.value}
                </p>
                <p className="mt-2 text-sm text-slate-500">{card.sub}</p>
              </div>
            );
          })}
        </div>

        <div className="mb-6 rounded-[28px] border border-white/70 bg-white/90 p-4 shadow-[0_12px_40px_rgba(15,23,42,0.05)] backdrop-blur">
          <div className="mb-3 flex flex-wrap gap-2">
            {datePresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset.id)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                  activePreset === preset.id
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 xl:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by customer or product"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition-colors focus:border-sky-400 focus:bg-white"
              />
            </div>

            <div className="relative md:w-56">
              <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                value={dueFilter}
                onChange={(event) => setDueFilter(event.target.value)}
                className="w-full appearance-none rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition-colors focus:border-sky-400"
              >
                <option value="all">All pending dues</option>
                <option value="high">High dues</option>
                <option value="recent">Created this month</option>
              </select>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <div className="md:w-44">
                <input
                  type="date"
                  value={startDate}
                  max={endDate || today}
                  onChange={(event) => {
                    setActivePreset("custom");
                    setStartDate(event.target.value);
                  }}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition-colors focus:border-sky-400"
                />
              </div>

              <div className="md:w-44">
                <input
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  max={today}
                  onChange={(event) => {
                    setActivePreset("custom");
                    setEndDate(event.target.value);
                  }}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition-colors focus:border-sky-400"
                />
              </div>

              <button
                type="button"
                onClick={exportPayments}
                disabled={analytics.sortedPayments.length === 0}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-[360px] items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {error}
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_420px]">
            <div className="rounded-[30px] border border-white/70 bg-white/90 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Payment Activity
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Every payment recorded against a sale, newest first.
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {analytics.sortedPayments.length} payments
                </span>
              </div>

              {analytics.sortedPayments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center text-sm text-slate-500">
                  No payment records yet. Payments will appear here after sales
                  are paid partially or fully.
                </div>
              ) : (
                <div className="space-y-3">
                  {analytics.sortedPayments.slice(0, 12).map((payment) => (
                    <button
                      key={payment.id}
                      onClick={() => navigate(`/sales/${payment.saleId}`)}
                      className="flex w-full flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-left transition-colors hover:bg-slate-100"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900">
                            {payment.customer.name}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Sale #{payment.saleId.slice(0, 8)}
                          </p>
                        </div>
                        <p className="text-sm font-bold text-emerald-700">
                          + {formatCurrency(payment.amount)}
                        </p>
                      </div>

                      <div className="grid gap-2 text-xs text-slate-500 sm:grid-cols-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(payment.createdAt)}
                        </div>
                        <div>
                          Total {formatCurrency(payment.totalAmount)}
                        </div>
                        <div>
                          Remaining due {formatCurrency(payment.dueAmount)}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="rounded-[30px] border border-white/70 bg-slate-950 p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">
                  Collections Focus
                </p>
                <p className="mt-4 text-4xl font-black tracking-tight">
                  {formatCurrency(analytics.filteredTotals.totalOutstanding)}
                </p>
                <p className="mt-3 max-w-sm text-sm leading-6 text-slate-300">
                  Outstanding across all open sales. Use this panel to spot where
                  follow-up effort matters most.
                </p>

                <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-400 via-emerald-400 to-lime-300"
                    style={{
                      width: `${Math.min(
                        100,
                        analytics.filteredTotals.totalInvoiced > 0
                          ? (analytics.filteredTotals.totalRevenue /
                              analytics.filteredTotals.totalInvoiced) *
                            100
                          : 0,
                      )}%`,
                    }}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-300">
                  <span>
                    Collected {formatCurrency(analytics.filteredTotals.totalRevenue)}
                  </span>
                  <span>
                    Invoiced {formatCurrency(analytics.filteredTotals.totalInvoiced)}
                  </span>
                </div>
              </div>

              <div className="rounded-[30px] border border-white/70 bg-white/90 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Follow-up Queue
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Sales with remaining dues, sorted by amount outstanding.
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                    {analytics.dueSales.length} open
                  </span>
                </div>

                {analytics.dueSales.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                    Nothing pending right now. All tracked sales are fully paid.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {analytics.dueSales.slice(0, 8).map((sale) => (
                      <button
                        key={sale.id}
                        onClick={() => navigate(`/sales/${sale.id}`)}
                        className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-left transition-colors hover:bg-slate-100"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900">
                              {sale.customer.name}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {sale.items
                                .slice(0, 2)
                                .map(
                                  (item) =>
                                    `${item.quantity} × ${item.product.name}`,
                                )
                                .join(", ")}
                              {sale.items.length > 2
                                ? ` +${sale.items.length - 2} more`
                                : ""}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-sm font-bold text-rose-700">
                              {formatCurrency(sale.dueAmount)}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              paid {formatCurrency(sale.paidAmount)}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payments;
