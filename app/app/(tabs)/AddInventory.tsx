import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
} from "react-native";
import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";

type FormData = {
  name: string;
  category: string;
  sku: string;
  costPrice: string;
  price: string;
  quantity: string;
  minimumQuantity: string;
};

const generateSKU = (name: string) => {
  if (!name) return "";
  const prefix = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const random = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${random}`;
};

const calculateMargin = (cost: string, price: string) => {
  const c = parseFloat(cost);
  const p = parseFloat(price);
  if (!c || !p || c <= 0 || p <= 0) return null;
  return (((p - c) / p) * 100).toFixed(1);
};

// ─── Reusable field row inside a card ───────────────────────────────────────
type FieldRowProps = {
  label: string;
  hint?: string;
  isLast?: boolean;
  children: React.ReactNode;
};

const FieldRow = ({ label, hint, isLast, children }: FieldRowProps) => (
  <View style={[styles.row, !isLast && styles.rowBorder]}>
    <View style={styles.rowLeft}>
      <Text style={styles.rowLabel}>{label}</Text>
      {hint ? <Text style={styles.rowHint}>{hint}</Text> : null}
    </View>
    <View style={styles.rowRight}>{children}</View>
  </View>
);

// ─── Stepper ─────────────────────────────────────────────────────────────────
type StepperProps = {
  value: string;
  onChange: (v: string) => void;
};

const Stepper = ({ value, onChange }: StepperProps) => {
  const num = parseInt(value) || 0;
  return (
    <View style={styles.stepper}>
      <Pressable
        style={styles.stepBtn}
        onPress={() => onChange(String(Math.max(0, num - 1)))}
      >
        <Text style={styles.stepBtnText}>−</Text>
      </Pressable>
      <Text style={styles.stepValue}>{num}</Text>
      <Pressable
        style={styles.stepBtn}
        onPress={() => onChange(String(num + 1))}
      >
        <Text style={styles.stepBtnText}>+</Text>
      </Pressable>
    </View>
  );
};

// ─── Main component ──────────────────────────────────────────────────────────
const AddInventory = () => {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      quantity: "0",
      minimumQuantity: "5",
    },
  });

  const productName = watch("name");
  const costPrice = watch("costPrice");
  const price = watch("price");
  const margin = calculateMargin(costPrice, price);

  useEffect(() => {
    if (productName) {
      setValue("sku", generateSKU(productName));
    }
  }, [productName]);

  const onSubmit = (data: FormData) => {
    const payload = {
      ...data,
      costPrice: Number(data.costPrice),
      price: Number(data.price),
      quantity: Number(data.quantity),
      minimumQuantity: Number(data.minimumQuantity),
    };
    console.log("SUBMIT:", payload);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.title}>Add product</Text>
        <Text style={styles.subtitle}>Fill in the details below</Text>
      </View>

      {/* ── Section: Product info ── */}
      <Text style={styles.sectionLabel}>Product info</Text>
      <View style={styles.card}>
        {/* Name */}
        <FieldRow label="Product name">
          <Controller
            control={control}
            name="name"
            rules={{ required: "Required" }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                placeholder="Wireless Mouse"
                placeholderTextColor="#9CA3AF"
                style={[styles.inlineInput, errors.name && styles.inputError]}
                returnKeyType="next"
              />
            )}
          />
        </FieldRow>

        {/* Category */}
        <FieldRow label="Category">
          <Controller
            control={control}
            name="category"
            rules={{ required: "Required" }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                placeholder="Electronics"
                placeholderTextColor="#9CA3AF"
                style={[
                  styles.inlineInput,
                  errors.category && styles.inputError,
                ]}
                returnKeyType="next"
              />
            )}
          />
        </FieldRow>

        {/* SKU */}
        <FieldRow label="SKU" isLast>
          <Controller
            control={control}
            name="sku"
            render={({ field: { value } }) => (
              <View style={styles.skuRow}>
                <Text style={styles.skuValue}>{value || "—"}</Text>
                <View style={styles.autoBadge}>
                  <Text style={styles.autoBadgeText}>Auto</Text>
                </View>
              </View>
            )}
          />
        </FieldRow>
      </View>

      {/* Validation errors */}
      {(errors.name || errors.category) && (
        <Text style={styles.errorText}>
          {errors.name?.message || errors.category?.message}
        </Text>
      )}

      {/* ── Section: Pricing ── */}
      <Text style={styles.sectionLabel}>Pricing</Text>
      <View style={styles.card}>
        <View style={styles.priceGrid}>
          {/* Cost price */}
          <View style={[styles.priceCell, styles.priceCellBorder]}>
            <Text style={styles.rowLabel}>Cost price</Text>
            <View style={styles.amountRow}>
              <Text style={styles.currencySymbol}>₹</Text>
              <Controller
                control={control}
                name="costPrice"
                rules={{ required: "Required" }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                    style={styles.priceInput}
                  />
                )}
              />
            </View>
          </View>

          {/* Selling price */}
          <View style={styles.priceCell}>
            <Text style={styles.rowLabel}>Selling price</Text>
            <View style={styles.amountRow}>
              <Text style={styles.currencySymbol}>₹</Text>
              <Controller
                control={control}
                name="price"
                rules={{ required: "Required" }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                    style={styles.priceInput}
                  />
                )}
              />
            </View>
          </View>
        </View>

        {/* Margin indicator */}
        <View style={styles.marginBar}>
          <Text style={styles.marginLabel}>Margin</Text>
          <Text
            style={[
              styles.marginValue,
              margin !== null
                ? parseFloat(margin) >= 0
                  ? styles.marginPositive
                  : styles.marginNegative
                : styles.marginNull,
            ]}
          >
            {margin !== null
              ? `${parseFloat(margin) >= 0 ? "+" : ""}${margin}%`
              : "—"}
          </Text>
        </View>
      </View>

      {/* ── Section: Stock ── */}
      <Text style={styles.sectionLabel}>Stock</Text>
      <View style={styles.card}>
        <FieldRow label="Opening quantity" hint="Units currently in stock">
          <Controller
            control={control}
            name="quantity"
            rules={{ required: "Required" }}
            render={({ field: { onChange, value } }) => (
              <Stepper value={value} onChange={onChange} />
            )}
          />
        </FieldRow>

        <FieldRow
          label="Low stock alert"
          hint="Alert when below this level"
          isLast
        >
          <Controller
            control={control}
            name="minimumQuantity"
            rules={{ required: "Required" }}
            render={({ field: { onChange, value } }) => (
              <Stepper value={value} onChange={onChange} />
            )}
          />
        </FieldRow>
      </View>

      {/* ── Submit ── */}
      <Pressable
        onPress={handleSubmit(onSubmit)}
        style={({ pressed }) => [
          styles.submitBtn,
          pressed && styles.submitBtnPressed,
        ]}
      >
        <Text style={styles.submitBtnText}>Add product</Text>
      </Pressable>

      <Text style={styles.footerNote}>
        Fields marked with errors will highlight on submit
      </Text>
    </ScrollView>
  );
};

export default AddInventory;

// ─── Styles ──────────────────────────────────────────────────────────────────
const BORDER = "#E5E7EB";
const TEXT_PRIMARY = "#111827";
const TEXT_SECONDARY = "#6B7280";
const TEXT_TERTIARY = "#9CA3AF";
const BG_PAGE = "#F3F4F6";
const BG_CARD = "#FFFFFF";
const BG_SECONDARY = "#F9FAFB";

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BG_PAGE,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },

  // Header
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: TEXT_PRIMARY,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: TEXT_SECONDARY,
  },

  // Section label
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: TEXT_TERTIARY,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 8,
    marginTop: 4,
  },

  // Card
  card: {
    backgroundColor: BG_CARD,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: BORDER,
    overflow: "hidden",
    marginBottom: 20,
  },

  // Field row
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 13,
    minHeight: 56,
  },
  rowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
  },
  rowLeft: {
    flex: 1,
    paddingRight: 12,
  },
  rowRight: {
    alignItems: "flex-end",
  },
  rowLabel: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    marginBottom: 1,
  },
  rowHint: {
    fontSize: 11,
    color: TEXT_TERTIARY,
    marginTop: 1,
  },

  // Inline text input (right-aligned in row)
  inlineInput: {
    fontSize: 15,
    color: TEXT_PRIMARY,
    textAlign: "right",
    minWidth: 140,
    padding: 0,
  },
  inputError: {
    color: "#EF4444",
  },

  // SKU
  skuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  skuValue: {
    fontSize: 14,
    color: TEXT_PRIMARY,
    fontFamily: "Courier New",
  },
  autoBadge: {
    backgroundColor: BG_SECONDARY,
    borderRadius: 99,
    borderWidth: 0.5,
    borderColor: BORDER,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  autoBadgeText: {
    fontSize: 11,
    color: TEXT_SECONDARY,
  },

  // Error text
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: -14,
    marginBottom: 12,
    marginLeft: 4,
  },

  // Pricing grid
  priceGrid: {
    flexDirection: "row",
  },
  priceCell: {
    flex: 1,
    padding: 14,
  },
  priceCellBorder: {
    borderRightWidth: 0.5,
    borderRightColor: BORDER,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 6,
    gap: 2,
  },
  currencySymbol: {
    fontSize: 13,
    color: TEXT_TERTIARY,
  },
  priceInput: {
    fontSize: 20,
    fontWeight: "500",
    color: TEXT_PRIMARY,
    padding: 0,
    minWidth: 60,
  },

  // Margin bar
  marginBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: BG_SECONDARY,
    borderTopWidth: 0.5,
    borderTopColor: BORDER,
  },
  marginLabel: {
    fontSize: 12,
    color: TEXT_SECONDARY,
  },
  marginValue: {
    fontSize: 13,
    fontWeight: "500",
  },
  marginPositive: {
    color: "#16A34A",
  },
  marginNegative: {
    color: "#DC2626",
  },
  marginNull: {
    color: TEXT_TERTIARY,
  },

  // Stepper
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  stepBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: BG_SECONDARY,
    borderWidth: 0.5,
    borderColor: BORDER,
    alignItems: "center",
    justifyContent: "center",
  },
  stepBtnText: {
    fontSize: 16,
    color: TEXT_PRIMARY,
    lineHeight: 18,
  },
  stepValue: {
    fontSize: 16,
    fontWeight: "500",
    color: TEXT_PRIMARY,
    minWidth: 28,
    textAlign: "center",
  },

  // Submit
  submitBtn: {
    backgroundColor: TEXT_PRIMARY,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  submitBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.2,
  },

  // Footer
  footerNote: {
    fontSize: 12,
    color: TEXT_TERTIARY,
    textAlign: "center",
  },
});
