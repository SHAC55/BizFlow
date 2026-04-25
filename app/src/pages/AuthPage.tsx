import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import {
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { authAssets } from "../constants/auth";
import { useAuthPageState } from "../hooks/useAuthPageState";
import { SignInPage } from "./SignInPage";
import { SignUpPage } from "./SignUpPage";
import { SafeAreaView } from "react-native-safe-area-context";

export const AuthPage = () => {
  const {
    error,
    isApiConfigured,
    isBusy,
    isLogin,
    loginForm,
    registerForm,
    rememberMe,
    setLoginForm,
    setRegisterForm,
    showLoginPassword,
    showRegisterConfirmPassword,
    showRegisterPassword,
    submitGoogle,
    submitLogin,
    submitRegister,
    switchMode,
    toggleFooterMode,
    toggleRememberMe,
    toggleRegisterTerms,
    toggleShowLoginPassword,
    toggleShowRegisterConfirmPassword,
    toggleShowRegisterPassword,
  } = useAuthPageState();

  const heroImage = isLogin ? authAssets.loginImage : authAssets.signupImage;

  return (
    <SafeAreaView className="flex-1 bg-[#e5e7eb]">
      <StatusBar style="dark" />
      <View className="absolute inset-0 bg-[#f3f4f6]" />
      <View className="absolute left-[-60px] top-[-10px] h-[220px] w-[220px] rounded-full bg-[#dbeafe]" />
      <View className="absolute right-[-90px] bottom-[160px] h-[240px] w-[240px] rounded-full bg-[#e5e7eb]" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          automaticallyAdjustKeyboardInsets
          contentContainerClassName="px-4 pb-10 pt-5"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View
            className="overflow-hidden rounded-[28px] bg-white"
            style={{
              shadowColor: "#111827",
              shadowOffset: { width: 0, height: 20 },
              shadowOpacity: 0.16,
              shadowRadius: 32,
              elevation: 12,
            }}
          >
            <View className="h-[230px]">
              <ImageBackground
                source={heroImage}
                resizeMode="cover"
                className="flex-1 justify-between"
              >
                <View className="absolute inset-0 bg-black/25" />

                <View className="flex-row items-center justify-between px-5 pt-5">
                  <View className="rounded-[16px] bg-white/95 px-3 py-2">
                    <Image
                      source={authAssets.logoImage}
                      style={{ height: 22, width: 92 }}
                      resizeMode="contain"
                    />
                  </View>

                  <View className="rounded-full bg-white/20 px-3 py-1.5">
                    <Text className="text-[11px] font-semibold uppercase tracking-[1.6px] text-white">
                      BizFlow
                    </Text>
                  </View>
                </View>

                <View className="px-5 pb-5">
                  <Text className="text-[31px] font-extrabold leading-[36px] text-white">
                    {isLogin ? "Welcome Back!" : "Create Account"}
                  </Text>
                  <Text className="mt-2 text-[14px] leading-[20px] text-white/85">
                    {isLogin
                      ? "Ready to take control of your business? Sign in to continue."
                      : "Join us to streamline your business management."}
                  </Text>
                </View>
              </ImageBackground>
            </View>

            <View className="px-5 pb-5 pt-5">
              <View className="mb-5 flex-row rounded-[18px] bg-[#f3f4f6] p-1.5">
                <TabButton
                  isActive={isLogin}
                  label="Sign In"
                  onPress={() => switchMode("login")}
                />
                <TabButton
                  isActive={!isLogin}
                  label="Create Account"
                  onPress={() => switchMode("register")}
                />
              </View>

              {error ? <Banner kind="error" message={error} /> : null}

              {!isApiConfigured ? (
                <Banner
                  kind="info"
                  message="Add EXPO_PUBLIC_API_URL in app/.env before testing auth."
                />
              ) : null}

              {isLogin ? (
                <SignInPage
                  form={loginForm}
                  isBusy={isBusy}
                  isDisabled={!isApiConfigured}
                  rememberMe={rememberMe}
                  showPassword={showLoginPassword}
                  onChangeForm={setLoginForm}
                  onSubmit={submitLogin}
                  onToggleRememberMe={toggleRememberMe}
                  onTogglePasswordVisibility={toggleShowLoginPassword}
                />
              ) : (
                <SignUpPage
                  form={registerForm}
                  isBusy={isBusy}
                  isDisabled={!isApiConfigured}
                  showConfirmPassword={showRegisterConfirmPassword}
                  showPassword={showRegisterPassword}
                  onChangeForm={setRegisterForm}
                  onSubmit={submitRegister}
                  onToggleConfirmPasswordVisibility={
                    toggleShowRegisterConfirmPassword
                  }
                  onTogglePasswordVisibility={toggleShowRegisterPassword}
                  onToggleTerms={toggleRegisterTerms}
                />
              )}

              <View className="pt-4">
                <View className="flex-row items-center gap-3">
                  <View className="h-px flex-1 bg-black/10" />
                  <Text className="text-[11px] font-semibold uppercase tracking-[1.6px] text-black/35">
                    Or continue with
                  </Text>
                  <View className="h-px flex-1 bg-black/10" />
                </View>

                <Pressable
                  onPress={submitGoogle}
                  disabled={isBusy || !isApiConfigured}
                  className={`mt-4 flex-row items-center justify-center gap-3 rounded-[16px] border border-[#d1d5db] bg-white py-[15px] ${
                    isBusy || !isApiConfigured ? "opacity-50" : ""
                  }`}
                >
                  <AntDesign name="google" size={18} color="#4285F4" />
                  <Text className="text-[14px] font-semibold text-[#374151]">
                    {isLogin ? "Sign in with Google" : "Sign up with Google"}
                  </Text>
                </Pressable>

                <View className="mt-6 flex-row items-center justify-center gap-1">
                  <Text className="text-[13px] text-[#4b5563]">
                    {isLogin ? "Need an account?" : "Already registered?"}
                  </Text>
                  <Pressable onPress={toggleFooterMode}>
                    <Text className="text-[13px] font-bold text-black">
                      {isLogin ? "Create one" : "Sign in"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const Banner = ({
  kind,
  message,
}: {
  kind: "error" | "info";
  message: string;
}) => (
  <View
    className={`mb-4 flex-row items-start gap-3 rounded-[20px] px-4 py-3 ${
      kind === "error"
        ? "border border-red-200 bg-red-50"
        : "border border-blue-200 bg-blue-50"
    }`}
  >
    <MaterialIcons
      name={kind === "error" ? "error-outline" : "info-outline"}
      size={18}
      color={kind === "error" ? "#dc2626" : "#2563eb"}
    />
    <Text
      className={`flex-1 text-[13px] leading-[18px] ${
        kind === "error" ? "text-red-600" : "text-blue-700"
      }`}
    >
      {message}
    </Text>
  </View>
);

const TabButton = ({
  isActive,
  label,
  onPress,
}: {
  isActive: boolean;
  label: string;
  onPress: () => void;
}) => (
  <Pressable
    onPress={onPress}
    className={`flex-1 rounded-[14px] px-3 py-3 ${isActive ? "bg-white" : ""}`}
  >
    <Text
      className={`text-center text-[13px] font-semibold ${
        isActive ? "text-[#111827]" : "text-black/45"
      }`}
    >
      {label}
    </Text>
  </Pressable>
);
