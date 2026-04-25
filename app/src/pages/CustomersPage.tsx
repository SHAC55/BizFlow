import { useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
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
        {
          text: "Cancel",
          style: "cancel",
          onPress: close,
        },
        {
          text: "Archive",
          style: "destructive",
          onPress: async () => {
            const token = session?.tokens.accessToken;
            if (!token) {
              close();
              return;
            }

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
              const msg =
                err instanceof Error ? err.message : "Failed to archive customer";
              Toast.show({
                type: "error",
                text1: "Archive Failed",
                text2: msg,
              });
            }
          },
        },
      ],
    );
  };

  const ListHeader = () => (
    <>
      {/* Add Button */}
      <Pressable
        onPress={onOpenAddCustomer}
        android_ripple={{ color: "rgba(255,255,255,0.1)", borderless: false }}
        className="mt-4 mb-4 flex-row items-center justify-center rounded-2xl bg-black py-4"
      >
        <MaterialIcons name="person-add" size={18} color="#fff" />
        <Text className="ml-2 text-[14px] font-semibold text-white">
          Add Customer
        </Text>
      </Pressable>

      {/* Metric Cards */}
      <View className="rounded-[28px] p-2 mb-1">
        <View className="flex-row gap-3">
          <MetricCard
            label="Customers"
            value={summary.totalCustomers.toLocaleString("en-IN")}
            white
          />
          <MetricCard
            label="Total Due"
            value={formatCurrency(summary.totalDue)}
            red
          />
        </View>
      </View>

      {/* Search */}
      <View className="mt-5 rounded-2xl border border-black/10 bg-white px-4 py-3 flex-row items-center">
        <MaterialIcons name="search" size={18} color="#999" />
        <TextInput
          value={search}
          onChangeText={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Search customer..."
          placeholderTextColor="#999"
          className="ml-2 flex-1 text-[14px]"
        />
      </View>

      {/* Filters */}
      <View className="mt-3 flex-row flex-wrap gap-2 mb-5">
        {(["all", "pending", "cleared", "high_due"] as const).map((item) => (
          <FilterChip
            key={item}
            active={dueStatus === item}
            label={
              item === "high_due"
                ? "High Due"
                : item.charAt(0).toUpperCase() + item.slice(1)
            }
            onPress={() => {
              setDueStatus(item);
              setPage(1);
            }}
          />
        ))}
      </View>

      {/* Card top */}
      <View className="rounded-t-[28px] border-t border-l border-r border-black/10 bg-white">
        <View className="px-5 py-4 border-b border-black/5">
          <Text className="text-[16px] font-semibold text-black">Customers</Text>
          <Text className="text-[12px] text-black/35 mt-1">
            Customer health & dues
          </Text>
        </View>
      </View>
    </>
  );

  const ListEmpty = () => {
    if (isLoading) {
      return (
        <View className="bg-white border-l border-r border-black/10">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCustomerRow key={i} />
          ))}
        </View>
      );
    }
    if (error) {
      return (
        <View className="bg-white border-l border-r border-black/10 items-center py-14">
          <MaterialIcons name="error-outline" size={32} color="#EF4444" />
          <Text className="text-center text-[12px] text-red-500 mt-2">{error}</Text>
        </View>
      );
    }
    return (
      <View className="bg-white border-l border-r border-black/10 items-center py-14">
        <Text className="text-[14px] text-black/35">No customers found</Text>
      </View>
    );
  };

  const ListFooter = () => (
    <View className="rounded-b-[28px] border-b border-l border-r border-black/10 bg-white">
      {!isLoading && !error && pagination.totalPages > 1 && (
        <View className="flex-row items-center justify-between border-t border-black/5 px-5 py-4">
          <Pressable
            onPress={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            android_ripple={{ color: "rgba(0,0,0,0.08)", borderless: false }}
            className={`rounded-xl px-4 py-2 ${page === 1 ? "bg-slate-100" : "bg-black"}`}
          >
            <Text className={`text-[12px] font-medium ${page === 1 ? "text-black/40" : "text-white"}`}>
              Previous
            </Text>
          </Pressable>
          <Text className="text-[12px] text-black/40">
            {page} / {pagination.totalPages}
          </Text>
          <Pressable
            onPress={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page === pagination.totalPages}
            android_ripple={{ color: "rgba(0,0,0,0.08)", borderless: false }}
            className={`rounded-xl px-4 py-2 ${page === pagination.totalPages ? "bg-slate-100" : "bg-black"}`}
          >
            <Text className={`text-[12px] font-medium ${page === pagination.totalPages ? "text-black/40" : "text-white"}`}>
              Next
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );

  const renderItem = ({ item: customer, index }: { item: Customer; index: number }) => {
    const cleared = customer.due <= 0;
    const isLast = index === customers.length - 1;
    return (
      <Swipeable
        overshootRight={false}
        friction={2}
        rightThreshold={36}
        renderRightActions={(_, __, swipeable) => (
          <View
            className={`overflow-hidden bg-amber-400 ${
              isLast
                ? "rounded-br-[28px]"
                : ""
            }`}
          >
            <Pressable
              onPress={() => handleArchiveCustomer(customer, () => swipeable.close())}
              android_ripple={{ color: "rgba(0,0,0,0.08)", borderless: false }}
              className="h-full w-[88px] items-center justify-center"
            >
              <MaterialIcons name="archive" size={20} color="#111827" />
              <Text className="mt-1 text-[11px] font-semibold text-slate-900">
                Archive
              </Text>
            </Pressable>
          </View>
        )}
      >
        <Pressable
          onPress={() => onOpenCustomer(customer.id)}
          android_ripple={{ color: "rgba(0,0,0,0.08)", borderless: false }}
          className="px-5 py-4 bg-white border-l border-r border-black/10 active:bg-slate-50"
        >
          <View className="flex-row gap-3">
            <View className="h-12 w-12 rounded-full bg-black items-center justify-center">
              <Text className="text-white font-semibold text-[12px]">
                {initialsFor(customer.name)}
              </Text>
            </View>
            <View className="flex-1">
              <View className="flex-row justify-between items-center">
                <Text className="text-[15px] font-semibold text-black">
                  {customer.name}
                </Text>
                <MaterialIcons name="chevron-right" size={18} color="#aaa" />
              </View>
              <Text className="mt-1 text-[12px] text-black/40">{customer.mobile}</Text>
              <View className="mt-3 flex-row items-center justify-between">
                <Text className="text-[11px] text-black/30">
                  Since {formatDate(customer.createdAt)}
                </Text>
                <View className={`rounded-full px-3 py-1 ${cleared ? "bg-green-50" : "bg-red-50"}`}>
                  <Text className={`text-[10px] font-semibold ${cleared ? "text-green-600" : "text-red-600"}`}>
                    {cleared ? "Cleared" : formatCurrency(customer.due)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          {!isLast && <View className="h-[0.5px] bg-black/5 mt-3" />}
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
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refetch} />}
        contentContainerClassName="px-4 pb-28 pt-2"
        showsVerticalScrollIndicator={false}
      />
    </AppLayout>
  );
};
const MetricCard = ({ label, value, red, white }: any) => (
  <View
    className={`flex-1 rounded-2xl px-4 py-4 ${
      red
        ? "bg-red-500"
        : white
          ? "bg-white border border-black/10"
          : "bg-zinc-100"
    }`}
  >
    <Text className={`text-[11px] ${red ? "text-red-100" : "text-black/45"}`}>
      {label}
    </Text>
    <Text
      className={`mt-2 text-[18px] font-bold ${red ? "text-white" : "text-black"}`}
    >
      {value}
    </Text>
  </View>
);

const FilterChip = ({ active, label, onPress }: any) => (
  <Pressable
    onPress={onPress}
    android_ripple={{ color: "rgba(0,0,0,0.08)", borderless: true }}
    className={`rounded-full px-4 py-2 ${
      active ? "bg-black" : "border border-black/10 bg-white"
    }`}
  >
    <Text className={`text-[12px] ${active ? "text-white" : "text-black/55"}`}>
      {label}
    </Text>
  </Pressable>
);
