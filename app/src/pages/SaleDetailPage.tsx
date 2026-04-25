import { useEffect, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
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
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export const SaleDetailPage = ({
  saleId,
  onBack,
  onNavigate,
}: SaleDetailPageProps) => {
  const { session } = useAuth();

  const [sale, setSale] = useState<DashboardSale | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [isPaying, setIsPaying] = useState(false);

  const loadSale = async (refresh = false) => {
    const token = session?.tokens.accessToken;
    if (!token) return;

    refresh ? setRefreshing(true) : setLoading(true);

    try {
      const data = await fetchSale(token, saleId);
      setSale(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSale();
  }, [saleId]);

  const handlePayment = async () => {
    const token = session?.tokens.accessToken;
    if (!token || !sale) return;

    setIsPaying(true);

    try {
      const updated = await createSalePayment(
        token,
        sale.id,
        Number(paymentAmount),
      );

      setSale(updated);
      setPaymentAmount("");
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <AppLayout
      currentRoute="sales"
      title="Sale Details"
      subtitle="Track payment and products"
      onNavigate={onNavigate}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pt-3 pb-32"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadSale(true)}
          />
        }
      >
        {/* Back */}
        <Pressable onPress={onBack} className="mb-4 flex-row items-center">
          <MaterialIcons name="arrow-back-ios" size={14} color="#64748B" />
          <Text className="text-slate-500 text-[14px]">Back to sales</Text>
        </Pressable>

        {loading ? (
          <View className="py-20 items-center">
            <ActivityIndicator size="large" color="#000" />
          </View>
        ) : !sale ? (
          <Text className="text-center text-red-500">Sale not found</Text>
        ) : (
          <>
            {/* Hero */}
            <View className="bg-white rounded-3xl border border-slate-100 p-5 mb-4">
              <View className="flex-row items-center">
                <View className="h-14 w-14 rounded-2xl bg-slate-100 items-center justify-center">
                  <MaterialIcons name="receipt-long" size={26} color="#000" />
                </View>

                <View className="ml-4 flex-1">
                  <Text className="text-[22px] font-bold text-slate-900">
                    Sale #{sale.id.slice(0, 6)}
                  </Text>

                  <Text className="text-[13px] text-slate-500 mt-1">
                    {formatDate(sale.createdAt)}
                  </Text>
                </View>
              </View>

              <View className="flex-row gap-3 mt-5">
                <StatCard
                  label="Total"
                  value={formatCurrency(sale.totalAmount)}
                />

                <StatCard
                  label="Due"
                  value={formatCurrency(sale.dueAmount)}
                  red
                />
              </View>
            </View>

            {/* Customer */}
            <Section title="Customer Summary">
              <InfoRow label="Customer" value={sale.customer.name} />
              <InfoRow
                label="Paid Amount"
                value={formatCurrency(sale.paidAmount)}
              />
              <InfoRow label="Status" value={sale.status} />
            </Section>

            {/* Products */}
            <Section title="Products">
              {sale.items.map((item) => (
                <View key={item.id} className="py-4 border-b border-slate-100">
                  <View className="flex-row justify-between">
                    <View>
                      <Text className="font-semibold text-slate-900">
                        {item.product.name}
                      </Text>

                      <Text className="text-[12px] text-slate-400 mt-1">
                        {item.quantity} × {formatCurrency(item.unitPrice)}
                      </Text>
                    </View>

                    <Text className="font-bold text-slate-900">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </Text>
                  </View>
                </View>
              ))}
            </Section>

            {/* Payment */}
            <Section title="Record Payment">
              <TextInput
                placeholder="Enter payment amount"
                keyboardType="decimal-pad"
                value={paymentAmount}
                onChangeText={setPaymentAmount}
                placeholderTextColor="#94A3B8"
                className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4 text-slate-900"
              />

              {sale.dueAmount > 0 && (
                <Text className="text-[12px] text-slate-500 mt-3">
                  Pending Due: ₹{sale.dueAmount}
                </Text>
              )}

              <Pressable
                onPress={handlePayment}
                disabled={isPaying || !paymentAmount}
                className={`mt-4 rounded-2xl py-4 items-center ${
                  isPaying || !paymentAmount ? "bg-slate-300" : "bg-black"
                }`}
              >
                <Text className="text-white font-semibold">
                  {isPaying ? "Recording..." : "Add Payment"}
                </Text>
              </Pressable>
            </Section>
          </>
        )}
      </ScrollView>
    </AppLayout>
  );
};

const Section = ({ title, children }: any) => (
  <View className="bg-white rounded-3xl border border-slate-100 p-4 mb-4">
    <Text className="text-[16px] font-bold text-slate-900 mb-4">{title}</Text>
    {children}
  </View>
);

const StatCard = ({ label, value, red }: any) => (
  <View className="flex-1 bg-slate-50 rounded-2xl p-4">
    <Text className="text-[12px] text-slate-500">{label}</Text>

    <Text
      className={`mt-1 text-[18px] font-bold ${
        red ? "text-red-500" : "text-slate-900"
      }`}
    >
      {value}
    </Text>
  </View>
);

const InfoRow = ({ label, value }: any) => (
  <View className="mb-3">
    <Text className="text-[11px] uppercase text-slate-400 mb-1">{label}</Text>

    <Text className="text-[15px] font-medium text-slate-900">{value}</Text>
  </View>
);
