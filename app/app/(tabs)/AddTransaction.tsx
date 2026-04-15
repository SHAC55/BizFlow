import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
} from "react-native";
import React, { useEffect, useMemo } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";

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

const AddTransaction = () => {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
  } = useForm<FormData>({
    defaultValues: {
      customer: "",
      items: [{ productName: "", quantity: "1", price: "0" }],
      totalAmount: "0",
      paidAmount: "0",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const items = watch("items");
  const total = Number(watch("totalAmount") || 0);
  const paid = Number(watch("paidAmount") || 0);

  // 🔥 Auto subtotal calculation
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      return (
        sum +
        Number(item.quantity || 0) * Number(item.price || 0)
      );
    }, 0);
  }, [items]);

  useEffect(() => {
    setValue("totalAmount", String(subtotal));
  }, [subtotal]);

  const due = Math.max(total - paid, 0);

  const onSubmit = (data: FormData) => {
    console.log("SALE:", data);

    // ✅ RESET FORM
    reset({
      customer: "",
      items: [{ productName: "", quantity: "1", price: "0" }],
      totalAmount: "0",
      paidAmount: "0",
    });
  };

  return (
    <ScrollView className="flex-1 bg-gray-100 px-4 pt-6">
      
      {/* Header */}
      <Text className="text-2xl font-bold mb-6">
        Add Transaction
      </Text>

      {/* Card */}
      <View className="bg-white rounded-2xl p-4 shadow-sm">
        
        {/* Customer */}
        <Text className="text-sm font-semibold mb-1">
          Customer
        </Text>
        <Controller
          control={control}
          name="customer"
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              placeholder="Customer name"
              className="border border-gray-300 rounded-lg px-3 py-3 mb-4"
            />
          )}
        />

        {/* Items */}
        <Text className="text-sm font-semibold mb-2">
          Items
        </Text>

        {fields.map((field, index) => (
          <View
            key={field.id}
            className="border border-gray-200 rounded-xl p-3 mb-3"
          >
            {/* Product */}
            <Controller
              control={control}
              name={`items.${index}.productName`}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="Product"
                  className="border border-gray-300 rounded-lg px-3 py-2 mb-2"
                />
              )}
            />

            {/* Row */}
            <View className="flex-row gap-2">
              
              {/* Qty */}
              <Controller
                control={control}
                name={`items.${index}.quantity`}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    keyboardType="numeric"
                    placeholder="Qty"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                  />
                )}
              />

              {/* Price */}
              <Controller
                control={control}
                name={`items.${index}.price`}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    keyboardType="numeric"
                    placeholder="Price"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                  />
                )}
              />
            </View>

            {/* Remove */}
            {fields.length > 1 && (
              <Pressable onPress={() => remove(index)}>
                <Text className="text-red-500 mt-2 text-sm">
                  Remove
                </Text>
              </Pressable>
            )}
          </View>
        ))}

        {/* Add Item */}
        <Pressable
          onPress={() =>
            append({ productName: "", quantity: "1", price: "0" })
          }
          className="mb-4"
        >
          <Text className="text-blue-600 font-medium">
            + Add Item
          </Text>
        </Pressable>

        {/* Total */}
        <Text className="text-sm font-semibold mb-1">
          Total
        </Text>
        <Controller
          control={control}
          name="totalAmount"
          render={({ field: { value } }) => (
            <TextInput
              value={value}
              editable={false}
              className="border border-gray-200 bg-gray-100 rounded-lg px-3 py-3 mb-4"
            />
          )}
        />

        {/* Paid */}
        <Text className="text-sm font-semibold mb-1">
          Paid
        </Text>
        <Controller
          control={control}
          name="paidAmount"
          render={({ field: { onChange, value } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              keyboardType="numeric"
              placeholder="0"
              className="border border-gray-300 rounded-lg px-3 py-3 mb-4"
            />
          )}
        />

        {/* Due */}
        <Text className="text-red-500 font-semibold mb-4">
          Due: ₹{due}
        </Text>
      </View>

      {/* Buttons */}
      <View className="flex-row gap-3 mt-6">
        
        {/* Reset */}
        <Pressable
          onPress={() =>
            reset({
              customer: "",
              items: [{ productName: "", quantity: "1", price: "0" }],
              totalAmount: "0",
              paidAmount: "0",
            })
          }
          className="flex-1 border border-gray-300 py-4 rounded-xl"
        >
          <Text className="text-center font-semibold">
            Reset
          </Text>
        </Pressable>

        {/* Submit */}
        <Pressable
          onPress={handleSubmit(onSubmit)}
          className="flex-1 bg-black py-4 rounded-xl"
        >
          <Text className="text-white text-center font-semibold">
            Save
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

export default AddTransaction;