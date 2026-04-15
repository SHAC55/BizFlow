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
  red: { icon: "#dc2626", iconBg: "#fef2f2", value: "#dc2626" },
  amber: { icon: "#d97706", iconBg: "#fffbeb", value: "#d97706" },
  green: { icon: "#16a34a", iconBg: "#ecfdf5", value: "#16a34a" },
  blue: { icon: "#2563eb", iconBg: "#eff6ff", value: "#2563eb" },
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
          <Text className="text-[11px] text-gray-600">
            {details}
          </Text>
        </View>
      )}
    </View>
  );
};

const PaymentAnalytics = () => {
  const [sectionOpen, setSectionOpen] = useState(true);

  const toggleSection = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSectionOpen((prev) => !prev);
  };

  return (
    <View className="px-4 mt-4">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text className="text-lg font-semibold text-black">
            Payments
          </Text>
          <Text className="text-xs text-gray-500">
            Track dues & reminders
          </Text>
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

      {/* Stats */}
      {sectionOpen && (
        <View>
          <View className="flex-row gap-3 mb-3">
            <Card
              title="Total Due"
              value="₹89,000"
              icon="time-outline"
              tint="red"
              details="Total pending amount yet to be collected from customers."
            />

            <Card
              title="Reminders Set"
              value="42"
              icon="notifications-outline"
              tint="amber"
              details="Total payment reminders  ready to send customers."
            />
          </View>

          {/* <View className="flex-row gap-3">
            <Card
              title="Collected Today"
              value="₹12,500"
              icon="cash-outline"
              tint="green"
              details="Payments successfully received today."
            />

            <Card
              title="Pending Follow-ups"
              value="15"
              icon="call-outline"
              tint="blue"
              details="Customers requiring manual follow-up."
            />
          </View> */}
        </View>
      )}
    </View>
  );
};

export default PaymentAnalytics;