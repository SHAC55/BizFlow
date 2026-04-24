import type { ReactNode } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, Text, TextInput, View, ScrollView } from "react-native";

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
  <ScrollView
    className="flex-1 bg-white"
    contentContainerClassName="min-h-full"
    keyboardShouldPersistTaps="handled"
    showsVerticalScrollIndicator={false}
  >
    {/* �� HERO ZONE ��������������������������������������� */}
    <View className="px-6 pb-8 pt-14">
      {/* Eyebrow */}
      <View className="mb-5 self-start flex-row items-center gap-1.5">
        <View className="h-[6px] w-[6px] rounded-full bg-gray-800" />
        <Text className="text-[11px] font-semibold uppercase tracking-[2.5px] text-gray-400">
          New Account
        </Text>
      </View>

      {/* Headline */}
      <Text className="text-[42px] font-extrabold leading-[46px] tracking-tight text-gray-900">
        {"Let's get\nyou set up."}
      </Text>

      {/* Separator */}
      <View className="my-5 h-px w-10 bg-gray-300" />

      {/* Subtext */}
      <Text
        className="text-[15px] leading-[22px] text-gray-500"
        style={{ maxWidth: 270 }}
      >
        Create your account to streamline your business management.
      </Text>
    </View>

    {/* �� FORM BODY ��������������������������������������� */}
    <View className="px-4">
      {/* �� SECTION: Business �� */}
      <SectionLabel title="Business Info" />
      <View
        className="mb-4 overflow-hidden rounded-3xl border border-gray-100 bg-gray-50"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 12,
          elevation: 2,
        }}
      >
        <FieldRow
          label="Business Name"
          value={form.businessName}
          onChangeText={(value) =>
            onChangeForm((current) => ({ ...current, businessName: value }))
          }
          placeholder="Your business name"
          icon="business"
          isFirst
          isLast
        />
      </View>

      {/* �� SECTION: Personal �� */}
      <SectionLabel title="Your Details" />
      <View
        className="mb-4 overflow-hidden rounded-3xl border border-gray-100 bg-gray-50"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 12,
          elevation: 2,
        }}
      >
        <FieldRow
          label="Username"
          value={form.username}
          onChangeText={(value) =>
            onChangeForm((current) => ({ ...current, username: value }))
          }
          placeholder="Choose a username"
          icon="person"
          autoCapitalize="none"
          isFirst
        />
        <Divider />
        <FieldRow
          label="Mobile Number"
          value={form.mobileNumber}
          onChangeText={(value) =>
            onChangeForm((current) => ({ ...current, mobileNumber: value }))
          }
          placeholder="Your mobile number"
          icon="phone"
          keyboardType="phone-pad"
        />
        <Divider />
        <FieldRow
          label="Email"
          value={form.email}
          onChangeText={(value) =>
            onChangeForm((current) => ({ ...current, email: value }))
          }
          placeholder="Optional"
          icon="email"
          keyboardType="email-address"
          autoCapitalize="none"
          isLast
        />
      </View>

      {/* �� SECTION: Security �� */}
      <SectionLabel title="Security" />
      <View
        className="mb-6 overflow-hidden rounded-3xl border border-gray-100 bg-gray-50"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 12,
          elevation: 2,
        }}
      >
        <FieldRow
          label="Password"
          value={form.password}
          onChangeText={(value) =>
            onChangeForm((current) => ({ ...current, password: value }))
          }
          placeholder="Create a password"
          icon="lock"
          secureTextEntry={!showPassword}
          isFirst
          trailing={
            <Pressable onPress={onTogglePasswordVisibility} hitSlop={10}>
              <MaterialIcons
                name={showPassword ? "visibility" : "visibility-off"}
                size={18}
                color="#9ca3af"
              />
            </Pressable>
          }
        />
        <Divider />
        <FieldRow
          label="Confirm Password"
          value={form.confirmPassword}
          onChangeText={(value) =>
            onChangeForm((current) => ({ ...current, confirmPassword: value }))
          }
          placeholder="Re-enter your password"
          icon="lock"
          secureTextEntry={!showConfirmPassword}
          isLast
          trailing={
            <Pressable onPress={onToggleConfirmPasswordVisibility} hitSlop={10}>
              <MaterialIcons
                name={showConfirmPassword ? "visibility" : "visibility-off"}
                size={18}
                color="#9ca3af"
              />
            </Pressable>
          }
        />
      </View>

      {/* �� TERMS �� */}
      <Pressable
        onPress={onToggleTerms}
        className="mb-5 flex-row items-start gap-3"
        hitSlop={6}
      >
        <View
          className={`mt-0.5 h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border ${
            form.acceptedTerms
              ? "border-blue-600 bg-blue-600"
              : "border-gray-300 bg-white"
          }`}
        >
          {form.acceptedTerms ? (
            <MaterialIcons name="check" size={13} color="#ffffff" />
          ) : null}
        </View>
        <Text className="flex-1 text-[13px] leading-[19px] text-gray-600">
          I agree to the{" "}
          <Text className="font-bold text-blue-600">Terms and Conditions</Text>{" "}
          and confirm that all information provided is accurate.
        </Text>
      </Pressable>

      {/* �� CTA BUTTON �� */}
      <Pressable
        onPress={onSubmit}
        disabled={isBusy || isDisabled}
        className={`items-center justify-center rounded-2xl bg-blue-600 ${
          isBusy || isDisabled ? "opacity-50" : ""
        }`}
        style={[
          { minHeight: 56 },
          !(isBusy || isDisabled) && {
            shadowColor: "#2563eb",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.25,
            shadowRadius: 16,
            elevation: 6,
          },
        ]}
      >
        <View className="flex-row items-center gap-2">
          {isBusy ? (
            <Text className="text-[15px] font-bold tracking-wide text-white">
              Creating account.
            </Text>
          ) : (
            <>
              <Text className="text-[15px] font-bold tracking-wide text-white">
                Create Account
              </Text>
              <MaterialIcons name="arrow-forward" size={16} color="#ffffff" />
            </>
          )}
        </View>
      </Pressable>
    </View>
  </ScrollView>
);

// �� SUB-COMPONENTS �����������������������������������������

const SectionLabel = ({ title }: { title: string }) => (
  <Text className="mb-2 ml-1 text-[11px] font-bold uppercase tracking-[1.8px] text-gray-400">
    {title}
  </Text>
);

const Divider = () => <View className="ml-[52px] h-px bg-gray-200" />;

type FieldRowProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  icon: "business" | "person" | "phone" | "email" | "lock";
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  trailing?: ReactNode;
  isFirst?: boolean;
  isLast?: boolean;
};

const FieldRow = ({
  autoCapitalize = "sentences",
  icon,
  isFirst,
  isLast,
  keyboardType = "default",
  label,
  onChangeText,
  placeholder,
  secureTextEntry,
  trailing,
  value,
}: FieldRowProps) => (
  <View
    className={`flex-row items-center gap-3 bg-gray-50 px-4 ${
      isFirst ? "pt-1" : ""
    } ${isLast ? "pb-1" : ""}`}
    style={{ minHeight: 58 }}
  >
    {/* Icon column - fixed width so divider always starts at same x */}
    <View className="w-7 items-center">
      <MaterialIcons name={icon} size={18} color="#9ca3af" />
    </View>

    {/* Label + Input stacked */}
    <View className="flex-1 py-2.5">
      <Text className="mb-0.5 text-[10px] font-bold uppercase tracking-[1.5px] text-gray-400">
        {label}
      </Text>
      <TextInput
        autoCapitalize={autoCapitalize}
        className="text-[15px] text-gray-900"
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#d1d5db"
        secureTextEntry={secureTextEntry}
        value={value}
      />
    </View>

    {trailing ? <View>{trailing}</View> : null}
  </View>
);
