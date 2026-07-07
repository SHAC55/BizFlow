import { useQueryClient } from "@tanstack/react-query";
import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Swipeable } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import Animated, { FadeInDown } from "react-native-reanimated";
import { deleteService } from "../lib/api";
import { queryKeys } from "../lib/query";
import { useDebounce } from "../hooks/useDebounce";
import { useServicesData } from "../hooks/useServicesData";
import { useAuth } from "../providers/AuthProvider";
import type { Service } from "../types/service";

const fmt = (v: number) =>
  `₹${Number(v || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const formatDuration = (minutes: number | null) => {
  if (!minutes && minutes !== 0) return "—";
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

const initials = (n: string) =>
  n
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || "")
    .join("");

type Props = {
  onOpenService: (serviceId: string) => void;
};

export const InventoryServicesPanel = ({ onOpenService }: Props) => {
  const { session } = useAuth();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const debouncedSearch = useDebounce(search);
  const {
    error,
    isLoading,
    isRefreshing,
    pagination,
    services,
    refetch,
    summary,
  } = useServicesData({
    page,
    limit: 10,
    category,
    search: debouncedSearch,
  });

  const handleDelete = (service: Service, close: () => void) => {
    Alert.alert(
      "Delete Service",
      `Delete ${service.name}? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel", onPress: close },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const token = session?.tokens.accessToken;
            if (!token) {
              close();
              return;
            }
            close();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            try {
              await deleteService(token, service.id);
              await Promise.all([
                qc.invalidateQueries({ queryKey: queryKeys.services.all }),
                qc.invalidateQueries({
                  queryKey: queryKeys.services.detail(service.id),
                }),
              ]);
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success,
              );
              Toast.show({
                type: "success",
                text1: "Deleted",
                text2: `${service.name} removed.`,
              });
            } catch (err) {
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Error,
              );
              Toast.show({
                type: "error",
                text1: "Delete Failed",
                text2: err instanceof Error ? err.message : "",
              });
            }
          },
        },
      ],
    );
  };

  const listHeader = (
    <Animated.View entering={FadeInDown.duration(400)}>
      {/* Stats hero */}
      <View
        className="rounded-[24px] overflow-hidden mb-4 mt-1"
        style={{
          backgroundColor: "#0F172A",
          shadowColor: "#0F172A",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.25,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        <View className="px-5 pt-5 pb-4">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-2">
              <View className="h-8 w-8 rounded-lg bg-indigo-500/20 items-center justify-center">
                <MaterialIcons name="build" size={16} color="#818CF8" />
              </View>
              <Text className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">
                Services Catalog
              </Text>
            </View>
          </View>

          <Text className="text-[34px] font-bold text-white tracking-tight mb-1">
            {summary.totalServices}
          </Text>
          <Text className="text-[12px] text-slate-400">
            {summary.totalServices === 1 ? "service" : "services"} offered
          </Text>

          <View className="flex-row items-center gap-3 mt-5 pt-5 border-t border-white/5">
            <View className="flex-1">
              <Text className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                Avg. price
              </Text>
              <Text className="text-[15px] font-bold text-white">
                {fmt(summary.averagePrice)}
              </Text>
            </View>
            <View className="h-8 w-px bg-white/5" />
            <View className="flex-1">
              <Text className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                Margin
              </Text>
              <Text
                className={`text-[15px] font-bold ${summary.projectedMargin >= 0 ? "text-emerald-300" : "text-red-300"}`}
              >
                {fmt(summary.projectedMargin)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Search */}
      <View className="bg-white rounded-2xl border border-slate-100 px-3.5 py-2.5 flex-row items-center gap-2 mb-3">
        <MaterialIcons name="search" size={17} color="#94A3B8" />
        <TextInput
          value={search}
          onChangeText={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search services…"
          placeholderTextColor="#CBD5E1"
          className="flex-1 text-[14px] text-slate-900"
        />
        {search ? (
          <Pressable onPress={() => setSearch("")}>
            <MaterialIcons name="cancel" size={16} color="#CBD5E1" />
          </Pressable>
        ) : null}
      </View>

      {/* Category chips */}
      {(summary?.categories ?? []).length > 0 && (
        <View className="flex-row flex-wrap gap-2 mb-3">
          <Chip
            active={!category}
            label="All"
            onPress={() => {
              setCategory("");
              setPage(1);
            }}
          />
          {summary.categories.map((c) => (
            <Chip
              key={c.category ?? "uncat"}
              active={category === c.category}
              label={`${c.category ?? "Uncategorized"} (${c.count})`}
              onPress={() => {
                setCategory(c.category ?? "");
                setPage(1);
              }}
            />
          ))}
        </View>
      )}
    </Animated.View>
  );

  const listEmpty = isLoading ? (
    <View className="items-center justify-center py-12">
      <Text className="text-slate-400 text-[12px]">Loading services…</Text>
    </View>
  ) : error ? (
    <View className="items-center justify-center py-12 px-4">
      <MaterialIcons name="error-outline" size={28} color="#EF4444" />
      <Text className="text-red-500 font-semibold text-[14px] mt-2">
        {error}
      </Text>
      <Pressable
        onPress={refetch}
        className="mt-4 px-5 py-2.5 bg-slate-900 rounded-xl"
      >
        <Text className="text-white text-[12px] font-semibold">Retry</Text>
      </Pressable>
    </View>
  ) : (
    <View className="items-center py-12 px-4">
      <View className="h-14 w-14 rounded-2xl bg-slate-100 items-center justify-center mb-3">
        <MaterialIcons name="build" size={24} color="#94A3B8" />
      </View>
      <Text className="text-slate-700 font-semibold text-[14px]">
        No services yet
      </Text>
      <Text className="text-slate-400 text-[12px] mt-1 text-center">
        Add your first service to start selling
      </Text>
    </View>
  );

  const listFooter =
    !isLoading && !error && pagination.totalPages > 1 ? (
      <View className="flex-row items-center justify-between py-4">
        <Pressable
          onPress={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className={`rounded-xl px-4 py-2.5 flex-row items-center gap-1 ${page === 1 ? "bg-slate-100" : "bg-slate-900"}`}
        >
          <MaterialIcons
            name="chevron-left"
            size={16}
            color={page === 1 ? "#94A3B8" : "#fff"}
          />
          <Text
            className={`text-[12px] font-semibold ${page === 1 ? "text-slate-400" : "text-white"}`}
          >
            Prev
          </Text>
        </Pressable>
        <Text className="text-[12px] text-slate-400">
          {page} / {pagination.totalPages}
        </Text>
        <Pressable
          onPress={() =>
            setPage((p) => Math.min(pagination.totalPages, p + 1))
          }
          disabled={page === pagination.totalPages}
          className={`rounded-xl px-4 py-2.5 flex-row items-center gap-1 ${page === pagination.totalPages ? "bg-slate-100" : "bg-slate-900"}`}
        >
          <Text
            className={`text-[12px] font-semibold ${page === pagination.totalPages ? "text-slate-400" : "text-white"}`}
          >
            Next
          </Text>
          <MaterialIcons
            name="chevron-right"
            size={16}
            color={page === pagination.totalPages ? "#94A3B8" : "#fff"}
          />
        </Pressable>
      </View>
    ) : null;

  const renderItem = ({
    item: service,
    index,
  }: {
    item: Service;
    index: number;
  }) => {
    const isFirst = index === 0;
    const isLast = index === (services?.length ?? 0) - 1;
    const margin = service.price - (service.costPrice || 0);

    return (
      <Swipeable
        overshootRight={false}
        friction={2}
        rightThreshold={36}
        renderRightActions={(_, __, swipeable) => (
          <View
            className={`overflow-hidden bg-red-500 ${isLast ? "rounded-br-2xl" : ""}`}
          >
            <Pressable
              onPress={() => handleDelete(service, () => swipeable.close())}
              android_ripple={{ color: "rgba(255,255,255,0.1)", borderless: false }}
              className="h-full w-[80px] items-center justify-center gap-1"
            >
              <MaterialIcons name="delete-outline" size={18} color="#fff" />
              <Text className="text-[10px] font-semibold text-white">
                Delete
              </Text>
            </Pressable>
          </View>
        )}
      >
        <Pressable
          onPress={() => onOpenService(service.id)}
          android_ripple={{ color: "rgba(0,0,0,0.04)", borderless: false }}
          className={`bg-white active:bg-slate-50 px-4 ${isFirst ? "rounded-t-2xl border-t" : ""} ${isLast ? "rounded-b-2xl border-b" : ""} border-l border-r border-zinc-100`}
        >
          <View className="flex-row items-center gap-3 py-3.5">
            <View className="h-11 w-11 rounded-xl bg-slate-900 items-center justify-center flex-shrink-0">
              <Text className="text-[11px] font-bold text-white">
                {initials(service.name)}
              </Text>
            </View>

            <View className="flex-1">
              <View className="flex-row items-center gap-2 mb-0.5">
                <Text
                  className="text-[14px] font-semibold text-slate-900 flex-shrink"
                  numberOfLines={1}
                >
                  {service.name}
                </Text>
                {service.durationMinutes ? (
                  <View className="flex-row items-center gap-1 rounded-full px-2 py-0.5 bg-indigo-50">
                    <MaterialIcons name="schedule" size={10} color="#6366F1" />
                    <Text className="text-[9px] font-bold text-indigo-700">
                      {formatDuration(service.durationMinutes)}
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text className="text-[11px] text-slate-400" numberOfLines={1}>
                {service.category ?? service.code ?? "Service"}
              </Text>
            </View>

            <View className="items-end">
              <Text className="text-[14px] font-bold text-slate-900">
                {fmt(service.price)}
              </Text>
              <Text
                className={`text-[11px] font-semibold mt-0.5 ${margin >= 0 ? "text-emerald-700" : "text-red-600"}`}
              >
                {margin >= 0 ? "+" : ""}
                {fmt(margin)}
              </Text>
            </View>

            <MaterialIcons
              name="chevron-right"
              size={18}
              color="#d4d4d8"
              style={{ marginLeft: 2 }}
            />
          </View>
          {!isLast && <View className="h-px bg-slate-50" />}
        </Pressable>
      </Swipeable>
    );
  };

  return (
    <FlatList
      data={isLoading ? [] : services}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListHeaderComponent={listHeader}
      ListEmptyComponent={listEmpty}
      ListFooterComponent={listFooter}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={refetch} />
      }
      contentContainerClassName="px-4 pb-32 pt-2"
      showsVerticalScrollIndicator={false}
    />
  );
};

const Chip = ({
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
    className={`rounded-full px-3.5 py-1.5 border ${active ? "bg-slate-900 border-slate-900" : "bg-white border-slate-200"}`}
  >
    <Text
      className={`text-[11px] font-semibold ${active ? "text-white" : "text-slate-600"}`}
    >
      {label}
    </Text>
  </Pressable>
);
