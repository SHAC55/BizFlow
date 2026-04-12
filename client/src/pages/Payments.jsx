import React, { useMemo, useState } from "react";
import Header from "../components/Header";
import {
  Search,
  Filter,
  Calendar,
  MessageCircleMore,
  ArrowUpRight,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Bell,
} from "lucide-react";
import { useSales, useSaleReminder } from "../hooks/useSales";
import PageLoader from "../components/loaders/PageLoader";

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const Payments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [dueFilter, setDueFilter] = useState("all");
  const [date, setDate] = useState("");

  const { sales, isLoading, error } = useSales({
    page: 1,
    limit: 100,
    search: searchTerm,
    status: "all",
  });

  const { getReminder } = useSaleReminder();

  const dueSales = useMemo(() => {
    return sales
      .filter((sale) => sale.dueAmount > 0)
      .filter((sale) => {
        if (dueFilter === "high") return sale.dueAmount > 10000;
        return true;
      })
      .filter((sale) => {
        if (!date) return true;
        return sale.date === date;
      });
  }, [sales, dueFilter, date]);

  if (isLoading) return <PageLoader />;

  const totalDue = dueSales.reduce((sum, sale) => sum + sale.dueAmount, 0);
  const highDueCount = dueSales.filter((sale) => sale.dueAmount > 10000).length;

  return (
    <div className="bg-white text-black min-h-screen w-full md:ml-20 md:mt-0 mt-12">
      <div className="px-4 sm:px-6 lg:px-8 md:py-0 py-4">

        {/* Header */}
        <div className="mb-8 border-b border-black/8 pb-6">
          <Header
            title="Payments"
            para="Track and manage customer due payments"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

          {/* Total Due — sky blue accent */}
          <div className="rounded-2xl p-5 border border-black/8 bg-[#EFF6FF] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-[#BFDBFE] opacity-40 translate-x-6 -translate-y-6" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#1D4ED8]">
                  Total Due
                </span>
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <TrendingUp className="h-4 w-4 text-[#1D4ED8]" />
                </div>
              </div>
              <p className="text-3xl font-bold text-black tracking-tight">
                {formatCurrency(totalDue)}
              </p>
              <p className="text-xs text-black/40 mt-2">
                Across {dueSales.length} customers
              </p>
            </div>
          </div>

          {/* High Dues — rose accent */}
          <div className="rounded-2xl p-5 border border-black/8 bg-[#FFF1F2] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-[#FECDD3] opacity-40 translate-x-6 -translate-y-6" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#BE123C]">
                  High Dues
                </span>
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <AlertTriangle className="h-4 w-4 text-[#BE123C]" />
                </div>
              </div>
              <p className="text-3xl font-bold text-black tracking-tight">
                {highDueCount}
              </p>
              <p className="text-xs text-black/40 mt-2">Above ₹10,000</p>
            </div>
          </div>

          {/* Pending Reminders — amber accent */}
          <div className="rounded-2xl p-5 border border-black/8 bg-[#FFFBEB] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-[#FDE68A] opacity-40 translate-x-6 -translate-y-6" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#B45309]">
                  Reminders
                </span>
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <Bell className="h-4 w-4 text-[#B45309]" />
                </div>
              </div>
              <p className="text-3xl font-bold text-black tracking-tight">
                {dueSales.length}
              </p>
              <p className="text-xs text-black/40 mt-2">Ready to send</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" />
            <input
              placeholder="Search by customer name or mobile…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-black/10 bg-white text-black text-sm placeholder:text-black/30 focus:outline-none focus:border-black/30 focus:ring-2 focus:ring-black/5 transition-all"
            />
          </div>

          <div className="relative sm:w-44">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" />
            <select
              value={dueFilter}
              onChange={(e) => setDueFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-black/10 bg-white text-black text-sm focus:outline-none focus:border-black/30 focus:ring-2 focus:ring-black/5 appearance-none cursor-pointer transition-all"
            >
              <option value="all">All dues</option>
              <option value="high">High dues only</option>
            </select>
          </div>

          <div className="relative sm:w-48">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-black/10 bg-white text-black text-sm focus:outline-none focus:border-black/30 focus:ring-2 focus:ring-black/5 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="border border-black/8 rounded-2xl overflow-hidden bg-white">

          {/* Table Header */}
          <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3.5 bg-black text-white text-xs font-semibold uppercase tracking-widest">
            <div className="col-span-4">Customer</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Paid</div>
            <div className="col-span-2 text-right">Due</div>
            <div className="col-span-2 text-right">Action</div>
          </div>

          {dueSales.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="h-5 w-5 text-black/25" />
              </div>
              <p className="text-sm text-black/40">No due payments found</p>
              <p className="text-xs text-black/25 mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="divide-y divide-black/5">
              {dueSales.map((sale) => {
                const isHigh = sale.dueAmount > 10000;
                return (
                  <div
                    key={sale.id}
                    className="group p-4 md:p-0 md:grid md:grid-cols-12 md:gap-4 md:items-center md:px-6 hover:bg-black/[0.02] transition-colors duration-100"
                  >
                    {/* Customer Info */}
                    <div className="md:col-span-4 flex items-center justify-between md:py-4">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                          {sale.customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-black text-sm leading-tight">
                            {sale.customer.name}
                          </p>
                          <p className="text-xs text-black/40 mt-0.5">
                            {sale.customer.mobile}
                          </p>
                          {sale.date && (
                            <p className="text-xs text-black/30 mt-0.5 hidden md:block">
                              {new Date(sale.date).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                      {/* Mobile: due amount */}
                      <div className="md:hidden text-right">
                        <p className={`font-bold text-lg ${isHigh ? "text-[#BE123C]" : "text-black"}`}>
                          {formatCurrency(sale.dueAmount)}
                        </p>
                        <p className="text-[10px] text-black/40 uppercase tracking-wide">due</p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="hidden md:flex md:col-span-2 items-center">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full ${
                          isHigh
                            ? "bg-[#FFF1F2] text-[#BE123C]"
                            : "bg-[#FFFBEB] text-[#B45309]"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isHigh ? "bg-[#BE123C]" : "bg-[#B45309]"
                          }`}
                        />
                        {isHigh ? "High Due" : "Partial"}
                      </span>
                    </div>

                    {/* Paid Amount */}
                    <div className="hidden md:block md:col-span-2 text-right">
                      <p className="text-sm font-semibold text-[#16A34A]">
                        {formatCurrency(sale.paidAmount)}
                      </p>
                      <p className="text-[11px] text-black/30 mt-0.5">paid</p>
                    </div>

                    {/* Due Amount */}
                    <div className="hidden md:block md:col-span-2 text-right">
                      <p
                        className={`text-base font-bold ${
                          isHigh ? "text-[#BE123C]" : "text-black"
                        }`}
                      >
                        {formatCurrency(sale.dueAmount)}
                      </p>
                      <p className="text-[11px] text-black/30 mt-0.5">outstanding</p>
                    </div>

                    {/* Action */}
                    <div className="md:col-span-2 flex justify-end items-center mt-3 md:mt-0">
                      <button
                        onClick={async () => {
                          const reminder = await getReminder(sale.id);
                          window.open(reminder.whatsappUrl);
                        }}
                        className="group/btn flex items-center gap-1.5 px-4 py-2 rounded-full bg-green-600 text-white text-xs font-medium hover:bg-green/80 active:scale-95 transition-all duration-150"
                      >
                        <MessageCircleMore size={13} />
                        <span>Remind</span>
                        <ArrowUpRight
                          size={11}
                          className="opacity-50 group-hover/btn:opacity-100 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform"
                        />
                      </button>
                    </div>

                    {/* Mobile extra info */}
                    <div className="md:hidden mt-3 pt-3 border-t border-black/5 flex items-center justify-between text-xs text-black/40">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${isHigh ? "bg-[#BE123C]" : "bg-[#B45309]"}`}
                        />
                        <span>{isHigh ? "High Due" : "Partial Payment"}</span>
                      </div>
                      <span className="text-[#16A34A] font-medium">
                        Paid: {formatCurrency(sale.paidAmount)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {dueSales.length > 0 && (
          <div className="mt-5 text-center">
            <span className="text-xs text-black/35 bg-black/[0.04] px-4 py-2 rounded-full inline-block">
              Showing{" "}
              <span className="font-semibold text-black/60">{dueSales.length}</span>{" "}
              due {dueSales.length === 1 ? "payment" : "payments"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payments;