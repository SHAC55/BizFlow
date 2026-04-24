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
import { createSalePayment, fetchSale } from "../lib/api";
import { useAuth } from "../providers/AuthProvider";
import type { DashboardSale } from "../types/dashboard";
import type { AppRoute } from "../types/navigation";

type SaleDetailPageProps = {
  saleId: string;
  onBack: () => void;
  onNavigate: (route: AppRoute) => void;
};

const formatCurrency = (value: number) =>
  `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const SaleDetailPage = ({ onBack, onNavigate, saleId }: SaleDetailPageProps) => {
  const { session } = useAuth();
  const [sale, setSale] = useState<DashboardSale | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [isPaying, setIsPaying] = useState(false);

  const load = async (refresh = false) => {
    const accessToken = session?.tokens.accessToken;
    if (!accessToken) return;
    refresh ? setIsRefreshing(true) : setIsLoading(true);
    try {
      setError(null);
      setSale(await fetchSale(accessToken, saleId));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load sale");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, [saleId, session?.tokens.accessToken]);

  const handlePayment = async () => {
    const accessToken = session?.tokens.accessToken;
    if (!accessToken || !sale) return;
    setIsPaying(true);
    try {
      const nextSale = await createSalePayment(accessToken, sale.id, Number(paymentAmount));
      setSale(nextSale);
      setPaymentAmount("");
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : "Failed to record payment");
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <AppLayout
      currentRoute="sales"
      eyebrow="Sale Detail"
      headerRight={
        <Pressable onPress={onBack} className="rounded-[18px] border border-black/10 bg-[#f8fafc] px-3 py-2.5">
          <Text className="text-[12px] font-semibold text-black/70">Back</Text>
        </Pressable>
      }
      onNavigate={onNavigate}
      subtitle="Transaction breakdown, payments, and line items in one place."
      title={sale ? `Sale #${sale.id.slice(0, 8)}` : "Sale Detail"}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-28"
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => load(true)} />}
      >
        {isLoading ? (
          <Text className="py-12 text-center text-[14px] text-black/45">Loading sale...</Text>
        ) : error || !sale ? (
          <Text className="py-12 text-center text-[14px] text-red-600">{error || "Sale not found"}</Text>
        ) : (
          <>
            <View className="rounded-[28px] bg-[#0f172a] px-5 py-5">
              <View className="flex-row gap-3">
                <MetricCard label="Total" value={formatCurrency(sale.totalAmount)} />
                <MetricCard label="Due" value={formatCurrency(sale.dueAmount)} />
              </View>
              <Text className="mt-4 text-[13px] text-white/60">{formatDate(sale.createdAt)}</Text>
            </View>

            <View className="mt-6 rounded-[28px] border border-black/8 bg-white px-5 py-5">
              <InfoRow label="Customer" value={sale.customer.name} />
              <InfoRow label="Paid" value={formatCurrency(sale.paidAmount)} />
              <InfoRow label="Status" value={sale.status} />
            </View>

            <View className="mt-6 overflow-hidden rounded-[28px] border border-black/8 bg-white">
              <View className="border-b border-black/5 px-5 py-4">
                <Text className="text-[15px] font-semibold text-black">Items</Text>
              </View>
              {sale.items.map((item, index) => (
                <View key={item.id} className={`px-5 py-4 ${index < sale.items.length - 1 ? "border-b border-black/5" : ""}`}>
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="text-[14px] font-semibold text-black">{item.product.name}</Text>
                      <Text className="mt-1 text-[12px] text-black/40">
                        {item.quantity} × {formatCurrency(item.unitPrice)}
                      </Text>
                    </View>
                    <Text className="text-[14px] font-bold text-black">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <View className="mt-6 rounded-[28px] border border-black/8 bg-white px-5 py-5">
              <Text className="text-[15px] font-semibold text-black">Record Payment</Text>
              <TextInput
                className="mt-4 rounded-[22px] border border-black/10 bg-[#f8fafc] px-4 py-4 text-[15px] text-[#0f172a]"
                keyboardType="decimal-pad"
                onChangeText={setPaymentAmount}
                placeholder="Enter payment amount"
                placeholderTextColor="#94a3b8"
                value={paymentAmount}
              />
              <Pressable
                onPress={handlePayment}
                disabled={isPaying || !paymentAmount}
                className={`mt-4 items-center rounded-[22px] bg-[#2563eb] py-4 ${isPaying || !paymentAmount ? "opacity-60" : ""}`}
              >
                <Text className="text-[15px] font-bold text-white">
                  {isPaying ? "Recording payment..." : "Add Payment"}
                </Text>
              </Pressable>
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
