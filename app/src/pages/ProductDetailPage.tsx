import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";
import { AppLayout } from "../components/AppLayout";
import {
  adjustProductStock,
  deleteProduct,
  fetchProduct,
  fetchProductMovements,
} from "../lib/api";
import { queryKeys } from "../lib/query";
import { useAuth } from "../providers/AuthProvider";
import type { InventoryMovement, Product } from "../types/product";
import type { AppRoute } from "../types/navigation";

type ProductDetailPageProps = {
  onBack: () => void;
  onEdit: () => void;
  onNavigate: (route: AppRoute) => void;
  productId: string;
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

export const ProductDetailPage = ({
  onBack,
  onEdit,
  onNavigate,
  productId,
}: ProductDetailPageProps) => {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const [product, setProduct] = useState<Product | null>(null);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const load = async (refresh = false) => {
    const token = session?.tokens.accessToken;
    if (!token) return;

    refresh ? setIsRefreshing(true) : setIsLoading(true);

    try {
      setError(null);
      const [nextProduct, nextMovements] = await Promise.all([
        fetchProduct(token, productId),
        fetchProductMovements(token, productId),
      ]);
      setProduct(nextProduct);
      setMovements(nextMovements);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, [productId]);

  const handleAdjustStock = async () => {
    const token = session?.tokens.accessToken;
    if (!token || !product) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsUpdating(true);

    try {
      await adjustProductStock(token, product.id, {
        type: "SET",
        quantity: Number(quantity),
        reason: reason || "manual stock update",
      });

      setQuantity("");
      setReason("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.products.all }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.products.detail(product.id),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.products.movements(product.id),
        }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
      ]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({
        type: "success",
        text1: "Stock Updated",
        text2: "Inventory level has been adjusted.",
      });
      load(true);
    } catch (adjustError) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const msg =
        adjustError instanceof Error
          ? adjustError.message
          : "Failed to adjust stock";
      setError(msg);
      Toast.show({ type: "error", text1: "Update Failed", text2: msg });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Product",
      "This will permanently remove the product and its history. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const accessToken = session?.tokens.accessToken;
            if (!accessToken || !product) return;
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            try {
              await deleteProduct(accessToken, product.id);
              await Promise.all([
                queryClient.invalidateQueries({
                  queryKey: queryKeys.products.all,
                }),
                queryClient.invalidateQueries({
                  queryKey: queryKeys.products.detail(product.id),
                }),
                queryClient.invalidateQueries({
                  queryKey: queryKeys.products.movements(product.id),
                }),
                queryClient.invalidateQueries({
                  queryKey: queryKeys.dashboard.all,
                }),
              ]);
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success,
              );
              Toast.show({ type: "success", text1: "Product Deleted" });
              onBack();
            } catch (deleteError) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              const msg =
                deleteError instanceof Error
                  ? deleteError.message
                  : "Failed to delete product";
              setError(msg);
              Toast.show({ type: "error", text1: "Delete Failed", text2: msg });
            }
          },
        },
      ],
    );
  };

  const isLowStock =
    product && product.quantity <= Number(product.minimumQuantity);

  const stockPct = product
    ? Math.min(
        100,
        Math.round((product.quantity / (Number(product.minimumQuantity) * 3 || 1)) * 100),
      )
    : 0;

  return (
    <AppLayout
      currentRoute="inventory"
      onNavigate={onNavigate}
      title={product?.name ?? "Product Detail"}
      subtitle="Manage stock & product insights"
    >
      <ScrollView
        className="flex-1 bg-zinc-50"
        contentContainerClassName="px-4 pt-3 pb-32"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => load(true)}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* ── Top Action Bar ── */}
        <View className="flex-row items-center gap-2 mb-4">
          <Pressable
            onPress={onBack}
            android_ripple={{ color: "rgba(0,0,0,0.06)", borderless: false }}
            className="flex-row items-center gap-1.5 bg-white border border-zinc-200 px-4 py-3 rounded-2xl"
          >
            <MaterialIcons name="arrow-back-ios-new" size={14} color="#18181b" />
            <Text className="text-zinc-900 font-semibold text-[13px]">Back</Text>
          </Pressable>

          <Pressable
            onPress={onEdit}
            android_ripple={{ color: "rgba(255,255,255,0.15)", borderless: false }}
            className="flex-1 flex-row items-center justify-center gap-2 bg-zinc-900 px-4 py-3 rounded-2xl"
          >
            <MaterialIcons name="edit" size={16} color="#fff" />
            <Text className="text-white font-semibold text-[13px]">Edit Product</Text>
          </Pressable>

          <Pressable
            onPress={handleDelete}
            android_ripple={{ color: "rgba(239,68,68,0.1)", borderless: false }}
            className="bg-red-50 border border-red-100 px-4 py-3 rounded-2xl"
          >
            <MaterialIcons name="delete-outline" size={18} color="#ef4444" />
          </Pressable>
        </View>

        {isLoading ? (
          <View className="py-24 items-center justify-center">
            <ActivityIndicator size="large" color="#18181b" />
            <Text className="text-zinc-400 text-[13px] mt-3">Loading product…</Text>
          </View>
        ) : error || !product ? (
          <View className="py-24 items-center">
            <MaterialIcons name="error-outline" size={40} color="#ef4444" />
            <Text className="text-red-500 mt-3 font-medium">
              {error || "Product not found"}
            </Text>
          </View>
        ) : (
          <>
            {/* ── Hero Card ── */}
            <View className="bg-zinc-900 rounded-[28px] px-5 pt-5 pb-6 mb-3 overflow-hidden">
              {/* Decorative rings */}
              <View
                className="absolute -right-10 -top-10 w-48 h-48 rounded-full border border-white/5"
                pointerEvents="none"
              />
              <View
                className="absolute -right-4 -top-4 w-32 h-32 rounded-full border border-white/5"
                pointerEvents="none"
              />

              {/* Header row */}
              <View className="flex-row items-start justify-between mb-5">
                <View className="flex-1 pr-3">
                  <Text className="text-white/40 text-[11px] font-medium tracking-widest uppercase mb-1">
                    Product
                  </Text>
                  <Text
                    className="text-white text-[22px] font-bold tracking-tight"
                    numberOfLines={2}
                  >
                    {product.name}
                  </Text>
                  <Text className="text-white/40 text-[12px] mt-1">
                    {product.sku ? `SKU: ${product.sku}` : "Auto SKU"} · {product.category}
                  </Text>
                </View>

                {/* Stock status pill */}
                <View
                  className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full ${
                    isLowStock ? "bg-red-500/20" : "bg-emerald-500/20"
                  }`}
                >
                  <View
                    className={`w-1.5 h-1.5 rounded-full ${
                      isLowStock ? "bg-red-400" : "bg-emerald-400"
                    }`}
                  />
                  <Text
                    className={`text-[11px] font-bold ${
                      isLowStock ? "text-red-300" : "text-emerald-400"
                    }`}
                  >
                    {isLowStock ? "LOW STOCK" : "IN STOCK"}
                  </Text>
                </View>
              </View>

              {/* Stock quantity */}
              <View className="mb-3">
                <Text className="text-white/40 text-[10px] uppercase tracking-widest mb-1">
                  Current Stock
                </Text>
                <View className="flex-row items-baseline gap-1.5">
                  <Text className="text-white text-[44px] font-bold leading-none tracking-tight">
                    {product.quantity}
                  </Text>
                  <Text className="text-white/40 text-[14px] mb-1">units</Text>
                </View>

                {/* Stock fill bar */}
                <View className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <View
                    className={`h-full rounded-full ${
                      isLowStock ? "bg-red-400" : "bg-emerald-400"
                    }`}
                    style={{ width: `${stockPct}%` }}
                  />
                </View>
                <Text className="text-white/30 text-[10px] mt-1">
                  Min threshold: {product.minimumQuantity} units
                </Text>
              </View>

              {/* Price tiles */}
              <View className="flex-row gap-2 mt-2">
                <View className="flex-1 bg-white/8 rounded-2xl px-4 py-3">
                  <Text className="text-white/40 text-[10px] uppercase tracking-widest mb-1">
                    Selling Price
                  </Text>
                  <Text className="text-emerald-400 text-[18px] font-bold">
                    {formatCurrency(product.price)}
                  </Text>
                </View>
                <View className="flex-1 bg-white/8 rounded-2xl px-4 py-3">
                  <Text className="text-white/40 text-[10px] uppercase tracking-widest mb-1">
                    Cost Price
                  </Text>
                  <Text className="text-white text-[18px] font-bold">
                    {formatCurrency(product.costPrice)}
                  </Text>
                </View>
              </View>
            </View>

            {/* ── Product Info Card ── */}
            <View className="bg-white rounded-[24px] border border-zinc-100 px-5 py-4 mb-3">
              <Text className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-4">
                Product Info
              </Text>
              <View className="flex-row">
                <InfoCell label="Category" value={product.category} />
                <View className="w-px bg-zinc-100 mx-1" />
                <InfoCell label="SKU" value={product.sku || "Auto"} />
                <View className="w-px bg-zinc-100 mx-1" />
                <InfoCell label="Min Qty" value={`${product.minimumQuantity}`} />
              </View>

              {/* Margin insight */}
              {product.costPrice > 0 && (
                <View className="mt-4 pt-4 border-t border-zinc-100 flex-row items-center justify-between">
                  <View>
                    <Text className="text-zinc-400 text-[11px] uppercase tracking-wider">
                      Gross Margin
                    </Text>
                    <Text className="text-zinc-900 text-[15px] font-bold mt-0.5">
                      {formatCurrency(product.price - product.costPrice)} / unit
                    </Text>
                  </View>
                  <View className="bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-1.5">
                    <Text className="text-emerald-700 text-[12px] font-bold">
                      {Math.round(
                        ((product.price - product.costPrice) / product.price) * 100,
                      )}
                      % margin
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* ── Adjust Stock Card ── */}
            <View className="bg-white rounded-[24px] border border-zinc-100 px-5 py-4 mb-3">
              <Text className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-4">
                Adjust Stock
              </Text>

              {isLowStock && (
                <View className="flex-row items-center gap-2 bg-red-50 border border-red-100 rounded-2xl px-4 py-3 mb-3">
                  <MaterialIcons name="warning-amber" size={15} color="#ef4444" />
                  <Text className="text-red-600 text-[12px] font-medium">
                    Stock is at or below minimum ({product.minimumQuantity} units)
                  </Text>
                </View>
              )}

              <View className="flex-row items-center bg-zinc-50 border border-zinc-200 rounded-2xl px-4 mb-3 overflow-hidden">
                <MaterialIcons name="inventory" size={16} color="#a1a1aa" />
                <TextInput
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="number-pad"
                  placeholder="New quantity"
                  placeholderTextColor="#a1a1aa"
                  className="flex-1 py-4 pl-3 text-zinc-900 text-[15px] font-medium"
                />
                {quantity.length > 0 && (
                  <Pressable onPress={() => setQuantity("")}>
                    <MaterialIcons name="cancel" size={18} color="#a1a1aa" />
                  </Pressable>
                )}
              </View>

              <View className="flex-row items-center bg-zinc-50 border border-zinc-200 rounded-2xl px-4 mb-3 overflow-hidden">
                <MaterialIcons name="notes" size={16} color="#a1a1aa" />
                <TextInput
                  value={reason}
                  onChangeText={setReason}
                  placeholder="Reason (optional)"
                  placeholderTextColor="#a1a1aa"
                  className="flex-1 py-4 pl-3 text-zinc-900 text-[13px]"
                />
              </View>

              <Pressable
                onPress={handleAdjustStock}
                disabled={isUpdating || !quantity}
                android_ripple={{ color: "rgba(255,255,255,0.15)", borderless: false }}
                className={`rounded-2xl py-4 items-center flex-row justify-center gap-2 ${
                  isUpdating || !quantity ? "bg-zinc-200" : "bg-zinc-900"
                }`}
              >
                {isUpdating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <MaterialIcons
                    name="update"
                    size={18}
                    color={!quantity ? "#a1a1aa" : "#fff"}
                  />
                )}
                <Text
                  className={`font-semibold text-[14px] ${
                    isUpdating || !quantity ? "text-zinc-400" : "text-white"
                  }`}
                >
                  {isUpdating ? "Updating…" : "Update Stock"}
                </Text>
              </Pressable>
            </View>

            {/* ── Movement History ── */}
            <View className="bg-white rounded-[24px] border border-zinc-100 px-5 py-4 mb-3">
              <Text className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-4">
                Movement History
              </Text>

              {movements.length === 0 ? (
                <View className="py-10 items-center">
                  <MaterialIcons name="swap-vert" size={32} color="#d4d4d8" />
                  <Text className="text-zinc-400 text-[13px] mt-2">
                    No movements yet
                  </Text>
                </View>
              ) : (
                <View>
                  {movements.map((item, index) => (
                    <MovementRow
                      key={item.id}
                      item={item}
                      isLast={index === movements.length - 1}
                    />
                  ))}
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </AppLayout>
  );
};

/* ─── Sub-components ─────────────────────────────────────── */

const InfoCell = ({ label, value }: { label: string; value: string }) => (
  <View className="flex-1 px-2 py-1">
    <Text className="text-[10px] uppercase tracking-wider text-zinc-400 mb-1">
      {label}
    </Text>
    <Text numberOfLines={1} className="text-[13px] font-bold text-zinc-900">
      {value}
    </Text>
  </View>
);

const MovementRow = ({
  item,
  isLast,
}: {
  item: InventoryMovement;
  isLast: boolean;
}) => {
  const typeConfig = {
    INCREASE: { dot: "bg-emerald-400", bg: "bg-emerald-50", text: "text-emerald-700", label: "Increase" },
    DECREASE: { dot: "bg-red-400",     bg: "bg-red-50",     text: "text-red-700",     label: "Decrease" },
    SET:      { dot: "bg-zinc-400",    bg: "bg-zinc-100",   text: "text-zinc-600",    label: "Set"      },
  };
  const cfg = typeConfig[item.type as keyof typeof typeConfig] ?? typeConfig.SET;

  return (
    <View
      className={`flex-row items-center gap-3 py-3.5 ${
        !isLast ? "border-b border-zinc-100" : ""
      }`}
    >
      {/* Icon */}
      <View className={`h-9 w-9 rounded-xl ${cfg.bg} items-center justify-center flex-shrink-0`}>
        <View className={`w-2 h-2 rounded-full ${cfg.dot}`} />
      </View>

      {/* Info */}
      <View className="flex-1 min-w-0">
        <Text className="text-zinc-900 text-[13px] font-semibold" numberOfLines={1}>
          {item.reason}
        </Text>
        <View className="flex-row items-center gap-1.5 mt-0.5">
          <View className={`px-2 py-0.5 rounded-full ${cfg.bg}`}>
            <Text className={`text-[10px] font-bold ${cfg.text}`}>{cfg.label}</Text>
          </View>
        </View>
      </View>

      {/* Delta */}
      <View className="items-end">
        <Text className="text-zinc-900 text-[13px] font-bold">
          {item.quantityBefore}
          <Text className="text-zinc-400 font-normal"> → </Text>
          {item.quantityAfter}
        </Text>
        <Text className="text-zinc-400 text-[10px] mt-0.5">units</Text>
      </View>
    </View>
  );
};