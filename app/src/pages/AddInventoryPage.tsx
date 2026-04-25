import { MaterialIcons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import type { ComponentProps } from "react";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from "react-native";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";
import { AppLayout } from "../components/AppLayout";
import { FormBottomSheet } from "../components/FormBottomSheet";
import { fetchProduct, updateProduct } from "../lib/api";
import { queryKeys } from "../lib/query";
import { useAuth } from "../providers/AuthProvider";
import { useCreateProduct } from "../hooks/useProductsData";
import type { AppRoute } from "../types/navigation";

type AddInventoryPageProps = {
  productId?: string;
  onBackToInventory: () => void;
  onCreated: (productId?: string) => void;
  onNavigate: (route: AppRoute) => void;
  onRequestClose?: () => void;
  presentation?: "screen" | "sheet";
};

type FormState = {
  name: string;
  category: string;
  sku: string;
  costPrice: string;
  price: string;
  quantity: string;
  minimumQuantity: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;
type FormTouched = Partial<Record<keyof FormState, boolean>>;

const initialForm: FormState = {
  name: "",
  category: "",
  sku: "",
  costPrice: "",
  price: "",
  quantity: "",
  minimumQuantity: "",
};

const generateSku = (name: string) => {
  if (!name.trim()) return "";

  const prefix = name
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 3);

  const random = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${random}`;
};

const validateField = (name: keyof FormState, value: string): string | undefined => {
  switch (name) {
    case "name":
      return value.trim() ? undefined : "Product name is required";
    case "category":
      return value.trim() ? undefined : "Category is required";
    case "costPrice": {
      if (!value.trim()) return "Cost price is required";
      const n = Number(value);
      if (Number.isNaN(n) || n < 0) return "Enter a valid positive number";
      return undefined;
    }
    case "price": {
      if (!value.trim()) return "Selling price is required";
      const n = Number(value);
      if (Number.isNaN(n) || n < 0) return "Enter a valid positive number";
      return undefined;
    }
    case "quantity": {
      if (!value.trim()) return "Stock quantity is required";
      const n = Number(value);
      if (Number.isNaN(n) || !Number.isInteger(n) || n < 0) return "Enter a valid non-negative integer";
      return undefined;
    }
    case "minimumQuantity": {
      if (!value.trim()) return "Low alert quantity is required";
      const n = Number(value);
      if (Number.isNaN(n) || !Number.isInteger(n) || n < 0) return "Enter a valid non-negative integer";
      return undefined;
    }
    default:
      return undefined;
  }
};

export const AddInventoryPage = ({
  productId,
  onBackToInventory,
  onCreated,
  onNavigate,
  onRequestClose,
  presentation = "screen",
}: AddInventoryPageProps) => {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const { createProduct, error: createError, isLoading } = useCreateProduct();

  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FormTouched>({});
  const [isBootstrapping, setIsBootstrapping] = useState(Boolean(productId));

  useEffect(() => {
    const token = session?.tokens.accessToken;

    if (!productId || !token) {
      setIsBootstrapping(false);
      return;
    }

    fetchProduct(token, productId)
      .then((product) => {
        setForm({
          name: product.name,
          category: product.category,
          sku: product.sku ?? "",
          costPrice: String(product.costPrice),
          price: String(product.price),
          quantity: String(product.quantity),
          minimumQuantity: String(product.minimumQuantity),
        });
      })
      .catch((err) => {
        setErrors({ name: err instanceof Error ? err.message : "Failed to load product" });
      })
      .finally(() => setIsBootstrapping(false));
  }, [productId, session?.tokens.accessToken]);

  const handleChange = (name: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const err = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: err }));
    }
  };

  const handleBlur = (name: keyof FormState, value: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const err = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: err }));
  };

  const handleSubmit = async () => {
    const requiredFields: (keyof FormState)[] = [
      "name", "category", "costPrice", "price", "quantity", "minimumQuantity",
    ];

    const newErrors: FormErrors = {};
    const newTouched: FormTouched = {};

    for (const field of requiredFields) {
      newTouched[field] = true;
      const err = validateField(field, form[field]);
      if (err) newErrors[field] = err;
    }

    setTouched((prev) => ({ ...prev, ...newTouched }));
    setErrors((prev) => ({ ...prev, ...newErrors }));

    if (Object.keys(newErrors).length > 0) return;

    const name = form.name.trim();
    const category = form.category.trim();
    const sku = form.sku.trim();
    const costPrice = Number(form.costPrice);
    const price = Number(form.price);
    const quantity = Number(form.quantity);
    const minimumQuantity = Number(form.minimumQuantity);
    const token = session?.tokens.accessToken;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const payload = {
        name,
        category,
        sku: sku || generateSku(name),
        costPrice,
        price,
        quantity,
        minimumQuantity,
      };

      if (productId) {
        if (!token) {
          setErrors((prev) => ({ ...prev, name: "Session expired" }));
          return;
        }

        await updateProduct(token, productId, payload);
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: queryKeys.products.all }),
          queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(productId) }),
          queryClient.invalidateQueries({ queryKey: queryKeys.products.movements(productId) }),
          queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
        ]);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Toast.show({ type: "success", text1: "Product Updated", text2: `${name} has been saved.` });
        onCreated(productId);
        return;
      }

      const product = await createProduct(payload);
      setForm(initialForm);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({ type: "success", text1: "Product Added", text2: `${name} is now in your inventory.` });
      onCreated(product.id);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.show({ type: "error", text1: "Save Failed", text2: "Could not save the product. Try again." });
    }
  };

  const closeHandler = onRequestClose ?? onBackToInventory;

  const header = presentation === "sheet" ? (
    <View className="mb-4 rounded-[26px] border border-zinc-200 bg-white px-4 py-4">
      <View className="flex-row items-center">
        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100">
          <MaterialIcons
            name={productId ? "edit" : "inventory-2"}
            size={24}
            color="#000"
          />
        </View>

        <View className="ml-4 flex-1">
          <Text className="text-[18px] font-bold text-black">
            {productId ? "Edit Product" : "Add Product"}
          </Text>
          <Text className="mt-1 text-[12px] leading-5 text-zinc-500">
            {productId
              ? "Adjust pricing, category and stock in context."
              : "Create inventory without leaving the current screen."}
          </Text>
        </View>
      </View>
    </View>
  ) : (
    <Pressable
      onPress={onBackToInventory}
      android_ripple={{ color: "rgba(0,0,0,0.08)", borderless: true }}
      className="mb-5 flex-row items-center"
    >
      <MaterialIcons name="arrow-back-ios" size={15} color="#666" />
      <Text className="text-[15px] text-zinc-600">Back to inventory</Text>
    </Pressable>
  );

  const cardContent = (
    <View className="rounded-[28px] border border-zinc-200 bg-white px-5 py-6">
      {createError && (
        <View className="mb-5 rounded-2xl bg-zinc-100 px-4 py-4">
          <Text className="text-[13px] text-black">{createError}</Text>
        </View>
      )}

      {isBootstrapping ? (
        <View className="items-center py-20">
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
        <>
          <Text className="mb-5 text-[12px] font-semibold uppercase tracking-[4px] text-zinc-500">
            Product Details
          </Text>

          <Field
            label="Product Name"
            icon="inventory-2"
            placeholder="Wireless Mouse"
            value={form.name}
            error={errors.name}
            onChangeText={(name) => handleChange("name", name)}
            onBlur={() => handleBlur("name", form.name)}
          />

          <Field
            label="Category"
            icon="category"
            placeholder="Electronics"
            value={form.category}
            error={errors.category}
            onChangeText={(category) => handleChange("category", category)}
            onBlur={() => handleBlur("category", form.category)}
          />

          <Field
            label="SKU"
            icon="qr-code"
            placeholder="Auto Generated"
            value={form.sku}
            onChangeText={(sku) => handleChange("sku", sku)}
            onBlur={() => handleBlur("sku", form.sku)}
          />

          <Pressable
            onPress={() =>
              setForm((c) => ({
                ...c,
                sku: generateSku(c.name),
              }))
            }
            android_ripple={{ color: "rgba(0,0,0,0.08)", borderless: true }}
            className="mb-7 self-start rounded-full border border-zinc-300 px-5 py-3"
          >
            <Text className="text-[13px] font-semibold text-black">
              Generate SKU
            </Text>
          </Pressable>

          <Text className="mb-5 text-[12px] font-semibold uppercase tracking-[4px] text-zinc-500">
            Pricing & Stock
          </Text>

          <View className="mb-4 flex-row gap-3">
            <View className="flex-1">
              <Field
                label="Cost Price"
                icon="currency-rupee"
                keyboardType="decimal-pad"
                placeholder="0"
                value={form.costPrice}
                error={errors.costPrice}
                onChangeText={(costPrice) => handleChange("costPrice", costPrice)}
                onBlur={() => handleBlur("costPrice", form.costPrice)}
              />
            </View>

            <View className="flex-1">
              <Field
                label="Selling Price"
                icon="sell"
                keyboardType="decimal-pad"
                placeholder="0"
                value={form.price}
                error={errors.price}
                onChangeText={(price) => handleChange("price", price)}
                onBlur={() => handleBlur("price", form.price)}
              />
            </View>
          </View>

          <View className="mb-2 flex-row gap-3">
            <View className="flex-1">
              <Field
                label="Stock"
                icon="inventory"
                keyboardType="number-pad"
                placeholder="0"
                value={form.quantity}
                error={errors.quantity}
                onChangeText={(quantity) => handleChange("quantity", quantity)}
                onBlur={() => handleBlur("quantity", form.quantity)}
              />
            </View>

            <View className="flex-1">
              <Field
                label="Low Alert"
                icon="warning"
                keyboardType="number-pad"
                placeholder="0"
                value={form.minimumQuantity}
                error={errors.minimumQuantity}
                onChangeText={(minimumQuantity) =>
                  handleChange("minimumQuantity", minimumQuantity)
                }
                onBlur={() => handleBlur("minimumQuantity", form.minimumQuantity)}
              />
            </View>
          </View>

          <View className="mt-5 rounded-[24px] bg-black px-5 py-5">
            <Text className="text-[11px] uppercase tracking-[3px] text-zinc-500">
              Preview
            </Text>

            <Text className="mt-3 text-[24px] font-bold text-white">
              {form.name || "Untitled Product"}
            </Text>

            <Text className="mt-1 text-zinc-400">
              {form.category || "Uncategorized"}
            </Text>

            <View className="mt-5 flex-row gap-3">
              <MiniCard title="Price" value={`₹${form.price || "0"}`} />
              <MiniCard title="Stock" value={`${form.quantity || "0"} pcs`} />
            </View>
          </View>

          <Pressable
            onPress={handleSubmit}
            disabled={isLoading}
            android_ripple={{ color: "rgba(255,255,255,0.1)", borderless: false }}
            className="mt-6 items-center justify-center rounded-2xl bg-black py-4"
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-[16px] font-semibold text-white">
                {productId ? "Update Product" : "Add Product"}
              </Text>
            )}
          </Pressable>
        </>
      )}
    </View>
  );

  const formBody = (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {presentation === "sheet" ? (
        <View className="px-5 pb-16 pt-2">
          {header}
          {cardContent}
        </View>
      ) : null}

      <ScrollView
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="px-5 pt-3 pb-36"
        style={presentation === "sheet" ? { display: "none" } : undefined}
      >
        {header}
        {cardContent}
      </ScrollView>
    </KeyboardAvoidingView>
  );

  if (presentation === "sheet") {
    return (
      <FormBottomSheet
        title={productId ? "Edit Inventory" : "Add Inventory"}
        subtitle="Update stock data without leaving the current screen."
        onClose={closeHandler}
      >
        {formBody}
      </FormBottomSheet>
    );
  }

  return (
    <AppLayout
      currentRoute="addInventory"
      onNavigate={onNavigate}
      title={productId ? "Edit Inventory" : "Add Inventory"}
      subtitle="Manage products professionally."
      eyebrow={productId ? "Edit" : "Create"}
    >
      {formBody}
    </AppLayout>
  );
};

const Field = ({
  label,
  icon,
  keyboardType = "default",
  placeholder,
  value,
  error,
  onChangeText,
  onBlur,
}: {
  label: string;
  icon: ComponentProps<typeof MaterialIcons>["name"];
  keyboardType?: "default" | "decimal-pad" | "number-pad";
  placeholder: string;
  value: string;
  error?: string;
  onChangeText: (value: string) => void;
  onBlur?: () => void;
}) => (
  <View className="mb-4">
    <Text className="mb-2 text-[14px] font-medium text-zinc-700">{label}</Text>

    <View
      className={`h-16 flex-row items-center rounded-2xl border bg-zinc-50 px-4 ${
        error ? "border-red-300" : "border-zinc-200"
      }`}
    >
      <MaterialIcons name={icon} size={20} color={error ? "#EF4444" : "#777"} />

      <TextInput
        className="flex-1 pl-3 text-[16px] text-black"
        placeholder={placeholder}
        placeholderTextColor="#999"
        keyboardType={keyboardType}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
      />
    </View>

    {error && (
      <Text className="text-red-500 text-[11px] mt-1 ml-1">{error}</Text>
    )}
  </View>
);

const MiniCard = ({ title, value }: { title: string; value: string }) => (
  <View className="flex-1 rounded-2xl bg-zinc-900 px-4 py-4">
    <Text className="text-[11px] text-zinc-500">{title}</Text>
    <Text className="mt-1 text-[17px] font-semibold text-white">{value}</Text>
  </View>
);
