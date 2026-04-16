import {
  View,
  Text,
  TextInput as RNTextInput,
  ScrollView,
  Pressable,
} from "react-native";
import { styled } from "nativewind";
import React, { useEffect, useMemo } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";

const TextInput = styled(RNTextInput);

type Item = {
  productName: string;
  quantity: string;
  price: string;
};

type FormData = {
  customer: string;
  items: Item[];
  totalAmount: string;
  paidAmount: string;
};

// ─── Section label ────────────────────────────────────────────────────────────
const SectionLabel = ({ children }: { children: string }) => (
  <Text className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase mb-2 ml-0.5">
    {children}
  </Text>
);

// ─── Main component ──────────────────────────────────────────────────────────
const AddTransaction = () => {
  const { control, handleSubmit, watch, setValue, reset } = useForm<FormData>({
    defaultValues: {
      customer: "",
      items: [{ productName: "", quantity: "1", price: "0" }],
      totalAmount: "0",
      paidAmount: "0",
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const items = watch("items");
  const total = Number(watch("totalAmount") || 0);
  const paid = Number(watch("paidAmount") || 0);

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + Number(item.quantity || 0) * Number(item.price || 0),
        0
      ),
    [items]
  );

  useEffect(() => {
    setValue("totalAmount", String(subtotal));
  }, [subtotal]);

  const due = Math.max(total - paid, 0);
  const isFullyPaid = due === 0 && total > 0;

  const handleReset = () =>
    reset({
      customer: "",
      items: [{ productName: "", quantity: "1", price: "0" }],
      totalAmount: "0",
      paidAmount: "0",
    });

  const onSubmit = (data: FormData) => {
    console.log("SALE:", data);
    handleReset();
  };

  return (
    <ScrollView
      className="flex-1 bg-zinc-50"
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 48 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* ── Header ── */}
      <View className="mb-6">
        <Text className="text-[22px] font-semibold text-zinc-900 tracking-tight mb-0.5">
          New transaction
        </Text>
        <Text className="text-[13px] text-zinc-500">Record a sale below</Text>
      </View>

      {/* ── Customer ── */}
      <SectionLabel>Customer</SectionLabel>
      <View className="bg-white rounded-2xl border border-zinc-200/70 overflow-hidden mb-5 shadow-sm">
        <Controller
          control={control}
          name="customer"
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              placeholder="Customer name"
              placeholderTextColor="#A1A1AA"
              className="px-4 py-4 text-[15px] text-zinc-900"
              returnKeyType="next"
            />
          )}
        />
      </View>

      {/* ── Items ── */}
      <SectionLabel>Items</SectionLabel>
      <View className="mb-2">
        {fields.map((field, index) => (
          <View
            key={field.id}
            className="bg-white rounded-2xl border border-zinc-200/70 overflow-hidden mb-3 shadow-sm"
          >
            {/* Item number pill */}
            <View className="flex-row items-center justify-between px-4 pt-3.5 pb-2 border-b border-zinc-100">
              <View className="bg-zinc-100 rounded-full px-2.5 py-0.5">
                <Text className="text-[11px] font-semibold text-zinc-500">
                  Item {index + 1}
                </Text>
              </View>
              {fields.length > 1 && (
                <Pressable onPress={() => remove(index)}>
                  <Text className="text-[12px] text-red-400 font-medium">
                    Remove
                  </Text>
                </Pressable>
              )}
            </View>

            {/* Product name */}
            <Controller
              control={control}
              name={`items.${index}.productName`}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="Product name"
                  placeholderTextColor="#A1A1AA"
                  className="px-4 py-3.5 text-[15px] text-zinc-900 border-b border-zinc-100"
                />
              )}
            />

            {/* Qty + Price row */}
            <View className="flex-row">
              <View className="flex-1 border-r border-zinc-100">
                <Text className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase px-4 pt-3 pb-1">
                  Qty
                </Text>
                <Controller
                  control={control}
                  name={`items.${index}.quantity`}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      keyboardType="numeric"
                      placeholder="1"
                      placeholderTextColor="#A1A1AA"
                      className="px-4 pb-3.5 text-[17px] font-semibold text-zinc-900"
                    />
                  )}
                />
              </View>

              <View className="flex-1">
                <Text className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase px-4 pt-3 pb-1">
                  Price (₹)
                </Text>
                <Controller
                  control={control}
                  name={`items.${index}.price`}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#A1A1AA"
                      className="px-4 pb-3.5 text-[17px] font-semibold text-zinc-900"
                    />
                  )}
                />
              </View>
            </View>

            {/* Line subtotal */}
            {(() => {
              const lineTotal =
                Number(items[index]?.quantity || 0) *
                Number(items[index]?.price || 0);
              return lineTotal > 0 ? (
                <View className="px-4 py-2 bg-zinc-50 border-t border-zinc-100">
                  <Text className="text-[12px] text-zinc-500 text-right">
                    Subtotal:{" "}
                    <Text className="font-semibold text-zinc-700">
                      ₹{lineTotal.toLocaleString("en-IN")}
                    </Text>
                  </Text>
                </View>
              ) : null;
            })()}
          </View>
        ))}
      </View>

      {/* Add item */}
      <Pressable
        onPress={() => append({ productName: "", quantity: "1", price: "0" })}
        className="bg-white border border-dashed border-zinc-300 rounded-2xl py-3.5 items-center mb-5 active:opacity-60"
      >
        <Text className="text-[13px] font-semibold text-zinc-500">
          + Add item
        </Text>
      </Pressable>

      {/* ── Payment summary ── */}
      <SectionLabel>Payment</SectionLabel>
      <View className="bg-white rounded-2xl border border-zinc-200/70 overflow-hidden mb-5 shadow-sm">
        {/* Total */}
        <View className="flex-row items-center justify-between px-4 py-3.5 border-b border-zinc-100">
          <Text className="text-[13px] text-zinc-500">Total</Text>
          <Controller
            control={control}
            name="totalAmount"
            render={({ field: { value } }) => (
              <Text className="text-[15px] font-semibold text-zinc-900">
                ₹{Number(value || 0).toLocaleString("en-IN")}
              </Text>
            )}
          />
        </View>

        {/* Paid */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-zinc-100">
          <Text className="text-[13px] text-zinc-500">Paid</Text>
          <Controller
            control={control}
            name="paidAmount"
            render={({ field: { onChange, value } }) => (
              <View className="flex-row items-baseline gap-0.5">
                <Text className="text-[13px] text-zinc-400">₹</Text>
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#A1A1AA"
                  className="text-[17px] font-semibold text-zinc-900 text-right min-w-[60px] p-0"
                />
              </View>
            )}
          />
        </View>

        {/* Due */}
        <View className="flex-row items-center justify-between px-4 py-3.5 bg-zinc-50">
          <Text className="text-[13px] text-zinc-500">Due</Text>
          <View className="flex-row items-center gap-2">
            {isFullyPaid && (
              <View className="bg-emerald-100 rounded-full px-2 py-0.5">
                <Text className="text-[10px] font-bold text-emerald-600 tracking-wide">
                  PAID
                </Text>
              </View>
            )}
            <Text
              className={`text-[15px] font-bold ${
                due > 0 ? "text-red-500" : "text-emerald-600"
              }`}
            >
              ₹{due.toLocaleString("en-IN")}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Actions ── */}
      <View className="flex-row gap-3">
        <Pressable
          onPress={handleReset}
          className="flex-1 border border-zinc-300 bg-white py-4 rounded-2xl items-center active:opacity-60"
        >
          <Text className="text-[14px] font-semibold text-zinc-600">Reset</Text>
        </Pressable>

        <Pressable
          onPress={handleSubmit(onSubmit)}
          className="flex-[2] bg-zinc-900 py-4 rounded-2xl items-center active:opacity-80"
        >
          <Text className="text-white text-[14px] font-semibold tracking-wide">
            Save transaction
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

export default AddTransaction;