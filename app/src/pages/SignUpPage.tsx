import { MaterialIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

export type RegisterForm = {
  businessName: string;
  username: string;
  mobileNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
};

type SignUpPageProps = {
  form: RegisterForm;
  isBusy: boolean;
  isDisabled: boolean;
  showConfirmPassword: boolean;
  showPassword: boolean;
  onChangeForm: (updater: (current: RegisterForm) => RegisterForm) => void;
  onSubmit: () => void;
  onToggleConfirmPasswordVisibility: () => void;
  onTogglePasswordVisibility: () => void;
  onToggleTerms: () => void;
};

export const SignUpPage = ({
  form,
  isBusy,
  isDisabled,
  showConfirmPassword,
  showPassword,
  onChangeForm,
  onSubmit,
  onToggleConfirmPasswordVisibility,
  onTogglePasswordVisibility,
  onToggleTerms,
}: SignUpPageProps) => (
  <View>
    <View className="mb-5">
      <Text className="text-[28px] font-bold text-[#1f2937]">Create Account</Text>
      <Text className="mt-2 text-[14px] leading-[20px] text-[#6b7280]">
        Join us to streamline your business management.
      </Text>
    </View>

    <Field
      icon="business"
      label="Business Name"
      placeholder="Enter your business name"
      value={form.businessName}
      onChangeText={(value) =>
        onChangeForm((current) => ({ ...current, businessName: value }))
      }
    />

    <Field
      icon="person"
      label="Username"
      placeholder="Choose a username"
      value={form.username}
      onChangeText={(value) =>
        onChangeForm((current) => ({ ...current, username: value }))
      }
    />
    <Field
      icon="phone"
      label="Mobile Number"
      placeholder="Enter your mobile number"
      keyboardType="phone-pad"
      value={form.mobileNumber}
      onChangeText={(value) =>
        onChangeForm((current) => ({ ...current, mobileNumber: value }))
      }
    />
    <Field
      icon="mail"
      label="Email"
      placeholder="Enter your email (optional)"
      keyboardType="email-address"
      value={form.email}
      onChangeText={(value) =>
        onChangeForm((current) => ({ ...current, email: value }))
      }
    />

    <Field
      icon="lock"
      label="Password"
      placeholder="Create a password"
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
    <Field
      icon="lock"
      label="Confirm Password"
      placeholder="Confirm your password"
      secureTextEntry={!showConfirmPassword}
      trailing={
        <Pressable onPress={onToggleConfirmPasswordVisibility} hitSlop={10}>
          <MaterialIcons
            name={
              showConfirmPassword ? "visibility" : "visibility-off"
            }
            size={20}
            color="#9ca3af"
          />
        </Pressable>
      }
      value={form.confirmPassword}
      onChangeText={(value) =>
        onChangeForm((current) => ({ ...current, confirmPassword: value }))
      }
    />

    <Pressable
      onPress={onToggleTerms}
      className="mb-6 mt-1 flex-row items-start gap-3"
    >
      <View
        className={`mt-0.5 h-5 w-5 items-center justify-center rounded-md border ${
          form.acceptedTerms ? "border-black bg-black" : "border-black/15 bg-white"
        }`}
      >
        {form.acceptedTerms ? (
          <MaterialIcons name="check" size={13} color="#ffffff" />
        ) : null}
      </View>
      <Text className="flex-1 text-[13px] leading-[19px] text-[#374151]">
        I agree to the <Text className="font-bold text-black">terms</Text> and confirm
        that my business information is accurate.
      </Text>
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
        {isBusy ? "Creating account..." : "Create Account"}
      </Text>
    </Pressable>
  </View>
);

const Field = ({
  icon,
  keyboardType = "default",
  label,
  onChangeText,
  placeholder,
  secureTextEntry,
  trailing,
  value,
}: {
  icon: ComponentProps<typeof MaterialIcons>["name"];
  keyboardType?: "default" | "email-address" | "phone-pad";
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
        className="flex-1 py-4 text-[15px] text-[#0f172a]"
        keyboardType={keyboardType}
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
