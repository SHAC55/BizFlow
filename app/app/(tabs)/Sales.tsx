import { View } from "react-native";
import React from "react";
import SalesAnalytics from "@/components/SalesAnalytics";
import SalesTransactions from "@/components/SalesTransactions";

const Sales = () => {
  return (
    <View className="flex-1 bg-white">
      {" "}
      {/* Top analytics */}
      <View>
        <SalesAnalytics />
      </View>
      {/*  List MUST be inside flex container */}
      <View className="flex-1">
        <SalesTransactions />
      </View>
    </View>
  );
};

export default Sales;
