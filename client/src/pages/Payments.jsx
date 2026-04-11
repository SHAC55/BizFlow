import React, { useMemo, useState } from "react";
import Header from "../components/Header";
import {
  Search,
  Filter,
  Calendar,
  MessageCircleMore,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
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

  // Filter sales with due amount > 0, apply high dues filter, and date filter
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

  // Calculate summary stats
  const totalDue = dueSales.reduce((sum, sale) => sum + sale.dueAmount, 0);
  const highDueCount = dueSales.filter((sale) => sale.dueAmount > 10000).length;

  return (
    <div className="bg-white text-black min-h-screen w-full md:ml-20 md:mt-0 mt-12">
      <div className="px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Header Section */}
        <div className="mb-8">
          <Header
            title="Payments"
            para="Track and manage customer due payments"
          />
        </div>

        {/* Stats Cards with Colors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {/* Total Due Card - Blue/Indigo */}
          <div className="border border-gray-200 rounded-2xl p-5 bg-gradient-to-br from-blue-50 to-white shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium uppercase tracking-wide">
                  Total Due
                </p>
                <p className="text-3xl font-bold mt-2 text-blue-700">
                  {formatCurrency(totalDue)}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Across {dueSales.length} customers
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-xl">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          {/* High Dues Card - Red/Orange */}
          <div className="border border-gray-200 rounded-2xl p-5 bg-gradient-to-br from-red-50 to-white shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium uppercase tracking-wide">
                  High Dues
                </p>
                <p className="text-3xl font-bold mt-2 text-red-700">
                  {highDueCount}
                </p>
                <p className="text-xs text-gray-500 mt-2">Above ₹10,000</p>
              </div>
              <div className="p-2 bg-red-100 rounded-xl">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </div>

          {/* Pending Reminders Card - Amber/Orange */}
          <div className="border border-gray-200 rounded-2xl p-5 bg-gradient-to-br from-amber-50 to-white shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-amber-600 font-medium uppercase tracking-wide">
                  Pending Reminders
                </p>
                <p className="text-3xl font-bold mt-2 text-amber-700">
                  {dueSales.length}
                </p>
                <p className="text-xs text-gray-500 mt-2">Ready to send</p>
              </div>
              <div className="p-2 bg-amber-100 rounded-xl">
                <Bell className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                placeholder="Search by customer name or mobile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200 transition-all text-sm"
              />
            </div>

            <div className="relative sm:w-44">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={dueFilter}
                onChange={(e) => setDueFilter(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200 appearance-none text-sm cursor-pointer"
              >
                <option value="all">All dues</option>
                <option value="high">High dues only</option>
              </select>
            </div>

            <div className="relative sm:w-48">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Due List Table - Enhanced with separate columns */}
        <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
          {/* Table Header - Updated with separate columns */}
          <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
            <div className="col-span-4">Customer Details</div>
            <div className="col-span-2">Payment Status</div>
            <div className="col-span-2 text-right">Paid Amount</div>
            <div className="col-span-2 text-right">Due Amount</div>
            <div className="col-span-2 text-right">Action</div>
          </div>

          {dueSales.length === 0 ? (
            <div className="py-16 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
                <CheckCircle2 className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">No due payments found</p>
              <p className="text-xs text-gray-400 mt-1">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {dueSales.map((sale, index) => (
                <div
                  key={sale.id}
                  className="group p-4 md:p-0 md:grid md:grid-cols-12 md:gap-4 md:items-center md:px-6 hover:bg-gray-50 transition-all duration-150"
                >
                  {/* Customer Info */}
                  <div className="md:col-span-4 mb-3 md:mb-0">
                    <div className="flex items-start justify-between md:block">
                      <div className="flex items-start gap-3">
                        <div className="hidden md:block w-8 h-8 rounded-full bg-gray-100 flex-shrink-0 mt-0.5">
                          <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-xs font-medium text-gray-600">
                            {sale.customer.name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-base">
                            {sale.customer.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {sale.customer.mobile}
                          </p>
                          {sale.date && (
                            <p className="text-xs text-gray-400 mt-1 hidden md:block">
                              Sale date:{" "}
                              {new Date(sale.date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      {/* Mobile amount indicator */}
                      <div className="md:hidden text-right">
                        <p className="font-bold text-red-600 text-lg">
                          {formatCurrency(sale.dueAmount)}
                        </p>
                        <p className="text-xs text-gray-500">due</p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Status (Desktop) */}
                  <div className="hidden md:block md:col-span-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                      <span className="text-sm font-medium text-amber-700">
                        Partial Payment
                      </span>
                    </div>
                  </div>

                  {/* Paid Amount (Desktop) - New separate column */}
                  <div className="hidden md:block md:col-span-2 text-right">
                    <p className="font-semibold text-green-600 text-base">
                      {formatCurrency(sale.paidAmount)}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">paid</p>
                  </div>

                  {/* Due Amount (Desktop) */}
                  <div className="hidden md:block md:col-span-2 text-right">
                    <p className="font-bold text-red-600 text-xl">
                      {formatCurrency(sale.dueAmount)}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">outstanding</p>
                  </div>

                  {/* Action Button */}
                  <div className="md:col-span-2 flex justify-end items-center gap-3 mt-3 md:mt-0">
                    <button
                      onClick={async () => {
                        const reminder = await getReminder(sale.id);
                        window.open(reminder.whatsappUrl);
                      }}
                      className="group relative flex items-center gap-2 px-4 py-2 rounded-full border-2 border-gray-200 bg-white text-gray-700 text-sm font-medium hover:border-green-500 hover:bg-green-50 hover:text-green-700 transition-all duration-200 overflow-hidden"
                    >
                      <MessageCircleMore
                        size={16}
                        className="group-hover:scale-110 transition-transform"
                      />
                      <span>Remind</span>
                      <ArrowUpRight
                        size={14}
                        className="opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </button>
                  </div>

                  {/* Mobile extra info - Updated with separate rows */}
                  <div className="md:hidden mt-3 flex flex-col gap-2 text-xs text-gray-500 border-t border-gray-100 pt-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                        <span>Partial Payment</span>
                      </div>
                      <span className="text-green-600 font-medium">
                        Paid: {formatCurrency(sale.paidAmount)}
                      </span>
                    </div>
                    {sale.date && (
                      <div className="text-center text-gray-400">
                        {new Date(sale.date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Note */}
        {dueSales.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 bg-gray-50 inline-block px-4 py-2 rounded-full">
              Showing{" "}
              <span className="font-semibold text-gray-700">
                {dueSales.length}
              </span>{" "}
              due {dueSales.length === 1 ? "payment" : "payments"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payments;
