import { MaterialIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
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
import { useProductsData } from "../hooks/useProductsData";
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
    badge: "bg-[#FFF1F2] text-[#BE123C]",
    qty: "text-[#BE123C]",
  },
  low: {
    label: "Low Stock",
    badge: "bg-[#FFFBEB] text-[#B45309]",
    qty: "text-[#B45309]",
  },
  ok: {
    label: "In Stock",
    badge: "bg-[#F0FDF4] text-[#15803D]",
    qty: "text-black",
  },
} as const;

const getStockConfig = (quantity: number, minQuantity: number) => {
  if (quantity === 0) {
    return STOCK_CONFIG.out;
  }

  if (quantity <= minQuantity) {
    return STOCK_CONFIG.low;
  }

  return STOCK_CONFIG.ok;
};

const initialsFor = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

export const InventoryPage = ({
  onAddInventory,
  onBack,
  onNavigate,
  onOpenProduct,
}: InventoryPageProps) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);

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
    search,
    lowStockOnly,
  });

  const stats: Array<{
    label: string;
    value: string | number;
    icon: MaterialIconName;
    bg: string;
    iconBg: string;
    iconColor: string;
  }> = [
    {
      label: "Products",
      value: summary.totalProducts,
      icon: "inventory-2",
      bg: "bg-[#EFF6FF]",
      iconBg: "bg-[#BFDBFE]",
      iconColor: "#1D4ED8",
    },
    {
      label: "Inventory Value",
      value: formatCurrency(summary.totalValue),
      icon: "trending-up",
      bg: "bg-[#F0FDF4]",
      iconBg: "bg-[#BBF7D0]",
      iconColor: "#15803D",
    },
    {
      label: "Projected P/L",
      value: formatCurrency(summary.projectedProfit),
      icon: "insights",
      bg: summary.projectedProfit >= 0 ? "bg-[#ECFDF5]" : "bg-[#FFF1F2]",
      iconBg: summary.projectedProfit >= 0 ? "bg-[#A7F3D0]" : "bg-[#FECDD3]",
      iconColor: summary.projectedProfit >= 0 ? "#065F46" : "#BE123C",
    },
    {
      label: "Low Stock",
      value: summary.lowStockCount,
      icon: "warning-amber",
      bg: "bg-[#FFFBEB]",
      iconBg: "bg-[#FDE68A]",
      iconColor: "#B45309",
    },
  ];

  return (
    <AppLayout
      currentRoute="inventory"
      eyebrow="Stock"
      headerRight={
        <Pressable
          onPress={onAddInventory}
          className="rounded-[20px] bg-[#0f172a] px-4 py-3"
        >
          <Text className="text-[13px] font-semibold text-white">Add item</Text>
        </Pressable>
      }
      onNavigate={onNavigate}
      subtitle="Monitor stock health, value, and product performance in one place."
      title="Inventory Atlas"
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
                Inventory Pulse
              </Text>
              <Text className="mt-2 text-[24px] font-extrabold text-white">
                {summary.totalProducts} active products
              </Text>
            </View>
            <Pressable
              onPress={onBack}
              className="rounded-[20px] bg-white/10 px-4 py-3"
            >
              <Text className="text-[12px] font-semibold text-white/85">
                Dashboard
              </Text>
            </Pressable>
          </View>

          <View className="mt-5 flex-row gap-3">
            <View className="flex-1 rounded-[22px] bg-white/8 px-4 py-4">
              <Text className="text-[12px] text-white/55">Value</Text>
              <Text className="mt-2 text-[18px] font-bold text-white">
                {formatCurrency(summary.totalValue)}
              </Text>
            </View>
            <View className="flex-1 rounded-[22px] bg-white/8 px-4 py-4">
              <Text className="text-[12px] text-white/55">Cost base</Text>
              <Text className="mt-2 text-[18px] font-bold text-white">
                {formatCurrency(summary.totalCostValue)}
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-5 gap-3">
            {stats.map((stat) => (
              <View
                key={stat.label}
                className={`${stat.bg} rounded-[26px] border border-black/5 px-4 py-4`}
              >
                <View className="flex-row items-start justify-between">
                  <Text className="text-[12px] text-black/55">{stat.label}</Text>
                  <View className={`${stat.iconBg} rounded-2xl p-2.5`}>
                    <MaterialIcons
                      name={stat.icon}
                      size={18}
                      color={stat.iconColor}
                    />
                  </View>
                </View>
                <Text className="mt-3 text-[22px] font-bold text-black">
                  {stat.value}
                </Text>
              </View>
            ))}
        </View>

        <View className="mt-6">
          <View className="rounded-[28px] border border-black/8 bg-white px-4 py-4">
            <View className="gap-3">
              <View className="rounded-[22px] border border-black/10 bg-[#f8fafc] px-4 py-2">
                <TextInput
                  value={search}
                  onChangeText={(value) => {
                    setSearch(value);
                    setPage(1);
                  }}
                  placeholder="Search products, categories or SKU"
                  placeholderTextColor="#9ca3af"
                  className="text-[14px] text-black"
                />
              </View>

              <View className="flex-row flex-wrap gap-2">
                <FilterChip
                  active={category === ""}
                  label="All Categories"
                  onPress={() => {
                    setCategory("");
                    setPage(1);
                  }}
                />
                {summary.categories.slice(0, 4).map((item) => (
                  <FilterChip
                    key={item.category}
                    active={category === item.category}
                    label={`${item.category} (${item.count})`}
                    onPress={() => {
                      setCategory(item.category);
                      setPage(1);
                    }}
                  />
                ))}
                <FilterChip
                  active={lowStockOnly}
                  label="Low Stock"
                  onPress={() => {
                    setLowStockOnly((current) => !current);
                    setPage(1);
                  }}
                />
              </View>
            </View>
          </View>
        </View>

        <View className="mt-6">
          <View className="overflow-hidden rounded-[28px] border border-black/8 bg-white">
            <View className="border-b border-black/5 px-5 py-4">
              <Text className="text-[15px] font-semibold text-black">
                Products
              </Text>
              <Text className="mt-0.5 text-[12px] text-black/40">
                Inventory snapshot
              </Text>
            </View>

            {isLoading ? (
              <View className="items-center justify-center py-14">
                <Text className="text-[13px] text-black/30">Loading...</Text>
              </View>
            ) : error ? (
              <View className="px-4 py-10">
                <Text className="text-center text-[14px] text-[#BE123C]">
                  {error}
                </Text>
              </View>
            ) : products.length === 0 ? (
              <View className="items-center px-4 py-14">
                <View className="mb-3 h-10 w-10 items-center justify-center rounded-full bg-black/5">
                  <MaterialIcons name="inventory-2" size={18} color="#6b7280" />
                </View>
                <Text className="text-[14px] text-black/40">
                  No inventory yet
                </Text>
                <Pressable onPress={onAddInventory} className="mt-4 rounded-2xl bg-black px-4 py-3">
                  <Text className="text-[13px] font-semibold text-white">
                    Add your first item
                  </Text>
                </Pressable>
              </View>
            ) : (
              <View>
                {products.map((product, index) => {
                  const stock = getStockConfig(
                    product.quantity,
                    product.minimumQuantity,
                  );

                  return (
                    <Pressable
                      key={product.id}
                      onPress={() => onOpenProduct(product.id)}
                      className={`px-5 py-4 ${index < products.length - 1 ? "border-b border-black/5" : ""}`}
                    >
                      <View className="flex-row items-start gap-3">
                        <View className="mt-0.5 h-11 w-11 items-center justify-center rounded-full bg-black">
                          <Text className="text-[12px] font-semibold text-white">
                            {initialsFor(product.name)}
                          </Text>
                        </View>

                        <View className="flex-1">
                          <View className="flex-row flex-wrap items-center gap-2">
                            <Text className="text-[14px] font-semibold text-black">
                              {product.name}
                            </Text>
                            <View className={`rounded-full px-2 py-1 ${stock.badge}`}>
                              <Text className="text-[10px] font-semibold">
                                {stock.label}
                              </Text>
                            </View>
                          </View>

                          <Text className="mt-1 text-[12px] text-black/40">
                            {product.category}
                            {product.sku ? ` · ${product.sku}` : ""}
                          </Text>

                          <View className="mt-3 flex-row flex-wrap gap-4">
                            <View>
                              <Text className="text-[11px] text-black/30">Price</Text>
                              <Text className="text-[13px] font-semibold text-black">
                                {formatCurrency(product.price)}
                              </Text>
                            </View>
                            <View>
                              <Text className="text-[11px] text-black/30">Cost</Text>
                              <Text className="text-[13px] font-semibold text-black">
                                {formatCurrency(product.costPrice)}
                              </Text>
                            </View>
                            <View>
                              <Text className="text-[11px] text-black/30">Qty</Text>
                              <Text className={`text-[13px] font-semibold ${stock.qty}`}>
                                {product.quantity}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}

            {!isLoading && !error && pagination.totalPages > 1 ? (
              <View className="flex-row items-center justify-between border-t border-black/5 px-5 py-4">
                <Pressable
                  onPress={() => setPage((current) => Math.max(current - 1, 1))}
                  disabled={page === 1}
                  className={`rounded-2xl border px-4 py-2 ${page === 1 ? "border-black/5 opacity-40" : "border-black/10"}`}
                >
                  <Text className="text-[12px] font-medium text-black">Previous</Text>
                </Pressable>
                <Text className="text-[12px] text-black/45">
                  Page {pagination.page} of {pagination.totalPages}
                </Text>
                <Pressable
                  onPress={() =>
                    setPage((current) =>
                      Math.min(current + 1, pagination.totalPages),
                    )
                  }
                  disabled={page >= pagination.totalPages}
                  className={`rounded-2xl border px-4 py-2 ${page >= pagination.totalPages ? "border-black/5 opacity-40" : "border-black/10"}`}
                >
                  <Text className="text-[12px] font-medium text-black">Next</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
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
    className={`rounded-full px-3 py-2 ${active ? "bg-black" : "bg-black/5"}`}
  >
    <Text
      className={`text-[12px] font-medium ${active ? "text-white" : "text-black/65"}`}
    >
      {label}
    </Text>
  </Pressable>
);
