import React from "react";
import {
  IndianRupee,
  CreditCard,
  Users,
  TrendingUp,
} from "lucide-react";
import { useCustomers } from "../hooks/useCustomers";
import { useSales } from "../hooks/useSales";

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const DashboardStatCard = () => {
  const {
    summary: customerSummary = {},
    isLoading: customersLoading,
    error: customersError,
  } = useCustomers({
    page: 1,
    limit: 1,
  });

  const {
    summary: salesSummary = {},
    isLoading: salesLoading,
    error: salesError,
  } = useSales({
    page: 1,
    limit: 1,
  });

  const isLoading = customersLoading || salesLoading;
  const error = customersError || salesError;

  const stats = [
    {
      title: "Today's Sales",
      value: isLoading ? "..." : formatCurrency(salesSummary.todaySalesAmount),
      subtitle: error
        ? "Unable to load today sales"
        : `${salesSummary.todaySalesCount || 0} sale${
            salesSummary.todaySalesCount === 1 ? "" : "s"
          } recorded`,
      icon: IndianRupee,
      bg: "bg-blue-50",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Pending Payments",
      value: isLoading ? "..." : formatCurrency(salesSummary.totalOutstanding),
      subtitle: error
        ? "Unable to load pending payments"
        : `${salesSummary.totalSales || 0} tracked sales`,
      icon: CreditCard,
      bg: "bg-yellow-50",
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
    },
    {
      title: "Total Customers",
      value: isLoading
        ? "..."
        : (customerSummary.totalCustomers || 0).toLocaleString("en-IN"),
      subtitle: error
        ? "Unable to load customers"
        : `${customerSummary.pendingCustomers || 0} pending balances`,
      icon: Users,
      bg: "bg-green-50",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Monthly Revenue",
      value: isLoading ? "..." : formatCurrency(salesSummary.monthlyRevenue),
      subtitle: error
        ? "Unable to load revenue"
        : `${formatCurrency(salesSummary.monthlySalesAmount)} sold this month`,
      icon: TrendingUp,
      bg: "bg-purple-50",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="
      grid 
      grid-cols-1 
      sm:grid-cols-2 
      lg:grid-cols-4 
      gap-3 sm:gap-4 
      mb-6 
      mt-5 
      px-4 sm:px-5
    ">
      {stats.map((stat, i) => {
        const Icon = stat.icon;

        return (
          <div
            key={i}
            className={`
              ${stat.bg} 
              rounded-2xl 
              p-4 sm:p-5 
              border border-neutral-100
              hover:shadow-sm
              transition
            `}
          >
            <div className="flex justify-between items-start">
              <span className="text-xs sm:text-sm text-neutral-600">
                {stat.title}
              </span>

              <div
                className={`${stat.iconBg} p-2 rounded-xl ${stat.iconColor}`}
              >
                <Icon size={18} />
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-semibold mt-2 sm:mt-3 text-neutral-900">
              {stat.value}
            </h2>

            <p className="text-[11px] sm:text-xs text-neutral-500 mt-1">
              {stat.subtitle}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardStatCard;