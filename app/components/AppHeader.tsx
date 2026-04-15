import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const AppHeader = () => {
  const router = useRouter();

  return (
    <View style={{ backgroundColor: "#000" }}>
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-800">
        {/* Left - Branding */}
        <View>
          <Text className="text-xl font-bold">
            <Text className="text-white">Biz</Text>
            <Text className="text-gray-300">ezy</Text>
          </Text>
          <Text className="text-xs text-gray-400">Manage your business</Text>
        </View>

        {/* Right - Actions */}
        <View className="flex-row items-center gap-4">
          {/* Notification Icon */}
          <Pressable>
            <Ionicons name="notifications-outline" size={22} color="white" />
          </Pressable>

          {/* Profile Initials */}
          <Pressable onPress={() => router.push("/Profile")}>
            <View className="w-9 h-9 rounded-full bg-blue-600 items-center justify-center">
              <Text className="text-white font-semibold">AK</Text>
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default AppHeader;
