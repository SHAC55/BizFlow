import React, { useEffect, useState } from "react";
import DashboardRecentSales from "../components/DashboardRecentSales";
import DashboardStatCard from "../components/DashboardStatCard";
import DashboardQuickActions from "../components/DashboardQuickActions";
import { useSales } from "../hooks/useSales";
import PageHeader from "../components/PageHeader";
import { LayoutDashboard } from "lucide-react";
import PageLoader from "../components/loaders/PageLoader";

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

  if (isLoading && !lastUpdated) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-100 to-indigo-50 p-4 md:ml-72 md:p-6 md:mt-0 mt-12">
      <PageHeader
        lastUpdated={lastUpdated}
        title="Dashboard"
        icon={LayoutDashboard}
        isRefreshing={isLoading}
      />
      <DashboardStatCard />
      <DashboardQuickActions />
      <DashboardRecentSales sales={sales} isLoading={isLoading} error={error} />
    </div>
  );
};

export default Dashboard;
