import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
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
  });

const STATUS_CONFIG = {
  paid: { label: "Paid", badge: "bg-[#F0FDF4] text-[#15803D]" },
  partial: { label: "Partial", badge: "bg-[#FFFBEB] text-[#B45309]" },
  pending: { label: "Pending", badge: "bg-[#FFF1F2] text-[#BE123C]" },
} as const;

export const SalesPage = ({
  onNavigate,
  onOpenAddSale,
  onOpenSale,
}: SalesPageProps) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "paid" | "partial" | "pending">(
    "all",
  );
  const { sales, summary, pagination, isLoading, isRefreshing, error, refetch } =
    useSalesData({ page, limit: 10, search, status });

  return (
    <AppLayout
      currentRoute="sales"
      eyebrow="Revenue"
      headerRight={
        <Pressable
          onPress={onOpenAddSale}
          className="rounded-[20px] bg-[#0f172a] px-4 py-3"
        >
          <Text className="text-[13px] font-semibold text-white">Add sale</Text>
        </Pressable>
      }
      onNavigate={onNavigate}
      subtitle="Track transactions, recover dues, and monitor payment momentum."
      title="Sales Ledger"
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
          <View className="flex-row gap-3">
            <MetricCard label="Collected" value={formatCurrency(summary.totalRevenue)} />
            <MetricCard
              label="Outstanding"
              value={formatCurrency(summary.totalOutstanding)}
            />
          </View>
          <View className="mt-3 flex-row gap-3">
            <MetricCard label="Today" value={formatCurrency(summary.todaySalesAmount)} />
            <MetricCard
              label="This month"
              value={formatCurrency(summary.monthlyRevenue)}
            />
          </View>
        </View>

        <View className="mt-6 rounded-[28px] border border-black/8 bg-white px-4 py-4">
          <View className="rounded-[22px] border border-black/10 bg-[#f8fafc] px-4 py-2">
            <TextInput
              value={search}
              onChangeText={(value) => {
                setSearch(value);
                setPage(1);
              }}
              placeholder="Search customers or products"
              placeholderTextColor="#94a3b8"
              className="text-[14px] text-black"
            />
          </View>
          <View className="mt-3 flex-row flex-wrap gap-2">
            {(["all", "paid", "partial", "pending"] as const).map((item) => (
              <FilterChip
                key={item}
                active={status === item}
                label={item === "all" ? "All Sales" : item}
                onPress={() => {
                  setStatus(item);
                  setPage(1);
                }}
              />
            ))}
          </View>
        </View>

        <View className="mt-6 overflow-hidden rounded-[28px] border border-black/8 bg-white">
          <View className="border-b border-black/5 px-5 py-4">
            <Text className="text-[15px] font-semibold text-black">Transactions</Text>
            <Text className="mt-0.5 text-[12px] text-black/40">
              Payment health across your recent sales
            </Text>
          </View>

          {isLoading ? (
            <StateMessage text="Loading sales..." />
          ) : error ? (
            <StateMessage error text={error} />
          ) : sales.length === 0 ? (
            <StateMessage text="No sales found" />
          ) : (
            sales.map((sale, index) => {
              const statusStyle = STATUS_CONFIG[sale.status] ?? STATUS_CONFIG.pending;

              return (
                <Pressable
                  key={sale.id}
                  onPress={() => onOpenSale(sale.id)}
                  className={`px-5 py-4 ${index < sales.length - 1 ? "border-b border-black/5" : ""}`}
                >
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-[15px] font-semibold text-black">
                          {sale.customer.name}
                        </Text>
                        <View className={`rounded-full px-2 py-1 ${statusStyle.badge}`}>
                          <Text className="text-[10px] font-semibold">
                            {statusStyle.label}
                          </Text>
                        </View>
                      </View>
                      <Text className="mt-1 text-[12px] text-black/40">
                        {sale.items
                          .slice(0, 2)
                          .map((item) => `${item.quantity}x ${item.product.name}`)
                          .join(" · ")}
                      </Text>
                      <Text className="mt-2 text-[11px] text-black/30">
                        {formatDate(sale.createdAt)}
                      </Text>
                    </View>

                    <View className="items-end">
                      <Text className="text-[15px] font-bold text-black">
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
                </Pressable>
              );
            })
          )}

          {!isLoading && !error && pagination.totalPages > 1 ? (
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onNext={() =>
                setPage((current) => Math.min(current + 1, pagination.totalPages))
              }
              onPrev={() => setPage((current) => Math.max(current - 1, 1))}
            />
          ) : null}
        </View>
      </ScrollView>
    </AppLayout>
  );
};

const MetricCard = ({ label, value }: { label: string; value: string }) => (
  <View className="flex-1 rounded-[22px] bg-white/8 px-4 py-4">
    <Text className="text-[12px] text-white/55">{label}</Text>
    <Text className="mt-2 text-[18px] font-bold text-white">{value}</Text>
  </View>
);

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
    className={`rounded-full px-3 py-2 ${active ? "bg-black" : "bg-black/5"}`}
  >
    <Text
      className={`text-[12px] font-medium capitalize ${active ? "text-white" : "text-black/65"}`}
    >
      {label}
    </Text>
  </Pressable>
);

const StateMessage = ({ error, text }: { error?: boolean; text: string }) => (
  <View className="items-center justify-center px-4 py-14">
    <Text className={`text-[14px] ${error ? "text-[#BE123C]" : "text-black/40"}`}>
      {text}
    </Text>
  </View>
);

const Pagination = ({
  onNext,
  onPrev,
  page,
  totalPages,
}: {
  onNext: () => void;
  onPrev: () => void;
  page: number;
  totalPages: number;
}) => (
  <View className="flex-row items-center justify-between border-t border-black/5 px-5 py-4">
    <Pressable
      onPress={onPrev}
      disabled={page === 1}
      className={`rounded-2xl border px-4 py-2 ${page === 1 ? "border-black/5 opacity-40" : "border-black/10"}`}
    >
      <Text className="text-[12px] font-medium text-black">Previous</Text>
    </Pressable>
    <Text className="text-[12px] text-black/45">
      Page {page} of {totalPages}
    </Text>
    <Pressable
      onPress={onNext}
      disabled={page >= totalPages}
      className={`rounded-2xl border px-4 py-2 ${page >= totalPages ? "border-black/5 opacity-40" : "border-black/10"}`}
    >
      <Text className="text-[12px] font-medium text-black">Next</Text>
    </Pressable>
  </View>
);
