import { View, Text, Pressable } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

type ActionButtonProps = {
  title: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  onPress?: () => void;
};

const ActionButton = ({ title, icon, onPress }: ActionButtonProps) => {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 bg-white border border-gray-200 rounded-2xl p-3 items-center justify-center"
    >
      <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mb-2">
        <Ionicons name={icon} size={18} color="#000" />
      </View>
      <Text className="text-xs text-gray-700 text-center">{title}</Text>
    </Pressable>
  );
};

const DashboardQuickButtons = () => {
  return (
    <View className="px-4 mt-4">
      <Text className="text-lg font-semibold mb-3 text-black">
        Quick Actions
      </Text>

      <View className="flex-row gap-3">
        <ActionButton
          title="Add Inventory"
          icon="cube-outline"
          onPress={() => router.push('/AddInventory')}
        />

        <ActionButton
          title="Add Sales"
          icon="cart-outline"
          onPress={() => router.push('/AddTransaction')}
        />

        <ActionButton
          title="Add Customer"
          icon="person-add-outline"
          onPress={() => router.push('/AddCustomer')}
        />
      </View>
    </View>
  );
};

export default DashboardQuickButtons;