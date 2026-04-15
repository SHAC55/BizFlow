import { View, Text, TextInput, ScrollView, Pressable } from "react-native";
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

const AddInventory = () => {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>();

  const productName = watch("name");

  // 🔥 SKU Generator (same logic as web)
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

  // Auto-generate SKU
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
    <ScrollView className="flex-1 bg-gray-100 px-4 pt-6">
      {/* Header */}
      <Text className="text-2xl font-bold mb-6">Add Product</Text>

      {/* Card */}
      <View className="bg-white rounded-2xl p-4 shadow-sm">
        {/* Product Name */}
        <Text className="text-sm font-semibold mb-1">Product Name</Text>
        <Controller
          control={control}
          name="name"
          rules={{ required: "Product name is required" }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              placeholder="Wireless Mouse"
              className="border border-gray-300 rounded-lg px-3 py-3 mb-1"
            />
          )}
        />
        {errors.name && (
          <Text className="text-red-500 text-xs mb-3">
            {errors.name.message}
          </Text>
        )}

        {/* Category */}
        <Text className="text-sm font-semibold mb-1">Category</Text>
        <Controller
          control={control}
          name="category"
          rules={{ required: "Category is required" }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              placeholder="Electronics"
              className="border border-gray-300 rounded-lg px-3 py-3 mb-1"
            />
          )}
        />
        {errors.category && (
          <Text className="text-red-500 text-xs mb-3">
            {errors.category.message}
          </Text>
        )}

        {/* SKU */}
        <Text className="text-sm font-semibold mb-1">SKU</Text>
        <Controller
          control={control}
          name="sku"
          render={({ field: { value } }) => (
            <TextInput
              value={value}
              editable={false}
              className="border border-gray-200 bg-gray-100 rounded-lg px-3 py-3 mb-4"
            />
          )}
        />

        {/* Prices Row */}
        <View className="flex-row gap-2">
          {/* Cost Price */}
          <View className="flex-1">
            <Text className="text-sm font-semibold mb-1">Cost</Text>
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
                  className="border border-gray-300 rounded-lg px-3 py-3"
                />
              )}
            />
          </View>

          {/* Selling Price */}
          <View className="flex-1">
            <Text className="text-sm font-semibold mb-1">Price</Text>
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
                  className="border border-gray-300 rounded-lg px-3 py-3"
                />
              )}
            />
          </View>
        </View>

        {/* Quantity */}
        <Text className="text-sm font-semibold mt-4 mb-1">Quantity</Text>
        <Controller
          control={control}
          name="quantity"
          rules={{ required: "Required" }}
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

        {/* Minimum Quantity */}
        <Text className="text-sm font-semibold mb-1">Min Alert Qty</Text>
        <Controller
          control={control}
          name="minimumQuantity"
          rules={{ required: "Required" }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              keyboardType="numeric"
              placeholder="5"
              className="border border-gray-300 rounded-lg px-3 py-3"
            />
          )}
        />
      </View>

      {/* Submit Button */}
      <Pressable
        onPress={handleSubmit(onSubmit)}
        className="bg-black mt-6 py-4 rounded-xl"
      >
        <Text className="text-white text-center font-semibold">
          Add Product
        </Text>
      </Pressable>
    </ScrollView>
  );
};

export default AddInventory;
