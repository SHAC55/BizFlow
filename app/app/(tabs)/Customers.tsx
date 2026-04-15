import { View } from "react-native";
import React from "react";
import AllCustomers from "@/components/AllCustomers";

const Customers = () => {
  return (
    <View className="flex-1 bg-white"> {/* 🔥 THIS FIX */}
      <AllCustomers />
    </View>
  );
};

export default Customers;