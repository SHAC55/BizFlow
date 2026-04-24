import { AntDesign } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import {
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import { authAssets } from "../constants/auth";
import { useAuthPageState } from "../hooks/useAuthPageState";
import { SignInPage } from "./SignInPage";
import { SignUpPage } from "./SignUpPage";

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

  const activeImage = isLogin ? authAssets.loginImage : authAssets.signupImage;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* �� HERO IMAGE - full bleed, top of screen �� */}
          <View style={{ height: 240 }}>
            <ImageBackground
              source={activeImage}
              resizeMode="cover"
              style={{ flex: 1 }}
            >
              {/* RN-safe bottom scrim */}
              <View
                pointerEvents="none"
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 80,
                }}
              >
                <View
                  style={{ flex: 1, backgroundColor: "#ffffff", opacity: 0.6 }}
                />
              </View>
            </ImageBackground>

            {/* Frosted logo pill - floats over image */}
            <View
              style={{
                position: "absolute",
                top: 16,
                left: 16,
                backgroundColor: "rgba(255,255,255,0.88)",
                borderRadius: 14,
                paddingHorizontal: 12,
                paddingVertical: 8,
              }}
            >
              <Image
                source={authAssets.logoImage}
                style={{ height: 28, width: 110 }}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* �� CARD - sits below image, overlaps slightly �� */}
          <View
            className="mx-4 -mt-5 overflow-hidden rounded-3xl bg-white"
            style={{
              shadowColor: "#0f172a",
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.12,
              shadowRadius: 28,
              elevation: 10,
            }}
          >
            {/* �� TAB SWITCHER �� */}
            <View className="border-b border-gray-100 px-5 pt-4">
              <View className="flex-row">
                <TabButton
                  label="Sign In"
                  isActive={isLogin}
                  onPress={() => switchMode("login")}
                />
                <TabButton
                  label="Sign Up"
                  isActive={!isLogin}
                  onPress={() => switchMode("register")}
                />
              </View>
            </View>

            {/* �� ALERTS �� */}
            {error ? (
              <View className="mx-5 mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                <Text className="text-[13px] leading-[18px] text-red-600">
                  {error}
                </Text>
              </View>
            ) : null}

            {!isApiConfigured ? (
              <View className="mx-5 mt-4 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3">
                <Text className="text-[13px] font-bold text-blue-700">
                  API URL required
                </Text>
                <Text className="mt-1 text-[12px] leading-[17px] text-blue-700">
                  Add `EXPO_PUBLIC_API_URL` in `app/.env` before testing auth.
                </Text>
              </View>
            ) : null}

            {/* �� FORM CONTENT �� */}
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

            {/* �� DIVIDER �� */}
            <View className="flex-row items-center gap-3 px-5 pt-5">
              <View className="h-px flex-1 bg-gray-200" />
              <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-gray-400">
                {isLogin ? "Or continue with" : "Or sign up with"}
              </Text>
              <View className="h-px flex-1 bg-gray-200" />
            </View>

            {/* �� GOOGLE BUTTON �� */}
            <View className="px-5 pt-3">
              <Pressable
                onPress={submitGoogle}
                disabled={isBusy || !isApiConfigured}
                className={`flex-row items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white py-[14px] ${
                  isBusy || !isApiConfigured ? "opacity-50" : ""
                }`}
                style={
                  isBusy || !isApiConfigured
                    ? undefined
                    : {
                        shadowColor: "#111827",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.06,
                        shadowRadius: 8,
                        elevation: 2,
                      }
                }
              >
                <AntDesign name="google" size={18} color="#4285F4" />
                <Text className="text-[14px] font-semibold text-gray-700">
                  {isLogin ? "Sign in with Google" : "Sign up with Google"}
                </Text>
              </Pressable>

              {/* Dev note - de-emphasised */}
              <Text className="mt-2 text-center text-[11px] leading-[16px] text-gray-400">
                Google auth requires a development build, not Expo Go.
              </Text>
            </View>

            {/* �� FOOTER SWITCH �� */}
            <View className="flex-row items-center justify-center gap-1 px-5 pb-6 pt-5">
              <Text className="text-[13px] text-gray-400">
                {isLogin
                  ? "Don't have an account?"
                  : "Already have an account?"}
              </Text>
              <Pressable onPress={toggleFooterMode} hitSlop={8}>
                <Text className="text-[13px] font-bold text-blue-600">
                  {isLogin ? "Create Account" : "Sign In"}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Bottom breathing room */}
          <View className="h-8" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// �� TAB BUTTON ��������������������������������������������

type TabButtonProps = {
  label: string;
  isActive: boolean;
  onPress: () => void;
};

const TabButton = ({ label, isActive, onPress }: TabButtonProps) => (
  <Pressable onPress={onPress} className="flex-1 items-center pb-3" hitSlop={4}>
    <Text
      className={`text-[14px] font-bold ${
        isActive ? "text-gray-900" : "text-gray-400"
      }`}
    >
      {label}
    </Text>
    {/* Active indicator - underline tab style */}
    <View
      className={`mt-2.5 h-[2px] w-6 rounded-full ${
        isActive ? "bg-gray-900" : "bg-transparent"
      }`}
    />
  </Pressable>
);
