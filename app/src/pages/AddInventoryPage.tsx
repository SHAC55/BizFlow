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
  ActivityIndicator,
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

export const AddInventoryPage = ({
  productId,
  onBackToInventory,
  onCreated,
  onNavigate,
}: AddInventoryPageProps) => {
  const { session } = useAuth();
  const { createProduct, error, isLoading } = useCreateProduct();

  const [form, setForm] = useState<FormState>(initialForm);
  const [validationError, setValidationError] = useState<string | null>(null);
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
        setValidationError(
          err instanceof Error ? err.message : "Failed to load product",
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

    const token = session?.tokens.accessToken;

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
      [costPrice, price, quantity, minimumQuantity].some((v) => Number.isNaN(v))
    ) {
      setValidationError("Enter valid numeric values");
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
        if (!token) {
          setValidationError("Session expired");
          return;
        }

        await updateProduct(token, productId, payload);
        onCreated(productId);
        return;
      }

      const product = await createProduct(payload);
      setForm(initialForm);
      onCreated(product.id);
    } catch {}
  };

  return (
    <AppLayout
      currentRoute="addInventory"
      onNavigate={onNavigate}
      title={productId ? "Edit Inventory" : "Add Inventory"}
      subtitle="Manage products professionally."
      eyebrow={productId ? "Edit" : "Create"}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="px-5 pt-3 pb-36"
        >
          {/* Back */}
          <Pressable
            onPress={onBackToInventory}
            className="mb-5 flex-row items-center"
          >
            <MaterialIcons name="arrow-back-ios" size={15} color="#666" />
            <Text className="text-[15px] text-zinc-600">Back to inventory</Text>
          </Pressable>

          {/* Form */}
          <View className="rounded-[28px] border border-zinc-200 bg-white px-5 py-6">
            {(validationError || error) && (
              <View className="mb-5 rounded-2xl bg-zinc-100 px-4 py-4">
                <Text className="text-[13px] text-black">
                  {validationError || error}
                </Text>
              </View>
            )}

            {isBootstrapping ? (
              <View className="py-20 items-center">
                <ActivityIndicator size="large" color="#000" />
              </View>
            ) : (
              <>
                {/* Section */}
                <Text className="mb-5 text-[12px] font-semibold uppercase tracking-[4px] text-zinc-500">
                  Product Details
                </Text>

                <Field
                  label="Product Name"
                  icon="inventory-2"
                  placeholder="Wireless Mouse"
                  value={form.name}
                  onChangeText={(name) => setForm((c) => ({ ...c, name }))}
                />

                <Field
                  label="Category"
                  icon="category"
                  placeholder="Electronics"
                  value={form.category}
                  onChangeText={(category) =>
                    setForm((c) => ({ ...c, category }))
                  }
                />

                <Field
                  label="SKU"
                  icon="qr-code"
                  placeholder="Auto Generated"
                  value={form.sku}
                  onChangeText={(sku) => setForm((c) => ({ ...c, sku }))}
                />

                <Pressable
                  onPress={() =>
                    setForm((c) => ({
                      ...c,
                      sku: generateSku(c.name),
                    }))
                  }
                  className="mb-7 self-start rounded-full border border-zinc-300 px-5 py-3"
                >
                  <Text className="text-[13px] font-semibold text-black">
                    Generate SKU
                  </Text>
                </Pressable>

                {/* Pricing */}
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
                      onChangeText={(costPrice) =>
                        setForm((c) => ({ ...c, costPrice }))
                      }
                    />
                  </View>

                  <View className="flex-1">
                    <Field
                      label="Selling Price"
                      icon="sell"
                      keyboardType="decimal-pad"
                      placeholder="0"
                      value={form.price}
                      onChangeText={(price) =>
                        setForm((c) => ({ ...c, price }))
                      }
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
                      onChangeText={(quantity) =>
                        setForm((c) => ({ ...c, quantity }))
                      }
                    />
                  </View>

                  <View className="flex-1">
                    <Field
                      label="Low Alert"
                      icon="warning"
                      keyboardType="number-pad"
                      placeholder="0"
                      value={form.minimumQuantity}
                      onChangeText={(minimumQuantity) =>
                        setForm((c) => ({
                          ...c,
                          minimumQuantity,
                        }))
                      }
                    />
                  </View>
                </View>

                {/* Preview */}
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

                    <MiniCard
                      title="Stock"
                      value={`${form.quantity || "0"} pcs`}
                    />
                  </View>
                </View>

                {/* Button */}
                <Pressable
                  onPress={handleSubmit}
                  disabled={isLoading}
                  className="mt-6 rounded-2xl bg-black py-4 items-center justify-center"
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
        </ScrollView>
      </KeyboardAvoidingView>
    </AppLayout>
  );
};

const Field = ({
  label,
  icon,
  keyboardType = "default",
  placeholder,
  value,
  onChangeText,
}: {
  label: string;
  icon: ComponentProps<typeof MaterialIcons>["name"];
  keyboardType?: "default" | "decimal-pad" | "number-pad";
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
}) => (
  <View className="mb-4">
    <Text className="mb-2 text-[14px] font-medium text-zinc-700">{label}</Text>

    <View className="h-16 flex-row items-center rounded-2xl border border-zinc-200 bg-zinc-50 px-4">
      <MaterialIcons name={icon} size={20} color="#777" />

      <TextInput
        className="flex-1 pl-3 text-[16px] text-black"
        placeholder={placeholder}
        placeholderTextColor="#999"
        keyboardType={keyboardType}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  </View>
);

const MiniCard = ({ title, value }: { title: string; value: string }) => (
  <View className="flex-1 rounded-2xl bg-zinc-900 px-4 py-4">
    <Text className="text-[11px] text-zinc-500">{title}</Text>
    <Text className="mt-1 text-[17px] font-semibold text-white">{value}</Text>
  </View>
);
