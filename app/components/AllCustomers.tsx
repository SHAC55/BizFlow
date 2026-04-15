import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
} from "react-native";
import React, { useState, useMemo, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  // balanceStatus: "Clear" | "Due" | "Pending" | "High";
  since: string;
};

const DATA: Customer[] = [
  {
    id: "1",
    name: "Rahul Sharma",
    email: "rahul@gmail.com",
    phone: "9876543210",
    // balanceStatus: "Clear",
    since: "Jan 2024",
  },
  {
    id: "2",
    name: "Amit Verma",
    email: "amit@gmail.com",
    phone: "9123456780",
    // balanceStatus: "Due",
    since: "Mar 2025",
  },
];

const CustomerRow = ({ item }: { item: Customer }) => {
  return (
    <View className="bg-white border-b border-gray-100 py-3 px-2 flex-row justify-between">
      <View className="flex-1">
        <Text className="text-sm font-semibold">{item.name}</Text>
        <Text className="text-[11px] text-gray-500">{item.email}</Text>
        <Text className="text-[11px] text-gray-500">{item.phone}</Text>
        <Text className="text-[10px] text-gray-400 mt-1">
          Since {item.since}
        </Text>
      </View>

      <View className="items-end">
        {/* <Text className="text-xs text-gray-600">
          {item.balanceStatus}
        </Text> */}

        <Pressable className="flex-row items-center mt-2">
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
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const filteredData = useMemo(() => {
    return DATA.filter((c) =>
      c.name.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [debouncedSearch]);

  return (
    <View className="flex-1 bg-white">
      {/*  Top Section */}
      <View className="px-4 mt-4">
        <Text className="text-lg font-semibold mb-2">
          All Customers
        </Text>

        {/* Search */}
        <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-3 py-2 mb-3">
          <Ionicons name="search-outline" size={18} color="#9ca3af" />
          <TextInput
            placeholder="Search..."
            value={search}
            onChangeText={setSearch}
            className="flex-1 ml-2"
          />
        </View>
      </View>

      {/*   FlatList OUTSIDE */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CustomerRow item={item} />}
        style={{ flex: 1 }} // 
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 120,
        }}
      />
    </View>
  );
};

export default AllCustomers;