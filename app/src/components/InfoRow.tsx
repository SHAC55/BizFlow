import { Text, View } from "react-native";

type InfoRowProps = {
  label: string;
  value: string;
};

export const InfoRow = ({ label, value }: InfoRowProps) => (
  <View className="border-b border-gray-200 px-3.5 py-3">
    <Text className="mb-1 text-xs text-gray-500">{label}</Text>
    <Text className="text-[15px] font-semibold text-gray-900">{value}</Text>
  </View>
);
