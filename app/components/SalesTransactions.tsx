import { View, Text, Pressable, FlatList, TextInput } from "react-native";
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

type Transaction = {
  id: string;
  customer: string;
  item: string;
  date: string;
  amount: string;
  status: "Paid" | "Pending" | "Partial";
};

const DATA: Transaction[] = [
  {
    id: "1",
    customer: "Rahul Sharma",
    item: "iPhone 13",
    date: "15 Apr 2026",
    amount: "₹79,000",
    status: "Paid",
  },
  {
    id: "2",
    customer: "Amit Verma",
    item: "AirPods Pro",
    date: "14 Apr 2026",
    amount: "₹24,900",
    status: "Pending",
  },
  {
    id: "3",
    customer: "Sneha Patil",
    item: "Samsung TV",
    date: "13 Apr 2026",
    amount: "₹55,000",
    status: "Paid",
  },
  {
    id: "4",
    customer: "Vikram Singh",
    item: "MacBook Air",
    date: "12 Apr 2026",
    amount: "₹50,000",
    status: "Partial",
  },
];

const TransactionRow = React.memo(({ item }: { item: Transaction }) => {
  return (
    <View className="flex-row items-center justify-between bg-white border-b border-gray-100 py-2 px-2">
      <View className="flex-1">
        <Text className="text-xs font-semibold text-black">
          {item.customer}
        </Text>
        <Text className="text-[10px] text-gray-500">
          {item.item} • {item.date}
        </Text>
      </View>

      <View className="items-end mr-2">
        <Text className="text-xs font-semibold text-black">{item.amount}</Text>
        <Text
          className={`text-[10px] ${
            item.status === "Paid"
              ? "text-green-600"
              : item.status === "Pending"
                ? "text-orange-600"
                : "text-blue-600"
          }`}
        >
          {item.status}
        </Text>
      </View>

      <Pressable
        onPress={() =>
          router.push({
            pathname: "/sales/[id]",
            params: { id: item.id },
          })
        }
      >
        <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
      </Pressable>
    </View>
  );
});

const SalesTransactions = () => {
  const [filter, setFilter] = useState<"All" | "Paid" | "Pending" | "Partial">(
    "All",
  );

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const filteredData = useMemo(() => {
    return DATA.filter((item) => {
      const matchesFilter = filter === "All" ? true : item.status === filter;

      const matchesSearch =
        item.customer.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        item.item.toLowerCase().includes(debouncedSearch.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [filter, debouncedSearch]);

  const renderItem = useCallback(
    ({ item }: { item: Transaction }) => <TransactionRow item={item} />,
    [],
  );

  return (
    <View className="flex-1 bg-white">
      {/* Top Section */}
      <View className="px-4 mt-4">
        <Text className="text-lg font-semibold text-black mb-2">
          Sales Transactions
        </Text>

        {/* Search */}
        <View
          className={`flex-row items-center bg-white rounded-xl px-3 py-2 mb-3 border ${
            isFocused ? "border-black" : "border-gray-200"
          }`}
        >
          <Ionicons
            name="search-outline"
            size={18}
            color={isFocused ? "#000" : "#9ca3af"}
          />

          <TextInput
            placeholder="Search customer, item..."
            placeholderTextColor="#9ca3af"
            value={search}
            onChangeText={setSearch}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="flex-1 ml-2 text-sm text-black"
          />

          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={16} color="#9ca3af" />
            </Pressable>
          )}
        </View>

        {/* Filters */}
        <View className="flex-row gap-2 mb-2">
          {["All", "Paid", "Pending", "Partial"].map((item) => {
            const isActive = filter === item;

            return (
              <Pressable
                key={item}
                onPress={() => setFilter(item as any)}
                className={`px-3 py-1 rounded-full ${
                  isActive
                    ? item === "Paid"
                      ? "bg-green-600"
                      : item === "Pending"
                        ? "bg-orange-500"
                        : item === "Partial"
                          ? "bg-blue-600"
                          : "bg-black"
                    : "bg-gray-100"
                }`}
              >
                <Text
                  className={`text-[10px] ${
                    isActive ? "text-white" : "text-gray-600"
                  }`}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/*  FIXED LIST */}
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

export default SalesTransactions;
