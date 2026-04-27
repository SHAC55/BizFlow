import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";
import { AppLayout } from "../components/AppLayout";
import { SubmitOverlay } from "../components/SubmitOverlay";
import { createSale, fetchCustomers, fetchProducts } from "../lib/api";
import { queryKeys } from "../lib/query";
import { useAuth } from "../providers/AuthProvider";
import type { Customer } from "../types/customer";
import type { Product } from "../types/product";
import type { AppRoute } from "../types/navigation";

type AddSalePageProps = {
  onBack: () => void;
  onCreated: (saleId: string) => void;
  onNavigate: (route: AppRoute) => void;
};

type SaleItem = {
  productId: string;
  quantity: string;
  price: string;
};

const formatCurrency = (value: number | string) =>
  `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export const AddSalePage = ({
  onBack,
  onCreated,
  onNavigate,
}: AddSalePageProps) => {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState<SaleItem[]>([
    { productId: "", quantity: "1", price: "0" },
  ]);
  const [discount, setDiscount] = useState("0");
  const [gstRate, setGstRate] = useState("18");
  const [paidAmount, setPaidAmount] = useState("0");
  const [reminderDate, setReminderDate] = useState("");
  const [reminderDateObj, setReminderDateObj] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const formatDateForDisplay = (d: Date) =>
    d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  const formatDateForBackend = (d: Date) => d.toISOString().split("T")[0];

  const handleDateChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === "android") setShowDatePicker(false);
    if (event.type === "dismissed" || !selected) return;
    setReminderDateObj(selected);
    setReminderDate(formatDateForBackend(selected));
  };

  useEffect(() => {
    if (!loading) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => sub.remove();
  }, [loading]);

  useEffect(() => {
    const token = session?.tokens.accessToken;
    if (!token) return;
    Promise.all([
      fetchCustomers(token, { page: 1, limit: 100, search: "" }),
      fetchProducts(token, { page: 1, limit: 100 }),
    ]).then(([c, p]) => {
      setCustomers(c.customers);
      setProducts(p.products);
    });
  }, []);

  const subTotal = useMemo(
    () =>
      items.reduce(
        (sum, i) => sum + (Number(i.quantity) || 0) * (Number(i.price) || 0),
        0,
      ),
    [items],
  );
  const discountAmount = Math.min(Number(discount) || 0, subTotal);
  const taxableAmount = Math.max(subTotal - discountAmount, 0);
  const gstAmount = Number(
    ((taxableAmount * (Number(gstRate) || 0)) / 100).toFixed(2),
  );
  const total = Number((taxableAmount + gstAmount).toFixed(2));
  const due = Math.max(total - (Number(paidAmount) || 0), 0);

  const filteredCustomers = customers.filter((c) =>
    `${c.name} ${c.mobile}`
      .toLowerCase()
      .includes(customerSearch.toLowerCase()),
  );
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()),
  );

  const selectedCustomer = customers.find((c) => c.id === customerId);

  const updateItem = (index: number, next: Partial<SaleItem>) => {
    const copy = [...items];
    copy[index] = { ...copy[index], ...next };
    if (next.productId) {
      const found = products.find((p) => p.id === next.productId);
      if (found) copy[index].price = String(found.price);
    }
    setItems(copy);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const token = session?.tokens.accessToken;
    if (!token) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    try {
      const res = await createSale(token, {
        customerId,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: Number(i.quantity),
          unitPrice: Number(i.price),
        })),
        subtotalAmount: subTotal,
        discountAmount,
        gstRate: Number(gstRate) || 0,
        gstAmount,
        totalAmount: total,
        paidAmount: Number(paidAmount),
        reminderDate: reminderDate || undefined,
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.sales.all, refetchType: "all" }),
        queryClient.invalidateQueries({ queryKey: queryKeys.customers.all, refetchType: "all" }),
        queryClient.invalidateQueries({ queryKey: queryKeys.products.all, refetchType: "all" }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all, refetchType: "all" }),
      ]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({ type: "success", text1: "Sale Created", text2: `₹${total.toLocaleString("en-IN")} sale recorded.` });
      onCreated(res.sale.id);
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const msg = err instanceof Error ? err.message : "Failed to create sale";
      Toast.show({ type: "error", text1: "Sale Failed", text2: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout
      currentRoute="sales"
      title="New Sale"
      subtitle="Easy billing & due tracking"
      onNavigate={onNavigate}
    >
      <SubmitOverlay visible={loading} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          automaticallyAdjustKeyboardInsets
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="px-4 pb-36 pt-3 mt-3"
        >
          {/* ── STEP 1: Customer ── */}
          <SectionHeader step={1} title="Select Customer" icon="person" />
          <View className="bg-white rounded-2xl border border-slate-100 p-4 mb-5">
            {/* Search */}
            <View className="flex-row items-center bg-slate-50 rounded-xl px-3 py-3 mb-3 border border-slate-100">
              <MaterialIcons name="search" size={17} color="#94a3b8" />
              <TextInput
                placeholder="Search by name or mobile..."
                placeholderTextColor="#94a3b8"
                value={customerSearch}
                onChangeText={setCustomerSearch}
                className="flex-1 ml-2 text-[14px] text-slate-800"
              />
            </View>

            {/* Selected badge */}
            {selectedCustomer && (
              <View className="flex-row items-center bg-slate-900 rounded-xl px-4 py-3 mb-3">
                <View className="h-8 w-8 rounded-full bg-white/20 items-center justify-center mr-3">
                  <Text className="text-white text-[13px] font-bold">
                    {selectedCustomer.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-white text-[14px] font-semibold">
                    {selectedCustomer.name}
                  </Text>
                  {selectedCustomer.mobile && (
                    <Text className="text-slate-300 text-[11px] mt-0.5">
                      {selectedCustomer.mobile}
                    </Text>
                  )}
                </View>
                <Pressable onPress={() => setCustomerId("")} android_ripple={{ color: "rgba(0,0,0,0.08)", borderless: true }}>
                  <MaterialIcons name="close" size={18} color="#94a3b8" />
                </Pressable>
              </View>
            )}

            {/* Customer chips */}
            {!selectedCustomer && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {filteredCustomers.slice(0, 20).map((c) => (
                    <Pressable
                      key={c.id}
                      onPress={() => setCustomerId(c.id)}
                      android_ripple={{ color: "rgba(0,0,0,0.08)", borderless: false }}
                      className="bg-slate-100 rounded-xl px-4 py-2.5 items-center"
                    >
                      <Text className="text-[13px] font-medium text-slate-700">
                        {c.name}
                      </Text>
                      {c.mobile && (
                        <Text className="text-[10px] text-slate-400 mt-0.5">
                          {c.mobile}
                        </Text>
                      )}
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            )}
          </View>

          {/* ── STEP 2: Products ── */}
          <SectionHeader step={2} title="Add Products" icon="inventory-2" />

          {items.map((item, index) => {
            const selectedProduct = products.find(
              (p) => p.id === item.productId,
            );
            const lineTotal =
              (Number(item.quantity) || 0) * (Number(item.price) || 0);

            return (
              <View
                key={index}
                className="bg-white rounded-2xl border border-slate-100 p-4 mb-3"
              >
                {/* Product header */}
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-[13px] font-semibold text-slate-500">
                    Item {index + 1}
                  </Text>
                  {items.length > 1 && (
                    <Pressable onPress={() => removeItem(index)} android_ripple={{ color: "rgba(239,68,68,0.15)", borderless: false }}>
                      <View className="bg-red-50 rounded-lg px-2.5 py-1.5 flex-row items-center gap-1">
                        <MaterialIcons
                          name="delete-outline"
                          size={14}
                          color="#ef4444"
                        />
                        <Text className="text-[11px] font-medium text-red-500">
                          Remove
                        </Text>
                      </View>
                    </Pressable>
                  )}
                </View>

                {/* Selected product pill */}
                {selectedProduct ? (
                  <View className="flex-row items-center bg-slate-900 rounded-xl px-4 py-3 mb-3">
                    <View className="h-8 w-8 rounded-lg bg-white/20 items-center justify-center mr-3">
                      <MaterialIcons
                        name="inventory-2"
                        size={14}
                        color="white"
                      />
                    </View>
                    <Text className="flex-1 text-white text-[14px] font-semibold">
                      {selectedProduct.name}
                    </Text>
                    <Pressable
                      onPress={() =>
                        updateItem(index, { productId: "", price: "0" })
                      }
                      android_ripple={{ color: "rgba(0,0,0,0.08)", borderless: true }}
                    >
                      <MaterialIcons name="close" size={18} color="#94a3b8" />
                    </Pressable>
                  </View>
                ) : (
                  <>
                    <View className="flex-row items-center bg-slate-50 rounded-xl px-3 py-3 mb-3 border border-slate-100">
                      <MaterialIcons name="search" size={17} color="#94a3b8" />
                      <TextInput
                        placeholder="Search product..."
                        placeholderTextColor="#94a3b8"
                        value={productSearch}
                        onChangeText={setProductSearch}
                        className="flex-1 ml-2 text-[14px] text-slate-800"
                      />
                    </View>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                    >
                      <View className="flex-row gap-2 mb-1">
                        {filteredProducts.slice(0, 20).map((p) => (
                          <Pressable
                            key={p.id}
                            onPress={() =>
                              updateItem(index, { productId: p.id })
                            }
                            android_ripple={{ color: "rgba(0,0,0,0.08)", borderless: false }}
                            className="bg-slate-100 rounded-xl px-4 py-2.5 items-center"
                          >
                            <Text className="text-[13px] font-medium text-slate-700">
                              {p.name}
                            </Text>
                            <Text className="text-[10px] text-slate-400 mt-0.5">
                              ₹{p.price}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    </ScrollView>
                  </>
                )}

                {/* Qty + Price row */}
                <View className="flex-row gap-3 mt-1">
                  <View className="flex-1">
                    <Text className="text-[11px] font-medium text-slate-400 mb-1.5 ml-1">
                      QUANTITY
                    </Text>
                    <View className="flex-row items-center bg-slate-50 border border-slate-100 rounded-xl overflow-hidden">
                      <Pressable
                        onPress={() =>
                          updateItem(index, {
                            quantity: String(
                              Math.max(1, (Number(item.quantity) || 1) - 1),
                            ),
                          })
                        }
                        android_ripple={{ color: "rgba(0,0,0,0.08)", borderless: false }}
                        className="px-4 py-3.5"
                      >
                        <MaterialIcons
                          name="remove"
                          size={16}
                          color="#475569"
                        />
                      </Pressable>
                      <TextInput
                        value={item.quantity}
                        onChangeText={(v) => updateItem(index, { quantity: v })}
                        keyboardType="number-pad"
                        className="flex-1 text-center text-[15px] font-semibold text-slate-800"
                      />
                      <Pressable
                        onPress={() =>
                          updateItem(index, {
                            quantity: String((Number(item.quantity) || 0) + 1),
                          })
                        }
                        android_ripple={{ color: "rgba(0,0,0,0.08)", borderless: false }}
                        className="px-4 py-3.5"
                      >
                        <MaterialIcons name="add" size={16} color="#475569" />
                      </Pressable>
                    </View>
                  </View>

                  <View className="flex-1">
                    <Text className="text-[11px] font-medium text-slate-400 mb-1.5 ml-1">
                      UNIT PRICE
                    </Text>
                    <View className="flex-row items-center bg-slate-50 border border-slate-100 rounded-xl px-3 py-3.5">
                      <Text className="text-slate-400 text-[14px] mr-1">₹</Text>
                      <TextInput
                        value={item.price}
                        onChangeText={(v) => updateItem(index, { price: v })}
                        keyboardType="decimal-pad"
                        className="flex-1 text-[15px] font-semibold text-slate-800"
                      />
                    </View>
                  </View>
                </View>

                {/* Line total */}
                {lineTotal > 0 && (
                  <View className="mt-3 flex-row justify-end items-center">
                    <Text className="text-[12px] text-slate-400 mr-2">
                      Line total:
                    </Text>
                    <Text className="text-[14px] font-bold text-slate-800">
                      {formatCurrency(lineTotal)}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}

          {/* Add product button */}
          <Pressable
            onPress={() =>
              setItems([...items, { productId: "", quantity: "1", price: "0" }])
            }
            android_ripple={{ color: "rgba(0,0,0,0.08)", borderless: false }}
            className="border-2 border-dashed border-slate-200 rounded-2xl py-4 items-center mb-5 flex-row justify-center gap-2"
          >
            <MaterialIcons
              name="add-circle-outline"
              size={20}
              color="#64748b"
            />
            <Text className="text-[14px] font-semibold text-slate-500">
              Add Another Product
            </Text>
          </Pressable>

          {/* ── STEP 3: Payment ── */}
          <SectionHeader step={3} title="Payment Details" icon="payments" />
          <View className="bg-white rounded-2xl border border-slate-100 p-4 mb-5">
            {/* Discount */}
            <View className="mb-3">
              <Text className="text-[11px] font-medium text-slate-400 mb-1.5 ml-1">
                DISCOUNT (₹)
              </Text>
              <View className="flex-row items-center bg-slate-50 border border-slate-100 rounded-xl px-4 py-3.5">
                <MaterialIcons name="local-offer" size={16} color="#94a3b8" />
                <TextInput
                  value={discount}
                  onChangeText={setDiscount}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor="#94a3b8"
                  className="flex-1 ml-2 text-[15px] text-slate-800"
                />
              </View>
            </View>

            <View className="mb-3">
              <Text className="text-[11px] font-medium text-slate-400 mb-1.5 ml-1">
                GST RATE (%)
              </Text>
              <View className="flex-row items-center bg-slate-50 border border-slate-100 rounded-xl px-4 py-3.5">
                <MaterialIcons name="receipt" size={16} color="#94a3b8" />
                <TextInput
                  value={gstRate}
                  onChangeText={setGstRate}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor="#94a3b8"
                  className="flex-1 ml-2 text-[15px] text-slate-800"
                />
              </View>
              <Text className="mt-1.5 ml-1 text-[11px] text-slate-400">
                GST amount: {formatCurrency(gstAmount)}
              </Text>
            </View>

            {/* Paid amount */}
            <View className="mb-3">
              <Text className="text-[11px] font-medium text-slate-400 mb-1.5 ml-1">
                AMOUNT PAID (₹)
              </Text>
              <View className="flex-row items-center bg-slate-50 border border-slate-100 rounded-xl px-4 py-3.5">
                <MaterialIcons
                  name="currency-rupee"
                  size={16}
                  color="#94a3b8"
                />
                <TextInput
                  value={paidAmount}
                  onChangeText={setPaidAmount}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor="#94a3b8"
                  className="flex-1 ml-2 text-[15px] text-slate-800"
                />
              </View>
            </View>

            {/* Reminder date */}
            <View>
              <Text className="text-[11px] font-medium text-slate-400 mb-1.5 ml-1">
                REMINDER DATE (optional)
              </Text>
              <Pressable
                onPress={() => setShowDatePicker(true)}
                android_ripple={{ color: "rgba(0,0,0,0.08)", borderless: false }}
                className="flex-row items-center bg-slate-50 border border-slate-100 rounded-xl px-4 py-3.5"
              >
                <MaterialIcons name="event" size={16} color="#94a3b8" />
                <Text className={`flex-1 ml-2 text-[15px] ${reminderDateObj ? "text-slate-800" : "text-slate-400"}`}>
                  {reminderDateObj ? formatDateForDisplay(reminderDateObj) : "Set reminder date"}
                </Text>
                {reminderDateObj && (
                  <Pressable
                    onPress={() => { setReminderDateObj(undefined); setReminderDate(""); }}
                    android_ripple={{ color: "rgba(0,0,0,0.08)", borderless: true }}
                    hitSlop={8}
                  >
                    <MaterialIcons name="close" size={16} color="#94a3b8" />
                  </Pressable>
                )}
              </Pressable>
              {showDatePicker && (
                <DateTimePicker
                  value={reminderDateObj ?? new Date()}
                  mode="date"
                  display={Platform.OS === "ios" ? "compact" : "default"}
                  minimumDate={new Date()}
                  onChange={handleDateChange}
                />
              )}
            </View>
          </View>

          {/* ── Summary card ── */}
          <View className="bg-slate-900 rounded-2xl p-5 mb-5">
            <Text className="text-white text-[15px] font-bold mb-4">
              Order Summary
            </Text>

            <SummaryRow
              label="Subtotal"
              value={formatCurrency(subTotal)}
              light
            />
            {discountAmount > 0 && (
              <SummaryRow
                label="Discount"
                value={`- ${formatCurrency(discountAmount)}`}
                light
              />
            )}
            {gstAmount > 0 && (
              <SummaryRow
                label={`GST (${Number(gstRate) || 0}%)`}
                value={formatCurrency(gstAmount)}
                light
              />
            )}
            <View className="h-[0.5px] bg-white/20 my-3" />
            <SummaryRow label="Total" value={formatCurrency(total)} bold />
            <SummaryRow label="Paid" value={formatCurrency(paidAmount)} light />

            {/* Due highlight */}
            <View className="mt-3 bg-white/10 rounded-xl px-4 py-3 flex-row justify-between items-center">
              <View className="flex-row items-center gap-2">
                <MaterialIcons
                  name="account-balance-wallet"
                  size={16}
                  color="#fca5a5"
                />
                <Text className="text-red-300 text-[13px] font-semibold">
                  Due Amount
                </Text>
              </View>
              <Text className="text-red-300 text-[18px] font-bold">
                {formatCurrency(due)}
              </Text>
            </View>
          </View>

          {/* Submit */}
          <Pressable
            onPress={handleSubmit}
            disabled={loading || !customerId}
            android_ripple={{ color: "rgba(255,255,255,0.1)", borderless: false }}
            className={`rounded-2xl py-4 items-center flex-row justify-center gap-2 ${
              loading || !customerId ? "bg-slate-300" : "bg-slate-900"
            }`}
          >
            {loading ? (
              <Text className="text-white text-[16px] font-bold">
                Saving sale...
              </Text>
            ) : (
              <>
                <MaterialIcons name="check-circle" size={20} color="white" />
                <Text className="text-white text-[16px] font-bold">
                  Create Sale
                </Text>
              </>
            )}
          </Pressable>

          {!customerId && (
            <Text className="text-center text-[12px] text-slate-400 mt-2">
              Please select a customer to continue
            </Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </AppLayout>
  );
};

/* ── Sub-components ── */

const SectionHeader = ({
  step,
  title,
  icon,
}: {
  step: number;
  title: string;
  icon: string;
}) => (
  <View className="flex-row items-center gap-3 mb-3">
    <View className="h-7 w-7 rounded-full bg-slate-900 items-center justify-center">
      <Text className="text-white text-[12px] font-bold">{step}</Text>
    </View>
    <MaterialIcons name={icon as any} size={16} color="#475569" />
    <Text className="text-[15px] font-bold text-slate-700">{title}</Text>
  </View>
);

const SummaryRow = ({
  label,
  value,
  bold,
  light,
}: {
  label: string;
  value: string;
  bold?: boolean;
  light?: boolean;
}) => (
  <View className="flex-row justify-between items-center py-1">
    <Text className={`text-[13px] ${light ? "text-slate-400" : "text-white"}`}>
      {label}
    </Text>
    <Text
      className={`text-[${bold ? "16" : "14"}px] ${
        bold
          ? "text-white font-bold"
          : light
            ? "text-slate-300 font-medium"
            : "text-white"
      }`}
    >
      {value}
    </Text>
  </View>
);
