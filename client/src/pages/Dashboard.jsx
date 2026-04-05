import React, { useEffect, useState } from "react";
import DashboardHeader from "../components/DashboardHeader";
import DashboardRecentSales from "../components/DashboardRecentSales";
import DashboardStatCard from "../components/DashboardStatCard";
import DashboardQuickActions from "../components/DashboardQuickActions";
import { useSales } from "../hooks/useSales";

const Dashboard = () => {
  const { sales, isLoading, error } = useSales({
    page: 1,
    limit: 5,
  });
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    if (!isLoading) {
      setLastUpdated(new Date().toISOString());
    }
  }, [isLoading, sales]);

  return (
    <div className="p-6  bg-gradient-to-br from-blue-50 to-indigo-100 w-screen md:ml-72 md:mt-0 mt-12 min-w-[350px] min-h-screen">
      <DashboardHeader lastUpdated={lastUpdated} isRefreshing={isLoading} />
      <DashboardStatCard />
      <DashboardQuickActions />
      <DashboardRecentSales sales={sales} isLoading={isLoading} error={error} />
    </div>
  );
};

export default Dashboard;
