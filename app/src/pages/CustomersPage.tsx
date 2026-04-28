import { useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Swipeable } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { AppLayout } from "../components/AppLayout";
import { SkeletonCustomerRow } from "../components/Skeleton";
import { archiveCustomer } from "../lib/api";
import { queryKeys } from "../lib/query";
import { useCustomersData } from "../hooks/useCustomersData";
import { useDebounce } from "../hooks/useDebounce";
import { useAuth } from "../providers/AuthProvider";
import type { Customer } from "../types/customer";
import type { AppRoute } from "../types/navigation";

type CustomersPageProps = {
  onOpenAddCustomer: () => void;
  onOpenCustomer: (customerId: string) => void;
  onNavigate: (route: AppRoute) => void;
};

const formatCurrency = (value: number) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });

const initialsFor = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0]?.toUpperCase() || "")
    .join("")
    .slice(0, 2);

export const CustomersPage = ({
  onNavigate,
  onOpenAddCustomer,
  onOpenCustomer,
}: CustomersPageProps) => {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [dueStatus, setDueStatus] = useState<
    "all" | "pending" | "cleared" | "high_due"
  >("all");

  const debouncedSearch = useDebounce(search);

  const {
    customers,
    summary,
    pagination,
    isLoading,
    isRefreshing,
    error,
    refetch,
  } = useCustomersData({
    page,
    limit: 10,
    search: debouncedSearch,
    dueStatus,
  });

  const handleArchiveCustomer = (customer: Customer, close: () => void) => {
    Alert.alert(
      "Archive Customer",
      `Archive ${customer.name} and hide them from the active list?`,
      [
        { text: "Cancel", style: "cancel", onPress: close },
        {
          text: "Archive",
          style: "destructive",
          onPress: async () => {
            const token = session?.tokens.accessToken;
            if (!token) { close(); return; }
            close();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            try {
              await archiveCustomer(token, customer.id);
              await Promise.all([
                queryClient.invalidateQueries({ queryKey: queryKeys.customers.all }),
                queryClient.invalidateQueries({ queryKey: queryKeys.customers.detail(customer.id) }),
                queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
                queryClient.invalidateQueries({ queryKey: queryKeys.sales.all }),
              ]);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Toast.show({
                type: "success",
                text1: "Customer Archived",
                text2: `${customer.name} moved out of the active list.`,
              });
            } catch (err) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              const msg = err instanceof Error ? err.message : "Failed to archive customer";
              Toast.show({ type: "error", text1: "Archive Failed", text2: msg });
            }
          },
        },
      ],
    );
  };

  const ListHeader = () => (
    <>
      {/* ── Add Button ── */}
      <Pressable
        onPress={onOpenAddCustomer}
        android_ripple={{ color: "rgba(255,255,255,0.15)", borderless: false }}
        className="mt-3 mb-4 flex-row items-center justify-center gap-2 bg-zinc-900 py-4 rounded-2xl"
      >
        <MaterialIcons name="person-add" size={16} color="#fff" />
        <Text className="text-white font-semibold text-[14px]">Add Customer</Text>
      </Pressable>

      {/* ── Hero Stats Card ── */}
      <View className="bg-zinc-900 rounded-[28px] px-5 pt-5 pb-6 mb-4 overflow-hidden">
        {/* Decorative rings */}
        <View
          className="absolute -right-10 -top-10 w-48 h-48 rounded-full border border-white/5"
          pointerEvents="none"
        />
        <View
          className="absolute -right-4 -top-4 w-32 h-32 rounded-full border border-white/5"
          pointerEvents="none"
        />

        <Text className="text-white/40 text-[11px] font-medium tracking-widest uppercase mb-4">
          Overview
        </Text>

        <View className="flex-row gap-3">
          {/* Total customers */}
          <View className="flex-1 bg-white/8 rounded-2xl px-4 py-3">
            <Text className="text-white/40 text-[10px] uppercase tracking-widest mb-1">
              Customers
            </Text>
            <Text className="text-white text-[26px] font-bold leading-none">
              {summary.totalCustomers.toLocaleString("en-IN")}
            </Text>
          </View>

          {/* Total due */}
          <View className="flex-1 bg-white/8 rounded-2xl px-4 py-3">
            <Text className="text-white/40 text-[10px] uppercase tracking-widest mb-1">
              Total Due
            </Text>
            <Text className="text-red-400 text-[22px] font-bold leading-none">
              {formatCurrency(summary.totalDue)}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Search ── */}
      <View className="flex-row items-center bg-white border border-zinc-200 rounded-2xl px-4 mb-3 overflow-hidden">
        <MaterialIcons name="search" size={18} color="#a1a1aa" />
        <TextInput
          value={search}
          onChangeText={(v) => { setSearch(v); setPage(1); }}
          placeholder="Search customers…"
          placeholderTextColor="#a1a1aa"
          className="flex-1 py-4 pl-3 text-zinc-900 text-[14px]"
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch("")}>
            <MaterialIcons name="cancel" size={18} color="#a1a1aa" />
          </Pressable>
        )}
      </View>

      {/* ── Filter Chips ── */}
      <View className="flex-row flex-wrap gap-2 mb-4">
        {(["all", "pending", "cleared", "high_due"] as const).map((item) => (
          <FilterChip
            key={item}
            active={dueStatus === item}
            label={item === "high_due" ? "High Due" : item.charAt(0).toUpperCase() + item.slice(1)}
            onPress={() => { setDueStatus(item); setPage(1); }}
          />
        ))}
      </View>

      {/* ── List card top ── */}
      <View className="bg-white rounded-t-[24px] border border-zinc-100 px-5 py-4 border-b-0">
        <Text className="text-zinc-900 text-[15px] font-bold">Customers</Text>
        <Text className="text-zinc-400 text-[12px] mt-0.5">Customer health & dues</Text>
      </View>
    </>
  );

  const ListEmpty = () => {
    if (isLoading) {
      return (
        <View className="bg-white border-x border-zinc-100">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCustomerRow key={i} />
          ))}
        </View>
      );
    }
    if (error) {
      return (
        <View className="bg-white border-x border-zinc-100 items-center py-16">
          <MaterialIcons name="error-outline" size={36} color="#ef4444" />
          <Text className="text-red-500 text-[13px] mt-2 font-medium">{error}</Text>
        </View>
      );
    }
    return (
      <View className="bg-white border-x border-zinc-100 items-center py-16">
        <MaterialIcons name="people-outline" size={36} color="#d4d4d8" />
        <Text className="text-zinc-400 text-[13px] mt-2">No customers found</Text>
      </View>
    );
  };

  const ListFooter = () => (
    <View className="bg-white rounded-b-[24px] border border-zinc-100 border-t-0">
      {!isLoading && !error && pagination.totalPages > 1 && (
        <View className="flex-row items-center justify-between border-t border-zinc-100 px-5 py-4">
          <Pressable
            onPress={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            android_ripple={{ color: "rgba(0,0,0,0.06)", borderless: false }}
            className={`rounded-xl px-4 py-2.5 ${page === 1 ? "bg-zinc-100" : "bg-zinc-900"}`}
          >
            <Text className={`text-[12px] font-semibold ${page === 1 ? "text-zinc-400" : "text-white"}`}>
              Previous
            </Text>
          </Pressable>
          <Text className="text-zinc-400 text-[12px]">
            {page} / {pagination.totalPages}
          </Text>
          <Pressable
            onPress={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page === pagination.totalPages}
            android_ripple={{ color: "rgba(0,0,0,0.06)", borderless: false }}
            className={`rounded-xl px-4 py-2.5 ${page === pagination.totalPages ? "bg-zinc-100" : "bg-zinc-900"}`}
          >
            <Text className={`text-[12px] font-semibold ${page === pagination.totalPages ? "text-zinc-400" : "text-white"}`}>
              Next
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );

  const renderItem = ({
    item: customer,
    index,
  }: {
    item: Customer;
    index: number;
  }) => {
    const cleared = customer.due <= 0;
    const isLast = index === customers.length - 1;

    return (
      <Swipeable
        overshootRight={false}
        friction={2}
        rightThreshold={36}
        renderRightActions={(_, __, swipeable) => (
          <View
            className={`bg-amber-400 overflow-hidden ${isLast ? "rounded-br-[24px]" : ""}`}
          >
            <Pressable
              onPress={() => handleArchiveCustomer(customer, () => swipeable.close())}
              android_ripple={{ color: "rgba(0,0,0,0.08)", borderless: false }}
              className="h-full w-[88px] items-center justify-center gap-1"
            >
              <MaterialIcons name="archive" size={20} color="#18181b" />
              <Text className="text-[11px] font-bold text-zinc-900">Archive</Text>
            </Pressable>
          </View>
        )}
      >
        <Pressable
          onPress={() => onOpenCustomer(customer.id)}
          android_ripple={{ color: "rgba(0,0,0,0.04)", borderless: false }}
          className={`bg-white border-x border-zinc-100 px-5 py-4 active:bg-zinc-50 ${
            !isLast ? "border-b border-zinc-100" : ""
          }`}
        >
          <View className="flex-row items-center gap-3">
            {/* Avatar */}
            <View className="h-11 w-11 rounded-2xl bg-zinc-900 items-center justify-center flex-shrink-0">
              <Text className="text-white font-bold text-[13px]">
                {initialsFor(customer.name)}
              </Text>
            </View>

            {/* Info */}
            <View className="flex-1 min-w-0">
              <View className="flex-row items-center justify-between">
                <Text className="text-zinc-900 text-[15px] font-semibold" numberOfLines={1}>
                  {customer.name}
                </Text>
                <View
                  className={`flex-row items-center gap-1 px-2.5 py-1 rounded-full ${
                    cleared ? "bg-emerald-50" : "bg-red-50"
                  }`}
                >
                  <View
                    className={`w-1.5 h-1.5 rounded-full ${
                      cleared ? "bg-emerald-500" : "bg-red-500"
                    }`}
                  />
                  <Text
                    className={`text-[10px] font-bold ${
                      cleared ? "text-emerald-700" : "text-red-700"
                    }`}
                  >
                    {cleared ? "Cleared" : formatCurrency(customer.due)}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center justify-between mt-1.5">
                <Text className="text-zinc-400 text-[12px]">{customer.mobile}</Text>
                <Text className="text-zinc-300 text-[11px]">
                  Since {formatDate(customer.createdAt)}
                </Text>
              </View>
            </View>

            <MaterialIcons name="chevron-right" size={18} color="#d4d4d8" />
          </View>
        </Pressable>
      </Swipeable>
    );
  };

  return (
    <AppLayout
      currentRoute="customers"
      onNavigate={onNavigate}
      title="Customer Book"
      subtitle="Track relationships & payments"
    >
      <FlatList
        data={isLoading ? [] : customers}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={<ListHeader />}
        ListEmptyComponent={<ListEmpty />}
        ListFooterComponent={<ListFooter />}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refetch} />
        }
        contentContainerClassName="px-4 pb-28 pt-2"
        showsVerticalScrollIndicator={false}
      />
    </AppLayout>
  );
};

/* ─── Sub-components ─────────────────────────────────────── */

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
    className={`rounded-full px-4 py-2 ${
      active ? "bg-zinc-900" : "bg-white border border-zinc-200"
    }`}
  >
    <Text
      className={`text-[12px] font-semibold ${
        active ? "text-white" : "text-zinc-500"
      }`}
    >
      {label}
    </Text>
  </Pressable>
);