import { useQueryClient } from "@tanstack/react-query";
import { MaterialIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
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
import * as Haptics from "expo-haptics";
import { Swipeable } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { AppLayout } from "../components/AppLayout";
import { SkeletonProductRow } from "../components/Skeleton";
import { useProductsData } from "../hooks/useProductsData";
import { useDebounce } from "../hooks/useDebounce";
import { deleteProduct } from "../lib/api";
import { queryKeys } from "../lib/query";
import { useAuth } from "../providers/AuthProvider";
import type { Product } from "../types/product";
import type { AppRoute } from "../types/navigation";

type InventoryPageProps = {
  onBack: () => void;
  onAddInventory: () => void;
  onOpenProduct: (productId: string) => void;
  onNavigate: (route: AppRoute) => void;
};

type MaterialIconName = ComponentProps<typeof MaterialIcons>["name"];

const formatCurrency = (value: number) =>
  `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const splitCurrency = (value: number) => {
  const str = formatCurrency(value);
  const dotIdx = str.indexOf(".");
  if (dotIdx === -1) return { main: str, decimal: "" };
  return { main: str.slice(0, dotIdx), decimal: str.slice(dotIdx) };
};

const STOCK_CONFIG = {
  out: { label: "Out of Stock", badge: "bg-red-50",    text: "text-red-700",     dot: "bg-red-500",     qty: "text-red-600"     },
  low: { label: "Low Stock",    badge: "bg-amber-50",  text: "text-amber-700",   dot: "bg-amber-500",   qty: "text-amber-600"   },
  ok:  { label: "In Stock",     badge: "bg-emerald-50",text: "text-emerald-700", dot: "bg-emerald-500", qty: "text-emerald-700" },
} as const;

const getStockConfig = (quantity: number, minQuantity: number) => {
  if (quantity === 0) return STOCK_CONFIG.out;
  if (quantity <= minQuantity) return STOCK_CONFIG.low;
  return STOCK_CONFIG.ok;
};

const initialsFor = (name: string) =>
  name.split(" ").slice(0, 2).map((p) => p[0]?.toUpperCase() || "").join("");

const STAT_DESCRIPTIONS: Record<string, string> = {
  "Products":     "Total number of unique products in your inventory.",
  "Value":        "Total cost value of all current stock on hand.",
  "Projected P/L":"Estimated profit or loss if all current stock is sold at listed prices.",
  "Low Stock":    "Number of products at or below their minimum stock threshold.",
};

export const InventoryPage = ({
  onNavigate,
  onOpenProduct,
}: InventoryPageProps) => {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [statsOpen, setStatsOpen] = useState(true);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search);

  const { error, isLoading, isRefreshing, pagination, products, refetch, summary } =
    useProductsData({ page, limit: 10, category, search: debouncedSearch, lowStockOnly });

  const handleDeleteProduct = (product: Product, close: () => void) => {
    Alert.alert(
      "Delete Product",
      `Delete ${product.name} from inventory? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel", onPress: close },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const token = session?.tokens.accessToken;
            if (!token) { close(); return; }
            close();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            try {
              await deleteProduct(token, product.id);
              await Promise.all([
                queryClient.invalidateQueries({ queryKey: queryKeys.products.all }),
                queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(product.id) }),
                queryClient.invalidateQueries({ queryKey: queryKeys.products.movements(product.id) }),
                queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
              ]);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Toast.show({ type: "success", text1: "Product Deleted", text2: `${product.name} removed from inventory.` });
            } catch (err) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              const msg = err instanceof Error ? err.message : "Failed to delete product";
              Toast.show({ type: "error", text1: "Delete Failed", text2: msg });
            }
          },
        },
      ],
    );
  };

  const stats = [
    {
      label: "Products",
      raw: null,
      display: String(summary.totalProducts),
      icon: "inventory-2",
      iconBg: "#eff6ff",
      iconColor: "#2563eb",
    },
    {
      label: "Value",
      raw: summary.totalValue,
      display: null,
      icon: "payments",
      iconBg: "#fffbeb",
      iconColor: "#d97706",
    },
    {
      label: "Projected P/L",
      raw: summary.projectedProfit,
      display: null,
      icon: "trending-up",
      iconBg: summary.projectedProfit >= 0 ? "#f0fdf4" : "#fef2f2",
      iconColor: summary.projectedProfit >= 0 ? "#16a34a" : "#dc2626",
    },
    {
      label: "Low Stock",
      raw: null,
      display: String(summary.lowStockCount),
      icon: "warning-amber",
      iconBg: "#fef2f2",
      iconColor: "#dc2626",
    },
  ];

  const ListHeader = () => (
    <>
      {/* Overview header */}
      <View className="flex-row justify-between items-center mb-4 mt-1">
        <View>
          <Text className="text-[22px] font-bold text-zinc-900 tracking-tight">Overview</Text>
          <Text className="text-[13px] text-zinc-400 mt-0.5">Inventory health at a glance</Text>
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
            const isOpen = activeTooltip === stat.label;
            const hasCurrency = stat.raw !== null;
            const { main, decimal } = hasCurrency ? splitCurrency(stat.raw!) : { main: "", decimal: "" };

            return (
              <View
                key={stat.label}
                className="bg-white rounded-[20px] p-4 border border-zinc-100"
                style={{ width: "48%" }}
              >
                {/* Icon + info button */}
                <View className="flex-row items-center justify-between mb-3">
                  <View
                    className="h-9 w-9 rounded-xl items-center justify-center"
                    style={{ backgroundColor: stat.iconBg }}
                  >
                    <MaterialIcons name={stat.icon as MaterialIconName} size={17} color={stat.iconColor} />
                  </View>
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

                {/* Tooltip */}
                {isOpen && (
                  <View className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 mb-2.5">
                    <Text className="text-[11px] text-zinc-500 leading-[16px]">
                      {STAT_DESCRIPTIONS[stat.label]}
                    </Text>
                  </View>
                )}

                {/* Value */}
                {hasCurrency ? (
                  <View className="flex-row items-baseline">
                    <Text className="text-[20px] font-bold text-zinc-900 tracking-tight" numberOfLines={1}>
                      {main}
                    </Text>
                    {decimal ? (
                      <Text className="text-[14px] font-semibold text-zinc-300">{decimal}</Text>
                    ) : null}
                  </View>
                ) : (
                  <Text className="text-[20px] font-bold text-zinc-900 tracking-tight" numberOfLines={1}>
                    {stat.display}
                  </Text>
                )}

                <Text className="text-[11px] font-medium text-zinc-400 mt-0.5 uppercase tracking-widest">
                  {stat.label}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Search + filters */}
      <View className="rounded-[20px] bg-white border border-zinc-100 p-4 mb-4">
        <View className="flex-row items-center bg-zinc-50 border border-zinc-200 rounded-2xl px-3.5 py-3 gap-2 mb-3">
          <MaterialIcons name="search" size={17} color="#a1a1aa" />
          <TextInput
            value={search}
            onChangeText={(v) => { setSearch(v); setPage(1); }}
            placeholder="Search products, category or SKU…"
            placeholderTextColor="#a1a1aa"
            className="flex-1 text-[14px] text-zinc-900"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <MaterialIcons name="cancel" size={16} color="#a1a1aa" />
            </Pressable>
          )}
        </View>

        <View className="flex-row flex-wrap gap-2">
          <FilterChip active={category === ""} label="All" onPress={() => { setCategory(""); setPage(1); }} />
          {summary.categories.slice(0, 4).map((item) => (
            <FilterChip
              key={item.category}
              active={category === item.category}
              label={item.category}
              onPress={() => { setCategory(item.category); setPage(1); }}
            />
          ))}
          <FilterChip
            active={lowStockOnly}
            label="⚠ Low Stock"
            onPress={() => { setLowStockOnly((c) => !c); setPage(1); }}
          />
        </View>
      </View>

      {/* Products card top */}
      <View className="rounded-t-[24px] bg-white border border-b-0 border-zinc-100">
        <View className="px-4 pt-5 pb-4 flex-row items-center justify-between">
          <Text className="text-[18px] font-bold text-zinc-900 tracking-tight">Products</Text>
          <Text className="text-[12px] text-zinc-400">{pagination.total ?? products.length} items</Text>
        </View>
        <View className="h-px bg-zinc-100 mx-4" />
      </View>
    </>
  );

  const ListEmpty = () => {
    if (isLoading) {
      return (
        <View className="bg-white border-l border-r border-zinc-100">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonProductRow key={i} />)}
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
          <MaterialIcons name="inventory-2" size={22} color="#a1a1aa" />
        </View>
        <Text className="text-zinc-900 font-semibold text-[14px]">No products found</Text>
        <Text className="text-zinc-400 text-[12px] mt-1">Try adjusting your search or filters</Text>
      </View>
    );
  };

  const ListFooter = () => (
    <View className="rounded-b-[24px] bg-white border border-t-0 border-zinc-100">
      {!isLoading && !error && pagination.totalPages > 1 && (
        <View className="flex-row items-center justify-between px-4 py-4">
          <Pressable
            onPress={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            android_ripple={{ color: "rgba(0,0,0,0.06)", borderless: false }}
            className={`rounded-xl px-4 py-2.5 flex-row items-center gap-1 ${page === 1 ? "bg-zinc-100" : "bg-zinc-900"}`}
          >
            <MaterialIcons name="chevron-left" size={16} color={page === 1 ? "#a1a1aa" : "#fff"} />
            <Text className={`text-[12px] font-semibold ${page === 1 ? "text-zinc-400" : "text-white"}`}>Prev</Text>
          </Pressable>

          <Text className="text-[12px] text-zinc-400">
            {page} / {pagination.totalPages}
          </Text>

          <Pressable
            onPress={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page === pagination.totalPages}
            android_ripple={{ color: "rgba(0,0,0,0.06)", borderless: false }}
            className={`rounded-xl px-4 py-2.5 flex-row items-center gap-1 ${page === pagination.totalPages ? "bg-zinc-100" : "bg-zinc-900"}`}
          >
            <Text className={`text-[12px] font-semibold ${page === pagination.totalPages ? "text-zinc-400" : "text-white"}`}>Next</Text>
            <MaterialIcons name="chevron-right" size={16} color={page === pagination.totalPages ? "#a1a1aa" : "#fff"} />
          </Pressable>
        </View>
      )}
    </View>
  );

  const renderItem = ({ item: product, index }: { item: Product; index: number }) => {
    const stock = getStockConfig(product.quantity, product.minimumQuantity);
    const isLast = index === products.length - 1;

    return (
      <Swipeable
        overshootRight={false}
        friction={2}
        rightThreshold={36}
        renderRightActions={(_, __, swipeable) => (
          <View className={`overflow-hidden bg-red-500 ${isLast ? "rounded-br-[24px]" : ""}`}>
            <Pressable
              onPress={() => handleDeleteProduct(product, () => swipeable.close())}
              android_ripple={{ color: "rgba(255,255,255,0.1)", borderless: false }}
              className="h-full w-[88px] items-center justify-center gap-1"
            >
              <MaterialIcons name="delete-outline" size={20} color="#fff" />
              <Text className="text-[11px] font-semibold text-white">Delete</Text>
            </Pressable>
          </View>
        )}
      >
        <Pressable
          onPress={() => onOpenProduct(product.id)}
          android_ripple={{ color: "rgba(0,0,0,0.04)", borderless: false }}
          className="bg-white border-l border-r border-zinc-100 active:bg-zinc-50 px-4"
        >
          <View className="flex-row items-center gap-3 py-4">
            {/* Initials avatar */}
            <View className="h-11 w-11 rounded-xl bg-zinc-900 items-center justify-center flex-shrink-0">
              <Text className="text-[12px] font-bold text-white">{initialsFor(product.name)}</Text>
            </View>

            {/* Info */}
            <View className="flex-1">
              <View className="flex-row items-center gap-2 mb-0.5">
                <Text className="text-[14px] font-semibold text-zinc-900" numberOfLines={1}>
                  {product.name}
                </Text>
                {/* Status dot badge */}
                <View className={`flex-row items-center gap-1 rounded-full px-2 py-0.5 ${stock.badge}`}>
                  <View className={`w-1.5 h-1.5 rounded-full ${stock.dot}`} />
                  <Text className={`text-[9px] font-bold ${stock.text}`}>{stock.label}</Text>
                </View>
              </View>
              <Text className="text-[12px] text-zinc-400">{product.category}</Text>

              <View className="flex-row items-center justify-between mt-2">
                <Text className="text-[13px] font-bold text-zinc-900">{formatCurrency(product.price)}</Text>
                <Text className={`text-[11px] font-semibold ${stock.qty}`}>
                  {product.quantity} units
                </Text>
              </View>
            </View>

            <MaterialIcons name="chevron-right" size={18} color="#d4d4d8" />
          </View>
          {!isLast && <View className="h-px bg-zinc-50" />}
        </Pressable>
      </Swipeable>
    );
  };

  return (
    <AppLayout
      currentRoute="inventory"
      eyebrow="Stock"
      title="Inventory Atlas"
      subtitle="Monitor stock health, value and product flow."
      onNavigate={onNavigate}
    >
      <FlatList
        data={isLoading ? [] : products}
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