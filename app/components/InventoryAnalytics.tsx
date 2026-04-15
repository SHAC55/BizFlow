import {
  View,
  Text,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

// Enable animation
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const tintStyles = {
  blue: { icon: "#2563eb", iconBg: "#eff6ff", value: "#2563eb" },
  purple: { icon: "#7c3aed", iconBg: "#f5f3ff", value: "#7c3aed" },
  indigo: { icon: "#4f46e5", iconBg: "#eef2ff", value: "#4f46e5" },
  green: { icon: "#16a34a", iconBg: "#ecfdf5", value: "#16a34a" },
  amber: { icon: "#d97706", iconBg: "#fffbeb", value: "#d97706" },
  red: { icon: "#dc2626", iconBg: "#fef2f2", value: "#dc2626" },
};

type CardProps = {
  title: string;
  value: string;
  icon: IconName;
  tint: keyof typeof tintStyles;
  details: string;
};

const Card = ({ title, value, icon, tint, details }: CardProps) => {
  const [open, setOpen] = useState(false);
  const t = tintStyles[tint];

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((prev) => !prev);
  };

  return (
    <View className="flex-1 bg-white rounded-2xl p-4 border border-gray-100">
      {/* Top */}
      <View className="flex-row justify-between items-start">
        <View>
          <View
            className="w-9 h-9 rounded-full items-center justify-center mb-3"
            style={{ backgroundColor: t.iconBg }}
          >
            <Ionicons name={icon} size={18} color={t.icon} />
          </View>

          <Text className="text-[11px] text-gray-500">{title}</Text>

          <Text
            className="text-xl font-semibold mt-1"
            style={{ color: t.value }}
          >
            {value}
          </Text>
        </View>

        {/* Card dropdown */}
        <Pressable onPress={toggle}>
          <Ionicons
            name={open ? "chevron-up" : "chevron-down"}
            size={14}
            color="#9ca3af"
          />
        </Pressable>
      </View>

      {/* Details */}
      {open && (
        <View className="mt-3 border-t border-gray-100 pt-2">
          <Text className="text-[11px] text-gray-600">{details}</Text>
        </View>
      )}
    </View>
  );
};

const InventoryAnalytics = () => {
  const [sectionOpen, setSectionOpen] = useState(true);

  const toggleSection = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSectionOpen((prev) => !prev);
  };

  return (
    <View className="px-4 mt-4">
      {/* 🔥 Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text className="text-lg font-semibold text-black">Inventory</Text>
          <Text className="text-xs text-gray-500">Overview of your stock</Text>
        </View>

        <Pressable
          onPress={toggleSection}
          className="flex-row items-center px-3 py-1.5 rounded-full bg-gray-100"
        >
          <Ionicons
            name={sectionOpen ? "chevron-up" : "chevron-down"}
            size={14}
            color="#6b7280"
          />
        </Pressable>
      </View>

      {/* 🔽 Section Content */}
      {sectionOpen && (
        <View>
          <View className="flex-row gap-3 mb-3">
            <Card
              title="Products"
              value="248"
              icon="cube-outline"
              tint="blue"
              details="Total number of products available in inventory."
            />

            <Card
              title="Inventory Value"
              value="₹5.2L"
              icon="layers-outline"
              tint="purple"
              details="Total selling value of all inventory items."
            />
          </View>

          <View className="flex-row gap-3 mb-3">
            <Card
              title="Cost Value"
              value="₹3.1L"
              icon="wallet-outline"
              tint="indigo"
              details="Total investment in purchasing inventory."
            />

            <Card
              title="Projected P/L"
              value="₹2.1L"
              icon="trending-up-outline"
              tint="green"
              details="Expected profit based on current stock."
            />
          </View>

          <View className="flex-row gap-3">
            <Card
              title="Low Stock"
              value="18"
              icon="alert-circle-outline"
              tint="amber"
              details="Items with low quantity that need restocking."
            />

            <Card
              title="Out of Stock"
              value="6"
              icon="close-circle-outline"
              tint="red"
              details="Items currently unavailable for sale."
            />
          </View>
        </View>
      )}
    </View>
  );
};

export default InventoryAnalytics;
