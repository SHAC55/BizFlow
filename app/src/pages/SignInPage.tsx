import { MaterialIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

export type LoginForm = {
  username: string;
  password: string;
};

type SignInPageProps = {
  form: LoginForm;
  isBusy: boolean;
  isDisabled: boolean;
  rememberMe: boolean;
  showPassword: boolean;
  onChangeForm: (updater: (current: LoginForm) => LoginForm) => void;
  onSubmit: () => void;
  onToggleRememberMe: () => void;
  onTogglePasswordVisibility: () => void;
};

export const SignInPage = ({
  form,
  isBusy,
  isDisabled,
  rememberMe,
  showPassword,
  onChangeForm,
  onSubmit,
  onToggleRememberMe,
  onTogglePasswordVisibility,
}: SignInPageProps) => (
  <View>
    <View className="mb-5">
      <Text className="text-[28px] font-bold text-[#1f2937]">Welcome Back!</Text>
      <Text className="mt-2 text-[14px] leading-[20px] text-[#6b7280]">
        Ready to take control of your business? Sign in to continue.
      </Text>
    </View>

    <Field
      icon="person"
      label="Username"
      placeholder="Enter your username"
      value={form.username}
      onChangeText={(value) =>
        onChangeForm((current) => ({ ...current, username: value }))
      }
    />

    <Field
      icon="lock"
      label="Password"
      placeholder="Enter your password"
      secureTextEntry={!showPassword}
      trailing={
        <Pressable onPress={onTogglePasswordVisibility} hitSlop={10}>
          <MaterialIcons
            name={showPassword ? "visibility" : "visibility-off"}
            size={20}
            color="#9ca3af"
          />
        </Pressable>
      }
      value={form.password}
      onChangeText={(value) =>
        onChangeForm((current) => ({ ...current, password: value }))
      }
    />

    <Pressable
      onPress={onToggleRememberMe}
      className="mb-6 mt-1 flex-row items-center gap-3"
    >
      <View
        className={`h-5 w-5 items-center justify-center rounded-md border ${
          rememberMe ? "border-black bg-black" : "border-black/15 bg-white"
        }`}
      >
        {rememberMe ? (
          <MaterialIcons name="check" size={13} color="#ffffff" />
        ) : null}
      </View>
      <Text className="text-[13px] text-[#374151]">Remember me</Text>
    </Pressable>

    <Pressable
      onPress={onSubmit}
      disabled={isBusy || isDisabled}
      className={`items-center justify-center rounded-[16px] bg-black py-4 ${
        isBusy || isDisabled ? "opacity-50" : ""
      }`}
      style={
        isBusy || isDisabled
          ? undefined
          : {
              shadowColor: "#000000",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.18,
              shadowRadius: 20,
              elevation: 8,
            }
      }
    >
      <Text className="text-[15px] font-bold text-white">
        {isBusy ? "Signing in..." : "Sign In"}
      </Text>
    </Pressable>
  </View>
);

const Field = ({
  icon,
  label,
  onChangeText,
  placeholder,
  secureTextEntry,
  trailing,
  value,
}: {
  icon: ComponentProps<typeof MaterialIcons>["name"];
  label: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  trailing?: React.ReactNode;
  value: string;
}) => (
  <View className="mb-4">
    <Text className="mb-2 text-[13px] font-medium text-[#374151]">{label}</Text>
    <View className="flex-row items-center gap-3 rounded-[16px] border border-[#d1d5db] bg-white px-4 py-1">
      <MaterialIcons name={icon} size={20} color="#9ca3af" />
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        className="flex-1 py-4 text-[15px] text-[#0f172a]"
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        secureTextEntry={secureTextEntry}
        value={value}
      />
      {trailing ? trailing : null}
    </View>
  </View>
);
