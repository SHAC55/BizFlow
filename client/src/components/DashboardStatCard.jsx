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
    summary: customerSummary,
    isLoading: customersLoading,
    error: customersError,
  } = useCustomers({
    page: 1,
    limit: 1,
  });
  const {
    summary: salesSummary,
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
      sub: error
        ? "Unable to load today sales"
        : `${salesSummary.todaySalesCount} sale${salesSummary.todaySalesCount === 1 ? "" : "s"} recorded`,
      icon: <IndianRupee size={20} />,
      bg: "bg-green-100",
      iconColor: "text-green-600",
      subColor: error ? "text-red-500" : "text-gray-500",
    },
    {
      title: "Pending Payments",
      value: isLoading ? "..." : formatCurrency(salesSummary.totalOutstanding),
      sub: error
        ? "Unable to load pending payments"
        : `${salesSummary.totalSales.toLocaleString("en-IN")} tracked sales`,
      icon: <CreditCard size={20} />,
      bg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      subColor: error ? "text-red-500" : "text-gray-500",
    },
    {
      title: "Total Customers",
      value: isLoading
        ? "..."
        : customerSummary.totalCustomers.toLocaleString("en-IN"),
      sub: error
        ? "Unable to load customer count"
        : `${customerSummary.pendingCustomers} pending balances`,
      icon: <Users size={20} />,
      bg: "bg-blue-100",
      iconColor: "text-blue-600",
      subColor: error ? "text-red-500" : "text-gray-500",
    },
    {
      title: "Monthly Revenue",
      value: isLoading ? "..." : formatCurrency(salesSummary.monthlyRevenue),
      sub: error
        ? "Unable to load monthly revenue"
        : `${formatCurrency(salesSummary.monthlySalesAmount)} sold this month`,
      icon: <TrendingUp size={20} />,
      bg: "bg-purple-100",
      iconColor: "text-purple-600",
      subColor: error ? "text-red-500" : "text-gray-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-6 px-4 md:px-6">
      {stats.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl shadow-sm p-5 flex justify-between items-start 
                     hover:shadow-md transition duration-200"
        >
          {/* Left */}
          <div className="min-w-0">
            <p className="text-sm text-gray-500 font-medium truncate">
              {item.title}
            </p>

            <h2 className="text-2xl md:text-3xl font-bold mt-2">
              {item.value}
            </h2>

            <p className={`text-sm mt-2 ${item.subColor} truncate`}>
              {item.sub}
            </p>
          </div>

          {/* Icon */}
          <div
            className={`p-3 rounded-xl ${item.bg} ${item.iconColor} shrink-0`}
          >
            {item.icon}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStatCard;
