import { MaterialIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
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
import { SkeletonProductRow } from "../components/Skeleton";
import { useProductsData } from "../hooks/useProductsData";
import { useDebounce } from "../hooks/useDebounce";
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
  `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const STOCK_CONFIG = {
  out: {
    label: "Out of Stock",
    badge: "bg-[#FFF1F2]",
    text: "text-[#BE123C]",
    qty: "text-[#BE123C]",
  },
  low: {
    label: "Low Stock",
    badge: "bg-[#FFFBEB]",
    text: "text-[#B45309]",
    qty: "text-[#B45309]",
  },
  ok: {
    label: "In Stock",
    badge: "bg-[#F0FDF4]",
    text: "text-[#15803D]",
    qty: "text-black",
  },
} as const;

const getStockConfig = (quantity: number, minQuantity: number) => {
  if (quantity === 0) return STOCK_CONFIG.out;
  if (quantity <= minQuantity) return STOCK_CONFIG.low;
  return STOCK_CONFIG.ok;
};

const initialsFor = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

export const InventoryPage = ({
  onNavigate,
  onOpenProduct,
}: InventoryPageProps) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [statsOpen, setStatsOpen] = useState(true);

  const debouncedSearch = useDebounce(search);

  const {
    error,
    isLoading,
    isRefreshing,
    pagination,
    products,
    refetch,
    summary,
  } = useProductsData({
    page,
    limit: 10,
    category,
    search: debouncedSearch,
    lowStockOnly,
  });

  const stats = [
    {
      label: "Products",
      value: summary.totalProducts,
      icon: "inventory-2",
      iconBg: "#DBEAFE",
      iconColor: "#2563EB",
    },
    {
      label: "Value",
      value: formatCurrency(summary.totalValue),
      icon: "payments",
      iconBg: "#FEF3C7",
      iconColor: "#D97706",
    },
    {
      label: "Projected P/L",
      value: formatCurrency(summary.projectedProfit),
      icon: "trending-up",
      iconBg: summary.projectedProfit >= 0 ? "#DCFCE7" : "#FEE2E2",
      iconColor: summary.projectedProfit >= 0 ? "#15803D" : "#DC2626",
    },
    {
      label: "Low Stock",
      value: summary.lowStockCount,
      icon: "warning-amber",
      iconBg: "#FEE2E2",
      iconColor: "#DC2626",
    },
  ];

  const ListHeader = () => (
    <>
      {/* Overview Header with Dropdown */}
      <View className="flex-row justify-between items-start mb-5 mt-2">
        <View>
          <Text className="text-[22px] font-bold text-slate-800">Overview</Text>
          <Text className="text-[13px] text-slate-500 mt-1">
            Track your inventory performance at a glance
          </Text>
        </View>
        <Pressable
          onPress={() => setStatsOpen(!statsOpen)}
          android_ripple={{ color: "rgba(0,0,0,0.08)", borderless: false }}
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
                    name={stat.icon as MaterialIconName}
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

      {/* Search */}
      <View className="rounded-xl bg-white border border-slate-100 p-4 mb-6 shadow-sm">
        <View className="rounded-lg bg-slate-50 px-4 py-3">
          <TextInput
            value={search}
            onChangeText={(value) => {
              setSearch(value);
              setPage(1);
            }}
            placeholder="Search products, category or SKU"
            placeholderTextColor="#94a3b8"
            className="text-[14px] text-slate-800"
          />
        </View>
        <View className="mt-4 flex-row flex-wrap gap-2">
          <FilterChip
            active={category === ""}
            label="All"
            onPress={() => { setCategory(""); setPage(1); }}
          />
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
            label="Low Stock"
            onPress={() => { setLowStockOnly((c) => !c); setPage(1); }}
          />
        </View>
      </View>

      {/* Products card top */}
      <View className="rounded-t-xl bg-white border-t border-l border-r border-slate-100 shadow-sm">
        <View className="border-b border-slate-100 px-5 py-4">
          <Text className="text-[16px] font-bold text-slate-800">Products</Text>
          <Text className="mt-1 text-[12px] text-slate-500">
            Inventory snapshot
          </Text>
        </View>
      </View>
    </>
  );

  const ListEmpty = () => {
    if (isLoading) {
      return (
        <View className="bg-white border-l border-r border-slate-100">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonProductRow key={i} />
          ))}
        </View>
      );
    }
    if (error) {
      return (
        <View className="bg-white border-l border-r border-slate-100 items-center px-5 py-12">
          <MaterialIcons name="error-outline" size={32} color="#EF4444" />
          <Text className="text-center text-[12px] text-red-500 mt-2">{error}</Text>
        </View>
      );
    }
    return (
      <View className="bg-white border-l border-r border-slate-100 items-center px-5 py-12">
        <View className="w-12 h-12 rounded-full bg-slate-100 items-center justify-center mb-3">
          <MaterialIcons name="inventory-2" size={22} color="#94A3B8" />
        </View>
        <Text className="text-[13px] text-slate-500">No products found</Text>
        <Text className="text-[11px] text-slate-400 mt-1">Try adjusting your search</Text>
      </View>
    );
  };

  const ListFooter = () => (
    <View className="rounded-b-xl bg-white border-b border-l border-r border-slate-100 shadow-sm">
      {!isLoading && !error && pagination.totalPages > 1 && (
        <View className="flex-row items-center justify-between px-5 py-4 border-t border-slate-100">
          <Pressable
            onPress={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            android_ripple={{ color: "rgba(0,0,0,0.08)", borderless: false }}
            className={`rounded-xl px-4 py-2 ${page === 1 ? "bg-slate-100" : "bg-slate-900"}`}
          >
            <Text className={`text-[12px] font-medium ${page === 1 ? "text-slate-400" : "text-white"}`}>
              Previous
            </Text>
          </Pressable>
          <Text className="text-[12px] text-slate-500">
            Page {page} of {pagination.totalPages}
          </Text>
          <Pressable
            onPress={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page === pagination.totalPages}
            android_ripple={{ color: "rgba(0,0,0,0.08)", borderless: false }}
            className={`rounded-xl px-4 py-2 ${page === pagination.totalPages ? "bg-slate-100" : "bg-slate-900"}`}
          >
            <Text className={`text-[12px] font-medium ${page === pagination.totalPages ? "text-slate-400" : "text-white"}`}>
              Next
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );

  const renderItem = ({ item: product, index }: { item: Product; index: number }) => {
    const stock = getStockConfig(product.quantity, product.minimumQuantity);
    return (
      <Pressable
        onPress={() => onOpenProduct(product.id)}
        android_ripple={{ color: "rgba(0,0,0,0.08)", borderless: false }}
        className={`px-4 py-4 bg-white border-l border-r border-slate-100 active:bg-slate-50 ${
          index !== products.length - 1 ? "border-b border-slate-100" : ""
        }`}
      >
        <View className="flex-row gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-lg bg-slate-900">
            <Text className="text-[12px] font-semibold text-white">
              {initialsFor(product.name)}
            </Text>
          </View>
          <View className="flex-1">
            <View className="flex-row flex-wrap items-center gap-2 mb-1">
              <Text className="text-[14px] font-semibold text-slate-800">
                {product.name}
              </Text>
              <View className={`rounded-full px-2 py-0.5 ${stock.badge}`}>
                <Text className={`text-[9px] font-semibold ${stock.text}`}>
                  {stock.label}
                </Text>
              </View>
            </View>
            <Text className="text-[11px] text-slate-500">{product.category}</Text>
            <View className="flex-row justify-between items-center mt-2">
              <Text className="text-[13px] font-bold text-slate-800">
                {formatCurrency(product.price)}
              </Text>
              <Text className={`text-[11px] font-medium ${stock.qty}`}>
                Stock: {product.quantity} units
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
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
    android_ripple={{ color: "rgba(0,0,0,0.08)", borderless: true }}
    className={`rounded-full px-4 py-2 ${
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
