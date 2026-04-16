// app/customers/[id].tsx

import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const DATA = [
  { id: "1", name: "Rahul Sharma", email: "rahul@gmail.com", phone: "9876543210", since: "Jan 2024" },
  { id: "2", name: "Amit Verma", email: "amit@gmail.com", phone: "9123456780", since: "Mar 2025" },
];

const StatCard = ({ title, value, sub, accent }: { title: string; value: string; sub?: string; accent?: boolean }) => (
  <View className="bg-white border border-gray-100 rounded-2xl p-4 flex-1">
    <Text className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">{title}</Text>
    <Text className={`text-2xl font-medium mt-1 ${accent ? "text-amber-600" : "text-black"}`}>{value}</Text>
    {sub ? <Text className="text-[11px] text-gray-400 mt-1">{sub}</Text> : null}
  </View>
);

const ContactRow = ({ label, value, muted }: { label: string; value: string; muted?: boolean }) => (
  <View className="flex-row justify-between items-center bg-gray-50 rounded-xl px-4 py-3">
    <Text className="text-[10px] uppercase tracking-widest text-gray-400">{label}</Text>
    <Text className={`text-sm font-medium ${muted ? "text-gray-400" : "text-black"}`}>{value}</Text>
  </View>
);

const EmptySection = ({ icon, title, sub }: { icon: string; title: string; sub: string }) => (
  <View className="py-10 items-center px-6">
    <View className="w-10 h-10 rounded-xl bg-gray-50 items-center justify-center mb-3">
      <Ionicons name={icon as any} size={20} color="#9ca3af" />
    </View>
    <Text className="text-sm font-medium text-black">{title}</Text>
    <Text className="text-xs text-gray-400 mt-1 text-center leading-5">{sub}</Text>
  </View>
);

const CustomerDetail = () => {
  const { id } = useLocalSearchParams();
  const customer = DATA.find((item) => item.id === id);

  if (!customer) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-black text-base">Customer not found</Text>
      </SafeAreaView>
    );
  }

  const initials = customer.name.charAt(0).toUpperCase();
  const firstName = customer.name.split(" ")[0];

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
            <Ionicons name="chevron-back" size={15} color="#111" />
            <Text className="text-sm font-medium text-black">Back</Text>
          </Pressable>

          <View className="flex-row gap-2">
            <Pressable className="px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl">
              <Text className="text-sm font-medium text-black">Edit</Text>
            </Pressable>
            <Pressable className="px-3.5 py-2.5 bg-red-600 rounded-xl">
              <Text className="text-sm font-medium text-white">Archive</Text>
            </Pressable>
          </View>
        </View>

        {/* Profile Card */}
        <View className="bg-white border border-gray-100 rounded-3xl p-5 mb-3">
          <View className="flex-row items-center gap-3.5 mb-5">
            {/* Avatar */}
            <View className="w-14 h-14 rounded-2xl bg-blue-50 items-center justify-center">
              <Text className="text-blue-800 text-xl font-medium">{initials}</Text>
            </View>

            <View className="flex-1">
              <Text className="text-xl font-medium text-black leading-tight">{customer.name}</Text>
              <Text className="text-xs text-gray-400 mt-0.5">Customer since {customer.since}</Text>
              {/* Active badge */}
              <View className="flex-row items-center gap-1 mt-1.5 self-start bg-green-50 px-2.5 py-0.5 rounded-full">
                <View className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <Text className="text-[11px] text-green-700 font-medium">Active</Text>
              </View>
            </View>
          </View>

          {/* Contact Rows */}
          <View className="gap-2">
            <ContactRow label="Phone" value={customer.phone} />
            <ContactRow label="Email" value={customer.email} />
            <ContactRow label="Address" value="Not added" muted />
          </View>
        </View>

        {/* Stats Grid */}
        <View className="gap-2 mb-3">
          <View className="flex-row gap-2">
            <StatCard title="Outstanding due" value="₹0" sub="All cleared" accent />
            <StatCard title="Revenue collected" value="₹0" />
          </View>
          <View className="flex-row gap-2">
            <StatCard title="Opening balance" value="₹0" />
            <StatCard title="Total orders" value="0" sub="Lifetime" />
          </View>
        </View>

        {/* CTA */}
        <Pressable className="bg-black rounded-2xl py-4 items-center mb-3">
          <Text className="text-white font-medium text-sm">+ New Sale for {firstName}</Text>
        </Pressable>

        {/* Sales History */}
        <View className="bg-white border border-gray-100 rounded-3xl overflow-hidden mb-2.5">
          <View className="flex-row justify-between items-center px-5 py-4 border-b border-gray-50">
            <Text className="text-[15px] font-medium text-black">Sales history</Text>
            <View className="bg-gray-50 rounded-full px-2.5 py-1">
              <Text className="text-xs text-gray-400">0 orders</Text>
            </View>
          </View>
          <EmptySection
            icon="receipt-outline"
            title="No sales yet"
            sub={"Sales will appear here once the customer makes a purchase"}
          />
        </View>

        {/* Payment History */}
        <View className="bg-white border border-gray-100 rounded-3xl overflow-hidden">
          <View className="px-5 py-4 border-b border-gray-50">
            <Text className="text-[15px] font-medium text-black">Payment history</Text>
          </View>
          <EmptySection
            icon="card-outline"
            title="No payments yet"
            sub={"Customer payments will appear here"}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CustomerDetail;