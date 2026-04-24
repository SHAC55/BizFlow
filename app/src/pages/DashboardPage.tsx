import { MaterialIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { AppLayout } from "../components/AppLayout";
import { useDashboardData } from "../hooks/useDashboardData";
import type { AuthSession } from "../types/auth";
import type {
  DashboardCustomerSummary,
  DashboardSale,
  DashboardSalesSummary,
} from "../types/dashboard";
import type { AppRoute } from "../types/navigation";

type DashboardPageProps = {
  onLogout: () => Promise<void>;
  onOpenAddInventory: () => void;
  onOpenCustomers: () => void;
  onOpenInventory: () => void;
  onOpenSales: () => void;
  onNavigate: (route: AppRoute) => void;
  session: AuthSession;
};

type MaterialIconName = ComponentProps<typeof MaterialIcons>["name"];

const formatCurrency = (value: number) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });

const formatTimestamp = (value: string | null) =>
  value
    ? new Date(value).toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
      })
    : "Just now";

const STATUS_CONFIG = {
  paid: {
    label: "Paid",
    dot: "bg-[#16A34A]",
    badge: "bg-[#F0FDF4] text-[#15803D]",
  },
  partial: {
    label: "Partial",
    dot: "bg-[#B45309]",
    badge: "bg-[#FFFBEB] text-[#B45309]",
  },
  pending: {
    label: "Pending",
    dot: "bg-[#BE123C]",
    badge: "bg-[#FFF1F2] text-[#BE123C]",
  },
} as const;

const QUICK_ACTIONS = [
  {
    name: "Add Inventory",
    description: "Stock new items",
    icon: "inventory-2" as const,
    gradient: "bg-[#EEF2FF]",
    iconBg: "bg-[#C7D2FE]",
    iconColor: "#4338CA",
    route: "addInventory" as const,
  },
  {
    name: "Add Customer",
    description: "Register new client",
    icon: "groups" as const,
    gradient: "bg-[#ECFDF5]",
    iconBg: "bg-[#A7F3D0]",
    iconColor: "#047857",
    route: "customers" as const,
  },
  {
    name: "Add Sale",
    description: "Record transaction",
    icon: "credit-card" as const,
    gradient: "bg-[#FFF7ED]",
    iconBg: "bg-[#FED7AA]",
    iconColor: "#C2410C",
    route: "sales" as const,
  },
];

export const DashboardPage = ({
  onLogout,
  onNavigate,
  onOpenAddInventory,
  onOpenCustomers,
  onOpenInventory,
  onOpenSales,
  session,
}: DashboardPageProps) => {
  const {
    customerSummary,
    error,
    isLoading,
    isRefreshing,
    lastUpdated,
    refetch,
    sales,
    salesSummary,
  } = useDashboardData();

  if (isLoading && !sales.length) {
    return (
      <AppLayout
        currentRoute="dashboard"
        eyebrow="Workspace"
        onNavigate={onNavigate}
        subtitle="Preparing your business workspace."
        title="Dashboard"
      >
        <View className="h-12 w-12 items-center justify-center rounded-full border-2 border-gray-200 border-t-gray-900" />
        <Text className="mt-4 text-[15px] font-semibold text-gray-700">
          Loading dashboard...
        </Text>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      currentRoute="dashboard"
      eyebrow="Workspace"
      headerRight={
        <Pressable
          onPress={onLogout}
          className="rounded-[20px] border border-black/10 bg-[#f8fafc] px-4 py-3"
        >
          <Text className="text-[13px] font-semibold text-black/70">
            Log out
          </Text>
        </Pressable>
      }
      onNavigate={onNavigate}
      subtitle={`Welcome back${session.user.name ? `, ${session.user.name}` : ""}. Here's the pulse of your business today.`}
      title="Command Center"
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-28"
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refetch} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View className="rounded-[28px] bg-[#0f172a] px-5 py-5">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-[12px] uppercase tracking-[1.8px] text-white/50">
                Snapshot
              </Text>
              <Text className="mt-2 text-[24px] font-extrabold text-white">
                Last updated {formatTimestamp(lastUpdated)}
              </Text>
            </View>
            <View className="rounded-[22px] bg-white/10 px-4 py-3">
              <Text className="text-[12px] font-semibold text-white/80">
                {salesSummary.totalSales} sales tracked
              </Text>
            </View>
          </View>

          <View className="mt-5 flex-row gap-3">
            <View className="flex-1 rounded-[22px] bg-white/8 px-4 py-4">
              <Text className="text-[12px] text-white/55">Invoiced</Text>
              <Text className="mt-2 text-[20px] font-bold text-white">
                {formatCurrency(salesSummary.totalInvoiced)}
              </Text>
            </View>
            <View className="flex-1 rounded-[22px] bg-white/8 px-4 py-4">
              <Text className="text-[12px] text-white/55">Collected</Text>
              <Text className="mt-2 text-[20px] font-bold text-white">
                {formatCurrency(salesSummary.totalRevenue)}
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-5">
          <StatCards
            customerSummary={customerSummary}
            error={error}
            isLoading={isLoading}
            salesSummary={salesSummary}
          />
        </View>

        <View className="mt-6">
          <QuickActions
            onOpenAddInventory={onOpenAddInventory}
            onOpenCustomers={onOpenCustomers}
            onOpenSales={onOpenSales}
          />
        </View>

        <View className="mt-6">
          <RecentSales error={error} isLoading={isLoading} sales={sales} />
        </View>
      </ScrollView>
    </AppLayout>
  );
};

type StatCardsProps = {
  customerSummary: DashboardCustomerSummary;
  salesSummary: DashboardSalesSummary;
  isLoading: boolean;
  error: string | null;
};

const StatCards = ({
  customerSummary,
  error,
  isLoading,
  salesSummary,
}: StatCardsProps) => {
  const stats: Array<{
    title: string;
    value: string;
    subtitle: string;
    icon: MaterialIconName;
    bg: string;
    iconBg: string;
    iconColor: string;
  }> = [
    {
      title: "Today's Sales",
      value: isLoading ? "..." : formatCurrency(salesSummary.todaySalesAmount),
      subtitle: error
        ? "Unable to load today sales"
        : `${salesSummary.todaySalesCount || 0} sale${
            salesSummary.todaySalesCount === 1 ? "" : "s"
          } recorded`,
      icon: "currency-rupee",
      bg: "bg-blue-50",
      iconBg: "bg-blue-100",
      iconColor: "#2563EB",
    },
    {
      title: "Pending Payments",
      value: isLoading ? "..." : formatCurrency(salesSummary.totalOutstanding),
      subtitle: error
        ? "Unable to load pending payments"
        : `${salesSummary.totalSales || 0} tracked sales`,
      icon: "credit-card",
      bg: "bg-yellow-50",
      iconBg: "bg-yellow-100",
      iconColor: "#CA8A04",
    },
    {
      title: "Total Customers",
      value: isLoading
        ? "..."
        : (customerSummary.totalCustomers || 0).toLocaleString("en-IN"),
      subtitle: error
        ? "Unable to load customers"
        : `${customerSummary.pendingCustomers || 0} pending balances`,
      icon: "groups",
      bg: "bg-green-50",
      iconBg: "bg-green-100",
      iconColor: "#16A34A",
    },
    {
      title: "Monthly Revenue",
      value: isLoading ? "..." : formatCurrency(salesSummary.monthlyRevenue),
      subtitle: error
        ? "Unable to load revenue"
        : `${formatCurrency(salesSummary.monthlySalesAmount)} sold this month`,
      icon: "trending-up",
      bg: "bg-purple-50",
      iconBg: "bg-purple-100",
      iconColor: "#9333EA",
    },
  ];

  return (
    <View className="gap-3">
      {stats.map((stat) => (
        <View
          key={stat.title}
          className={`${stat.bg} overflow-hidden rounded-[26px] border border-black/5 px-4 py-4`}
        >
          <View className="flex-row items-start justify-between">
            <Text className="text-[13px] text-neutral-600">{stat.title}</Text>
            <View className={`${stat.iconBg} rounded-2xl p-2.5`}>
              <MaterialIcons
                name={stat.icon}
                size={18}
                color={stat.iconColor}
              />
            </View>
          </View>
          <Text className="mt-3 text-[24px] font-bold text-neutral-900">
            {stat.value}
          </Text>
          <Text className="mt-1 text-[12px] leading-[17px] text-neutral-500">
            {stat.subtitle}
          </Text>
        </View>
      ))}
    </View>
  );
};

const QuickActions = ({
  onOpenAddInventory,
  onOpenCustomers,
  onOpenSales,
}: {
  onOpenAddInventory: () => void;
  onOpenCustomers: () => void;
  onOpenSales: () => void;
}) => (
  <View className="overflow-hidden rounded-[30px] border border-neutral-700/40 bg-neutral-900">
    <View className="px-5 pb-5 pt-5">
      <View className="flex-row items-center gap-2">
        <View className="h-8 w-1.5 rounded-full bg-[#818CF8]" />
        <Text className="text-[12px] font-semibold uppercase tracking-[1.3px] text-neutral-400">
          Quick Actions
        </Text>
      </View>

      <Text className="mt-3 text-[25px] font-extrabold tracking-tight text-white">
        Add anything instantly
      </Text>
      <Text className="mt-2 text-[13px] leading-[19px] text-neutral-400">
        Streamline your workflow with one-tap access to essential operations.
      </Text>

      <View className="mt-5 gap-3">
        {QUICK_ACTIONS.map((action) => (
          <Pressable
            key={action.name}
            onPress={
              action.route === "addInventory"
                ? onOpenAddInventory
                : action.route === "customers"
                  ? onOpenCustomers
                  : onOpenSales
            }
            className="rounded-[26px] border border-neutral-700/70 bg-neutral-900 px-4 py-4"
          >
            <View className="flex-row items-center gap-4">
              <View className={`${action.gradient} rounded-2xl p-3`}>
                <View className={`${action.iconBg} rounded-2xl p-2`}>
                  <MaterialIcons
                    name={action.icon}
                    size={18}
                    color={action.iconColor}
                  />
                </View>
              </View>

              <View className="flex-1">
                <Text className="text-[15px] font-semibold text-white">
                  {action.name}
                </Text>
                <Text className="mt-1 text-[12px] text-neutral-500">
                  {action.description}
                </Text>
              </View>

              <View className="rounded-full bg-white/10 px-3 py-1.5">
                <Text className="text-[10px] font-semibold uppercase tracking-[1.2px] text-white/65">
                  Open
                </Text>
              </View>
            </View>
          </Pressable>
        ))}
      </View>
    </View>

    <View className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-indigo-500/10" />
    <View className="absolute -bottom-10 -left-10 h-24 w-24 rounded-full bg-emerald-500/10" />
  </View>
);

type RecentSalesProps = {
  sales: DashboardSale[];
  isLoading: boolean;
  error: string | null;
};

const RecentSales = ({ error, isLoading, sales }: RecentSalesProps) => (
  <View className="overflow-hidden rounded-[28px] border border-black/8 bg-white">
    <View className="flex-row items-center justify-between border-b border-black/5 px-5 py-4">
      <View>
        <Text className="text-[15px] font-semibold text-black">
          Recent Sales
        </Text>
        <Text className="mt-0.5 text-[12px] text-black/40">
          Latest transactions
        </Text>
      </View>
      <Text className="text-[12px] font-medium text-black/35">Sales</Text>
    </View>

    {isLoading ? (
      <View className="items-center justify-center py-14">
        <Text className="text-[13px] text-black/30">Loading...</Text>
      </View>
    ) : error ? (
      <View className="px-4 py-10">
        <Text className="text-center text-[14px] text-[#BE123C]">{error}</Text>
      </View>
    ) : sales.length === 0 ? (
      <View className="items-center px-4 py-14">
        <View className="mb-3 h-10 w-10 items-center justify-center rounded-full bg-black/5">
          <MaterialIcons name="receipt-long" size={18} color="#6b7280" />
        </View>
        <Text className="text-[14px] text-black/40">No sales yet</Text>
      </View>
    ) : (
      <View>
        {sales.map((sale, index) => {
          const status =
            STATUS_CONFIG[sale.status] ?? STATUS_CONFIG.pending;

          return (
            <View
              key={sale.id}
              className={`px-5 py-4 ${index < sales.length - 1 ? "border-b border-black/5" : ""}`}
            >
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1 flex-row items-start gap-3">
                  <View className="mt-0.5 h-10 w-10 items-center justify-center rounded-full bg-black">
                    <Text className="text-[12px] font-semibold text-white">
                      {sale.customer.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  <View className="flex-1">
                    <View className="flex-row flex-wrap items-center gap-2">
                      <Text className="text-[14px] font-semibold text-black">
                        {sale.customer.name}
                      </Text>
                      <View
                        className={`flex-row items-center gap-1 rounded-full px-2 py-1 ${status.badge}`}
                      >
                        <View className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                        <Text className="text-[10px] font-semibold">
                          {status.label}
                        </Text>
                      </View>
                    </View>

                    <Text
                      className="mt-1 text-[12px] leading-[17px] text-black/40"
                      numberOfLines={1}
                    >
                      {sale.items
                        .slice(0, 2)
                        .map((item) => `${item.quantity}x ${item.product.name}`)
                        .join(" · ")}
                      {sale.items.length > 2
                        ? ` · +${sale.items.length - 2} more`
                        : ""}
                    </Text>

                    <Text className="mt-1 text-[11px] text-black/30">
                      {formatDate(sale.createdAt)}
                    </Text>
                  </View>
                </View>

                <View className="items-end">
                  <Text className="text-[14px] font-bold text-black">
                    {formatCurrency(sale.totalAmount)}
                  </Text>
                  <Text
                    className={`mt-1 text-[11px] ${
                      sale.dueAmount > 0 ? "text-[#B45309]" : "text-[#15803D]"
                    }`}
                  >
                    {sale.dueAmount > 0
                      ? `Due ${formatCurrency(sale.dueAmount)}`
                      : "Fully paid"}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    )}
  </View>
);
