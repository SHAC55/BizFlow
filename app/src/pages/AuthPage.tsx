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
import { authStyles as styles } from "../styles/authStyles";
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
    screenBackground,
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
  const activeImage = isLogin
    ? authAssets.loginImage
    : authAssets.signupImage;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: screenBackground }]}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.shell}>
            <Image
              source={authAssets.logoImage}
              style={styles.logo}
              resizeMode="contain"
            />

            <View style={styles.modeRow}>
              <Pressable
                onPress={() => switchMode("login")}
                style={[styles.modeButton, isLogin && styles.modeButtonActive]}
              >
                <Text
                  style={[styles.modeButtonText, isLogin && styles.modeButtonTextActive]}
                >
                  Sign In
                </Text>
              </Pressable>
              <Pressable
                onPress={() => switchMode("register")}
                style={[styles.modeButton, !isLogin && styles.modeButtonActive]}
              >
                <Text
                  style={[
                    styles.modeButtonText,
                    !isLogin && styles.modeButtonTextActive,
                  ]}
                >
                  Sign Up
                </Text>
              </Pressable>
            </View>

            <View style={styles.card}>
              <ImageBackground
                source={activeImage}
                imageStyle={styles.heroImage}
                style={styles.heroPanel}
              >
                {isLogin ? <View style={styles.heroOverlay} /> : null}
              </ImageBackground>

              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {!isApiConfigured ? (
                <View style={styles.noticeBox}>
                  <Text style={styles.noticeTitle}>API URL required</Text>
                  <Text style={styles.noticeBody}>
                    Add `EXPO_PUBLIC_API_URL` in `app/.env` before testing auth.
                  </Text>
                </View>
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

              <View style={styles.dividerRow}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>
                  {isLogin ? "Or continue with" : "Or sign up with"}
                </Text>
                <View style={styles.divider} />
              </View>

              <Pressable
                onPress={submitGoogle}
                disabled={isBusy || !isApiConfigured}
                style={[
                  styles.googleButton,
                  (isBusy || !isApiConfigured) && styles.disabledButton,
                ]}
              >
                <View style={styles.googleIcon}>
                  <AntDesign name="google" size={18} color="#4285F4" />
                </View>
                <Text style={styles.googleButtonText}>
                  {isLogin ? "Sign in with Google" : "Sign up with Google"}
                </Text>
              </Pressable>

              <Text style={styles.helperText}>
                Google auth for Expo requires a development build, not Expo Go.
              </Text>

              <View style={styles.footerRow}>
                <Text style={styles.footerText}>
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                </Text>
                <Pressable onPress={toggleFooterMode} hitSlop={8}>
                  <Text style={styles.footerLink}>
                    {isLogin ? "Create Account" : "Sign In"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
