import React from "react";
import { IndianRupee, ClipboardList, AlertCircle } from "lucide-react";
import DashboardHeader from "../components/DashboardHeader";
import DashboardStatCard from "../components/DashboardStatCard";
import DashboardQuickActions from "../components/DashboardQuickActions";

const stats = [
  {
    title: "Total Payments",
    value: "₹48,520",
    sub: "↑ 12% from last month",
    icon: <IndianRupee size={20} />,
    bg: "bg-yellow-100",
    iconColor: "text-yellow-600",
    subColor: "text-green-600",
  },
  {
    title: "Pending Orders",
    value: "342",
    sub: "24 awaiting approval",
    icon: <ClipboardList size={20} />,
    bg: "bg-blue-100",
    iconColor: "text-blue-600",
    subColor: "text-gray-500",
  },
  {
    title: "Quality Check Pending",
    value: "28",
    sub: "Requires attention",
    icon: <AlertCircle size={20} />,
    bg: "bg-red-100",
    iconColor: "text-red-600",
    subColor: "text-gray-500",
  },
];

const Dashboard = () => {
  return (
    <div className="p-6  bg-gradient-to-br from-blue-50 to-indigo-100 w-screen md:ml-72 md:mt-0 mt-12 min-w-[350px] min-h-screen">
      
      <DashboardHeader />
      <DashboardStatCard />
      <DashboardQuickActions />

    </div>
  );
};

export default Dashboard;