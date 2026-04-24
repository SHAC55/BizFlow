import { MaterialIcons } from "@expo/vector-icons";
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
} from "react-native";
import { AppLayout } from "../components/AppLayout";
import { fetchProduct, updateProduct } from "../lib/api";
import { useAuth } from "../providers/AuthProvider";
import { useCreateProduct } from "../hooks/useProductsData";
import type { AppRoute } from "../types/navigation";

type AddInventoryPageProps = {
  productId?: string;
  onBackToInventory: () => void;
  onCreated: (productId?: string) => void;
  onNavigate: (route: AppRoute) => void;
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
  if (!name.trim()) {
    return "";
  }

  const prefix = name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const random = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${random}`;
};

export const AddInventoryPage = ({
  productId,
  onBackToInventory,
  onCreated,
  onNavigate,
}: AddInventoryPageProps) => {
  const { session } = useAuth();
  const { createProduct, error, isLoading } = useCreateProduct();
  const [form, setForm] = useState<FormState>(initialForm);
  const [isBootstrapping, setIsBootstrapping] = useState(Boolean(productId));
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    const accessToken = session?.tokens.accessToken;

    if (!productId || !accessToken) {
      setIsBootstrapping(false);
      return;
    }

    fetchProduct(accessToken, productId)
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
      .catch((loadError) => {
        setValidationError(
          loadError instanceof Error ? loadError.message : "Failed to load product",
        );
      })
      .finally(() => setIsBootstrapping(false));
  }, [productId, session?.tokens.accessToken]);

  const handleSubmit = async () => {
    const name = form.name.trim();
    const category = form.category.trim();
    const sku = form.sku.trim();
    const costPrice = Number(form.costPrice);
    const price = Number(form.price);
    const quantity = Number(form.quantity);
    const minimumQuantity = Number(form.minimumQuantity);
    const accessToken = session?.tokens.accessToken;

    if (
      !name ||
      !category ||
      !form.costPrice ||
      !form.price ||
      !form.quantity ||
      !form.minimumQuantity
    ) {
      setValidationError("All required fields must be filled");
      return;
    }

    if (
      [costPrice, price, quantity, minimumQuantity].some((value) =>
        Number.isNaN(value),
      )
    ) {
      setValidationError("Enter valid numeric values");
      return;
    }

    if (costPrice < 0 || price < 0 || quantity < 0 || minimumQuantity < 0) {
      setValidationError("Numbers cannot be negative");
      return;
    }

    try {
      setValidationError(null);
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
        if (!accessToken) {
          setValidationError("Session expired. Please sign in again.");
          return;
        }

        await updateProduct(accessToken, productId, payload);
        onCreated(productId);
        return;
      }

      const product = await createProduct(payload);
      setForm(initialForm);
      onCreated(product.id);
    } catch {
      // surfaced by hook state
    }
  };

  return (
    <AppLayout
      currentRoute="addInventory"
      eyebrow={productId ? "Edit" : "Create"}
      headerRight={
        <Pressable
          onPress={onBackToInventory}
          className="rounded-[20px] border border-black/10 bg-[#f8fafc] px-4 py-3"
        >
          <Text className="text-[13px] font-semibold text-black/70">
            Inventory
          </Text>
        </Pressable>
      }
      onNavigate={onNavigate}
      subtitle="Craft a polished product record with pricing, stock, and SKU details."
      title={productId ? "Edit Inventory" : "Add Inventory"}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="pb-28"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="rounded-[28px] bg-[#0f172a] px-5 py-5">
            <View className="flex-row items-center justify-between gap-3">
              <View className="flex-row items-center gap-4">
                <View className="h-16 w-16 items-center justify-center rounded-[24px] bg-white/10">
                  <MaterialIcons name="inventory-2" size={30} color="#ffffff" />
                </View>
                <View className="flex-1">
                  <Text className="text-[12px] uppercase tracking-[1.8px] text-white/45">
                    Product Composer
                  </Text>
                  <Text className="mt-2 text-[24px] font-extrabold text-white">
                    {productId ? "Refine the catalog entry" : "Make it shelf-ready"}
                  </Text>
                </View>
              </View>
            </View>
            <Text className="mt-4 text-[14px] leading-[21px] text-white/65">
              Define identity, pricing, and stock thresholds before it enters your
              catalog.
            </Text>
          </View>

          <View className="pt-5">
            <Pressable
              onPress={onBackToInventory}
              className="mb-4 self-start flex-row items-center gap-2"
            >
              <MaterialIcons name="arrow-back" size={18} color="#4b5563" />
              <Text className="text-[13px] font-medium text-gray-600">
                Back to inventory
              </Text>
            </Pressable>

            <View className="rounded-[28px] border border-gray-200 bg-white px-5 py-5">
              {validationError || error ? (
                <View className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                  <Text className="text-[13px] leading-[18px] text-red-600">
                    {validationError || error}
                  </Text>
                </View>
              ) : null}

              {isBootstrapping ? (
                <Text className="py-10 text-center text-[14px] text-black/45">
                  Loading product...
                </Text>
              ) : (
                <>
                  <SectionTitle
                    subtitle="Name, category, and product identity"
                    title="Product Basics"
                  />

                  <Field
                    label="Product Name"
                    icon="inventory-2"
                    placeholder="e.g. Wireless Mouse"
                    value={form.name}
                    onChangeText={(name) =>
                      setForm((current) => ({ ...current, name }))
                    }
                  />
                  <Field
                    label="Category"
                    icon="sell"
                    placeholder="e.g. Electronics"
                    value={form.category}
                    onChangeText={(category) =>
                      setForm((current) => ({ ...current, category }))
                    }
                  />

                  <View className="mb-6">
                    <Field
                      label="SKU"
                      icon="qr-code"
                      placeholder="Auto-generated or enter manually"
                      value={form.sku}
                      onChangeText={(sku) =>
                        setForm((current) => ({ ...current, sku }))
                      }
                    />
                    <Pressable
                      onPress={() =>
                        setForm((current) => ({
                          ...current,
                          sku: generateSku(current.name),
                        }))
                      }
                      className="mt-2 self-start rounded-[18px] border border-gray-200 bg-[#f8fafc] px-4 py-2"
                    >
                      <Text className="text-[12px] font-medium text-gray-700">
                        Generate SKU
                      </Text>
                    </Pressable>
                  </View>

                  <SectionTitle
                    subtitle="Numbers that drive margin and stock behavior"
                    title="Pricing & Stock"
                  />

                  <Field
                    label="Cost Price"
                    icon="currency-rupee"
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    value={form.costPrice}
                    onChangeText={(costPrice) =>
                      setForm((current) => ({ ...current, costPrice }))
                    }
                  />
                  <Field
                    label="Selling Price"
                    icon="payments"
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    value={form.price}
                    onChangeText={(price) =>
                      setForm((current) => ({ ...current, price }))
                    }
                  />
                  <Field
                    label="Quantity"
                    icon="inventory-2"
                    keyboardType="number-pad"
                    placeholder="0"
                    value={form.quantity}
                    onChangeText={(quantity) =>
                      setForm((current) => ({ ...current, quantity }))
                    }
                  />
                  <Field
                    label="Minimum Quantity"
                    icon="warning-amber"
                    keyboardType="number-pad"
                    placeholder="0"
                    value={form.minimumQuantity}
                    onChangeText={(minimumQuantity) =>
                      setForm((current) => ({ ...current, minimumQuantity }))
                    }
                  />

                  <View className="mt-3 rounded-[24px] bg-[#0f172a] px-4 py-4">
                    <Text className="text-[12px] uppercase tracking-[1.8px] text-white/45">
                      Preview
                    </Text>
                    <Text className="mt-2 text-[18px] font-bold text-white">
                      {form.name.trim() || "Untitled product"}
                    </Text>
                    <Text className="mt-1 text-[13px] text-white/60">
                      {form.category.trim() || "No category yet"}
                    </Text>
                    <View className="mt-4 flex-row gap-3">
                      <View className="flex-1 rounded-[18px] bg-white/8 px-3 py-3">
                        <Text className="text-[11px] text-white/45">Sell at</Text>
                        <Text className="mt-1 text-[16px] font-semibold text-white">
                          {form.price ? `₹${form.price}` : "₹0"}
                        </Text>
                      </View>
                      <View className="flex-1 rounded-[18px] bg-white/8 px-3 py-3">
                        <Text className="text-[11px] text-white/45">Stock</Text>
                        <Text className="mt-1 text-[16px] font-semibold text-white">
                          {form.quantity || "0"} units
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Pressable
                    onPress={handleSubmit}
                    disabled={isLoading}
                    className={`mt-5 items-center justify-center rounded-[22px] bg-[#2563eb] py-4 ${
                      isLoading ? "opacity-60" : ""
                    }`}
                    style={
                      isLoading
                        ? undefined
                        : {
                            shadowColor: "#2563eb",
                            shadowOffset: { width: 0, height: 10 },
                            shadowOpacity: 0.25,
                            shadowRadius: 20,
                            elevation: 8,
                          }
                    }
                  >
                    <Text className="text-[15px] font-bold text-white">
                      {isLoading
                        ? productId
                          ? "Updating product..."
                          : "Adding product..."
                        : productId
                          ? "Update Inventory"
                          : "Add to Inventory"}
                    </Text>
                  </Pressable>
                </>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppLayout>
  );
};

const SectionTitle = ({
  subtitle,
  title,
}: {
  subtitle: string;
  title: string;
}) => (
  <View className="mb-4">
    <Text className="text-[18px] font-bold text-[#0f172a]">{title}</Text>
    <Text className="mt-1 text-[13px] leading-[19px] text-[#64748b]">
      {subtitle}
    </Text>
  </View>
);

const Field = ({
  label,
  icon,
  keyboardType = "default",
  onChangeText,
  placeholder,
  value,
}: {
  label: string;
  icon: ComponentProps<typeof MaterialIcons>["name"];
  keyboardType?: "default" | "decimal-pad" | "number-pad";
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
}) => (
  <View className="mb-4">
    <Text className="mb-2 text-[11px] font-bold uppercase tracking-[1.8px] text-gray-400">
      {label}
    </Text>
    <View className="flex-row items-center gap-3 rounded-[22px] border border-gray-200 bg-[#f8fafc] px-4">
      <MaterialIcons name={icon} size={18} color="#9ca3af" />
      <TextInput
        className="flex-1 py-4 text-[15px] text-gray-900"
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        value={value}
      />
    </View>
  </View>
);
