import { StatusBar } from "expo-status-bar";
import { Image, Pressable, SafeAreaView, Text, View } from "react-native";
import { InfoRow } from "../components/InfoRow";
import { authAssets } from "../constants/auth";
import type { AuthSession } from "../types/auth";

type AuthenticatedPageProps = {
  session: AuthSession;
  onLogout: () => Promise<void>;
};

export const AuthenticatedPage = ({
  onLogout,
  session,
}: AuthenticatedPageProps) => (
  <SafeAreaView className="flex-1 justify-center bg-indigo-50 p-5">
    <StatusBar style="dark" />
    <View
      className="gap-4 rounded-3xl bg-white p-[22px] shadow"
      style={{
        shadowColor: "#0f172a",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 8,
      }}
    >
      <View className="flex-row items-center justify-between">
        <Image
          source={authAssets.logoImage}
          className="h-[34px] w-[110px]"
          resizeMode="contain"
        />
        <Text className="text-xs font-bold text-blue-600">Mobile Session</Text>
      </View>

      <Text className="text-[28px] font-extrabold leading-8 text-gray-900">
        {session.user.name || session.user.email || "Authenticated user"}
      </Text>
      <Text className="text-[15px] leading-[22px] text-gray-600">
        Ready to take control of your business? You are signed in.
      </Text>

      <View className="overflow-hidden rounded-2xl border border-gray-200">
        <InfoRow label="Provider" value={session.user.provider || "password"} />
        <InfoRow label="Mobile" value={session.user.mobile || "Not set"} />
        <InfoRow
          label="Business"
          value={session.user.business?.name || "Not set"}
        />
      </View>

      {session.needsOnboarding ? (
        <View className="rounded-[10px] border border-blue-200 bg-blue-50 p-3">
          <Text className="text-sm font-bold text-blue-700">
            Onboarding still needed
          </Text>
          <Text className="mt-1 text-[13px] leading-[18px] text-blue-800">
            This account is authenticated, but some profile fields are still missing.
          </Text>
        </View>
      ) : null}

      <Pressable
        onPress={onLogout}
        className="items-center rounded-[10px] bg-black py-[14px]"
      >
        <Text className="text-[15px] font-bold text-white">Log Out</Text>
      </Pressable>
    </View>
  </SafeAreaView>
);
