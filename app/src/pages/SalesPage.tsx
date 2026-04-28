import { MaterialIcons } from "@expo/vector-icons";
import {
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from "react-native";
import { useState } from "react";
import { AppLayout } from "../components/AppLayout";
import { SkeletonSaleRow } from "../components/Skeleton";
import { useSalesData } from "../hooks/useSalesData";
import { useDebounce } from "../hooks/useDebounce";
import type { DashboardSale } from "../types/dashboard";
import type { AppRoute } from "../types/navigation";

type SalesPageProps = {
  onOpenAddSale: () => void;
  onOpenSale: (saleId: string) => void;
  onNavigate: (route: AppRoute) => void;
};

const formatCurrency = (value: number) =>
  `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

/** Splits "₹1,23,456.78" → { main: "₹1,23,456", decimal: ".78" } */
const splitCurrency = (value: number) => {
  const str = formatCurrency(value);
  const dotIdx = str.indexOf(".");
  if (dotIdx === -1) return { main: str, decimal: "" };
  return { main: str.slice(0, dotIdx), decimal: str.slice(dotIdx) };
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const STATUS_CONFIG = {
  paid:    { label: "Paid",    badge: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  partial: { label: "Partial", badge: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-500"   },
  pending: { label: "Pending", badge: "bg-red-50",     text: "text-red-600",     dot: "bg-red-500"     },
} as const;

const STAT_DESCRIPTIONS: Record<string, string> = {
  "Collected":   "Total payments received from customers across all sales.",
  "Outstanding": "Total amount still unpaid or partially paid by customers.",
  "Today":       "Total sales amount recorded today.",
  "This Month":  "Total revenue collected in the current calendar month.",
};

export const SalesPage = ({
  onNavigate,
  onOpenSale,
  onOpenAddSale,
}: SalesPageProps) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "paid" | "partial" | "pending">("all");
  const [statsOpen, setStatsOpen] = useState(true);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search);

  const { sales, summary, pagination, isLoading, isRefreshing, error, refetch } =
    useSalesData({ page, limit: 10, search: debouncedSearch, status });

  const stats = [
    { label: "Collected",   raw: summary.totalRevenue,      icon: "payments",               iconBg: "#f0fdf4", iconColor: "#16a34a" },
    { label: "Outstanding", raw: summary.totalOutstanding,  icon: "account-balance-wallet", iconBg: "#fef2f2", iconColor: "#dc2626" },
    { label: "Today",       raw: summary.todaySalesAmount,  icon: "today",                  iconBg: "#eff6ff", iconColor: "#2563eb" },
    { label: "This Month",  raw: summary.monthlyRevenue,    icon: "bar-chart",              iconBg: "#faf5ff", iconColor: "#7c3aed" },
  ];

  const goToNextPage = () => { if (page < pagination.totalPages) setPage(page + 1); };
  const goToPrevPage = () => { if (page > 1) setPage(page - 1); };
  const goToPage = (p: number) => setPage(p);

  const ListHeader = () => (
    <>
      {/* Stats toggle row */}
      <View className="flex-row justify-between items-center mb-4 mt-1">
        <View>
          <Text className="text-[22px] font-bold text-zinc-900 tracking-tight">Overview</Text>
          <Text className="text-[13px] text-zinc-400 mt-0.5">Sales performance at a glance</Text>
        </View>
        <Pressable
          onPress={() => setStatsOpen(!statsOpen)}
          android_ripple={{ color: "rgba(0,0,0,0.06)", borderless: false }}
          className="h-9 w-9 rounded-xl bg-white border border-zinc-200 items-center justify-center"
        >
          <MaterialIcons
            name={statsOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"}
            size={20}
            color="#52525b"
          />
        </Pressable>
      </View>

      {/* Stats grid */}
      {statsOpen && (
        <View className="flex-row flex-wrap gap-3 mb-5">
          {stats.map((stat) => {
            const { main, decimal } = splitCurrency(stat.raw);
            const isOpen = activeTooltip === stat.label;

            return (
              <View
                key={stat.label}
                className="bg-white rounded-[20px] p-4 border border-zinc-100"
                style={{ width: "48%" }}
              >
                {/* Icon row + info button */}
                <View className="flex-row items-center justify-between mb-3">
                  <View
                    className="h-9 w-9 rounded-xl items-center justify-center"
                    style={{ backgroundColor: stat.iconBg }}
                  >
                    <MaterialIcons name={stat.icon as any} size={17} color={stat.iconColor} />
                  </View>

                  {/* ⓘ info button */}
                  <Pressable
                    onPress={() => setActiveTooltip(isOpen ? null : stat.label)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    className={`h-6 w-6 rounded-full items-center justify-center ${isOpen ? "bg-zinc-200" : "bg-zinc-100"}`}
                  >
                    <MaterialIcons
                      name="info-outline"
                      size={13}
                      color={isOpen ? "#18181b" : "#a1a1aa"}
                    />
                  </Pressable>
                </View>

                {/* Tooltip — slides in below icon row */}
                {isOpen && (
                  <View className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 mb-2.5">
                    <Text className="text-[11px] text-zinc-500 leading-[16px]">
                      {STAT_DESCRIPTIONS[stat.label]}
                    </Text>
                  </View>
                )}

                {/* Amount — main bold, decimal dimmed */}
                <View className="flex-row items-baseline gap-0">
                  <Text
                    className="text-[20px] font-bold text-zinc-900 tracking-tight"
                    numberOfLines={1}
                  >
                    {main}
                  </Text>
                  {decimal ? (
                    <Text className="text-[14px] font-semibold text-zinc-300">
                      {decimal}
                    </Text>
                  ) : null}
                </View>

                <Text className="text-[11px] font-medium text-zinc-400 mt-0.5 uppercase tracking-widest">
                  {stat.label}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Table header card */}
      <View className="rounded-t-[24px] bg-white border border-b-0 border-zinc-100">
        <View className="px-4 pt-5 pb-3 flex-row items-center justify-between">
          <Text className="text-[18px] font-bold text-zinc-900 tracking-tight">Transactions</Text>
          <Text className="text-[12px] text-zinc-400">{pagination.total ?? sales.length} total</Text>
        </View>

        {/* Search */}
        <View className="px-4 mb-3">
          <View className="flex-row items-center bg-zinc-50 border border-zinc-200 rounded-2xl px-3.5 py-3 gap-2">
            <MaterialIcons name="search" size={17} color="#a1a1aa" />
            <TextInput
              placeholder="Search customer or item…"
              placeholderTextColor="#a1a1aa"
              value={search}
              onChangeText={(v) => { setSearch(v); setPage(1); }}
              className="flex-1 text-[14px] text-zinc-900"
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch("")}>
                <MaterialIcons name="cancel" size={16} color="#a1a1aa" />
              </Pressable>
            )}
          </View>
        </View>

        {/* Filter chips */}
        <View className="flex-row px-4 gap-2 mb-4">
          {(["all", "paid", "partial", "pending"] as const).map((item) => (
            <FilterChip
              key={item}
              active={status === item}
              label={item === "all" ? "All" : item.charAt(0).toUpperCase() + item.slice(1)}
              onPress={() => { setStatus(item); setPage(1); }}
            />
          ))}
        </View>

        <View className="h-px bg-zinc-100 mx-4" />
      </View>
    </>
  );

  const ListEmpty = () => {
    if (isLoading) {
      return (
        <View className="bg-white border-l border-r border-zinc-100">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonSaleRow key={i} />)}
        </View>
      );
    }
    if (error) {
      return (
        <View className="bg-white border-l border-r border-zinc-100 items-center px-5 py-14">
          <View className="h-12 w-12 rounded-full bg-red-50 items-center justify-center mb-3">
            <MaterialIcons name="error-outline" size={24} color="#ef4444" />
          </View>
          <Text className="text-zinc-900 font-semibold text-[14px]">Something went wrong</Text>
          <Text className="text-zinc-400 text-[12px] mt-1 text-center">{error}</Text>
          <Pressable
            onPress={refetch}
            android_ripple={{ color: "rgba(0,0,0,0.06)", borderless: false }}
            className="mt-4 px-5 py-2.5 bg-zinc-900 rounded-xl"
          >
            <Text className="text-white text-[12px] font-semibold">Try Again</Text>
          </Pressable>
        </View>
      );
    }
    return (
      <View className="bg-white border-l border-r border-zinc-100 items-center px-5 py-14">
        <View className="h-12 w-12 rounded-full bg-zinc-100 items-center justify-center mb-3">
          <MaterialIcons name="receipt-long" size={22} color="#a1a1aa" />
        </View>
        <Text className="text-zinc-900 font-semibold text-[14px]">No transactions</Text>
        <Text className="text-zinc-400 text-[12px] mt-1">Try adjusting your filters</Text>
      </View>
    );
  };

  const ListFooter = () => (
    <View className="rounded-b-[24px] bg-white border border-t-0 border-zinc-100">
      <View className="px-4 py-4">
        {pagination.totalPages > 1 && (
          <View className="flex-row items-center justify-between mb-3">
            <Pressable
              onPress={goToPrevPage}
              disabled={page === 1}
              android_ripple={{ color: "rgba(0,0,0,0.06)", borderless: false }}
              className={`rounded-xl px-4 py-2.5 flex-row items-center gap-1 ${page === 1 ? "bg-zinc-100" : "bg-zinc-900"}`}
            >
              <MaterialIcons name="chevron-left" size={16} color={page === 1 ? "#a1a1aa" : "#fff"} />
              <Text className={`text-[12px] font-semibold ${page === 1 ? "text-zinc-400" : "text-white"}`}>Prev</Text>
            </Pressable>

            <View className="flex-row items-center gap-1.5">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum: number;
                if (pagination.totalPages <= 5) pageNum = i + 1;
                else if (page <= 3) pageNum = i + 1;
                else if (page >= pagination.totalPages - 2) pageNum = pagination.totalPages - 4 + i;
                else pageNum = page - 2 + i;
                return (
                  <Pressable
                    key={pageNum}
                    onPress={() => goToPage(pageNum)}
                    android_ripple={{ color: "rgba(0,0,0,0.06)", borderless: false }}
                    className={`w-8 h-8 rounded-xl items-center justify-center ${page === pageNum ? "bg-zinc-900" : "bg-zinc-100"}`}
                  >
                    <Text className={`text-[12px] font-semibold ${page === pageNum ? "text-white" : "text-zinc-500"}`}>
                      {pageNum}
                    </Text>
                  </Pressable>
                );
              })}
              {pagination.totalPages > 5 && page < pagination.totalPages - 2 && (
                <>
                  <Text className="text-zinc-300 text-[12px]">…</Text>
                  <Pressable
                    onPress={() => goToPage(pagination.totalPages)}
                    android_ripple={{ color: "rgba(0,0,0,0.06)", borderless: false }}
                    className="w-8 h-8 rounded-xl items-center justify-center bg-zinc-100"
                  >
                    <Text className="text-[12px] font-semibold text-zinc-500">{pagination.totalPages}</Text>
                  </Pressable>
                </>
              )}
            </View>

            <Pressable
              onPress={goToNextPage}
              disabled={page === pagination.totalPages}
              android_ripple={{ color: "rgba(0,0,0,0.06)", borderless: false }}
              className={`rounded-xl px-4 py-2.5 flex-row items-center gap-1 ${page === pagination.totalPages ? "bg-zinc-100" : "bg-zinc-900"}`}
            >
              <Text className={`text-[12px] font-semibold ${page === pagination.totalPages ? "text-zinc-400" : "text-white"}`}>Next</Text>
              <MaterialIcons name="chevron-right" size={16} color={page === pagination.totalPages ? "#a1a1aa" : "#fff"} />
            </Pressable>
          </View>
        )}

        <View className="items-center pt-1">
          <Text className="text-[11px] text-zinc-400">
            {(page - 1) * 10 + 1}–{Math.min(page * 10, pagination.total ?? sales.length)} of{" "}
            {pagination.total ?? sales.length} transactions
          </Text>
        </View>
      </View>
    </View>
  );

  const renderItem = ({ item: sale, index }: { item: DashboardSale; index: number }) => {
    const s = STATUS_CONFIG[sale.status] ?? STATUS_CONFIG.pending;
    const isLast = index === sales.length - 1;
    return (
      <Pressable
        onPress={() => onOpenSale(sale.id)}
        android_ripple={{ color: "rgba(0,0,0,0.04)", borderless: false }}
        className="bg-white border-l border-r border-zinc-100 active:bg-zinc-50 px-4"
      >
        <View className="flex-row items-center justify-between py-4">
          <View className="flex-row items-center gap-3 flex-1 pr-3">
            <View className="h-10 w-10 rounded-xl bg-zinc-100 items-center justify-center flex-shrink-0">
              <Text className="text-zinc-700 text-[14px] font-bold">
                {sale.customer.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-[14px] font-semibold text-zinc-900" numberOfLines={1}>
                {sale.customer.name}
              </Text>
              <Text className="text-[12px] text-zinc-400 mt-0.5" numberOfLines={1}>
                {sale.items?.[0]?.product?.name ?? "Sale Item"}
                {sale.items.length > 1 ? ` +${sale.items.length - 1} more` : ""} · {formatDate(sale.createdAt)}
              </Text>
            </View>
          </View>

          <View className="items-end gap-1">
            <Text className="text-[15px] font-bold text-zinc-900">{formatCurrency(sale.totalAmount)}</Text>
            <View className={`flex-row items-center gap-1 rounded-full px-2.5 py-0.5 ${s.badge}`}>
              <View className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
              <Text className={`text-[10px] font-bold ${s.text}`}>{s.label}</Text>
            </View>
          </View>

          <MaterialIcons name="chevron-right" size={18} color="#d4d4d8" style={{ marginLeft: 6 }} />
        </View>
        {!isLast && <View className="h-px bg-zinc-50" />}
      </Pressable>
    );
  };

  return (
    <AppLayout
      currentRoute="sales"
      eyebrow="Finance"
      title="Sales Dashboard"
      subtitle="Track collections, dues and transaction flow."
      onNavigate={onNavigate}
    >
      <FlatList
        data={isLoading ? [] : sales}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={<ListHeader />}
        ListEmptyComponent={<ListEmpty />}
        ListFooterComponent={<ListFooter />}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refetch} />}
        contentContainerClassName="px-4 pb-32 pt-2"
        showsVerticalScrollIndicator={false}
      />
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
    android_ripple={{ color: "rgba(0,0,0,0.06)", borderless: true }}
    className={`rounded-full px-4 py-1.5 border ${
      active ? "bg-zinc-900 border-zinc-900" : "bg-white border-zinc-200"
    }`}
  >
    <Text className={`text-[12px] font-semibold ${active ? "text-white" : "text-zinc-500"}`}>
      {label}
    </Text>
  </Pressable>
);