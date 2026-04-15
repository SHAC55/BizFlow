import { View } from "react-native";
import React from "react";
import PaymentAnalytics from "@/components/PaymentAnalytics";
import AllDuePayments from "@/components/AllDuePayments";

const Payment = () => {
  return (
    <View className="flex-1 bg-white">
      
      {/* Top analytics */}
      <View>
        <PaymentAnalytics />
      </View>

      {/*  List must take remaining space */}
      <View className="flex-1">
        <AllDuePayments />
      </View>

    </View>
  );
};

export default Payment;