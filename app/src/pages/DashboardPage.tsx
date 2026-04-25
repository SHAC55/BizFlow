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
    dotColor: "#22C55E",
    badgeBg: "#DCFCE7",
    badgeText: "#15803D",
    avatarBg: "#ECFDF5",
    avatarText: "#065F46",
  },
  partial: {
    label: "Partial",
    dotColor: "#F59E0B",
    badgeBg: "#FEF3C7",
    badgeText: "#B45309",
    avatarBg: "#FEF3C7",
    avatarText: "#B45309",
  },
  pending: {
    label: "Pending",
    dotColor: "#EF4444",
    badgeBg: "#FEE2E2",
    badgeText: "#DC2626",
    avatarBg: "#FEE2E2",
    avatarText: "#DC2626",
  },
} as const;

// Avatar color pools — pick by first letter
const AVATAR_COLORS: Array<{ bg: string; text: string }> = [
  { bg: "#EEF2FF", text: "#4338CA" },
  { bg: "#FEF3C7", text: "#B45309" },
  { bg: "#ECFDF5", text: "#065F46" },
  { bg: "#FEE2E2", text: "#DC2626" },
  { bg: "#F5F3FF", text: "#6D28D9" },
  { bg: "#E0F2FE", text: "#0369A1" },
];

const getAvatarColor = (name: string) =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const QUICK_ACTIONS = [
  {
    name: "Add inventory",
    description: "Stock new items",
    icon: "inventory-2" as const,
    iconBg: "#ECFDF5",
    iconColor: "#059669",
    action: "addInventory" as const,
  },
  {
    name: "Add customer",
    description: "Register new client",
    icon: "groups" as const,
    iconBg: "#EEF2FF",
    iconColor: "#4F46E5",
    action: "customers" as const,
  },
  {
    name: "Add sale",
    description: "Record transaction",
    icon: "credit-card" as const,
    iconBg: "#FFFBEB",
    iconColor: "#D97706",
    action: "sales" as const,
  },
] as const;

export const DashboardPage = ({
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
        eyebrow="Dashboard"
        onNavigate={onNavigate}
        subtitle="Preparing your business workspace."
        title="Command Centre"
      >
        <View className="flex-1 items-center justify-center gap-3">
          <View className="h-10 w-10 rounded-full border-2 border-slate-200 border-t-indigo-500" />
          <Text style={{ fontSize: 13, color: "#94A3B8" }}>
            Loading dashboard…
          </Text>
        </View>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      currentRoute="dashboard"
      eyebrow="Dashboard"
      onNavigate={onNavigate}
      subtitle="Here's your business today."
      title="Dashboard"
    >
      <ScrollView
        style={{ backgroundColor: "#F8FAFE" }}
        contentContainerStyle={{ paddingBottom: 112, paddingHorizontal: 16 }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refetch} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Overview Header */}
        <View className="mt-2 mb-5">
          <Text className="text-[22px] font-bold text-slate-800">Overview</Text>
          <Text className="text-[13px] text-slate-500 mt-1">
            Track your business performance at a glance
          </Text>
        </View>

        {/* Stat Cards */}
        <StatCards
          customerSummary={customerSummary}
          error={error}
          isLoading={isLoading}
          salesSummary={salesSummary}
        />

        {/* Quick Actions */}
        <View className="mt-8">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              Quick Actions
            </Text>
            <Text className="text-[10px] text-slate-400">Tap to create</Text>
          </View>
          <QuickActions
            onOpenAddInventory={onOpenAddInventory}
            onOpenCustomers={onOpenCustomers}
            onOpenSales={onOpenSales}
          />
        </View>

        {/* Recent Sales */}
        <View className="mt-8 mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              Recent Transactions
            </Text>
            <Pressable onPress={onOpenSales} android_ripple={{ color: "rgba(0,0,0,0.08)", borderless: true }}>
              <Text className="text-[11px] font-medium text-indigo-600">
                View all
              </Text>
            </Pressable>
          </View>
          <RecentSales error={error} isLoading={isLoading} sales={sales} />
        </View>
      </ScrollView>
    </AppLayout>
  );
};

// ── Stat Cards ────────────────────────────────────────────────────

type StatCardsProps = {
  customerSummary: DashboardCustomerSummary;
  salesSummary: DashboardSalesSummary;
  isLoading: boolean;
  error: string | null;
};

type StatDef = {
  title: string;
  value: string;
  subtitle: string;
  icon: MaterialIconName;
  isDark?: boolean;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
};

const StatCards = ({
  customerSummary,
  error,
  isLoading,
  salesSummary,
}: StatCardsProps) => {
  const stats: StatDef[] = [
    {
      title: "Today's Sales",
      value: isLoading ? "—" : formatCurrency(salesSummary.todaySalesAmount),
      subtitle: error
        ? "Unable to load"
        : `${salesSummary.todaySalesCount || 0} transaction${
            salesSummary.todaySalesCount === 1 ? "" : "s"
          } today`,
      icon: "trending-up",
      isDark: true,
      trend: salesSummary.todaySalesCount > 0 ? "up" : "neutral",
    },
    {
      title: "Monthly Revenue",
      value: isLoading ? "—" : formatCurrency(salesSummary.monthlyRevenue),
      subtitle: error
        ? "Unable to load"
        : `${formatCurrency(salesSummary.monthlySalesAmount)} total sales`,
      icon: "payments",
      isDark: false,
    },
    {
      title: "Pending Payments",
      value: isLoading ? "—" : formatCurrency(salesSummary.totalOutstanding),
      subtitle: error
        ? "Unable to load"
        : `From ${salesSummary.totalSales || 0} total sales`,
      icon: "credit-card",
      isDark: false,
    },
    {
      title: "Total Customers",
      value: isLoading
        ? "—"
        : (customerSummary.totalCustomers || 0).toLocaleString("en-IN"),
      subtitle: error
        ? "Unable to load"
        : `${customerSummary.pendingCustomers || 0} with pending balance`,
      icon: "groups",
      isDark: true,
    },
  ];

  return (
    <View className="flex-row flex-wrap gap-3">
      {stats.map((stat) => (
        <View
          key={stat.title}
          className={`rounded-xl p-4 ${
            stat.isDark ? "bg-slate-900" : "bg-white"
          }`}
          style={{
            width: "48%",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.04,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <View className="flex-row justify-between items-start mb-3">
            <View
              className={`h-9 w-9 rounded-lg items-center justify-center ${
                stat.isDark ? "bg-white/10" : "bg-slate-100"
              }`}
            >
              <MaterialIcons
                name={stat.icon}
                size={18}
                color={stat.isDark ? "#FFFFFF" : "#475569"}
              />
            </View>
            {stat.trend && stat.trend === "up" && !stat.isDark && (
              <View className="flex-row items-center gap-0.5 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                <MaterialIcons name="arrow-upward" size={10} color="#10B981" />
                <Text className="text-[9px] font-medium text-emerald-600">
                  +{salesSummary.todaySalesCount}
                </Text>
              </View>
            )}
            {stat.trend && stat.trend === "up" && stat.isDark && (
              <View className="flex-row items-center gap-0.5 bg-emerald-500/20 px-1.5 py-0.5 rounded-full">
                <MaterialIcons name="arrow-upward" size={10} color="#34D399" />
                <Text className="text-[9px] font-medium text-emerald-400">
                  +{salesSummary.todaySalesCount}
                </Text>
              </View>
            )}
          </View>

          <Text
            className={`text-[22px] font-bold mb-1 ${
              stat.isDark ? "text-white" : "text-slate-800"
            }`}
          >
            {stat.value}
          </Text>
          <Text
            className={`text-[11px] font-medium ${
              stat.isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            {stat.title}
          </Text>
          <Text
            className={`text-[10px] mt-1 leading-tight ${
              stat.isDark ? "text-slate-500" : "text-slate-400"
            }`}
          >
            {stat.subtitle}
          </Text>
        </View>
      ))}
    </View>
  );
};

// ── Quick Actions ─────────────────────────────────────────────────

const QuickActions = ({
  onOpenAddInventory,
  onOpenCustomers,
  onOpenSales,
}: {
  onOpenAddInventory: () => void;
  onOpenCustomers: () => void;
  onOpenSales: () => void;
}) => {
  const handlers = {
    addInventory: onOpenAddInventory,
    customers: onOpenCustomers,
    sales: onOpenSales,
  };

  return (
    <View className="rounded-xl bg-white border border-slate-100 overflow-hidden shadow-sm">
      {QUICK_ACTIONS.map((action, index) => (
        <Pressable
          key={action.name}
          onPress={handlers[action.action]}
          android_ripple={{ color: "rgba(0,0,0,0.08)", borderless: false }}
          className={`flex-row items-center gap-4 px-4 py-3.5 active:bg-slate-50 ${
            index < QUICK_ACTIONS.length - 1 ? "border-b border-slate-50" : ""
          }`}
        >
          <View
            className="w-10 h-10 rounded-lg items-center justify-center"
            style={{ backgroundColor: action.iconBg }}
          >
            <MaterialIcons
              name={action.icon}
              size={18}
              color={action.iconColor}
            />
          </View>
          <View className="flex-1">
            <Text className="text-[14px] font-semibold text-slate-800">
              {action.name}
            </Text>
            <Text className="text-[11px] text-slate-400 mt-0.5">
              {action.description}
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={18} color="#CBD5E1" />
        </Pressable>
      ))}
    </View>
  );
};

// ── Recent Sales ──────────────────────────────────────────────────

type RecentSalesProps = {
  sales: DashboardSale[];
  isLoading: boolean;
  error: string | null;
};

const RecentSales = ({ error, isLoading, sales }: RecentSalesProps) => (
  <View className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
    {isLoading ? (
      <View className="items-center justify-center py-12">
        <View className="h-8 w-8 rounded-full border-2 border-slate-200 border-t-indigo-500" />
        <Text className="text-[12px] text-slate-400 mt-3">Loading...</Text>
      </View>
    ) : error ? (
      <View className="items-center px-5 py-12">
        <MaterialIcons name="error-outline" size={32} color="#EF4444" />
        <Text className="text-center text-[12px] text-red-500 mt-2">
          {error}
        </Text>
      </View>
    ) : sales.length === 0 ? (
      <View className="items-center px-5 py-12">
        <View className="w-12 h-12 rounded-full bg-slate-100 items-center justify-center mb-3">
          <MaterialIcons name="receipt-long" size={22} color="#94A3B8" />
        </View>
        <Text className="text-[13px] text-slate-500">No sales yet</Text>
        <Text className="text-[11px] text-slate-400 mt-1">
          Start by adding your first sale
        </Text>
      </View>
    ) : (
      sales.slice(0, 5).map((sale, index) => {
        const status = STATUS_CONFIG[sale.status] ?? STATUS_CONFIG.pending;
        const avatar = getAvatarColor(sale.customer.name);
        return (
          <Pressable
            key={sale.id}
            onPress={() => {}}
            android_ripple={{ color: "rgba(0,0,0,0.08)", borderless: false }}
            className={`flex-row items-center gap-3 px-4 py-3 active:bg-slate-50 ${
              index < Math.min(sales.length, 5) - 1
                ? "border-b border-slate-50"
                : ""
            }`}
          >
            {/* Avatar */}
            <View
              className="w-10 h-10 rounded-full items-center justify-center flex-shrink-0"
              style={{ backgroundColor: avatar.bg }}
            >
              <Text
                className="text-[13px] font-semibold"
                style={{ color: avatar.text }}
              >
                {sale.customer.name.charAt(0).toUpperCase()}
              </Text>
            </View>

            {/* Info */}
            <View className="flex-1">
              <View className="flex-row items-center gap-1.5 mb-0.5">
                <Text className="text-[13px] font-semibold text-slate-800">
                  {sale.customer.name}
                </Text>
                <View
                  className="flex-row items-center gap-1 rounded-full px-2 py-0.5"
                  style={{ backgroundColor: status.badgeBg }}
                >
                  <View
                    className="w-1 h-1 rounded-full"
                    style={{ backgroundColor: status.dotColor }}
                  />
                  <Text
                    className="text-[8px] font-bold"
                    style={{ color: status.badgeText }}
                  >
                    {status.label}
                  </Text>
                </View>
              </View>

              <Text
                className="text-[10px] text-slate-500 mb-0.5"
                numberOfLines={1}
              >
                {sale.items
                  .slice(0, 2)
                  .map((item) => `${item.quantity}× ${item.product.name}`)
                  .join(" · ")}
                {sale.items.length > 2 ? ` · +${sale.items.length - 2}` : ""}
              </Text>

              <Text className="text-[9px] text-slate-400">
                {formatDate(sale.createdAt)}
              </Text>
            </View>

            {/* Amount */}
            <View className="items-end">
              <Text className="text-[13px] font-bold text-slate-800">
                {formatCurrency(sale.totalAmount)}
              </Text>
              {sale.dueAmount > 0 ? (
                <Text className="text-[9px] font-medium text-amber-600 mt-0.5">
                  Due {formatCurrency(sale.dueAmount)}
                </Text>
              ) : (
                <Text className="text-[9px] font-medium text-emerald-600 mt-0.5">
                  Paid
                </Text>
              )}
            </View>
          </Pressable>
        );
      })
    )}
    {!isLoading && !error && sales.length > 5 && (
      <Pressable
        onPress={() => {}}
        android_ripple={{ color: "rgba(0,0,0,0.08)", borderless: false }}
        className="py-3 items-center border-t border-slate-50 bg-slate-50/50"
      >
        <Text className="text-[11px] font-medium text-indigo-600">
          View all {sales.length} transactions
        </Text>
      </Pressable>
    )}
  </View>
);
