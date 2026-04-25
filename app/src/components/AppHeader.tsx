import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

type AppHeaderProps = {
  title: string;
  subtitle: string;
  userName?: string;
  onProfilePress?: () => void;
};

export const AppHeader = ({
  title,
  subtitle,
  userName,
  onProfilePress,
}: AppHeaderProps) => {
  return (
    <View className="mb-5 flex-row items-center justify-between">
      <View className="flex-1 pr-4">
        <Text className="text-[28px] font-bold tracking-tight text-zinc-900">
          {title}
        </Text>

        <Text className="mt-1 text-[13px] leading-5 text-zinc-500">
          {subtitle}
        </Text>
      </View>

      <Pressable
        onPress={onProfilePress}
        className="h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900"
      >
        <Text className="text-sm font-semibold text-white">
          {userName?.charAt(0)?.toUpperCase() || "U"}
        </Text>
      </Pressable>
    </View>
  );
};