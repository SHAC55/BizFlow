// app/transactions/[id].tsx

import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const DATA = [
  {
    id: "1",
    saleNo: "#0135b498",
    customer: "Imran",
    mobile: "9878987800",
    email: "saifchoudhary.0666@gmail.com",
    item: "Monitor",
    sku: "M-784",
    category: "Accessories",
    date: "11 April 2026 at 06:43 pm",
    total: "₹8,000",
    paid: "₹5,000",
    due: "₹3,000",
    status: "Partial Payment",
  },
];

const MiniStat = ({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "green" | "red";
}) => (
  <View className="flex-1 bg-gray-50 rounded-xl p-3">
    <Text className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">{label}</Text>
    <Text
      className={`text-[15px] font-medium ${
        accent === "green" ? "text-green-800" : accent === "red" ? "text-red-700" : "text-black"
      }`}
    >
      {value}
    </Text>
  </View>
);

const InfoRow = ({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) => (
  <View
    className={`flex-row justify-between items-center py-2.5 ${
      !last ? "border-b border-gray-50" : ""
    }`}
  >
    <Text className="text-xs text-gray-500">{label}</Text>
    <Text className="text-xs font-medium text-black flex-shrink-0 max-w-[55%] text-right">
      {value}
    </Text>
  </View>
);

const TransactionDetail = () => {
  const { id } = useLocalSearchParams();
  const transaction = DATA.find((item) => item.id === id);

  if (!transaction) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Text className="text-black">Transaction not found</Text>
      </SafeAreaView>
    );
  }

  const initial = transaction.customer.charAt(0).toUpperCase();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
      >
        {/* Top Bar */}
        <View className="flex-row items-center justify-between mb-5">
          <Pressable
            onPress={() => router.back()}
            className="flex-row items-center gap-1.5 px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl"
          >
            <Ionicons name="chevron-back" size={14} color="#111" />
            <Text className="text-sm font-medium text-black">Back to sales</Text>
          </Pressable>

          <Pressable className="flex-row items-center gap-1.5 px-3.5 py-2.5 bg-black rounded-xl">
            <Ionicons name="print-outline" size={14} color="#fff" />
            <Text className="text-sm font-medium text-white">Invoice</Text>
          </Pressable>
        </View>

        {/* Sale Card */}
        <View className="bg-white border border-gray-100 rounded-3xl p-5 mb-2.5">
          <View className="flex-row justify-between items-start pb-4 mb-4 border-b border-gray-50">
            <View>
              <Text className="text-xs font-medium text-gray-400 mb-1">{transaction.saleNo}</Text>
              <Text className="text-lg font-medium text-black">Sale</Text>
              <Text className="text-[11px] text-gray-400 mt-0.5">{transaction.date}</Text>
              {/* Status badge */}
              <View className="flex-row items-center gap-1 mt-2 self-start bg-amber-50 px-2.5 py-1 rounded-full">
                <View className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <Text className="text-[11px] text-amber-800 font-medium">{transaction.status}</Text>
              </View>
            </View>
            <View className="items-end">
              <Text className="text-[27px] font-medium text-black leading-tight">{transaction.total}</Text>
              <Text className="text-[11px] text-gray-400 mt-0.5">Total amount</Text>
            </View>
          </View>

          <View className="flex-row gap-2 mb-2">
            <MiniStat label="Customer" value={transaction.customer} />
            <MiniStat label="Items" value="1 product" />
          </View>
          <View className="flex-row gap-2">
            <MiniStat label="Paid" value={transaction.paid} accent="green" />
            <MiniStat label="Due" value={transaction.due} accent="red" />
          </View>
        </View>

        {/* Customer Card */}
        <View className="bg-white border border-gray-100 rounded-3xl p-5 mb-2.5">
          <Text className="text-[10px] uppercase tracking-widest text-gray-400 mb-3">Customer</Text>
          <View className="flex-row items-center gap-3 mb-3">
            <View className="w-9 h-9 rounded-xl bg-blue-50 items-center justify-center">
              <Text className="text-blue-800 text-sm font-medium">{initial}</Text>
            </View>
            <View>
              <Text className="text-[15px] font-medium text-black">{transaction.customer}</Text>
              <Text className="text-[11px] text-gray-400">Customer</Text>
            </View>
          </View>
          <InfoRow label="Mobile" value={transaction.mobile} />
          <InfoRow label="Email" value={transaction.email} last />
        </View>

        {/* Sold Items */}
        <View className="bg-white border border-gray-100 rounded-3xl p-5 mb-2.5">
          <Text className="text-[10px] uppercase tracking-widest text-gray-400 mb-3">Sold items</Text>
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-[15px] font-medium text-black">{transaction.item}</Text>
              <Text className="text-xs text-gray-400 mt-0.5">
                {transaction.category} · SKU {transaction.sku}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-[11px] text-gray-400">1 × {transaction.total}</Text>
              <Text className="text-base font-medium text-black mt-0.5">{transaction.total}</Text>
            </View>
          </View>
          <View className="h-px bg-gray-50 my-3" />
          <View className="flex-row justify-between">
            <Text className="text-xs text-gray-500">Subtotal</Text>
            <Text className="text-xs font-medium text-black">{transaction.total}</Text>
          </View>
        </View>

        {/* Payment Summary */}
        <View className="bg-black rounded-2xl px-5 py-4 flex-row justify-between items-center mb-2">
          <View>
            <Text className="text-[10px] uppercase tracking-widest text-white/50 mb-1">Final amount</Text>
            <Text className="text-[26px] font-medium text-white leading-tight">{transaction.total}</Text>
          </View>
          <Ionicons name="card-outline" size={20} color="rgba(255,255,255,0.25)" />
        </View>

        <View className="flex-row gap-2 mb-4">
          <View className="flex-1 bg-green-50 rounded-2xl px-4 py-4">
            <Text className="text-[10px] uppercase tracking-widest text-green-700 mb-1.5">Total paid</Text>
            <Text className="text-[22px] font-medium text-green-900">{transaction.paid}</Text>
          </View>
          <View className="flex-1 bg-red-50 rounded-2xl px-4 py-4">
            <Text className="text-[10px] uppercase tracking-widest text-red-600 mb-1.5">Remaining due</Text>
            <Text className="text-[22px] font-medium text-red-800">{transaction.due}</Text>
          </View>
        </View>

        {/* CTA */}
        <Pressable className="bg-black rounded-2xl py-4 items-center">
          <Text className="text-white font-medium text-sm">Record Payment</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TransactionDetail;