import React, { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Calendar,
  CreditCard,
  Filter,
  MessageCircleMore,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSaleReminder, useSales } from "../hooks/useSales";

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
      return { start: end, end };
    case "this_week": {
      const startDate = new Date(now);
      const day = startDate.getDay();
      const diff = day === 0 ? 6 : day - 1;
      startDate.setDate(startDate.getDate() - diff);
      return { start: formatInputDate(startDate), end };
    }
    case "this_month":
      return {
        start: formatInputDate(new Date(now.getFullYear(), now.getMonth(), 1)),
        end,
      };
    case "last_30_days": {
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 29);
      return { start: formatInputDate(startDate), end };
    }
    default:
      return { start: "", end: "" };
  }
};

const sameMonth = (date, now) =>
  date.getFullYear() === now.getFullYear() &&
  date.getMonth() === now.getMonth();

const sameDay = (date, now) =>
  sameMonth(date, now) && date.getDate() === now.getDate();

const Payments = () => {
  const today = formatInputDate(new Date());
  const defaultPreset = "all_time";
  const defaultRange = getPresetRange(defaultPreset);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [dueFilter, setDueFilter] = useState("all");
  const [activePreset, setActivePreset] = useState(defaultPreset);
  const [startDate, setStartDate] = useState(defaultRange.start);
  const [endDate, setEndDate] = useState(defaultRange.end || today);
  const [sendingReminderFor, setSendingReminderFor] = useState("");

  const { sales, isLoading, error } = useSales({
    page: 1,
    limit: 100,
    search: searchTerm,
    status: "all",
  });
  const { getReminder, isLoading: isLoadingReminder } = useSaleReminder();

  const analytics = useMemo(() => {
    const now = new Date();
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

    const dueTodayAmount = dueSales.reduce((sum, sale) => {
      const reminderDate = sale.reminderDate ? new Date(sale.reminderDate) : null;
      return sum + (reminderDate && sameDay(reminderDate, now) ? sale.dueAmount : 0);
    }, 0);

    const scheduledReminderCount = dueSales.filter(
      (sale) => sale.reminderDate && isWithinRange(sale.reminderDate),
    ).length;

    const collectionRate =
      filteredTotals.totalInvoiced > 0
        ? (filteredTotals.totalRevenue / filteredTotals.totalInvoiced) * 100
        : 0;

    return {
      dueSales,
      dueTodayAmount,
      scheduledReminderCount,
      collectionRate,
      filteredTotals,
      recoveryPotential: dueSales.reduce(
        (sum, sale) => sum + Math.max(sale.estimatedProfitAmount || 0, 0),
        0,
      ),
    };
  }, [dueFilter, endDate, sales, startDate]);

  const applyPreset = (preset) => {
    const range = getPresetRange(preset);
    setActivePreset(preset);
    setStartDate(range.start);
    setEndDate(range.end || today);
  };

  const openReminder = async (saleId) => {
    setSendingReminderFor(saleId);

    try {
      const reminder = await getReminder(saleId);
      window.open(reminder.whatsappUrl, "_blank", "noopener,noreferrer");
    } finally {
      setSendingReminderFor("");
    }
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
      label: "Open Dues",
      value: formatCurrency(analytics.filteredTotals.totalOutstanding),
      sub: `${analytics.dueSales.length} sales still unpaid`,
      icon: CreditCard,
      tone: "bg-amber-50 text-amber-700",
    },
    {
      label: "Reminder Today",
      value: formatCurrency(analytics.dueTodayAmount),
      sub: "Due amount tied to today's reminder dates",
      icon: Calendar,
      tone: "bg-sky-50 text-sky-700",
    },
    {
      label: "Scheduled Reminders",
      value: analytics.scheduledReminderCount,
      sub: "Open sales with reminder dates set",
      icon: MessageCircleMore,
      tone: "bg-fuchsia-50 text-fuchsia-700",
    },
    {
      label: "Recovery Potential",
      value: formatCurrency(analytics.recoveryPotential),
      sub: "Estimated profit protected by collecting dues",
      icon: TrendingUp,
      tone: "bg-emerald-50 text-emerald-700",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-100 to-indigo-50 p-4 md:ml-72 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-[32px] border border-sky-100 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-500">
                Due Payments Console
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
                Outstanding dues, reminders, and recovery cues in one place
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
                This page stays focused on unpaid sales only. Use it to decide
                who to follow up with next and send WhatsApp-ready reminders in
                one click.
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
                <option value="all">All open dues</option>
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
                    Due Ledger
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Open sales only, sorted by pending amount.
                  </p>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                  {analytics.dueSales.length} open
                </span>
              </div>

              {analytics.dueSales.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center text-sm text-slate-500">
                  No due payments right now. Everything in the selected range is
                  fully settled.
                </div>
              ) : (
                <div className="space-y-3">
                  {analytics.dueSales.slice(0, 12).map((sale, index) => (
                    <div
                      key={sale.id}
                      className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <button
                          onClick={() => navigate(`/sales/${sale.id}`)}
                          className="flex-1 text-left"
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white">
                              {index + 1}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-900">
                                {sale.customer.name}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                Sale #{sale.id.slice(0, 8)} • {sale.customer.mobile}
                              </p>
                              <p className="mt-2 text-xs text-slate-500">
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
                          </div>
                        </button>

                        <div className="min-w-[220px] rounded-2xl bg-white p-4">
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>Due now</span>
                            <span className="font-semibold text-rose-700">
                              {formatCurrency(sale.dueAmount)}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                            <span>Paid</span>
                            <span>{formatCurrency(sale.paidAmount)}</span>
                          </div>
                          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                            <span>Reminder</span>
                            <span>
                              {sale.reminderDate
                                ? formatDate(sale.reminderDate)
                                : "Not scheduled"}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => openReminder(sale.id)}
                            disabled={sendingReminderFor === sale.id || isLoadingReminder}
                            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
                          >
                            <MessageCircleMore className="h-4 w-4" />
                            {sendingReminderFor === sale.id
                              ? "Preparing..."
                              : "Send WhatsApp Reminder"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="rounded-[30px] border border-white/70 bg-slate-950 p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">
                  Creative Cue
                </p>
                <p className="mt-4 text-4xl font-black tracking-tight">
                  {analytics.collectionRate.toFixed(0)}%
                </p>
                <p className="mt-3 max-w-sm text-sm leading-6 text-slate-300">
                  Current collection rate inside the selected range. The bar
                  below turns the due page into a recovery radar instead of a
                  static report.
                </p>

                <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-400 via-emerald-400 to-lime-300"
                    style={{
                      width: `${Math.min(100, analytics.collectionRate)}%`,
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
                      Priority Radar
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      A quick ranking of who needs follow-up first.
                    </p>
                  </div>
                  <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                    <Sparkles className="inline h-3.5 w-3.5 mr-1" />
                    Smart view
                  </span>
                </div>

                {analytics.dueSales.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                    Nothing pending right now. All tracked sales are fully paid.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {analytics.dueSales.slice(0, 5).map((sale) => {
                      const urgencyScore =
                        sale.dueAmount +
                        (sale.reminderDate
                          ? Math.max(
                              0,
                              5000 -
                                Math.floor(
                                  (new Date(sale.reminderDate).getTime() -
                                    Date.now()) /
                                    (1000 * 60 * 60 * 24),
                                ) *
                                  500,
                            )
                          : 2500);

                      return (
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
                                Reminder{" "}
                                {sale.reminderDate
                                  ? formatDate(sale.reminderDate)
                                  : "not scheduled"}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="text-sm font-bold text-rose-700">
                                {formatCurrency(sale.dueAmount)}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                score {Math.round(urgencyScore)}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="rounded-[30px] border border-white/70 bg-white/90 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur">
                <h2 className="text-xl font-bold text-slate-900">
                  Reminder Playbook
                </h2>
                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    Follow up first on the biggest dues with reminder dates due
                    today or overdue.
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    Use the WhatsApp action to open a prewritten message with the
                    customer number already attached.
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    Keep GST and invoice address updated in profile so invoice
                    copies and reminder conversations match the business identity.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payments;
