import React from "react";
import {
  IndianRupee,
  CreditCard,
  Users,
  TrendingUp,
} from "lucide-react";

const stats = [
  {
    title: "Today's Sales",
    value: "₹12,430",
    sub: "↑ 8% from yesterday",
    icon: <IndianRupee size={20} />,
    bg: "bg-green-100",
    iconColor: "text-green-600",
    subColor: "text-green-600",
  },
  {
    title: "Pending Payments",
    value: "₹8,200",
    sub: "5 invoices unpaid",
    icon: <CreditCard size={20} />,
    bg: "bg-yellow-100",
    iconColor: "text-yellow-600",
    subColor: "text-gray-500",
  },
  {
    title: "Total Customers",
    value: "1,284",
    sub: "↑ 12 new this week",
    icon: <Users size={20} />,
    bg: "bg-blue-100",
    iconColor: "text-blue-600",
    subColor: "text-green-600",
  },
  {
    title: "Monthly Revenue",
    value: "₹2.4L",
    sub: "↑ 18% from last month",
    icon: <TrendingUp size={20} />,
    bg: "bg-purple-100",
    iconColor: "text-purple-600",
    subColor: "text-green-600",
  },
];

const DashboardStatCard = () => {
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