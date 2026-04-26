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
        queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(product.id) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.products.movements(product.id) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
      ]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({ type: "success", text1: "Stock Updated", text2: "Inventory level has been adjusted." });
      load(true);
    } catch (adjustError) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const msg = adjustError instanceof Error ? adjustError.message : "Failed to adjust stock";
      setError(msg);
      Toast.show({ type: "error", text1: "Update Failed", text2: msg });
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
                queryClient.invalidateQueries({ queryKey: queryKeys.products.all }),
                queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(product.id) }),
                queryClient.invalidateQueries({ queryKey: queryKeys.products.movements(product.id) }),
                queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
              ]);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Toast.show({ type: "success", text1: "Product Deleted" });
              onBack();
            } catch (deleteError) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              const msg = deleteError instanceof Error ? deleteError.message : "Failed to delete product";
              setError(msg);
              Toast.show({ type: "error", text1: "Delete Failed", text2: msg });
            }
          },
        },
      ],
    );
  };

  const isLowStock = product && product.quantity <= Number(product.minimumQuantity);

  return (
    <AppLayout
      currentRoute="inventory"
      onNavigate={onNavigate}
      title={product?.name ?? "Product Detail"}
      subtitle="Manage stock & product insights"
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-32"
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => load(true)} />
        }
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <Text className="py-16 text-center text-black/40">
            Loading product...
          </Text>
        ) : error || !product ? (
          <Text className="py-16 text-center text-red-500">
            {error || "Product not found"}
          </Text>
        ) : (
          <>
            {/* Top Bar */}
            <View className="flex-row items-center justify-between px-4 pt-4 pb-3">
              <Pressable
                onPress={onBack}
                className="h-[36px] w-[36px] items-center justify-center rounded-full bg-black/5"
              >
                <MaterialIcons name="arrow-back" size={18} color="#000" />
              </Pressable>

              <View className="flex-row gap-2">
                <TopBtn icon="edit" label="Edit" onPress={onEdit} />
                <TopBtn icon="delete" label="Delete" danger onPress={handleDelete} />
              </View>
            </View>

            {/* Hero Card */}
            <View className="mx-4 rounded-[22px] bg-[#141414] px-5 pt-5 pb-5">
              {/* Name + Status */}
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-3">
                  <Text className="text-[18px] font-semibold text-white leading-snug" numberOfLines={2}>
                    {product.name}
                  </Text>
                  <View className="mt-2 flex-row gap-2">
                    <View className="rounded-full bg-white/10 px-3 py-[3px]">
                      <Text className="text-[10px] text-white/50">{product.category}</Text>
                    </View>
                    <View className="rounded-full bg-white/10 px-3 py-[3px]">
                      <Text className="text-[10px] text-white/50">{product.sku || "Auto SKU"}</Text>
                    </View>
                  </View>
                </View>
                <View
                  className={`rounded-full px-3 py-[5px] ${
                    isLowStock ? "bg-red-500/20" : "bg-green-500/20"
                  }`}
                >
                  <Text
                    className={`text-[10px] font-semibold ${
                      isLowStock ? "text-red-300" : "text-green-400"
                    }`}
                  >
                    {isLowStock ? "LOW STOCK" : "IN STOCK"}
                  </Text>
                </View>
              </View>

              {/* Stock Number */}
              <View className="mt-5">
                <Text className="text-[10px] uppercase tracking-widest text-white/40">
                  Current Stock
                </Text>
                <View className="flex-row items-baseline gap-1 mt-1">
                  <Text className="text-[44px] font-semibold text-white leading-none tracking-tight">
                    {product.quantity}
                  </Text>
                  <Text className="text-[14px] text-white/40 mb-1">units</Text>
                </View>
              </View>

              {/* Price Tiles */}
              <View className="mt-4 flex-row gap-2">
                <View className="flex-1 rounded-[14px] bg-white/8 border border-white/8 px-4 py-3">
                  <Text className="text-[10px] uppercase tracking-wider text-white/40">Selling</Text>
                  <Text className="mt-2 text-[16px] font-semibold text-green-400">
                    {formatCurrency(product.price)}
                  </Text>
                </View>
                <View className="flex-1 rounded-[14px] bg-white/8 border border-white/8 px-4 py-3">
                  <Text className="text-[10px] uppercase tracking-wider text-white/40">Cost</Text>
                  <Text className="mt-2 text-[16px] font-semibold text-white">
                    {formatCurrency(product.costPrice)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Product Info */}
            <View className="mx-4 mt-3 rounded-[18px] border border-black/[0.07] bg-white overflow-hidden">
              <View className="px-4 pt-4 pb-3">
                <Text className="text-[11px] font-medium uppercase tracking-wider text-black/35">
                  Product Info
                </Text>
              </View>
              <View className="flex-row border-t border-black/[0.06]">
                <InfoCell label="Category" value={product.category} />
                <View className="w-[0.5px] bg-black/[0.06]" />
                <InfoCell label="SKU" value={product.sku || "Auto"} />
                <View className="w-[0.5px] bg-black/[0.06]" />
                <InfoCell label="Min Qty" value={`${product.minimumQuantity}`} />
              </View>
            </View>

            {/* Adjust Stock */}
            <View className="mx-4 mt-3 rounded-[18px] border border-black/[0.07] bg-white px-4 py-4">
              <Text className="mb-3 text-[11px] font-medium uppercase tracking-wider text-black/35">
                Adjust Stock
              </Text>

              <View className="flex-row gap-2 items-center">
                {/* Live preview display */}
                <View className="h-[48px] w-[56px] items-center justify-center rounded-[12px] bg-zinc-100 border border-black/[0.06]">
                  <Text className="text-[18px] font-semibold text-black">
                    {quantity || "—"}
                  </Text>
                </View>
                <TextInput
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="number-pad"
                  placeholder="New quantity"
                  placeholderTextColor="#aaa"
                  className="flex-1 h-[48px] rounded-[12px] bg-zinc-50 border border-black/[0.06] px-4 text-[15px] text-black"
                />
              </View>

              <TextInput
                value={reason}
                onChangeText={setReason}
                placeholder="Reason (optional)"
                placeholderTextColor="#aaa"
                className="mt-2 h-[42px] rounded-[12px] bg-zinc-50 border border-black/[0.06] px-4 text-[13px] text-black"
              />

              <Pressable
                onPress={handleAdjustStock}
                android_ripple={{ color: "rgba(255,255,255,0.1)", borderless: false }}
                className="mt-3 h-[48px] items-center justify-center rounded-[12px] bg-[#141414]"
              >
                <Text className="text-[14px] font-semibold text-white">
                  Update Stock
                </Text>
              </Pressable>
            </View>

            {/* Movement History */}
            <View className="mx-4 mt-3 rounded-[18px] border border-black/[0.07] bg-white overflow-hidden">
              <View className="px-4 pt-4 pb-3 border-b border-black/[0.06]">
                <Text className="text-[11px] font-medium uppercase tracking-wider text-black/35">
                  Movement History
                </Text>
              </View>

              {movements.length === 0 ? (
                <Text className="py-10 text-center text-[13px] text-black/30">
                  No movements yet
                </Text>
              ) : (
                movements.map((item, index) => (
                  <MovementRow
                    key={item.id}
                    item={item}
                    isLast={index === movements.length - 1}
                  />
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </AppLayout>
  );
};

/* ─── Sub-components ─────────────────────────────────────── */

const TopBtn = ({
  label,
  icon,
  danger,
  onPress,
}: {
  label: string;
  icon: string;
  danger?: boolean;
  onPress: () => void;
}) => (
  <Pressable
    onPress={onPress}
    className={`flex-row items-center gap-1.5 rounded-[10px] px-3 h-[36px] border ${
      danger
        ? "bg-red-50 border-red-200"
        : "bg-black border-black"
    }`}
  >
    <MaterialIcons
      name={icon as any}
      size={15}
      color={danger ? "#b91c1c" : "#fff"}
    />
    <Text
      className={`text-[13px] font-medium ${
        danger ? "text-red-700" : "text-white"
      }`}
    >
      {label}
    </Text>
  </Pressable>
);

const InfoCell = ({ label, value }: { label: string; value: string }) => (
  <View className="flex-1 px-4 py-3">
    <Text className="text-[10px] uppercase tracking-wider text-black/35">
      {label}
    </Text>
    <Text numberOfLines={1} className="mt-1.5 text-[13px] font-semibold text-black">
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
  const dotColor =
    item.type === "INCREASE"
      ? "#86efac"   // green-300
      : item.type === "DECREASE"
      ? "#fca5a5"   // red-300
      : "#93c5fd";  // blue-300

  return (
    <View
      className={`flex-row items-center gap-3 px-4 py-3.5 ${
        !isLast ? "border-b border-black/[0.05]" : ""
      }`}
    >
      {/* Type dot */}
      <View
        style={{ backgroundColor: dotColor }}
        className="w-2 h-2 rounded-full flex-shrink-0"
      />

      {/* Info */}
      <View className="flex-1 min-w-0">
        <Text className="text-[13px] font-semibold text-black" numberOfLines={1}>
          {item.reason}
        </Text>
        <Text className="mt-0.5 text-[11px] text-black/40">{item.type}</Text>
      </View>

      {/* Delta */}
      <Text className="text-[12px] font-medium text-black/50 flex-shrink-0">
        <Text className="text-black font-semibold">{item.quantityBefore}</Text>
        {" → "}
        <Text className="text-black font-semibold">{item.quantityAfter}</Text>
      </Text>
    </View>
  );
};