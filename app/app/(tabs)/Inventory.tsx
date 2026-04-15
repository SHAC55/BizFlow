import { View } from "react-native";
import React from "react";
import InventoryAnalytics from "@/components/InventoryAnalytics";
import AllProducts from "@/components/AllProducts";

const Inventory = () => {
  return (
    <View className="flex-1 bg-white"> 
      <InventoryAnalytics />
      <AllProducts/>
    </View>
  );
};

export default Inventory;