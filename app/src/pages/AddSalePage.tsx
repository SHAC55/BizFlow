import { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { AppLayout } from "../components/AppLayout";
import { createSale, fetchCustomers, fetchProducts } from "../lib/api";
import { useAuth } from "../providers/AuthProvider";
import type { Customer } from "../types/customer";
import type { Product } from "../types/product";
import type { AppRoute } from "../types/navigation";

type AddSalePageProps = {
  onBack: () => void;
  onCreated: (saleId: string) => void;
  onNavigate: (route: AppRoute) => void;
};

type SaleItemForm = {
  productId: string;
  quantity: string;
  unitPrice: string;
};

export const AddSalePage = ({ onBack, onCreated, onNavigate }: AddSalePageProps) => {
  const { session } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState<SaleItemForm[]>([
    { productId: "", quantity: "1", unitPrice: "0" },
  ]);
  const [paidAmount, setPaidAmount] = useState("0");
  const [reminderDate, setReminderDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const accessToken = session?.tokens.accessToken;
    if (!accessToken) return;
    Promise.all([
      fetchCustomers(accessToken, { page: 1, limit: 100, search: "" }),
      fetchProducts(accessToken, { page: 1, limit: 100 }),
    ])
      .then(([customerResponse, productResponse]) => {
        setCustomers(customerResponse.customers);
        setProducts(productResponse.products);
      })
      .catch((loadError) =>
        setError(loadError instanceof Error ? loadError.message : "Failed to load sale form"),
      );
  }, [session?.tokens.accessToken]);

  const totalAmount = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
        0,
      ),
    [items],
  );

  const handleItemChange = (index: number, next: Partial<SaleItemForm>) => {
    setItems((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        const updated = { ...item, ...next };
        if (next.productId) {
          const product = products.find((entry) => entry.id === next.productId);
          if (product) {
            updated.unitPrice = String(product.price);
          }
        }
        return updated;
      }),
    );
  };

  const handleSubmit = async () => {
    const accessToken = session?.tokens.accessToken;
    if (!accessToken) {
      setError("Session expired. Please sign in again.");
      return;
    }
    if (!customerId || items.some((item) => !item.productId)) {
      setError("Select a customer and all products");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await createSale(accessToken, {
        customerId,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
        })),
        totalAmount,
        paidAmount: Number(paidAmount || "0"),
        reminderDate: reminderDate || undefined,
      });
      onCreated(response.sale.id);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to create sale");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout
      currentRoute="sales"
      eyebrow="New Sale"
      headerRight={
        <Pressable onPress={onBack} className="rounded-[18px] border border-black/10 bg-[#f8fafc] px-3 py-2.5">
          <Text className="text-[12px] font-semibold text-black/70">Back</Text>
        </Pressable>
      }
      onNavigate={onNavigate}
      subtitle="Link a customer, select items, and capture payment context."
      title="Record Sale"
    >
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <ScrollView className="flex-1" contentContainerClassName="pb-28">
          <View className="rounded-[28px] bg-[#0f172a] px-5 py-5">
            <Text className="text-[12px] uppercase tracking-[1.8px] text-white/45">Checkout</Text>
            <Text className="mt-2 text-[24px] font-extrabold text-white">Build the transaction clearly.</Text>
          </View>

          <View className="mt-6 rounded-[28px] border border-black/8 bg-white px-4 py-4">
            {error ? (
              <View className="mb-4 rounded-[20px] border border-red-200 bg-red-50 px-4 py-3">
                <Text className="text-[13px] text-red-600">{error}</Text>
              </View>
            ) : null}

            <Picker
              label="Customer"
              value={customerId}
              options={customers.map((customer) => ({ label: `${customer.name} · ${customer.mobile}`, value: customer.id }))}
              onSelect={setCustomerId}
            />

            {items.map((item, index) => (
              <View key={index} className="mb-4 rounded-[22px] bg-[#f8fafc] px-4 py-4">
                <Picker
                  label={`Product ${index + 1}`}
                  value={item.productId}
                  options={products.map((product) => ({
                    label: `${product.name} · ₹${product.price}`,
                    value: product.id,
                  }))}
                  onSelect={(productId) => handleItemChange(index, { productId })}
                />
                <Field label="Quantity" value={item.quantity} keyboardType="number-pad" onChangeText={(quantity) => handleItemChange(index, { quantity })} />
                <Field label="Unit Price" value={item.unitPrice} keyboardType="decimal-pad" onChangeText={(unitPrice) => handleItemChange(index, { unitPrice })} />
                {items.length > 1 ? (
                  <Pressable onPress={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))}>
                    <Text className="text-[12px] font-semibold text-red-600">Remove item</Text>
                  </Pressable>
                ) : null}
              </View>
            ))}

            <Pressable
              onPress={() =>
                setItems((current) => [
                  ...current,
                  { productId: "", quantity: "1", unitPrice: "0" },
                ])
              }
              className="mb-4 rounded-[18px] border border-black/10 bg-white px-4 py-3"
            >
              <Text className="text-center text-[13px] font-semibold text-black/70">Add Another Product</Text>
            </Pressable>

            <Field label="Paid Amount" value={paidAmount} keyboardType="decimal-pad" onChangeText={setPaidAmount} />
            <Field label="Reminder Date" value={reminderDate} onChangeText={setReminderDate} />

            <View className="mb-5 rounded-[22px] bg-[#0f172a] px-4 py-4">
              <Text className="text-[12px] text-white/55">Total Amount</Text>
              <Text className="mt-2 text-[22px] font-bold text-white">₹{totalAmount.toLocaleString("en-IN")}</Text>
            </View>

            <Pressable
              onPress={handleSubmit}
              disabled={isLoading}
              className={`items-center rounded-[22px] bg-[#2563eb] py-4 ${isLoading ? "opacity-60" : ""}`}
            >
              <Text className="text-[15px] font-bold text-white">
                {isLoading ? "Saving sale..." : "Create Sale"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppLayout>
  );
};

const Field = ({
  label,
  keyboardType = "default",
  onChangeText,
  value,
}: {
  label: string;
  keyboardType?: "default" | "number-pad" | "decimal-pad";
  onChangeText: (value: string) => void;
  value: string;
}) => (
  <View className="mb-4">
    <Text className="mb-2 text-[11px] font-bold uppercase tracking-[1.8px] text-black/35">{label}</Text>
    <TextInput
      className="rounded-[22px] border border-black/10 bg-white px-4 py-4 text-[15px] text-[#0f172a]"
      keyboardType={keyboardType}
      onChangeText={onChangeText}
      placeholder={label}
      placeholderTextColor="#94a3b8"
      value={value}
    />
  </View>
);

const Picker = ({
  label,
  onSelect,
  options,
  value,
}: {
  label: string;
  onSelect: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  value: string;
}) => (
  <View className="mb-4">
    <Text className="mb-2 text-[11px] font-bold uppercase tracking-[1.8px] text-black/35">{label}</Text>
    <View className="rounded-[22px] border border-black/10 bg-white px-4 py-1">
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-2 py-3">
          {options.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => onSelect(option.value)}
              className={`rounded-full px-3 py-2 ${value === option.value ? "bg-black" : "bg-[#f8fafc]"}`}
            >
              <Text className={`text-[12px] ${value === option.value ? "text-white" : "text-black/70"}`}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  </View>
);
