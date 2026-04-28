import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from "react-native";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";
import { AppLayout } from "../components/AppLayout";
import { createSalePayment, fetchSale, fetchSaleReminder } from "../lib/api";
import { queryKeys } from "../lib/query";
import { useAuth } from "../providers/AuthProvider";
import type { DashboardSale } from "../types/dashboard";
import type { AppRoute } from "../types/navigation";
import { handleGenerateInvoice } from "../lib/InvoiceGenerator";

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

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  paid:    { label: "Paid",           bg: "bg-emerald-50",  text: "text-emerald-700", dot: "bg-emerald-500" },
  partial: { label: "Partial",        bg: "bg-amber-50",    text: "text-amber-700",   dot: "bg-amber-500"   },
  unpaid:  { label: "Unpaid",         bg: "bg-red-50",      text: "text-red-700",     dot: "bg-red-500"     },
};

export const SaleDetailPage = ({
  saleId,
  onBack,
  onNavigate,
}: SaleDetailPageProps) => {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const [sale, setSale] = useState<DashboardSale | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [isSendingReminder, setIsSendingReminder] = useState(false);

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

  useEffect(() => { loadSale(); }, [saleId]);

  const handlePayment = async () => {
    const token = session?.tokens.accessToken;
    if (!token || !sale) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsPaying(true);
    try {
      const updated = await createSalePayment(token, sale.id, Number(paymentAmount));
      setSale(updated);
      setPaymentAmount("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.sales.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.sales.detail(sale.id) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.customers.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
      ]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({ type: "success", text1: "Payment Recorded", text2: `₹${paymentAmount} added to this sale.` });
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const msg = err instanceof Error ? err.message : "Failed to record payment";
      Toast.show({ type: "error", text1: "Payment Failed", text2: msg });
    } finally {
      setIsPaying(false);
    }
  };

  const handleInvoice = () => {
    if (!sale || !session?.user) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    handleGenerateInvoice(sale, session.user);
  };

  const handleReminder = async () => {
    const token = session?.tokens.accessToken;
    if (!token || !sale) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSendingReminder(true);
    try {
      const reminder = await fetchSaleReminder(token, sale.id);
      const digits = reminder.customerMobile.replace(/\D/g, "");
      const phone = digits.startsWith("91") && digits.length >= 12 ? digits : `91${digits}`;
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(reminder.message)}`;
      await Linking.openURL(url);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({ type: "success", text1: "Reminder Ready", text2: reminder.reminderLabel });
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const msg = err instanceof Error ? err.message : "Could not open reminder";
      Toast.show({ type: "error", text1: "Reminder Failed", text2: msg });
    } finally {
      setIsSendingReminder(false);
    }
  };

  const statusCfg = STATUS_CONFIG[sale?.status ?? "unpaid"] ?? STATUS_CONFIG.unpaid;

  return (
    <AppLayout
      currentRoute="sales"
      title="Sale Details"
      subtitle="Track payment and invoice"
      onNavigate={onNavigate}
    >
      <ScrollView
        className="flex-1 bg-zinc-50"
        contentContainerClassName="px-4 pt-3 pb-32"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadSale(true)} />
        }
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
            onPress={handleInvoice}
            android_ripple={{ color: "rgba(255,255,255,0.15)", borderless: false }}
            className="flex-1 flex-row items-center justify-center gap-2 bg-zinc-900 px-4 py-3 rounded-2xl"
          >
            <MaterialIcons name="receipt-long" size={16} color="#fff" />
            <Text className="text-white font-semibold text-[13px]">Download Invoice</Text>
          </Pressable>
        </View>

        {/* ── WhatsApp Reminder ── */}
        {sale && sale.dueAmount > 0 && (
          <Pressable
            onPress={handleReminder}
            disabled={isSendingReminder}
            android_ripple={{ color: "rgba(255,255,255,0.1)", borderless: false }}
            className="flex-row items-center justify-center gap-2 bg-[#25D366] rounded-2xl px-4 py-3 mb-4"
          >
            <FontAwesome5 name="whatsapp" size={16} color="#fff" />
            <Text className="text-white font-semibold text-[13px]">
              {isSendingReminder ? "Opening WhatsApp…" : "Send Payment Reminder"}
            </Text>
          </Pressable>
        )}

        {loading ? (
          <View className="py-24 items-center justify-center">
            <ActivityIndicator size="large" color="#18181b" />
            <Text className="text-zinc-400 text-[13px] mt-3">Loading sale…</Text>
          </View>
        ) : !sale ? (
          <View className="py-24 items-center">
            <MaterialIcons name="error-outline" size={40} color="#ef4444" />
            <Text className="text-red-500 mt-3 font-medium">Sale not found</Text>
          </View>
        ) : (
          <>
            {/* ── Hero Card ── */}
            <View className="bg-zinc-900 rounded-[28px] px-5 pt-5 pb-6 mb-3 overflow-hidden">
              {/* Decorative ring */}
              <View
                className="absolute -right-10 -top-10 w-48 h-48 rounded-full border border-white/5"
                pointerEvents="none"
              />
              <View
                className="absolute -right-4 -top-4 w-32 h-32 rounded-full border border-white/5"
                pointerEvents="none"
              />

              <View className="flex-row items-start justify-between mb-5">
                <View>
                  <Text className="text-white/40 text-[11px] font-medium tracking-widest uppercase mb-1">
                    Sale ID
                  </Text>
                  <Text className="text-white text-[22px] font-bold tracking-tight">
                    #{sale.id.slice(0, 8).toUpperCase()}
                  </Text>
                  <Text className="text-white/40 text-[12px] mt-1">
                    {formatDate(sale.createdAt)}
                  </Text>
                </View>

                {/* Status pill */}
                <View className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full ${statusCfg.bg}`}>
                  <View className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                  <Text className={`text-[11px] font-bold ${statusCfg.text}`}>{statusCfg.label}</Text>
                </View>
              </View>

              {/* Amount row */}
              <View className="flex-row gap-3">
                <View className="flex-1 bg-white/8 rounded-2xl px-4 py-3">
                  <Text className="text-white/40 text-[10px] uppercase tracking-widest mb-1">Total</Text>
                  <Text className="text-white text-[20px] font-bold">{formatCurrency(sale.totalAmount)}</Text>
                </View>
                <View className="flex-1 bg-white/8 rounded-2xl px-4 py-3">
                  <Text className="text-white/40 text-[10px] uppercase tracking-widest mb-1">Balance Due</Text>
                  <Text className={`text-[20px] font-bold ${sale.dueAmount > 0 ? "text-red-400" : "text-emerald-400"}`}>
                    {formatCurrency(sale.dueAmount)}
                  </Text>
                </View>
              </View>
            </View>

            {/* ── Customer Card ── */}
            <View className="bg-white rounded-[24px] border border-zinc-100 px-5 py-4 mb-3">
              <Text className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-3">Customer</Text>
              <View className="flex-row items-center gap-3">
                <View className="h-10 w-10 rounded-xl bg-zinc-900 items-center justify-center">
                  <Text className="text-white text-[14px] font-bold">
                    {sale.customer.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-zinc-900 text-[15px] font-semibold">{sale.customer.name}</Text>
                  <Text className="text-zinc-400 text-[12px] mt-0.5">
                    Paid {formatCurrency(sale.paidAmount)} of {formatCurrency(sale.totalAmount)}
                  </Text>
                </View>
                {/* Progress bar */}
                <View className="w-16">
                  <View className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                    <View
                      className="h-full bg-zinc-900 rounded-full"
                      style={{ width: `${Math.min(100, (sale.paidAmount / sale.totalAmount) * 100)}%` }}
                    />
                  </View>
                  <Text className="text-zinc-400 text-[10px] mt-1 text-right">
                    {Math.round((sale.paidAmount / sale.totalAmount) * 100)}%
                  </Text>
                </View>
              </View>
            </View>

            {/* ── Bill Summary ── */}
            <View className="bg-white rounded-[24px] border border-zinc-100 px-5 py-4 mb-3">
              <Text className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-4">Bill Summary</Text>

              <View className="gap-2">
                <BillRow label="Subtotal" value={formatCurrency(sale.subtotalAmount)} />
                {sale.discountAmount > 0 && (
                  <BillRow label="Discount" value={`− ${formatCurrency(sale.discountAmount)}`} accent="green" />
                )}
                {sale.gstAmount > 0 && (
                  <BillRow label={`GST (${sale.gstRate}%)`} value={formatCurrency(sale.gstAmount)} />
                )}
              </View>

              <View className="my-3 h-px bg-zinc-100" />

              <View className="flex-row justify-between items-center">
                <Text className="text-zinc-900 text-[14px] font-bold">Total</Text>
                <Text className="text-zinc-900 text-[20px] font-bold">{formatCurrency(sale.totalAmount)}</Text>
              </View>
            </View>

            {/* ── Products ── */}
            <View className="bg-white rounded-[24px] border border-zinc-100 px-5 py-4 mb-3">
              <Text className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-4">Products</Text>

              <View>
                {sale.items.map((item, index) => (
                  <View
                    key={item.id}
                    className={`flex-row items-center justify-between py-3.5 ${
                      index < sale.items.length - 1 ? "border-b border-zinc-100" : ""
                    }`}
                  >
                    <View className="flex-row items-center gap-3 flex-1 pr-3">
                      <View className="h-9 w-9 rounded-xl bg-zinc-50 border border-zinc-100 items-center justify-center flex-shrink-0">
                        <MaterialIcons name="inventory-2" size={14} color="#71717a" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-zinc-900 font-semibold text-[13px]" numberOfLines={1}>
                          {item.product.name}
                        </Text>
                        <Text className="text-zinc-400 text-[12px] mt-0.5">
                          {item.quantity} × {formatCurrency(item.unitPrice)}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-zinc-900 font-bold text-[14px]">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* ── Record Payment ── */}
            <View className="bg-white rounded-[24px] border border-zinc-100 px-5 py-4 mb-3">
              <Text className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-4">
                Record Payment
              </Text>

              {sale.dueAmount > 0 && (
                <View className="flex-row items-center gap-2 bg-red-50 border border-red-100 rounded-2xl px-4 py-3 mb-3">
                  <MaterialIcons name="pending" size={15} color="#ef4444" />
                  <Text className="text-red-600 text-[12px] font-medium">
                    Pending Due: {formatCurrency(sale.dueAmount)}
                  </Text>
                </View>
              )}

              <View className="flex-row items-center bg-zinc-50 border border-zinc-200 rounded-2xl px-4 mb-3 overflow-hidden">
                <Text className="text-zinc-400 text-[16px] mr-1">₹</Text>
                <TextInput
                  placeholder="Enter amount"
                  keyboardType="decimal-pad"
                  value={paymentAmount}
                  onChangeText={setPaymentAmount}
                  placeholderTextColor="#a1a1aa"
                  className="flex-1 py-4 text-zinc-900 text-[15px] font-medium"
                />
                {paymentAmount.length > 0 && (
                  <Pressable onPress={() => setPaymentAmount("")}>
                    <MaterialIcons name="cancel" size={18} color="#a1a1aa" />
                  </Pressable>
                )}
              </View>

              <Pressable
                onPress={handlePayment}
                disabled={isPaying || !paymentAmount}
                android_ripple={{ color: "rgba(255,255,255,0.15)", borderless: false }}
                className={`rounded-2xl py-4 items-center flex-row justify-center gap-2 ${
                  isPaying || !paymentAmount ? "bg-zinc-200" : "bg-zinc-900"
                }`}
              >
                {isPaying ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <MaterialIcons name="add-circle-outline" size={18} color={!paymentAmount ? "#a1a1aa" : "#fff"} />
                )}
                <Text
                  className={`font-semibold text-[14px] ${
                    isPaying || !paymentAmount ? "text-zinc-400" : "text-white"
                  }`}
                >
                  {isPaying ? "Recording…" : "Add Payment"}
                </Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </AppLayout>
  );
};

/* ── Sub-components ───────────────────────────────────────────────────────── */

const BillRow = ({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "green";
}) => (
  <View className="flex-row items-center justify-between">
    <Text className="text-zinc-500 text-[13px]">{label}</Text>
    <Text className={`text-[13px] font-semibold ${accent === "green" ? "text-emerald-600" : "text-zinc-800"}`}>
      {value}
    </Text>
  </View>
);