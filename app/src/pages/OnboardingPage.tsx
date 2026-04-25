import { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { authAssets } from "../constants/auth";
import { useAuth } from "../providers/AuthProvider";
import type { AuthSession } from "../types/auth";

type OnboardingPageProps = {
  session: AuthSession;
  onLogout: () => Promise<void>;
};

type OnboardingForm = {
  businessName: string;
  phone: string;
  username: string;
};

const getInitialForm = (session: AuthSession): OnboardingForm => ({
  businessName: session.user.business?.name ?? "",
  phone: session.user.mobile ?? "",
  username: session.user.name ?? "",
});

export const OnboardingPage = ({
  onLogout,
  session,
}: OnboardingPageProps) => {
  const { completeOnboarding, isBusy } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<OnboardingForm>(() => getInitialForm(session));

  const handleSubmit = async () => {
    const username = form.username.trim();
    const phone = form.phone.trim();
    const businessName = form.businessName.trim();

    if (!username || !phone || !businessName) {
      setError("All fields are required");
      return;
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError("Username can only use letters, numbers, and underscores");
      return;
    }

    if (phone.length < 7) {
      setError("Please enter a valid mobile number");
      return;
    }

    if (businessName.length < 2) {
      setError("Business name must be at least 2 characters");
      return;
    }

    try {
      setError(null);
      await completeOnboarding({ businessName, phone, username });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Onboarding failed",
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#eef2ff]">
      <StatusBar style="dark" />
      <View className="absolute inset-0 bg-[#eff6ff]" />
      <View className="absolute left-[-40px] top-[20px] h-[220px] w-[220px] rounded-full bg-[#dbeafe]" />
      <View className="absolute right-[-70px] bottom-[120px] h-[210px] w-[210px] rounded-full bg-[#c7d2fe]" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          automaticallyAdjustKeyboardInsets
          contentContainerClassName="flex-grow py-4"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View
            className="mx-4 overflow-hidden rounded-[28px] bg-white"
            style={{
              shadowColor: "#111827",
              shadowOffset: { width: 0, height: 18 },
              shadowOpacity: 0.14,
              shadowRadius: 28,
              elevation: 10,
            }}
          >
            <View className="bg-[#2563eb] px-5 pb-6 pt-5">
              <View className="flex-row items-start justify-between">
                <View className="rounded-[16px] bg-white px-3 py-2">
                  <Image
                    source={authAssets.logoImage}
                    style={{ height: 24, width: 96 }}
                    resizeMode="contain"
                  />
                </View>

                <Pressable
                  onPress={onLogout}
                  className="rounded-full bg-white/15 px-3 py-1.5"
                >
                  <Text className="text-[11px] font-semibold uppercase tracking-[1.6px] text-white">
                    Log out
                  </Text>
                </Pressable>
              </View>

              <View className="mt-6">
                <Text className="text-[32px] font-extrabold tracking-tight text-white">
                  Almost There!
                </Text>
                <Text className="mt-3 text-[14px] leading-[21px] text-white/85">
                  Hi{" "}
                  <Text className="font-bold text-white">
                    {session.user.email || "there"}
                  </Text>
                  ! Just a few more details to set up your account.
                </Text>
              </View>
            </View>

            <View className="px-5 pb-5 pt-5">
              {error ? (
                <View className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                  <Text className="text-[13px] leading-[18px] text-red-600">
                    {error}
                  </Text>
                </View>
              ) : null}

              <View className="mb-5">
                <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-[#2563eb]">
                  <MaterialIcons name="business" size={30} color="#ffffff" />
                </View>
                <Text className="text-[28px] font-bold text-[#1f2937]">
                  Complete your profile
                </Text>
                <Text className="mt-2 text-[14px] leading-[20px] text-[#6b7280]">
                  These details are required before entering the live business workspace.
                </Text>
              </View>

              <FieldCard
                label="Username"
                icon="person"
                placeholder="Choose a username"
                value={form.username}
                autoCapitalize="none"
                onChangeText={(username) =>
                  setForm((current) => ({ ...current, username }))
                }
              />
              <FieldCard
                label="Mobile Number"
                icon="phone"
                placeholder="Enter your mobile number"
                value={form.phone}
                keyboardType="phone-pad"
                onChangeText={(phone) =>
                  setForm((current) => ({ ...current, phone }))
                }
              />
              <FieldCard
                label="Business Name"
                icon="business"
                placeholder="Enter your business name"
                value={form.businessName}
                onChangeText={(businessName) =>
                  setForm((current) => ({ ...current, businessName }))
                }
              />

              <Pressable
                onPress={handleSubmit}
                disabled={isBusy}
                className={`mt-2 items-center justify-center rounded-[16px] bg-[#2563eb] py-4 ${
                  isBusy ? "opacity-60" : ""
                }`}
                style={
                  isBusy
                    ? undefined
                    : {
                        shadowColor: "#2563eb",
                        shadowOffset: { width: 0, height: 12 },
                        shadowOpacity: 0.24,
                        shadowRadius: 22,
                        elevation: 8,
                      }
                }
              >
                <View className="flex-row items-center gap-2">
                  <Text className="text-[15px] font-bold text-white">
                    {isBusy ? "Setting up..." : "Complete Setup"}
                  </Text>
                  {!isBusy ? (
                    <MaterialIcons
                      name="arrow-forward"
                      size={16}
                      color="#ffffff"
                    />
                  ) : null}
                </View>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

type FieldCardProps = {
  label: string;
  icon: "business" | "person" | "phone";
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "phone-pad";
};

const FieldCard = ({
  autoCapitalize = "sentences",
  icon,
  keyboardType = "default",
  label,
  onChangeText,
  placeholder,
  value,
}: FieldCardProps) => (
  <View className="mb-4">
    <Text className="mb-2 text-[13px] font-medium text-[#374151]">{label}</Text>
    <View className="flex-row items-center gap-3 rounded-[16px] border border-[#d1d5db] bg-white px-4 py-1">
      <MaterialIcons name={icon} size={20} color="#9ca3af" />
      <TextInput
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        className="flex-1 py-4 text-[15px] text-[#0f172a]"
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        value={value}
      />
    </View>
  </View>
);
