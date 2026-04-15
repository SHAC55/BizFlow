import { View, Text } from "react-native";
import React from "react";
import DashboardAnalytics from "@/components/DashboardAnalytics";
import DashboardQuickButtons from "@/components/DashboardQuickButtons";

const index = () => {
  return (
    <View>
      <DashboardAnalytics/>
      <DashboardQuickButtons/>
    </View>
  );
};

export default index;
