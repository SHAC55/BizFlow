import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

type CardProps = {
  title: string;
  subtitle?: string; // make optional if not always used
  value: string;
  tag: string;
  icon: IconName;
  dark?: boolean;
};

const Card = ({ title, subtitle, value, dark, icon, tag }: CardProps) => {
  return (
    <View
      className={`flex-1 p-4 rounded-2xl ${
        dark ? "bg-black" : "bg-white"
      } border border-gray-200`}
    >
      {/* Icon */}
      <View
        className={`w-8 h-8 rounded-lg items-center justify-center mb-3 ${
          dark ? "bg-gray-800" : "bg-gray-100"
        }`}
      >
        <Ionicons name={icon} size={16} color={dark ? "#fff" : "#000"} />
      </View>

      {/* Title */}
      <Text className={`text-xs ${dark ? "text-gray-400" : "text-gray-500"}`}>
        {title}
      </Text>

      {/* Subtitle (optional) */}
      {subtitle && (
        <Text className="text-[10px] text-gray-400">{subtitle}</Text>
      )}

      {/* Value */}
      <Text
        className={`text-lg font-bold mt-1 ${
          dark ? "text-white" : "text-black"
        }`}
      >
        {value}
      </Text>

      {/* Tag */}
      <View className="mt-2 self-start px-2 py-1 rounded-full bg-gray-100">
        <Text className="text-[10px] text-gray-600">{tag}</Text>
      </View>
    </View>
  );
};

const DashboardAnalytics = () => {
  return (
    <View className="px-4 mt-4">
      {/* Header */}
      <Text className="text-xl font-bold text-black">Dashboard</Text>
      <Text className="text-xs text-gray-500 mb-4">
        Wednesday, 15 April 2026
      </Text>

      {/* Grid */}
      <View className="flex-row gap-3 mb-3">
        <Card
          title="Today's sales"
          value="₹24,850"
          tag="+14% vs yesterday"
          icon="calendar-outline"
          dark
        />

        <Card
          title="Pending payments"
          value="₹6,200"
          tag="8 invoices due"
          icon="card-outline"
        />
      </View>

      <View className="flex-row gap-3">
        <Card
          title="Total customers"
          value="1,204"
          tag="+23 this month"
          icon="people-outline"
        />

        <Card
          title="Monthly revenue"
          value="₹3.84L"
          tag="Apr 2026"
          icon="trending-up-outline"
          dark
        />
      </View>
    </View>
  );
};

export default DashboardAnalytics;