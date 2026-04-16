import React from "react";
import {
  View,
  Text,
  TextInput as RNTextInput,
  ScrollView,
  Pressable,
} from "react-native";
import { styled } from "nativewind";
import { useForm, Controller } from "react-hook-form";

const TextInput = styled(RNTextInput);

type FormData = {
  name: string;
  mobile: string;
  email: string;
  openingBalance: string;
  address: string;
  notes: string;
};

// ─── Section label ────────────────────────────────────────────────────────────
const SectionLabel = ({ children }: { children: string }) => (
  <Text className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase mb-2 ml-0.5">
    {children}
  </Text>
);

// ─── Field row (label + input inside a card, separated by divider) ────────────
type FieldRowProps = {
  label: string;
  hint?: string;
  isLast?: boolean;
  error?: string;
  children: React.ReactNode;
};

const FieldRow = ({ label, hint, isLast, error, children }: FieldRowProps) => (
  <View className={!isLast ? "border-b border-zinc-100" : ""}>
    <View className="px-4 pt-3.5 pb-1">
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-[11px] font-semibold text-zinc-400 tracking-wide uppercase">
          {label}
        </Text>
        {hint && (
          <Text className="text-[10px] text-zinc-400">{hint}</Text>
        )}
      </View>
      {children}
      {error && (
        <Text className="text-[11px] text-red-400 mt-1">{error}</Text>
      )}
    </View>
    {/* bottom padding inside row */}
    <View className="pb-2" />
  </View>
);

// ─── Main component ──────────────────────────────────────────────────────────
const AddCustomer = () => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      mobile: "",
      email: "",
      openingBalance: "",
      address: "",
      notes: "",
    },
  });

  const onSubmit = (data: FormData) => {
    console.log("CUSTOMER:", data);
    reset();
  };

  const inputClass =
    "text-[15px] text-zinc-900 py-1 p-0 w-full";
  const placeholderColor = "#A1A1AA";

  return (
    <ScrollView
      className="flex-1 bg-zinc-50"
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 48,
      }}
      keyboardShouldPersistTaps="handled"
    >
      {/* ── Header ── */}
      <View className="mb-6">
        <Text className="text-[22px] font-semibold text-zinc-900 tracking-tight mb-0.5">
          Add customer
        </Text>
        <Text className="text-[13px] text-zinc-500">
          Create a new customer profile
        </Text>
      </View>

      {/* ── Identity ── */}
      <SectionLabel>Identity</SectionLabel>
      <View className="bg-white rounded-2xl border border-zinc-200/70 overflow-hidden mb-5 shadow-sm">
        <FieldRow label="Full name" error={errors.name ? "Name is required" : undefined}>
          <Controller
            control={control}
            name="name"
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                placeholder="John Doe"
                placeholderTextColor={placeholderColor}
                returnKeyType="next"
                className={`${inputClass} ${errors.name ? "text-red-500" : ""}`}
              />
            )}
          />
        </FieldRow>

        <FieldRow
          label="Mobile"
          hint="10 digits"
          error={errors.mobile ? "Valid mobile required" : undefined}
        >
          <Controller
            control={control}
            name="mobile"
            rules={{ required: true, pattern: /^[0-9]{10}$/ }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                keyboardType="number-pad"
                placeholder="9876543210"
                placeholderTextColor={placeholderColor}
                returnKeyType="next"
                className={`${inputClass} ${errors.mobile ? "text-red-500" : ""}`}
              />
            )}
          />
        </FieldRow>

        <FieldRow label="Email" isLast>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="customer@mail.com"
                placeholderTextColor={placeholderColor}
                returnKeyType="next"
                className={inputClass}
              />
            )}
          />
        </FieldRow>
      </View>

      {/* ── Financial ── */}
      <SectionLabel>Financial</SectionLabel>
      <View className="bg-white rounded-2xl border border-zinc-200/70 overflow-hidden mb-5 shadow-sm">
        <FieldRow label="Opening balance" hint="₹" isLast>
          <Controller
            control={control}
            name="openingBalance"
            render={({ field: { onChange, value } }) => (
              <View className="flex-row items-baseline gap-1">
                <Text className="text-[13px] text-zinc-400">₹</Text>
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={placeholderColor}
                  className="text-[17px] font-semibold text-zinc-900 p-0 min-w-[60px]"
                />
              </View>
            )}
          />
        </FieldRow>
      </View>

      {/* ── More details ── */}
      <SectionLabel>More details</SectionLabel>
      <View className="bg-white rounded-2xl border border-zinc-200/70 overflow-hidden mb-6 shadow-sm">
        <FieldRow label="Address">
          <Controller
            control={control}
            name="address"
            render={({ field: { onChange, value } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                placeholder="Street, Area, City"
                placeholderTextColor={placeholderColor}
                returnKeyType="next"
                className={inputClass}
              />
            )}
          />
        </FieldRow>

        <FieldRow label="Notes" isLast>
          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, value } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                placeholder="Extra details..."
                placeholderTextColor={placeholderColor}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className={`${inputClass} min-h-[80px]`}
              />
            )}
          />
        </FieldRow>
      </View>

      {/* ── Actions ── */}
      <View className="flex-row gap-3">
        <Pressable
          onPress={() => reset()}
          className="flex-1 border border-zinc-300 bg-white rounded-2xl py-4 items-center active:opacity-60"
        >
          <Text className="text-[14px] font-semibold text-zinc-600">
            Reset
          </Text>
        </Pressable>

        <Pressable
          onPress={handleSubmit(onSubmit)}
          className="flex-[2] bg-zinc-900 rounded-2xl py-4 items-center active:opacity-80"
        >
          <Text className="text-white text-[14px] font-semibold tracking-wide">
            Add customer
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

export default AddCustomer;