import { useEffect, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { AppLayout } from "../components/AppLayout";
import {
  adjustProductStock,
  deleteProduct,
  fetchProduct,
  fetchProductMovements,
} from "../lib/api";
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
  `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export const ProductDetailPage = ({
  onBack,
  onEdit,
  onNavigate,
  productId,
}: ProductDetailPageProps) => {
  const { session } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");

  const load = async (refresh = false) => {
    const accessToken = session?.tokens.accessToken;
    if (!accessToken) return;
    refresh ? setIsRefreshing(true) : setIsLoading(true);
    try {
      setError(null);
      const [nextProduct, nextMovements] = await Promise.all([
        fetchProduct(accessToken, productId),
        fetchProductMovements(accessToken, productId),
      ]);
      setProduct(nextProduct);
      setMovements(nextMovements);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load product");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, [productId, session?.tokens.accessToken]);

  const handleAdjustStock = async () => {
    const accessToken = session?.tokens.accessToken;
    if (!accessToken || !product) return;
    try {
      await adjustProductStock(accessToken, product.id, {
        type: "SET",
        quantity: Number(quantity),
        reason: reason || "manual stock update",
      });
      setQuantity("");
      setReason("");
      load(true);
    } catch (adjustError) {
      setError(adjustError instanceof Error ? adjustError.message : "Failed to adjust stock");
    }
  };

  const handleDelete = async () => {
    const accessToken = session?.tokens.accessToken;
    if (!accessToken || !product) return;
    try {
      await deleteProduct(accessToken, product.id);
      onBack();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete product");
    }
  };

  return (
    <AppLayout
      currentRoute="inventory"
      eyebrow="Product Detail"
      headerRight={
        <View className="flex-row gap-2">
          <Pressable onPress={onEdit} className="rounded-[18px] border border-black/10 bg-white px-3 py-2.5">
            <Text className="text-[12px] font-semibold text-black/70">Edit</Text>
          </Pressable>
          <Pressable onPress={onBack} className="rounded-[18px] border border-black/10 bg-[#f8fafc] px-3 py-2.5">
            <Text className="text-[12px] font-semibold text-black/70">Back</Text>
          </Pressable>
        </View>
      }
      onNavigate={onNavigate}
      subtitle="Pricing, stock state, and movement history in one place."
      title={product?.name ?? "Product Detail"}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-28"
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => load(true)} />}
      >
        {isLoading ? (
          <Text className="py-12 text-center text-[14px] text-black/45">Loading product...</Text>
        ) : error || !product ? (
          <Text className="py-12 text-center text-[14px] text-red-600">{error || "Product not found"}</Text>
        ) : (
          <>
            <View className="rounded-[28px] bg-[#0f172a] px-5 py-5">
              <View className="flex-row gap-3">
                <MetricCard label="Price" value={formatCurrency(product.price)} />
                <MetricCard label="Quantity" value={`${product.quantity}`} />
              </View>
            </View>

            <View className="mt-6 rounded-[28px] border border-black/8 bg-white px-5 py-5">
              <InfoRow label="Category" value={product.category} />
              <InfoRow label="SKU" value={product.sku || "Auto-generated"} />
              <InfoRow label="Cost Price" value={formatCurrency(product.costPrice)} />
              <InfoRow label="Minimum Quantity" value={`${product.minimumQuantity}`} />
            </View>

            <View className="mt-6 rounded-[28px] border border-black/8 bg-white px-5 py-5">
              <Text className="text-[15px] font-semibold text-black">Adjust Stock</Text>
              <TextInput
                className="mt-4 rounded-[22px] border border-black/10 bg-[#f8fafc] px-4 py-4 text-[15px] text-[#0f172a]"
                keyboardType="number-pad"
                onChangeText={setQuantity}
                placeholder="Set quantity"
                placeholderTextColor="#94a3b8"
                value={quantity}
              />
              <TextInput
                className="mt-3 rounded-[22px] border border-black/10 bg-[#f8fafc] px-4 py-4 text-[15px] text-[#0f172a]"
                onChangeText={setReason}
                placeholder="Reason"
                placeholderTextColor="#94a3b8"
                value={reason}
              />
              <Pressable onPress={handleAdjustStock} className="mt-4 items-center rounded-[22px] bg-[#2563eb] py-4">
                <Text className="text-[15px] font-bold text-white">Update Stock</Text>
              </Pressable>
              <Pressable onPress={handleDelete} className="mt-3 items-center rounded-[22px] bg-[#0f172a] py-4">
                <Text className="text-[15px] font-bold text-white">Delete Product</Text>
              </Pressable>
            </View>

            <View className="mt-6 overflow-hidden rounded-[28px] border border-black/8 bg-white">
              <View className="border-b border-black/5 px-5 py-4">
                <Text className="text-[15px] font-semibold text-black">Movement History</Text>
              </View>
              {movements.length === 0 ? (
                <Text className="px-5 py-10 text-center text-[14px] text-black/40">No movements yet</Text>
              ) : (
                movements.map((movement, index) => (
                  <View key={movement.id} className={`px-5 py-4 ${index < movements.length - 1 ? "border-b border-black/5" : ""}`}>
                    <Text className="text-[14px] font-semibold text-black">{movement.reason}</Text>
                    <Text className="mt-1 text-[12px] text-black/40">
                      {movement.type} · {movement.quantityBefore} → {movement.quantityAfter}
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

const MetricCard = ({ label, value }: { label: string; value: string }) => (
  <View className="flex-1 rounded-[22px] bg-white/8 px-4 py-4">
    <Text className="text-[12px] text-white/55">{label}</Text>
    <Text className="mt-2 text-[18px] font-bold text-white">{value}</Text>
  </View>
);

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View className="mb-4 rounded-[20px] bg-[#f8fafc] px-4 py-4">
    <Text className="text-[11px] font-bold uppercase tracking-[1.8px] text-black/35">{label}</Text>
    <Text className="mt-2 text-[14px] text-black">{value}</Text>
  </View>
);
