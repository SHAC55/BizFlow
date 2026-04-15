import {
  View,
  Text,
  FlatList,
  Pressable,
  TextInput,
} from "react-native";
import React, {
  useCallback,
  useState,
  useMemo,
  useEffect,
} from "react";
import { Ionicons } from "@expo/vector-icons";

type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  qty: number;
};

const DATA: Product[] = [
  {
    id: "1",
    name: "iPhone 13",
    sku: "IP13-128",
    category: "Mobile",
    qty: 12,
  },
  {
    id: "2",
    name: "AirPods Pro",
    sku: "APP-2",
    category: "Accessories",
    qty: 4,
  },
  {
    id: "3",
    name: "Samsung TV",
    sku: "SAM-TV-55",
    category: "Electronics",
    qty: 0,
  },
];

const getStatus = (qty: number) => {
  if (qty === 0) return "Out";
  if (qty < 5) return "Low";
  return "In";
};

const categories = ["All", "Mobile", "Accessories", "Electronics"];

const ProductRow = React.memo(({ item }: { item: Product }) => {
  const status = getStatus(item.qty);

  return (
    <View className="flex-row items-center justify-between bg-white border-b border-gray-100 py-3 px-2">
      <View className="flex-1">
        <Text className="text-sm font-semibold text-black">
          {item.name}
        </Text>
        <Text className="text-[11px] text-gray-500">
          {item.sku} • {item.category}
        </Text>
      </View>

      <View className="items-end mr-3">
        <Text className="text-xs font-semibold text-black">
          {item.qty}
        </Text>
        <Text
          className={`text-[10px] ${
            status === "In"
              ? "text-green-600"
              : status === "Low"
              ? "text-orange-600"
              : "text-red-600"
          }`}
        >
          {status}
        </Text>
      </View>

      <Pressable onPress={() => console.log("View", item.id)}>
        <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
      </Pressable>
    </View>
  );
});

const AllProducts = () => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // 🔁 Debounce
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  // 🔍 Filter logic
  const filteredData = useMemo(() => {
    return DATA.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        item.sku.toLowerCase().includes(debouncedSearch.toLowerCase());

      const matchCategory =
        category === "All" || item.category === category;

      const matchLowStock =
        !lowStockOnly || item.qty < 5;

      return matchSearch && matchCategory && matchLowStock;
    });
  }, [debouncedSearch, category, lowStockOnly]);

  const renderItem = useCallback(
    ({ item }: { item: Product }) => <ProductRow item={item} />,
    []
  );

  return (
    <View className="flex-1 bg-white">
      <View className="px-4 mt-4">
        {/* Header */}
        <Text className="text-lg font-semibold text-black mb-2">
          All Products
        </Text>

        {/* 🔍 Search */}
        <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-2 mb-3">
          <Ionicons name="search-outline" size={16} color="#6b7280" />
          <TextInput
            placeholder="Search product or SKU..."
            value={search}
            onChangeText={setSearch}
            className="flex-1 ml-2 text-sm"
          />
        </View>

        {/* 🏷️ Category Filters */}
        <View className="flex-row gap-2 mb-2">
          {categories.map((item) => (
            <Pressable
              key={item}
              onPress={() => setCategory(item)}
              className={`px-3 py-1 rounded-full ${
                category === item ? "bg-black" : "bg-gray-100"
              }`}
            >
              <Text
                className={`text-[10px] ${
                  category === item ? "text-white" : "text-gray-600"
                }`}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* ⚠️ Low Stock Toggle */}
        <Pressable
          onPress={() => setLowStockOnly(!lowStockOnly)}
          className={`flex-row items-center mb-2 px-3 py-1 rounded-full self-start ${
            lowStockOnly ? "bg-orange-100" : "bg-gray-100"
          }`}
        >
          <Ionicons
            name="alert-circle-outline"
            size={14}
            color={lowStockOnly ? "#ea580c" : "#6b7280"}
          />
          <Text
            className={`text-[10px] ml-1 ${
              lowStockOnly ? "text-orange-600" : "text-gray-600"
            }`}
          >
            Low Stock
          </Text>
        </Pressable>
      </View>

      {/* List */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default AllProducts;