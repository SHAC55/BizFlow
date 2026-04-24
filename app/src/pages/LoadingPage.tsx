import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Image, SafeAreaView, Text } from "react-native";
import { authAssets } from "../constants/auth";

export const LoadingPage = () => (
  <SafeAreaView className="flex-1 items-center justify-center gap-3 bg-indigo-50 px-6">
    <StatusBar style="dark" />
    <Image
      source={authAssets.logoImage}
      className="h-12 w-36"
      resizeMode="contain"
    />
    <ActivityIndicator size="large" color="#2563eb" />
    <Text className="text-[15px] font-semibold text-gray-700">
      Loading BizEazy session...
    </Text>
  </SafeAreaView>
);
