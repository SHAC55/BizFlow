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

  const isLowStock =
    product && product.quantity <= Number(product.minimumQuantity);

  return (
    <AppLayout
      currentRoute="inventory"
      onNavigate={onNavigate}
      title={product?.name ?? "Product Detail"}
      subtitle="Manage stock & product insights"
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-32"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => load(true)}
          />
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
            {/* Top Actions */}
            <View className="mt-4 mb-4 flex-row justify-between">
              <ActionBtn icon="arrow-back" label="Back" onPress={onBack} />

              <View className="flex-row gap-2">
                <ActionBtn
                  icon="edit"
                  label="Edit"
                  dark
                  onPress={onEdit}
                />

                <ActionBtn
                  icon="delete"
                  label="Delete"
                  red
                  onPress={handleDelete}
                />
              </View>
            </View>

            {/* Hero */}
            <View className="rounded-[30px] bg-black px-5 py-5">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-[11px] uppercase text-white/55">
                    Current Stock
                  </Text>

                  <Text className="mt-1 text-[30px] font-bold text-white">
                    {product.quantity}
                  </Text>
                </View>

                <View
                  className={`rounded-full px-3 py-1 ${
                    isLowStock
                      ? "bg-red-500/20"
                      : "bg-green-500/20"
                  }`}
                >
                  <Text
                    className={`text-[11px] font-semibold ${
                      isLowStock
                        ? "text-red-300"
                        : "text-green-300"
                    }`}
                  >
                    {isLowStock ? "LOW STOCK" : "IN STOCK"}
                  </Text>
                </View>
              </View>

              <View className="mt-5 flex-row gap-3">
                <MetricCard
                  label="Selling"
                  value={formatCurrency(product.price)}
                  green
                />

                <MetricCard
                  label="Cost"
                  value={formatCurrency(product.costPrice)}
                />
              </View>
            </View>

            {/* Product Info One Row */}
            <View className="mt-5 rounded-[28px] border border-black/10 bg-white p-5">
              <Text className="mb-4 text-[16px] font-bold text-black">
                Product Info
              </Text>

              <View className="flex-row gap-3">
                <InfoCard
                  label="Category"
                  value={product.category}
                />

                <InfoCard
                  label="SKU"
                  value={product.sku || "Auto"}
                />

                <InfoCard
                  label="Min Qty"
                  value={`${product.minimumQuantity}`}
                />
              </View>
            </View>

            {/* Adjust Stock */}
            <View className="mt-5 rounded-[28px] border border-black/10 bg-white p-5">
              <Text className="mb-4 text-[16px] font-bold text-black">
                Adjust Stock
              </Text>

              <TextInput
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="number-pad"
                placeholder="Enter quantity"
                placeholderTextColor="#999"
                className="rounded-2xl bg-zinc-50 px-4 py-4 text-black"
              />

              <TextInput
                value={reason}
                onChangeText={setReason}
                placeholder="Reason (optional)"
                placeholderTextColor="#999"
                className="mt-3 rounded-2xl bg-zinc-50 px-4 py-4 text-black"
              />

              <Pressable
                onPress={handleAdjustStock}
                android_ripple={{ color: "rgba(255,255,255,0.1)", borderless: false }}
                className="mt-4 items-center rounded-2xl bg-blue-600 py-4"
              >
                <Text className="font-semibold text-white">
                  Update Stock
                </Text>
              </Pressable>
            </View>

            {/* Movement History */}
            <View className="mt-5 rounded-[28px] border border-black/10 bg-white overflow-hidden">
              <View className="px-5 py-4 border-b border-black/5">
                <Text className="text-[16px] font-bold text-black">
                  Movement History
                </Text>
              </View>

              {movements.length === 0 ? (
                <Text className="py-10 text-center text-black/35">
                  No movement found
                </Text>
              ) : (
                movements.map((item, index) => (
                  <View
                    key={item.id}
                    className={`px-5 py-4 ${
                      index !== movements.length - 1
                        ? "border-b border-black/5"
                        : ""
                    }`}
                  >
                    <View className="flex-row justify-between items-center">
                      <Text className="font-semibold text-black">
                        {item.reason}
                      </Text>

                      <Text className="text-blue-600 font-bold text-[12px]">
                        {item.quantityBefore} → {item.quantityAfter}
                      </Text>
                    </View>

                    <Text className="mt-1 text-[12px] text-black/40">
                      {item.type}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </AppLayout>
  );
};

/* Components */

const ActionBtn = ({ label, icon, dark, red, onPress }: any) => (
  <Pressable
    onPress={onPress}
    className={`flex-row items-center gap-2 rounded-2xl px-4 py-3 ${
      dark
        ? "bg-black"
        : red
        ? "bg-red-500"
        : "border border-black/10 bg-white"
    }`}
  >
    <MaterialIcons
      name={icon}
      size={18}
      color={dark || red ? "#fff" : "#000"}
    />

    <Text
      className={`font-medium ${
        dark || red ? "text-white" : "text-black"
      }`}
    >
      {label}
    </Text>
  </Pressable>
);

const MetricCard = ({ label, value, green }: any) => (
  <View
    className={`flex-1 rounded-2xl px-4 py-4 ${
      green ? "bg-green-400" : "bg-white/10"
    }`}
  >
    <Text className="text-[11px] text-white/70">{label}</Text>

    <Text className="mt-2 text-[17px] font-bold text-white">
      {value}
    </Text>
  </View>
);

const InfoCard = ({ label, value }: any) => (
  <View className="flex-1 rounded-2xl bg-zinc-50 px-3 py-4">
    <Text className="text-[10px] uppercase text-black/35">
      {label}
    </Text>

    <Text
      numberOfLines={1}
      className="mt-2 text-[13px] font-semibold text-black"
    >
      {value}
    </Text>
  </View>
);
