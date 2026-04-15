import {
  View,
  Text,
  FlatList,
  Pressable,
  TextInput,
} from "react-native";
import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import { Ionicons } from "@expo/vector-icons";

type Payment = {
  id: string;
  customer: string;
  amount: number;
  due: number;
  status: "Pending" | "Partial";
};

const DATA: Payment[] = [
  { id: "1", customer: "Rahul Sharma", amount: 50000, due: 10000, status: "Partial" },
  { id: "2", customer: "Amit Verma", amount: 20000, due: 20000, status: "Pending" },
  { id: "3", customer: "Sneha Patil", amount: 30000, due: 5000, status: "Pending" },
];

const statusColors = {
  Pending: "text-blue-600",
  Partial: "text-orange-600",
};

const PaymentRow = React.memo(({ item }: { item: Payment }) => {
  return (
    <View className="bg-white border-b border-gray-100 py-3 px-2 flex-row items-center justify-between">
      
      {/* Left */}
      <View className="flex-1">
        <Text className="text-sm font-semibold text-black">
          {item.customer}
        </Text>
        <Text className="text-[11px] text-gray-500">
          ₹{item.amount} • Due ₹{item.due}
        </Text>
      </View>

      {/* Status */}
      <Text className={`text-[11px] font-medium mr-3 ${statusColors[item.status]}`}>
        {item.status}
      </Text>

      {/* Action */}
      <Pressable
        onPress={() => console.log("Send Reminder", item.id)}
        className="px-2 py-1 bg-black rounded-md"
      >
        <Text className="text-[10px] text-white">Remind</Text>
      </Pressable>
    </View>
  );
});

const AllDuePayments = () => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Pending" | "Partial">("All");
  const [sortType, setSortType] = useState<"High" | "Low">("High");
  const [filterOpen, setFilterOpen] = useState(true);

  // 🔁 debounce
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  // 🔍 filter + sort
  const filteredData = useMemo(() => {
    let data = DATA.filter((item) => {
      const matchSearch = item.customer
        .toLowerCase()
        .includes(debouncedSearch.toLowerCase());

      const matchStatus =
        statusFilter === "All" || item.status === statusFilter;

      return matchSearch && matchStatus;
    });

    // 📊 sort
    data = data.sort((a, b) =>
      sortType === "High" ? b.due - a.due : a.due - b.due
    );

    return data;
  }, [debouncedSearch, statusFilter, sortType]);

  const renderItem = useCallback(
    ({ item }: { item: Payment }) => <PaymentRow item={item} />,
    []
  );

  return (
    <View className="flex-1 bg-white">
      <View className="px-4 mt-4">

        {/* Header */}
        <Text className="text-lg font-semibold text-black mb-2">
          Due Payments
        </Text>

        {/* 🔍 Search */}
        <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-2 mb-3">
          <Ionicons name="search-outline" size={16} color="#6b7280" />
          <TextInput
            placeholder="Search customer..."
            value={search}
            onChangeText={setSearch}
            className="flex-1 ml-2 text-sm"
          />
        </View>

        {/* 🔽 FILTER HEADER */}
        <Pressable
          onPress={() => setFilterOpen(!filterOpen)}
          className="flex-row items-center justify-between bg-gray-50 px-3 py-2 rounded-xl mb-3"
        >
          <Text className="text-xs font-medium text-gray-700">
            Filters & Sorting
          </Text>

          <Ionicons
            name={filterOpen ? "chevron-up" : "chevron-down"}
            size={14}
            color="#6b7280"
          />
        </Pressable>

        {/* 🔽 FILTER CONTENT */}
        {filterOpen && (
          <View className="bg-gray-50 rounded-xl p-3 mb-3">

            {/* 🎯 STATUS */}
            <Text className="text-[11px] text-gray-500 mb-2">
              Payment Status
            </Text>

            <View className="flex-row gap-2 mb-3">
              {["All", "Pending", "Partial"].map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setStatusFilter(item as any)}
                  className={`px-3 py-1 rounded-full ${
                    statusFilter === item
                      ? "bg-black"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  <Text
                    className={`text-[10px] ${
                      statusFilter === item
                        ? "text-white"
                        : "text-gray-600"
                    }`}
                  >
                    {item}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* 📊 SORT */}
            <Text className="text-[11px] text-gray-500 mb-2">
              Sort by Due Amount
            </Text>

            <View className="flex-row gap-2">
              {["High", "Low"].map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setSortType(item as any)}
                  className={`px-3 py-1 rounded-full ${
                    sortType === item
                      ? "bg-black"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  <Text
                    className={`text-[10px] ${
                      sortType === item
                        ? "text-white"
                        : "text-gray-600"
                    }`}
                  >
                    {item === "High"
                      ? "High → Low"
                      : "Low → High"}
                  </Text>
                </Pressable>
              ))}
            </View>

          </View>
        )}
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

export default AllDuePayments;