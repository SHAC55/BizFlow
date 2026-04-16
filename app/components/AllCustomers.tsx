// app/customers/index.tsx

import { View, Text, FlatList, TextInput, Pressable } from "react-native";
import React, { useState, useMemo, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  since: string;
};

const DATA: Customer[] = [
  {
    id: "1",
    name: "Rahul Sharma",
    email: "rahul@gmail.com",
    phone: "9876543210",
    since: "Jan 2024",
  },
  {
    id: "2",
    name: "Amit Verma",
    email: "amit@gmail.com",
    phone: "9123456780",
    since: "Mar 2025",
  },
];

const CustomerRow = ({ item }: { item: Customer }) => {
  return (
    <View className="bg-white border-b border-gray-100 py-3 px-2 flex-row justify-between">
      <View className="flex-1">
        <Text className="text-sm font-semibold text-black">{item.name}</Text>

        <Text className="text-[11px] text-gray-500">{item.email}</Text>

        <Text className="text-[11px] text-gray-500">{item.phone}</Text>

        <Text className="text-[10px] text-gray-400 mt-1">
          Since {item.since}
        </Text>
      </View>

      <View className="items-end justify-center">
        <Pressable
          onPress={() =>
            router.push({
              pathname: "/customers/[id]",
              params: { id: item.id },
            })
          }
          className="flex-row items-center mt-2"
        >
          <Text className="text-xs text-blue-600 mr-1">View</Text>

          <Ionicons name="chevron-forward" size={14} color="#2563eb" />
        </Pressable>
      </View>
    </View>
  );
};

const AllCustomers = () => {
  const [search, setSearch] = useState("");

  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const filteredData = useMemo(() => {
    return DATA.filter((customer) =>
      customer.name.toLowerCase().includes(debouncedSearch.toLowerCase()),
    );
  }, [debouncedSearch]);

  return (
    <View className="flex-1 bg-gray-100">
      <View className="px-4 pt-4">
        <Text className="text-lg font-semibold text-black mb-2">
          All Customers
        </Text>

        <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-3 py-2 mb-3">
          <Ionicons name="search-outline" size={18} color="#9ca3af" />

          <TextInput
            placeholder="Search customer..."
            value={search}
            onChangeText={setSearch}
            className="flex-1 ml-2 text-black"
          />
        </View>
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CustomerRow item={item} />}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 100,
        }}
      />
    </View>
  );
};

export default AllCustomers;
