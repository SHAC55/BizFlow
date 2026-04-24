import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, Text, TextInput, View, ScrollView } from "react-native";

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
  <ScrollView
    className="flex-1 bg-white"
    contentContainerClassName="min-h-full"
    keyboardShouldPersistTaps="handled"
    showsVerticalScrollIndicator={false}
  >
    {/* �� HERO ZONE ��������������������������������������� */}
    <View className="px-6 pb-10 pt-16">
      {/* Eyebrow label */}
      <View className="mb-5 self-start flex-row items-center gap-1.5">
        <View className="h-[6px] w-[6px] rounded-full bg-gray-800" />
        <Text className="text-[11px] font-semibold uppercase tracking-[2.5px] text-gray-400">
          Business Dashboard
        </Text>
      </View>

      {/* Primary headline - giant, heavy, tight */}
      <Text
        className="text-[44px] font-extrabold leading-[48px] tracking-tight text-gray-900"
        numberOfLines={2}
      >
        {"Welcome\nBack."}
      </Text>

      {/* Separator rule */}
      <View className="my-5 h-px w-10 bg-gray-300" />

      {/* Subtext */}
      <Text
        className="text-[15px] leading-[22px] text-gray-500"
        style={{ maxWidth: 260 }}
      >
        Sign in to take control of your operations.
      </Text>
    </View>

    {/* �� FORM CARD ��������������������������������������� */}
    <View
      className="mx-4 rounded-3xl border border-gray-100 bg-gray-50 px-5 py-6"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
        elevation: 3,
      }}
    >
      {/* �� USERNAME FIELD �� */}
      <View className="mb-4">
        <Text className="mb-2 text-[11px] font-bold uppercase tracking-[1.8px] text-gray-400">
          Username
        </Text>
        <View
          className="flex-row items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4"
          style={{ minHeight: 54 }}
        >
          <MaterialIcons name="person" size={18} color="#9ca3af" />
          <TextInput
            className="flex-1 py-3 text-[15px] text-gray-900"
            onChangeText={(value) =>
              onChangeForm((current) => ({ ...current, username: value }))
            }
            placeholder="Enter your username"
            placeholderTextColor="#d1d5db"
            value={form.username}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      {/* �� PASSWORD FIELD �� */}
      <View className="mb-5">
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-[11px] font-bold uppercase tracking-[1.8px] text-gray-400">
            Password
          </Text>
          <Pressable hitSlop={10}>
            <Text className="text-[12px] font-semibold text-gray-500">
              Forgot?
            </Text>
          </Pressable>
        </View>
        <View
          className="flex-row items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4"
          style={{ minHeight: 54 }}
        >
          <MaterialIcons name="lock" size={18} color="#9ca3af" />
          <TextInput
            className="flex-1 py-3 text-[15px] text-gray-900"
            onChangeText={(value) =>
              onChangeForm((current) => ({ ...current, password: value }))
            }
            placeholder="Enter your password"
            placeholderTextColor="#d1d5db"
            secureTextEntry={!showPassword}
            value={form.password}
          />
          <Pressable
            onPress={onTogglePasswordVisibility}
            hitSlop={10}
            className="py-1 pl-1"
          >
            <MaterialIcons
              name={showPassword ? "visibility" : "visibility-off"}
              size={18}
              color="#9ca3af"
            />
          </Pressable>
        </View>
      </View>

      {/* �� REMEMBER ME �� */}
      <Pressable
        onPress={onToggleRememberMe}
        className="mb-6 flex-row items-center gap-3"
        hitSlop={6}
      >
        <View
          className={`h-5 w-5 items-center justify-center rounded-md border ${
            rememberMe
              ? "border-blue-600 bg-blue-600"
              : "border-gray-300 bg-white"
          }`}
        >
          {rememberMe ? (
            <MaterialIcons name="check" size={13} color="#ffffff" />
          ) : null}
        </View>
        <Text className="text-[13px] text-gray-600">Keep me signed in</Text>
      </Pressable>

      {/* �� CTA BUTTON �� */}
      <Pressable
        onPress={onSubmit}
        disabled={isBusy || isDisabled}
        className={`items-center justify-center rounded-2xl bg-gray-900 ${
          isBusy || isDisabled ? "opacity-50" : ""
        }`}
        style={[
          { minHeight: 56 },
          !(isBusy || isDisabled) && {
            shadowColor: "#000000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.18,
            shadowRadius: 16,
            elevation: 6,
          },
        ]}
      >
        <View className="flex-row items-center gap-2">
          {isBusy ? (
            <Text className="text-[15px] font-bold tracking-wide text-white">
              Signing in.
            </Text>
          ) : (
            <>
              <Text className="text-[15px] font-bold tracking-wide text-white">
                Sign In
              </Text>
              <MaterialIcons name="arrow-forward" size={16} color="#ffffff" />
            </>
          )}
        </View>
      </Pressable>
    </View>

    {/* �� FOOTER ������������������������������������������ */}
    <View className="flex-row items-center justify-center gap-1 pb-10 pt-8">
      <Text className="text-[13px] text-gray-400">Don't have an account?</Text>
      <Text className="text-[13px] font-bold text-gray-800">Contact Admin</Text>
    </View>
  </ScrollView>
);
