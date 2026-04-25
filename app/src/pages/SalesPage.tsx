import { MaterialIcons } from "@expo/vector-icons";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { AppLayout } from "../components/AppLayout";
import { useSalesData } from "../hooks/useSalesData";
import type { AppRoute } from "../types/navigation";

type SalesPageProps = {
  onOpenAddSale: () => void;
  onOpenSale: (saleId: string) => void;
  onNavigate: (route: AppRoute) => void;
};

const formatCurrency = (value: number) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const STATUS_CONFIG = {
  paid: {
    label: "Paid",
    badge: "bg-[#ecfdf5]",
    text: "text-[#16a34a]",
  },
  partial: {
    label: "Partial",
    badge: "bg-[#fef3c7]",
    text: "text-[#b45309]",
  },
  pending: {
    label: "Pending",
    badge: "bg-[#fff7ed]",
    text: "text-[#c2410c]",
  },
} as const;

export const SalesPage = ({ onNavigate, onOpenSale }: SalesPageProps) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "paid" | "partial" | "pending">(
    "all",
  );
  const [statsOpen, setStatsOpen] = useState(true);

  const {
    sales,
    summary,
    pagination,
    isLoading,
    isRefreshing,
    error,
    refetch,
  } = useSalesData({
    page,
    limit: 10,
    search,
    status,
  });

  const stats = [
    {
      label: "Collected",
      value: formatCurrency(summary.totalRevenue),
      icon: "payments",
      iconBg: "#DCFCE7",
      iconColor: "#16A34A",
    },
    {
      label: "Outstanding",
      value: formatCurrency(summary.totalOutstanding),
      icon: "account-balance-wallet",
      iconBg: "#FEE2E2",
      iconColor: "#DC2626",
    },
    {
      label: "Today",
      value: formatCurrency(summary.todaySalesAmount),
      icon: "today",
      iconBg: "#DBEAFE",
      iconColor: "#2563EB",
    },
    {
      label: "This Month",
      value: formatCurrency(summary.monthlyRevenue),
      icon: "bar-chart",
      iconBg: "#EDE9FE",
      iconColor: "#7C3AED",
    },
  ];

  const goToNextPage = () => {
    if (page < pagination.totalPages) setPage(page + 1);
  };

  const goToPrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const goToPage = (pageNum: number) => setPage(pageNum);

  return (
    <AppLayout
      currentRoute="sales"
      eyebrow="Finance"
      title="Sales Dashboard"
      subtitle="Track collections, dues and transaction flow."
      onNavigate={onNavigate}
    >
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-4 pb-32 pt-2"
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refetch} />
        }
      >
        {/* Overview Header */}
        <View className="flex-row justify-between items-start mb-5 mt-2">
          <View>
            <Text className="text-[22px] font-bold text-slate-800">
              Overview
            </Text>
            <Text className="text-[13px] text-slate-500 mt-1">
              Track your sales performance at a glance
            </Text>
          </View>
          <Pressable
            onPress={() => setStatsOpen(!statsOpen)}
            className="h-10 w-10 rounded-lg bg-white border border-slate-200 items-center justify-center shadow-sm"
          >
            <MaterialIcons
              name={statsOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"}
              size={22}
              color="#475569"
            />
          </Pressable>
        </View>

        {/* Stats Cards */}
        {statsOpen && (
          <View className="flex-row flex-wrap gap-3 mb-6">
            {stats.map((stat) => (
              <View
                key={stat.label}
                className="bg-white rounded-xl p-4"
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
                    className="h-9 w-9 rounded-lg items-center justify-center"
                    style={{ backgroundColor: stat.iconBg }}
                  >
                    <MaterialIcons
                      name={stat.icon as any}
                      size={18}
                      color={stat.iconColor}
                    />
                  </View>
                </View>
                <Text className="text-[22px] font-bold text-slate-800 mb-1">
                  {stat.value}
                </Text>
                <Text className="text-[11px] font-medium text-slate-500">
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Sales Transactions Section */}
        <View className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">

          {/* Title */}
          <View className="px-4 pt-5 pb-3">
            <Text className="text-[20px] font-bold text-slate-800">
              Sales Transactions
            </Text>
          </View>

          {/* Search Bar */}
          <View className="px-4 mb-3">
            <View className="flex-row items-center bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100">
              <MaterialIcons name="search" size={18} color="#94a3b8" />
              <TextInput
                placeholder="Search customer, item..."
                placeholderTextColor="#94a3b8"
                value={search}
                onChangeText={(value) => {
                  setSearch(value);
                  setPage(1);
                }}
                className="flex-1 text-[14px] text-slate-800 ml-2"
              />
            </View>
          </View>

          {/* Filter Chips */}
          <View className="flex-row px-4 gap-2 mb-4">
            {(["all", "paid", "partial", "pending"] as const).map((item) => (
              <FilterChip
                key={item}
                active={status === item}
                label={item === "all" ? "All" : item.charAt(0).toUpperCase() + item.slice(1)}
                onPress={() => {
                  setStatus(item);
                  setPage(1);
                }}
              />
            ))}
          </View>

          {/* Divider */}
          <View className="h-[0.5px] bg-slate-100 mx-4 mb-2" />

          {/* Transaction List */}
          {isLoading ? (
            <View className="items-center justify-center py-12">
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text className="text-[12px] text-slate-400 mt-3">
                Loading transactions...
              </Text>
            </View>
          ) : error ? (
            <View className="items-center px-5 py-12">
              <MaterialIcons name="error-outline" size={32} color="#EF4444" />
              <Text className="text-center text-[12px] text-red-500 mt-2">
                {error}
              </Text>
              <Pressable
                onPress={refetch}
                className="mt-4 px-4 py-2 bg-slate-100 rounded-lg"
              >
                <Text className="text-[12px] font-medium text-slate-700">
                  Try Again
                </Text>
              </Pressable>
            </View>
          ) : sales.length === 0 ? (
            <View className="items-center px-5 py-12">
              <View className="w-12 h-12 rounded-full bg-slate-100 items-center justify-center mb-3">
                <MaterialIcons name="receipt-long" size={22} color="#94A3B8" />
              </View>
              <Text className="text-[13px] text-slate-500">
                No transactions found
              </Text>
              <Text className="text-[11px] text-slate-400 mt-1">
                Try adjusting your filters
              </Text>
            </View>
          ) : (
            <>
              <View className="px-4 pb-2">
                {sales.map((sale, index) => {
                  const statusStyle =
                    STATUS_CONFIG[sale.status] ?? STATUS_CONFIG.pending;
                  const isLast = index === sales.length - 1;

                  return (
                    <Pressable
                      key={sale.id}
                      onPress={() => onOpenSale(sale.id)}
                      className="active:bg-slate-50"
                    >
                      <View className="flex-row items-center justify-between py-4">
                        {/* Left: Customer + product info */}
                        <View className="flex-1 pr-3">
                          <Text className="text-[15px] font-semibold text-slate-800">
                            {sale.customer.name}
                          </Text>
                          <Text className="mt-0.5 text-[12px] text-slate-400">
                            {sale.items?.[0]?.product?.name || "Sale Item"} •{" "}
                            {formatDate(sale.createdAt)}
                          </Text>
                          {sale.items.length > 1 && (
                            <Text className="text-[11px] text-slate-400 mt-0.5">
                              +{sale.items.length - 1} more item
                              {sale.items.length - 1 > 1 ? "s" : ""}
                            </Text>
                          )}
                        </View>

                        {/* Right: Amount + status */}
                        <View className="items-end">
                          <Text className="text-[15px] font-bold text-slate-800">
                            {formatCurrency(sale.totalAmount)}
                          </Text>
                          <View className={`rounded-full px-2.5 py-0.5 mt-1 ${statusStyle.badge}`}>
                            <Text className={`text-[11px] font-semibold ${statusStyle.text}`}>
                              {statusStyle.label}
                            </Text>
                          </View>
                        </View>

                        <MaterialIcons
                          name="chevron-right"
                          size={20}
                          color="#CBD5E1"
                          style={{ marginLeft: 6 }}
                        />
                      </View>

                      {/* Row divider (skip on last) */}
                      {!isLast && (
                        <View className="h-[0.5px] bg-slate-100" />
                      )}
                    </Pressable>
                  );
                })}
              </View>

              {/* Pagination */}
              <View className="border-t border-slate-100 px-4 py-4">
                {pagination.totalPages > 1 && (
                  <>
                    {/* Prev / Next */}
                    <View className="flex-row items-center justify-between mb-3">
                      <Pressable
                        onPress={goToPrevPage}
                        disabled={page === 1}
                        className={`rounded-xl px-4 py-2 flex-row items-center gap-1 ${
                          page === 1 ? "bg-slate-100" : "bg-slate-900"
                        }`}
                      >
                        <MaterialIcons
                          name="chevron-left"
                          size={16}
                          color={page === 1 ? "#94A3B8" : "#FFFFFF"}
                        />
                        <Text
                          className={`text-[12px] font-medium ${
                            page === 1 ? "text-slate-400" : "text-white"
                          }`}
                        >
                          Previous
                        </Text>
                      </Pressable>

                      <Text className="text-[12px] text-slate-500">
                        Page {page} of {pagination.totalPages}
                      </Text>

                      <Pressable
                        onPress={goToNextPage}
                        disabled={page === pagination.totalPages}
                        className={`rounded-xl px-4 py-2 flex-row items-center gap-1 ${
                          page === pagination.totalPages
                            ? "bg-slate-100"
                            : "bg-slate-900"
                        }`}
                      >
                        <Text
                          className={`text-[12px] font-medium ${
                            page === pagination.totalPages
                              ? "text-slate-400"
                              : "text-white"
                          }`}
                        >
                          Next
                        </Text>
                        <MaterialIcons
                          name="chevron-right"
                          size={16}
                          color={
                            page === pagination.totalPages ? "#94A3B8" : "#FFFFFF"
                          }
                        />
                      </Pressable>
                    </View>

                    {/* Page Number Dots */}
                    <View className="flex-row justify-center items-center gap-2 flex-wrap mb-3">
                      {Array.from(
                        { length: Math.min(5, pagination.totalPages) },
                        (_, i) => {
                          let pageNum;
                          if (pagination.totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (page <= 3) {
                            pageNum = i + 1;
                          } else if (page >= pagination.totalPages - 2) {
                            pageNum = pagination.totalPages - 4 + i;
                          } else {
                            pageNum = page - 2 + i;
                          }

                          return (
                            <Pressable
                              key={pageNum}
                              onPress={() => goToPage(pageNum)}
                              className={`w-8 h-8 rounded-lg items-center justify-center ${
                                page === pageNum ? "bg-slate-900" : "bg-slate-100"
                              }`}
                            >
                              <Text
                                className={`text-[12px] font-medium ${
                                  page === pageNum ? "text-white" : "text-slate-600"
                                }`}
                              >
                                {pageNum}
                              </Text>
                            </Pressable>
                          );
                        },
                      )}

                      {pagination.totalPages > 5 &&
                        page < pagination.totalPages - 2 && (
                          <>
                            <Text className="text-slate-400">...</Text>
                            <Pressable
                              onPress={() => goToPage(pagination.totalPages)}
                              className="w-8 h-8 rounded-lg items-center justify-center bg-slate-100"
                            >
                              <Text className="text-[12px] font-medium text-slate-600">
                                {pagination.totalPages}
                              </Text>
                            </Pressable>
                          </>
                        )}
                    </View>
                  </>
                )}

                {/* Always-visible results summary */}
                <View className="items-center">
                  <Text className="text-[11px] text-slate-400">
                    Showing {(page - 1) * 10 + 1}–
                    {Math.min(page * 10, pagination.total || sales.length)} of{" "}
                    {pagination.total || sales.length} transactions
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </AppLayout>
  );
};

const FilterChip = ({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) => (
  <Pressable
    onPress={onPress}
    className={`rounded-full px-4 py-1.5 ${
      active ? "bg-slate-900" : "bg-slate-100"
    }`}
  >
    <Text
      className={`text-[12px] font-medium ${
        active ? "text-white" : "text-slate-600"
      }`}
    >
      {label}
    </Text>
  </Pressable>
);