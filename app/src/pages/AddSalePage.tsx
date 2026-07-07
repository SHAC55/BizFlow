import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
} from "react";
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
  ActivityIndicator,
  Linking,
  Animated as RNAnimated,
  Easing,
} from "react-native";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";
import Animated, {
  FadeInDown,
  FadeIn,
  FadeOut,
  ZoomIn,
  ZoomOut,
} from "react-native-reanimated";
import { AppLayout } from "../components/AppLayout";
import {
  createCustomer,
  createSale,
  fetchCustomers,
  fetchProducts,
  fetchServices,
} from "../lib/api";
import { queryKeys } from "../lib/query";
import { useAuth } from "../providers/AuthProvider";
import type { Customer } from "../types/customer";
import type { Product } from "../types/product";
import type { Service } from "../types/service";
import type { AppRoute } from "../types/navigation";

type IconName = ComponentProps<typeof MaterialIcons>["name"];
type AddSalePageProps = {
  onBack: () => void;
  onCreated: (saleId: string) => void;
  onNavigate: (route: AppRoute) => void;
};
type SaleItem = {
  itemType: "product" | "service";
  productId: string;
  serviceId: string;
  quantity: string;
  price: string;
};

const fmt = (v: number | string) =>
  `₹${Number(v || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

// ── Save Stage Overlay ───────────────────────────────────────────
type SaveStage = "validating" | "saving" | "syncing" | "done";

const STAGE_CONFIG: Record<SaveStage, { label: string; sub: string; color: string }> = {
  validating: { label: "Validating",  sub: "Checking your order…",        color: "#FFFFFF" },
  saving:     { label: "Recording",   sub: "Writing sale to ledger…",      color: "#FFFFFF" },
  syncing:    { label: "Syncing",     sub: "Refreshing your dashboard…",   color: "#FFFFFF" },
  done:       { label: "Sale Done!",  sub: "Transaction recorded ✓",       color: "#FFFFFF" },
};

const SaveOverlay = ({
  visible,
  stage,
  customerName,
  totalAmount,
}: {
  visible: boolean;
  stage: SaveStage;
  customerName: string;
  totalAmount: string;
}) => {
  const spinAnim = useRef(new RNAnimated.Value(0)).current;
  const pulseAnim = useRef(new RNAnimated.Value(1)).current;
  const progressAnim = useRef(new RNAnimated.Value(0)).current;

  const stageOrder: SaveStage[] = ["validating", "saving", "syncing", "done"];
  const stageIndex = stageOrder.indexOf(stage);
  const progress = stageIndex === -1 ? 0 : (stageIndex + 1) / stageOrder.length;

  useEffect(() => {
    if (!visible) return;
    spinAnim.setValue(0);
    const spin = RNAnimated.loop(
      RNAnimated.timing(spinAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    spin.start();
    const pulse = RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        RNAnimated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => {
      spin.stop();
      pulse.stop();
    };
  }, [visible, stage]);

  useEffect(() => {
    RNAnimated.timing(progressAnim, {
      toValue: progress,
      duration: 450,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress]);

  if (!visible) return null;

  const cfg = STAGE_CONFIG[stage];
  const isDone = stage === "done";
  const spinDeg = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(300)}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 100,
        backgroundColor: "rgba(0,0,0,0.90)",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Animated.View
        entering={ZoomIn.duration(320).springify().damping(14)}
        exiting={ZoomOut.duration(200)}
        style={{
          backgroundColor: "#000000",
          borderRadius: 28,
          padding: 32,
          width: 300,
          alignItems: "center",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.08)",
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: 16 },
          shadowOpacity: 0.4,
          shadowRadius: 40,
          elevation: 20,
        }}
      >
        {/* Icon / Avatar */}
        <RNAnimated.View
          style={{ transform: [{ scale: pulseAnim }], marginBottom: 20 }}
        >
          <View
            style={{
              height: 72,
              width: 72,
              borderRadius: 20,
              backgroundColor: isDone ? "#052e16" : "#0a1a0f",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1.5,
              borderColor: isDone ? "#10B981" : "#1a3a20",
              shadowColor: cfg.color,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: isDone ? 0.5 : 0.2,
              shadowRadius: 16,
              elevation: 10,
            }}
          >
            <MaterialIcons
              name={isDone ? "check-circle" : "add-shopping-cart"}
              size={32}
              color={cfg.color}
            />
          </View>

          {/* Spinning ring */}
          {!isDone && (
            <RNAnimated.View
              style={{
                position: "absolute",
                inset: -6,
                borderRadius: 28,
                borderWidth: 2,
                borderColor: "transparent",
                borderTopColor: cfg.color,
                borderRightColor: `${cfg.color}44`,
                transform: [{ rotate: spinDeg }],
              }}
            />
          )}

          {/* Done badge */}
          {isDone && (
            <Animated.View
              entering={ZoomIn.duration(300).springify()}
              style={{
                position: "absolute",
                bottom: -4,
                right: -4,
                backgroundColor: "#0D1A12",
                borderRadius: 12,
                padding: 2,
              }}
            >
              <MaterialIcons name="verified" size={20} color="#10B981" />
            </Animated.View>
          )}
        </RNAnimated.View>

        {/* Sale details */}
        {customerName.trim() ? (
          <Text
            style={{
              fontSize: 13,
              color: "#34d399",
              fontWeight: "700",
              marginBottom: 2,
              textAlign: "center",
            }}
            numberOfLines={1}
          >
            {customerName.trim()}
          </Text>
        ) : null}
        {totalAmount !== "₹0" && (
          <Text
            style={{
              fontSize: 22,
              fontWeight: "800",
              color: "#fff",
              marginBottom: 8,
              letterSpacing: -0.5,
            }}
          >
            {totalAmount}
          </Text>
        )}

        {/* Stage label */}
        <Text
          style={{
            fontSize: 18,
            fontWeight: "800",
            color: "#fff",
            marginBottom: 4,
            textAlign: "center",
            letterSpacing: -0.3,
          }}
        >
          {cfg.label}
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: "#4a7a5a",
            textAlign: "center",
            marginBottom: 24,
            lineHeight: 18,
          }}
        >
          {cfg.sub}
        </Text>

        {/* Progress bar */}
        <View
          style={{
            width: "100%",
            height: 4,
            backgroundColor: "#1a3a20",
            borderRadius: 4,
            overflow: "hidden",
            marginBottom: 20,
          }}
        >
          <RNAnimated.View
            style={{
              height: "100%",
              borderRadius: 4,
              backgroundColor: cfg.color,
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
              shadowColor: cfg.color,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.9,
              shadowRadius: 4,
            }}
          />
        </View>

        {/* Stage dots */}
        <View style={{ flexDirection: "row", gap: 8 }}>
          {stageOrder.map((s, i) => {
            const active = i <= stageIndex;
            const current = i === stageIndex;
            return (
              <View
                key={s}
                style={{
                  height: current ? 8 : 6,
                  width: current ? 20 : 6,
                  borderRadius: 4,
                  backgroundColor: active ? cfg.color : "#1a3a20",
                  opacity: active ? 1 : 0.5,
                }}
              />
            );
          })}
        </View>

        <Text
          style={{
            fontSize: 11,
            color: "#2d5a3a",
            marginTop: 12,
            fontWeight: "600",
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          Step {Math.min(stageIndex + 1, stageOrder.length)} of{" "}
          {stageOrder.length}
        </Text>
      </Animated.View>
    </Animated.View>
  );
};

// ── Main Component ───────────────────────────────────────────────
export const AddSalePage = ({
  onBack,
  onCreated,
  onNavigate,
}: AddSalePageProps) => {
  const { session } = useAuth();
  const qc = useQueryClient();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [serviceSearch, setServiceSearch] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState<SaleItem[]>([
    {
      itemType: "product",
      productId: "",
      serviceId: "",
      quantity: "1",
      price: "0",
    },
  ]);
  const [discount, setDiscount] = useState("0");
  const [gstRate, setGstRate] = useState("18");
  const [paidAmount, setPaidAmount] = useState("0");
  const [reminderDate, setReminderDate] = useState("");
  const [reminderDateObj, setReminderDateObj] = useState<Date | undefined>(
    undefined,
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveStage, setSaveStage] = useState<SaveStage>("validating");
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerMobile, setNewCustomerMobile] = useState("");
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const fmtDateDisplay = (d: Date) =>
    d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  const fmtDateBackend = (d: Date) => d.toISOString().split("T")[0];

  const handleDateChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === "android") setShowDatePicker(false);
    if (event.type === "dismissed" || !selected) return;
    setReminderDateObj(selected);
    setReminderDate(fmtDateBackend(selected));
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
      fetchServices(token, { page: 1, limit: 100 }),
    ]).then(([c, p, s]) => {
      setCustomers(c.customers);
      setProducts(p.products);
      setServices(s.services);
    });
  }, []);

  const subTotal = useMemo(
    () =>
      items.reduce(
        (s, i) => s + (Number(i.quantity) || 0) * (Number(i.price) || 0),
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
  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(serviceSearch.toLowerCase()),
  );
  const selectedCustomer = customers.find((c) => c.id === customerId);

  const updateItem = (i: number, next: Partial<SaleItem>) => {
    const copy = [...items];
    copy[i] = { ...copy[i], ...next };
    if (next.productId) {
      const f = products.find((p) => p.id === next.productId);
      if (f) copy[i].price = String(f.price);
    }
    if (next.serviceId) {
      const f = services.find((s) => s.id === next.serviceId);
      if (f) copy[i].price = String(f.price);
    }
    setItems(copy);
  };
  const setItemType = (i: number, type: "product" | "service") => {
    const copy = [...items];
    copy[i] = {
      ...copy[i],
      itemType: type,
      productId: "",
      serviceId: "",
      price: "0",
    };
    setItems(copy);
  };
  const removeItem = (i: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, j) => j !== i));
  };

  const openQuickAdd = (prefillName = "") => {
    setNewCustomerName(prefillName);
    setNewCustomerMobile("");
    setShowQuickAdd(true);
  };

  const closeQuickAdd = () => {
    setShowQuickAdd(false);
    setNewCustomerName("");
    setNewCustomerMobile("");
  };

  const handleQuickAddCustomer = async () => {
    const token = session?.tokens.accessToken;
    if (!token || !newCustomerName.trim() || !newCustomerMobile.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "Name and mobile number are required.",
      });
      return;
    }
    setIsCreatingCustomer(true);
    try {
      const created = await createCustomer(token, {
        name: newCustomerName.trim(),
        mobile: newCustomerMobile.trim(),
      });
      const newCustomer: Customer = {
        id: created.id,
        name: newCustomerName.trim(),
        mobile: newCustomerMobile.trim(),
        businessId: "",
        email: null,
        address: null,
        notes: null,
        openingBalance: 0,
        archivedAt: null,
        createdAt: new Date().toISOString(),
        orders: 0,
        totalInvoiced: 0,
        totalPayment: 0,
        due: 0,
      };
      setCustomers((prev) => [newCustomer, ...prev]);
      setCustomerId(created.id);
      setCustomerSearch("");
      closeQuickAdd();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({
        type: "success",
        text1: "Customer Added",
        text2: `${newCustomer.name} added and selected.`,
      });
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.show({
        type: "error",
        text1: "Failed to add customer",
        text2: err instanceof Error ? err.message : "",
      });
    } finally {
      setIsCreatingCustomer(false);
    }
  };

  const handleSubmit = async () => {
    const token = session?.tokens.accessToken;
    if (!token) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      setLoading(true);
      setSaveStage("validating");
      await sleep(500);

      setSaveStage("saving");
      const res = await createSale(token, {
        customerId,
        items: items.map((i) => ({
          ...(i.itemType === "service"
            ? { serviceId: i.serviceId }
            : { productId: i.productId }),
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

      setSaveStage("syncing");
      await Promise.all([
        qc.invalidateQueries({
          queryKey: queryKeys.sales.all,
          refetchType: "all",
        }),
        qc.invalidateQueries({
          queryKey: queryKeys.customers.all,
          refetchType: "all",
        }),
        qc.invalidateQueries({
          queryKey: queryKeys.products.all,
          refetchType: "all",
        }),
        qc.invalidateQueries({
          queryKey: queryKeys.dashboard.all,
          refetchType: "all",
        }),
      ]);

      await sleep(400);
      setSaveStage("done");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await sleep(900);

      Toast.show({
        type: "success",
        text1: "Sale Created! 🎉",
        text2: `${fmt(total)} recorded.`,
      });

      if ((res.lowStockProducts?.length ?? 0) > 0 && session?.user?.mobile) {
        setTimeout(async () => {
          const list = res
            .lowStockProducts!.map(
              (p: any) =>
                `- ${p.name} (Left: ${p.quantity}, Min: ${p.minimumQuantity})`,
            )
            .join("\n");
          const msg = `🚨 *Low Stock Alert*\n\n${list}\n\nPlease restock soon.`;
          const digits = session.user!.mobile!.replace(/\D/g, "");
          const phone =
            digits.startsWith("91") && digits.length >= 12
              ? digits
              : `91${digits}`;
          try {
            await Linking.openURL(
              `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`,
            );
          } catch {}
        }, 500);
      }

      onCreated(res.sale.id);
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.show({
        type: "error",
        text1: "Sale Failed",
        text2: err instanceof Error ? err.message : "",
      });
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
      <SaveOverlay
        visible={loading}
        stage={saveStage}
        customerName={selectedCustomer?.name ?? ""}
        totalAmount={fmt(total)}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}
          contentContainerClassName="px-4 pb-36 pt-3"
        >
          {/* Header */}
          <Animated.View entering={FadeInDown.duration(400).delay(0)}>
            <View className="mb-5 flex-row items-center gap-4">
              <Pressable
                onPress={onBack}
                className="h-10 w-10 rounded-xl bg-slate-100 items-center justify-center"
              >
                <MaterialIcons name="arrow-back" size={20} color="#334155" />
              </Pressable>
              <View className="flex-1">
                <Text className="text-[22px] font-bold text-slate-900 tracking-tight">
                  New Sale
                </Text>
                <Text className="text-[13px] text-slate-400 mt-0.5">
                  Create a new transaction
                </Text>
              </View>
              <View className="h-12 w-12 rounded-2xl bg-emerald-50 items-center justify-center">
                <MaterialIcons
                  name="add-shopping-cart"
                  size={22}
                  color="#10B981"
                />
              </View>
            </View>
          </Animated.View>

          {/* ── Step 1: Customer ── */}
          <Animated.View entering={FadeInDown.duration(400).delay(80)}>
            <StepHeader
              step={1}
              icon="person"
              color="#6366F1"
              bg="#EEF2FF"
              title="Select Customer"
            />
            <View
              className="bg-white rounded-2xl border border-slate-100 p-4 mb-5"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.03,
                shadowRadius: 8,
                elevation: 1,
              }}
            >
              {selectedCustomer ? (
                <View className="flex-row items-center bg-slate-900 rounded-xl px-4 py-3">
                  <View className="h-9 w-9 rounded-lg bg-indigo-500/30 items-center justify-center mr-3">
                    <Text className="text-white text-[14px] font-bold">
                      {selectedCustomer.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-[14px] font-semibold">
                      {selectedCustomer.name}
                    </Text>
                    <Text className="text-slate-400 text-[11px] mt-0.5">
                      {selectedCustomer.mobile}
                    </Text>
                  </View>
                  <Pressable onPress={() => setCustomerId("")}>
                    <MaterialIcons name="close" size={18} color="#94A3B8" />
                  </Pressable>
                </View>
              ) : (
                <>
                  <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 gap-2 mb-3">
                    <MaterialIcons name="search" size={17} color="#94A3B8" />
                    <TextInput
                      value={customerSearch}
                      onChangeText={(v) => {
                        setCustomerSearch(v);
                        setShowQuickAdd(false);
                      }}
                      placeholder="Search by name or mobile…"
                      placeholderTextColor="#CBD5E1"
                      className="flex-1 text-[14px] text-slate-900"
                    />
                    {customerSearch.length > 0 && (
                      <Pressable
                        onPress={() => {
                          setCustomerSearch("");
                          setShowQuickAdd(false);
                        }}
                      >
                        <MaterialIcons
                          name="cancel"
                          size={17}
                          color="#CBD5E1"
                        />
                      </Pressable>
                    )}
                  </View>

                  {/* Results */}
                  {filteredCustomers.length > 0 ? (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                    >
                      <View className="flex-row gap-2">
                        {filteredCustomers.slice(0, 20).map((c) => (
                          <Pressable
                            key={c.id}
                            onPress={() => {
                              setCustomerId(c.id);
                              setCustomerSearch("");
                              setShowQuickAdd(false);
                            }}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 items-center"
                          >
                            <Text className="text-[13px] font-semibold text-slate-700">
                              {c.name}
                            </Text>
                            <Text className="text-[10px] text-slate-400 mt-0.5">
                              {c.mobile}
                            </Text>
                          </Pressable>
                        ))}
                        {/* + New Customer chip at end of list */}
                        <Pressable
                          onPress={() => openQuickAdd(customerSearch.trim())}
                          className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2.5 items-center justify-center flex-row gap-1.5"
                        >
                          <MaterialIcons
                            name="person-add"
                            size={13}
                            color="#6366F1"
                          />
                          <Text className="text-[13px] font-semibold text-indigo-600">
                            New
                          </Text>
                        </Pressable>
                      </View>
                    </ScrollView>
                  ) : customerSearch.trim().length > 0 ? (
                    /* No results state */
                    <Pressable
                      onPress={() => openQuickAdd(customerSearch.trim())}
                      className="flex-row items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3.5"
                    >
                      <View className="h-9 w-9 rounded-xl bg-indigo-100 items-center justify-center">
                        <MaterialIcons
                          name="person-add"
                          size={18}
                          color="#6366F1"
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-[13px] font-semibold text-indigo-700">
                          No customer found
                        </Text>
                        <Text className="text-[11px] text-indigo-400 mt-0.5">
                          Tap to add "{customerSearch.trim()}" as a new customer
                        </Text>
                      </View>
                      <MaterialIcons
                        name="chevron-right"
                        size={18}
                        color="#6366F1"
                      />
                    </Pressable>
                  ) : null}

                  {/* Quick Add inline form */}
                  {showQuickAdd && (
                    <Animated.View
                      entering={FadeInDown.duration(250)}
                      className="mt-3 bg-indigo-50 border border-indigo-100 rounded-2xl p-4"
                    >
                      <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center gap-2">
                          <MaterialIcons
                            name="person-add"
                            size={15}
                            color="#6366F1"
                          />
                          <Text className="text-[13px] font-bold text-indigo-700">
                            Add New Customer
                          </Text>
                        </View>
                        <Pressable onPress={closeQuickAdd} hitSlop={8}>
                          <MaterialIcons
                            name="close"
                            size={17}
                            color="#94A3B8"
                          />
                        </Pressable>
                      </View>

                      <View className="flex-row items-center bg-white border border-indigo-100 rounded-xl px-3.5 py-3 gap-2 mb-2">
                        <MaterialIcons
                          name="person"
                          size={15}
                          color="#94A3B8"
                        />
                        <TextInput
                          value={newCustomerName}
                          onChangeText={setNewCustomerName}
                          placeholder="Customer name"
                          placeholderTextColor="#CBD5E1"
                          className="flex-1 text-[14px] text-slate-900"
                        />
                      </View>

                      <View className="flex-row items-center bg-white border border-indigo-100 rounded-xl px-3.5 py-3 gap-2 mb-3">
                        <MaterialIcons name="phone" size={15} color="#94A3B8" />
                        <TextInput
                          value={newCustomerMobile}
                          onChangeText={setNewCustomerMobile}
                          placeholder="Mobile number"
                          placeholderTextColor="#CBD5E1"
                          keyboardType="phone-pad"
                          className="flex-1 text-[14px] text-slate-900"
                        />
                      </View>

                      <Pressable
                        onPress={handleQuickAddCustomer}
                        disabled={
                          isCreatingCustomer ||
                          !newCustomerName.trim() ||
                          !newCustomerMobile.trim()
                        }
                        className="flex-row items-center justify-center gap-2 rounded-xl py-3"
                        style={{
                          backgroundColor:
                            isCreatingCustomer ||
                            !newCustomerName.trim() ||
                            !newCustomerMobile.trim()
                              ? "#c7d2fe"
                              : "#6366F1",
                        }}
                      >
                        {isCreatingCustomer ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <MaterialIcons name="check" size={16} color="#fff" />
                        )}
                        <Text className="text-[13px] font-bold text-white">
                          {isCreatingCustomer ? "Adding…" : "Create & Select"}
                        </Text>
                      </Pressable>
                    </Animated.View>
                  )}
                </>
              )}
            </View>
          </Animated.View>

          {/* ── Step 2: Items (products + services) ── */}
          <Animated.View entering={FadeInDown.duration(400).delay(160)}>
            <StepHeader
              step={2}
              icon="inventory-2"
              color="#F59E0B"
              bg="#FEF3C7"
              title="Add Items"
            />
            {items.map((item, idx) => {
              const isService = item.itemType === "service";
              const prod = products.find((p) => p.id === item.productId);
              const svc = services.find((s) => s.id === item.serviceId);
              const lineTotal =
                (Number(item.quantity) || 0) * (Number(item.price) || 0);
              return (
                <View
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-100 p-4 mb-3"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.03,
                    shadowRadius: 8,
                    elevation: 1,
                  }}
                >
                  <View className="flex-row justify-between items-center mb-3">
                    <View className="flex-row items-center gap-2">
                      <View className="h-6 w-6 rounded-md bg-amber-50 items-center justify-center">
                        <Text className="text-[10px] font-bold text-amber-600">
                          {idx + 1}
                        </Text>
                      </View>
                      <Text className="text-[12px] font-semibold text-slate-500">
                        Item {idx + 1}
                      </Text>
                    </View>
                    {items.length > 1 && (
                      <Pressable
                        onPress={() => removeItem(idx)}
                        className="flex-row items-center gap-1 bg-red-50 rounded-lg px-2.5 py-1.5"
                      >
                        <MaterialIcons
                          name="delete-outline"
                          size={14}
                          color="#EF4444"
                        />
                        <Text className="text-[10px] font-bold text-red-500">
                          Remove
                        </Text>
                      </Pressable>
                    )}
                  </View>

                  {/* Type toggle */}
                  <View className="flex-row items-center bg-slate-100 rounded-xl p-1 mb-3">
                    <Pressable
                      onPress={() => setItemType(idx, "product")}
                      className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-lg py-2 ${!isService ? "bg-white" : ""}`}
                      style={
                        !isService
                          ? {
                              shadowColor: "#000",
                              shadowOffset: { width: 0, height: 1 },
                              shadowOpacity: 0.05,
                              shadowRadius: 4,
                              elevation: 1,
                            }
                          : undefined
                      }
                    >
                      <MaterialIcons
                        name="inventory-2"
                        size={13}
                        color={!isService ? "#0F172A" : "#94A3B8"}
                      />
                      <Text
                        className={`text-[12px] font-bold ${!isService ? "text-slate-900" : "text-slate-500"}`}
                      >
                        Product
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setItemType(idx, "service")}
                      className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-lg py-2 ${isService ? "bg-white" : ""}`}
                      style={
                        isService
                          ? {
                              shadowColor: "#000",
                              shadowOffset: { width: 0, height: 1 },
                              shadowOpacity: 0.05,
                              shadowRadius: 4,
                              elevation: 1,
                            }
                          : undefined
                      }
                    >
                      <MaterialIcons
                        name="build"
                        size={13}
                        color={isService ? "#0F172A" : "#94A3B8"}
                      />
                      <Text
                        className={`text-[12px] font-bold ${isService ? "text-slate-900" : "text-slate-500"}`}
                      >
                        Service
                      </Text>
                    </Pressable>
                  </View>

                  {isService ? (
                    svc ? (
                      <View className="flex-row items-center bg-slate-900 rounded-xl px-4 py-3 mb-3">
                        <View className="h-8 w-8 rounded-lg bg-indigo-500/25 items-center justify-center mr-3">
                          <MaterialIcons
                            name="build"
                            size={14}
                            color="#A5B4FC"
                          />
                        </View>
                        <View className="flex-1">
                          <Text className="text-white text-[14px] font-semibold">
                            {svc.name}
                          </Text>
                          <Text className="text-slate-400 text-[10px] mt-0.5">
                            {svc.code ?? svc.category ?? "Service"}
                            {svc.durationMinutes
                              ? ` · ${svc.durationMinutes} min`
                              : ""}
                          </Text>
                        </View>
                        <Pressable
                          onPress={() =>
                            updateItem(idx, { serviceId: "", price: "0" })
                          }
                        >
                          <MaterialIcons
                            name="close"
                            size={18}
                            color="#94A3B8"
                          />
                        </Pressable>
                      </View>
                    ) : (
                      <>
                        <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 gap-2 mb-3">
                          <MaterialIcons
                            name="search"
                            size={17}
                            color="#94A3B8"
                          />
                          <TextInput
                            value={serviceSearch}
                            onChangeText={setServiceSearch}
                            placeholder="Search service…"
                            placeholderTextColor="#CBD5E1"
                            className="flex-1 text-[14px] text-slate-900"
                          />
                        </View>
                        {filteredServices.length > 0 ? (
                          <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                          >
                            <View className="flex-row gap-2 mb-1">
                              {filteredServices.slice(0, 20).map((s) => (
                                <Pressable
                                  key={s.id}
                                  onPress={() =>
                                    updateItem(idx, { serviceId: s.id })
                                  }
                                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 items-center"
                                >
                                  <Text className="text-[13px] font-semibold text-slate-700">
                                    {s.name}
                                  </Text>
                                  <Text className="text-[10px] text-slate-400 mt-0.5">
                                    ₹{s.price}
                                    {s.durationMinutes
                                      ? ` · ${s.durationMinutes} min`
                                      : ""}
                                  </Text>
                                </Pressable>
                              ))}
                            </View>
                          </ScrollView>
                        ) : (
                          <View className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 mb-1 flex-row items-center gap-2">
                            <MaterialIcons
                              name="info-outline"
                              size={15}
                              color="#6366F1"
                            />
                            <Text className="text-[12px] text-indigo-700 flex-1">
                              No services found. Add one in Inventory →
                              Services.
                            </Text>
                          </View>
                        )}
                      </>
                    )
                  ) : prod ? (
                    <View className="flex-row items-center bg-slate-900 rounded-xl px-4 py-3 mb-3">
                      <View className="h-8 w-8 rounded-lg bg-amber-500/25 items-center justify-center mr-3">
                        <MaterialIcons
                          name="inventory-2"
                          size={14}
                          color="#FBBF24"
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-white text-[14px] font-semibold">
                          {prod.name}
                        </Text>
                        <Text className="text-slate-400 text-[10px] mt-0.5">
                          {prod.quantity} in stock
                        </Text>
                      </View>
                      <Pressable
                        onPress={() =>
                          updateItem(idx, { productId: "", price: "0" })
                        }
                      >
                        <MaterialIcons name="close" size={18} color="#94A3B8" />
                      </Pressable>
                    </View>
                  ) : (
                    <>
                      <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 gap-2 mb-3">
                        <MaterialIcons
                          name="search"
                          size={17}
                          color="#94A3B8"
                        />
                        <TextInput
                          value={productSearch}
                          onChangeText={setProductSearch}
                          placeholder="Search product…"
                          placeholderTextColor="#CBD5E1"
                          className="flex-1 text-[14px] text-slate-900"
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
                                updateItem(idx, { productId: p.id })
                              }
                              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 items-center"
                            >
                              <Text className="text-[13px] font-semibold text-slate-700">
                                {p.name}
                              </Text>
                              <Text className="text-[10px] text-slate-400 mt-0.5">
                                ₹{p.price} · {p.quantity} pcs
                              </Text>
                            </Pressable>
                          ))}
                        </View>
                      </ScrollView>
                    </>
                  )}

                  <View className="flex-row gap-3 mt-1">
                    <View className="flex-1">
                      <Text className="text-[10px] font-semibold text-slate-400 mb-1.5 ml-1 uppercase tracking-wider">
                        Qty
                      </Text>
                      <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                        <Pressable
                          onPress={() =>
                            updateItem(idx, {
                              quantity: String(
                                Math.max(1, (Number(item.quantity) || 1) - 1),
                              ),
                            })
                          }
                          className="px-3.5 py-3"
                        >
                          <MaterialIcons
                            name="remove"
                            size={16}
                            color="#475569"
                          />
                        </Pressable>
                        <TextInput
                          value={item.quantity}
                          onChangeText={(v) => updateItem(idx, { quantity: v })}
                          keyboardType="number-pad"
                          className="flex-1 text-center text-[15px] font-bold text-slate-800"
                        />
                        <Pressable
                          onPress={() =>
                            updateItem(idx, {
                              quantity: String(
                                (Number(item.quantity) || 0) + 1,
                              ),
                            })
                          }
                          className="px-3.5 py-3"
                        >
                          <MaterialIcons name="add" size={16} color="#475569" />
                        </Pressable>
                      </View>
                    </View>
                    <View className="flex-1">
                      <Text className="text-[10px] font-semibold text-slate-400 mb-1.5 ml-1 uppercase tracking-wider">
                        Unit Price
                      </Text>
                      <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3">
                        <Text className="text-slate-400 text-[14px] mr-1">
                          ₹
                        </Text>
                        <TextInput
                          value={item.price}
                          onChangeText={(v) => updateItem(idx, { price: v })}
                          keyboardType="decimal-pad"
                          className="flex-1 text-[15px] font-bold text-slate-800"
                        />
                      </View>
                    </View>
                  </View>

                  {lineTotal > 0 && (
                    <View className="mt-3 flex-row justify-end items-center bg-slate-50 rounded-lg px-3 py-2">
                      <Text className="text-[11px] text-slate-400 mr-2">
                        Line total:
                      </Text>
                      <Text className="text-[14px] font-bold text-slate-800">
                        {fmt(lineTotal)}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}

            <Pressable
              onPress={() =>
                setItems([
                  ...items,
                  {
                    itemType: "product",
                    productId: "",
                    serviceId: "",
                    quantity: "1",
                    price: "0",
                  },
                ])
              }
              className="border-2 border-dashed border-slate-200 rounded-2xl py-4 items-center mb-5 flex-row justify-center gap-2"
            >
              <MaterialIcons
                name="add-circle-outline"
                size={20}
                color="#6366F1"
              />
              <Text className="text-[14px] font-semibold text-indigo-600">
                Add Another Item
              </Text>
            </Pressable>
          </Animated.View>

          {/* ── Step 3: Payment ── */}
          <Animated.View entering={FadeInDown.duration(400).delay(240)}>
            <StepHeader
              step={3}
              icon="payments"
              color="#10B981"
              bg="#ECFDF5"
              title="Payment Details"
            />
            <View
              className="bg-white rounded-2xl border border-slate-100 p-4 mb-5"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.03,
                shadowRadius: 8,
                elevation: 1,
              }}
            >
              <View className="flex-row gap-3 mb-3">
                <View className="flex-1">
                  <MiniField
                    label="Discount (₹)"
                    icon="local-offer"
                    value={discount}
                    onChangeText={setDiscount}
                  />
                </View>
                <View className="flex-1">
                  <MiniField
                    label="GST Rate (%)"
                    icon="receipt"
                    value={gstRate}
                    onChangeText={setGstRate}
                    sub={`GST: ${fmt(gstAmount)}`}
                  />
                </View>
              </View>
              <MiniField
                label="Amount Paid (₹)"
                icon="currency-rupee"
                value={paidAmount}
                onChangeText={setPaidAmount}
              />

              <View className="mt-3">
                <Text className="text-[10px] font-semibold text-slate-400 mb-1.5 ml-1 uppercase tracking-wider">
                  Reminder Date
                </Text>
                <Pressable
                  onPress={() => setShowDatePicker(true)}
                  className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3.5"
                >
                  <MaterialIcons name="event" size={16} color="#94A3B8" />
                  <Text
                    className={`flex-1 ml-2 text-[14px] ${reminderDateObj ? "text-slate-800 font-medium" : "text-slate-400"}`}
                  >
                    {reminderDateObj
                      ? fmtDateDisplay(reminderDateObj)
                      : "Set reminder (optional)"}
                  </Text>
                  {reminderDateObj && (
                    <Pressable
                      onPress={() => {
                        setReminderDateObj(undefined);
                        setReminderDate("");
                      }}
                      hitSlop={8}
                    >
                      <MaterialIcons name="close" size={16} color="#94A3B8" />
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
          </Animated.View>

          {/* ── Order Summary ── */}
          <Animated.View entering={FadeInDown.duration(400).delay(320)}>
            <View
              className="rounded-2xl overflow-hidden mb-5"
              style={{
                backgroundColor: "#0F172A",
                shadowColor: "#0F172A",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.25,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              <View className="px-5 pt-5 pb-4">
                <Text className="text-[9px] font-bold text-slate-500 uppercase tracking-[3px] mb-4">
                  Order Summary
                </Text>
                <SumRow label="Subtotal" value={fmt(subTotal)} />
                {discountAmount > 0 && (
                  <SumRow label="Discount" value={`- ${fmt(discountAmount)}`} />
                )}
                {gstAmount > 0 && (
                  <SumRow
                    label={`GST (${Number(gstRate) || 0}%)`}
                    value={fmt(gstAmount)}
                  />
                )}
                <View className="h-px bg-white/10 my-3" />
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-[14px] font-bold text-white">
                    Total
                  </Text>
                  <Text className="text-[22px] font-bold text-white">
                    {fmt(total)}
                  </Text>
                </View>
                <SumRow label="Paid" value={fmt(paidAmount)} />
              </View>
              <View
                className="flex-row items-center justify-between px-5 py-3.5 border-t border-white/5"
                style={{
                  backgroundColor:
                    due > 0 ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
                }}
              >
                <View className="flex-row items-center gap-2">
                  <MaterialIcons
                    name={due > 0 ? "account-balance-wallet" : "check-circle"}
                    size={16}
                    color={due > 0 ? "#FCA5A5" : "#6EE7B7"}
                  />
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "700",
                      color: due > 0 ? "#FCA5A5" : "#6EE7B7",
                    }}
                  >
                    {due > 0 ? "Due Amount" : "Fully Paid"}
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "800",
                    color: due > 0 ? "#FCA5A5" : "#6EE7B7",
                  }}
                >
                  {fmt(due)}
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* ── Submit ── */}
          <Animated.View entering={FadeInDown.duration(400).delay(400)}>
            {(() => {
              const allItemsFilled = items.every((i) =>
                i.itemType === "service"
                  ? Boolean(i.serviceId)
                  : Boolean(i.productId),
              );
              const disabled = loading || !customerId || !allItemsFilled;
              return (
                <>
                  <Pressable
                    onPress={handleSubmit}
                    disabled={disabled}
                    android_ripple={{
                      color: "rgba(255,255,255,0.1)",
                      borderless: false,
                    }}
                    className={`flex-row items-center justify-center gap-2.5 rounded-2xl ${disabled ? "bg-slate-300" : "bg-slate-900"}`}
                    style={{
                      paddingVertical: 18,
                      shadowColor: "#0F172A",
                      shadowOffset: { width: 0, height: 6 },
                      shadowOpacity: 0.2,
                      shadowRadius: 12,
                      elevation: 6,
                    }}
                  >
                    <MaterialIcons name="check-circle" size={20} color="#fff" />
                    <Text className="text-[16px] font-bold text-white">
                      Create Sale
                    </Text>
                  </Pressable>
                  {!customerId ? (
                    <Text className="text-center text-[11px] text-slate-400 mt-2">
                      Select a customer to continue
                    </Text>
                  ) : !allItemsFilled ? (
                    <Text className="text-center text-[11px] text-slate-400 mt-2">
                      Pick a product or service for each line
                    </Text>
                  ) : null}
                </>
              );
            })()}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppLayout>
  );
};

// ── Sub-components ───────────────────────────────────────────────
const StepHeader = ({
  step,
  icon,
  color,
  bg,
  title,
}: {
  step: number;
  icon: IconName;
  color: string;
  bg: string;
  title: string;
}) => (
  <View className="flex-row items-center gap-2.5 mb-3 ml-1">
    <View className="h-7 w-7 rounded-full bg-slate-900 items-center justify-center">
      <Text className="text-white text-[11px] font-bold">{step}</Text>
    </View>
    <View
      className="h-6 w-6 rounded-md items-center justify-center"
      style={{ backgroundColor: bg }}
    >
      <MaterialIcons name={icon} size={13} color={color} />
    </View>
    <Text className="text-[14px] font-bold text-slate-700">{title}</Text>
  </View>
);

const MiniField = ({
  label,
  icon,
  value,
  onChangeText,
  sub,
}: {
  label: string;
  icon: IconName;
  value: string;
  onChangeText: (v: string) => void;
  sub?: string;
}) => (
  <View className="mb-1">
    <Text className="text-[10px] font-semibold text-slate-400 mb-1.5 ml-1 uppercase tracking-wider">
      {label}
    </Text>
    <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3">
      <MaterialIcons name={icon} size={15} color="#94A3B8" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType="decimal-pad"
        placeholder="0"
        placeholderTextColor="#CBD5E1"
        className="flex-1 ml-2 text-[14px] font-medium text-slate-800"
      />
    </View>
    {sub && <Text className="mt-1 ml-1 text-[10px] text-slate-400">{sub}</Text>}
  </View>
);

const SumRow = ({ label, value }: { label: string; value: string }) => (
  <View className="flex-row justify-between items-center py-1">
    <Text className="text-[12px] text-slate-400">{label}</Text>
    <Text className="text-[14px] font-medium text-slate-300">{value}</Text>
  </View>
);
