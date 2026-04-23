import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { AuthProvider, useAuth } from "./src/providers/AuthProvider";
import { apiUrl } from "./src/config";

type AuthMode = "login" | "register";

type LoginForm = {
  username: string;
  password: string;
};

type RegisterForm = {
  businessName: string;
  username: string;
  mobileNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
};

const initialLoginForm: LoginForm = {
  username: "",
  password: "",
};

const initialRegisterForm: RegisterForm = {
  businessName: "",
  username: "",
  mobileNumber: "",
  email: "",
  password: "",
  confirmPassword: "",
  acceptedTerms: false,
};

const Screen = () => {
  const { session, isBusy, isReady, login, loginWithGoogle, logout, register } =
    useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [error, setError] = useState<string | null>(null);
  const [loginForm, setLoginForm] = useState(initialLoginForm);
  const [registerForm, setRegisterForm] = useState(initialRegisterForm);

  const submitLogin = async () => {
    if (!loginForm.username.trim() || !loginForm.password) {
      setError("Username and password are required");
      return;
    }

    try {
      setError(null);
      await login({
        username: loginForm.username.trim(),
        password: loginForm.password,
      });
    } catch (loginError) {
      setError(
        loginError instanceof Error ? loginError.message : "Login failed",
      );
    }
  };

  const submitRegister = async () => {
    const email = registerForm.email.trim();

    if (
      !registerForm.businessName.trim() ||
      !registerForm.username.trim() ||
      !registerForm.mobileNumber.trim() ||
      !registerForm.password ||
      !registerForm.confirmPassword
    ) {
      setError("All required fields must be filled");
      return;
    }

    if (registerForm.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address");
      return;
    }

    if (!registerForm.acceptedTerms) {
      setError("You must accept the terms to continue");
      return;
    }

    try {
      setError(null);
      await register({
        businessName: registerForm.businessName.trim(),
        username: registerForm.username.trim(),
        phone: registerForm.mobileNumber.trim(),
        email: email || undefined,
        password: registerForm.password,
        confirmPassword: registerForm.confirmPassword,
      });
    } catch (registerError) {
      setError(
        registerError instanceof Error
          ? registerError.message
          : "Registration failed",
      );
    }
  };

  const submitGoogle = async () => {
    try {
      setError(null);
      await loginWithGoogle();
    } catch (googleError) {
      setError(
        googleError instanceof Error
          ? googleError.message
          : "Google sign-in failed",
      );
    }
  };

  if (!isReady) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#111827" />
        <Text style={styles.loadingText}>Loading BizEazy session...</Text>
      </SafeAreaView>
    );
  }

  if (session) {
    return (
      <SafeAreaView style={styles.dashboardScreen}>
        <StatusBar style="dark" />
        <View style={styles.dashboardCard}>
          <Text style={styles.kicker}>BizEazy Mobile</Text>
          <Text style={styles.dashboardTitle}>
            {session.user.name || session.user.email || "Authenticated user"}
          </Text>
          <Text style={styles.dashboardText}>
            Provider: {session.user.provider || "password"}
          </Text>
          <Text style={styles.dashboardText}>
            Mobile: {session.user.mobile || "Not set"}
          </Text>
          <Text style={styles.dashboardText}>
            Business: {session.user.business?.name || "Not set"}
          </Text>
          {session.needsOnboarding ? (
            <View style={styles.noticeBox}>
              <Text style={styles.noticeTitle}>Onboarding still needed</Text>
              <Text style={styles.noticeBody}>
                This account is authenticated, but some profile fields are still
                missing.
              </Text>
            </View>
          ) : null}
          <Pressable onPress={logout} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Log Out</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const isLogin = mode === "login";

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.heroPanel}>
            <Text style={styles.kicker}>BizEazy</Text>
            <Text style={styles.heroTitle}>Business control, now on mobile.</Text>
            <Text style={styles.heroText}>
              Sign in or create your account to start building the native app
              version of the BizEazy experience.
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.tabRow}>
              <Pressable
                onPress={() => {
                  setMode("login");
                  setError(null);
                }}
                style={[styles.tabButton, isLogin && styles.activeTabButton]}
              >
                <Text style={[styles.tabText, isLogin && styles.activeTabText]}>
                  Login
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setMode("register");
                  setError(null);
                }}
                style={[styles.tabButton, !isLogin && styles.activeTabButton]}
              >
                <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>
                  Register
                </Text>
              </Pressable>
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {!apiUrl ? (
              <View style={styles.noticeBox}>
                <Text style={styles.noticeTitle}>API URL required</Text>
                <Text style={styles.noticeBody}>
                  Add `EXPO_PUBLIC_API_URL` in `app/.env` before testing auth.
                </Text>
              </View>
            ) : null}

            {isLogin ? (
              <View style={styles.form}>
                <FormField
                  label="Username"
                  value={loginForm.username}
                  onChangeText={(value) =>
                    setLoginForm((current) => ({ ...current, username: value }))
                  }
                  placeholder="Enter your username"
                />
                <FormField
                  label="Password"
                  value={loginForm.password}
                  onChangeText={(value) =>
                    setLoginForm((current) => ({ ...current, password: value }))
                  }
                  placeholder="Enter your password"
                  secureTextEntry
                />
                <Pressable
                  onPress={submitLogin}
                  disabled={isBusy || !apiUrl}
                  style={[styles.primaryButton, (isBusy || !apiUrl) && styles.disabledButton]}
                >
                  <Text style={styles.primaryButtonText}>
                    {isBusy ? "Signing in..." : "Sign In"}
                  </Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.form}>
                <FormField
                  label="Business Name"
                  value={registerForm.businessName}
                  onChangeText={(value) =>
                    setRegisterForm((current) => ({
                      ...current,
                      businessName: value,
                    }))
                  }
                  placeholder="Enter your business name"
                />
                <FormField
                  label="Username"
                  value={registerForm.username}
                  onChangeText={(value) =>
                    setRegisterForm((current) => ({ ...current, username: value }))
                  }
                  placeholder="Choose a username"
                />
                <FormField
                  label="Mobile Number"
                  value={registerForm.mobileNumber}
                  onChangeText={(value) =>
                    setRegisterForm((current) => ({
                      ...current,
                      mobileNumber: value,
                    }))
                  }
                  placeholder="Enter your mobile number"
                  keyboardType="phone-pad"
                />
                <FormField
                  label="Email"
                  value={registerForm.email}
                  onChangeText={(value) =>
                    setRegisterForm((current) => ({ ...current, email: value }))
                  }
                  placeholder="Enter your email (optional)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <FormField
                  label="Password"
                  value={registerForm.password}
                  onChangeText={(value) =>
                    setRegisterForm((current) => ({ ...current, password: value }))
                  }
                  placeholder="Create a password"
                  secureTextEntry
                />
                <FormField
                  label="Confirm Password"
                  value={registerForm.confirmPassword}
                  onChangeText={(value) =>
                    setRegisterForm((current) => ({
                      ...current,
                      confirmPassword: value,
                    }))
                  }
                  placeholder="Confirm your password"
                  secureTextEntry
                />
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>
                    I accept the terms and conditions
                  </Text>
                  <Switch
                    value={registerForm.acceptedTerms}
                    onValueChange={(value) =>
                      setRegisterForm((current) => ({
                        ...current,
                        acceptedTerms: value,
                      }))
                    }
                  />
                </View>
                <Pressable
                  onPress={submitRegister}
                  disabled={isBusy || !apiUrl}
                  style={[styles.primaryButton, (isBusy || !apiUrl) && styles.disabledButton]}
                >
                  <Text style={styles.primaryButtonText}>
                    {isBusy ? "Creating account..." : "Create Account"}
                  </Text>
                </Pressable>
              </View>
            )}

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.divider} />
            </View>

            <Pressable
              onPress={submitGoogle}
              disabled={isBusy || !apiUrl}
              style={[styles.googleButton, (isBusy || !apiUrl) && styles.disabledButton]}
            >
              <Text style={styles.googleButtonText}>
                {isLogin ? "Continue with Google" : "Sign up with Google"}
              </Text>
            </Pressable>

            <Text style={styles.helperText}>
              Google auth for Expo requires a development build, not Expo Go.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

type FormFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
};

const FormField = ({
  autoCapitalize = "sentences",
  keyboardType = "default",
  label,
  onChangeText,
  placeholder,
  secureTextEntry,
  value,
}: FormFieldProps) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      autoCapitalize={autoCapitalize}
      keyboardType={keyboardType}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#6B7280"
      secureTextEntry={secureTextEntry}
      style={styles.input}
      value={value}
    />
  </View>
);

export default function App() {
  return (
    <AuthProvider>
      <Screen />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#f4efe7",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 28,
    gap: 18,
  },
  heroPanel: {
    backgroundColor: "#1f4f46",
    borderRadius: 28,
    padding: 24,
    gap: 10,
  },
  kicker: {
    color: "#f1e7d5",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  heroTitle: {
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "800",
    lineHeight: 36,
  },
  heroText: {
    color: "#dce7e3",
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    backgroundColor: "#fffdf8",
    borderRadius: 28,
    padding: 20,
    gap: 18,
  },
  tabRow: {
    flexDirection: "row",
    backgroundColor: "#ece5d8",
    borderRadius: 16,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTabButton: {
    backgroundColor: "#1f1f1a",
  },
  tabText: {
    color: "#5c5648",
    fontSize: 15,
    fontWeight: "700",
  },
  activeTabText: {
    color: "#fffefb",
  },
  form: {
    gap: 14,
  },
  field: {
    gap: 6,
  },
  label: {
    color: "#2f352f",
    fontSize: 14,
    fontWeight: "700",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d9d1c4",
    borderRadius: 14,
    backgroundColor: "#ffffff",
    color: "#101828",
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  primaryButton: {
    backgroundColor: "#1f1f1a",
    borderRadius: 16,
    alignItems: "center",
    paddingVertical: 15,
  },
  primaryButtonText: {
    color: "#fffefb",
    fontSize: 15,
    fontWeight: "800",
  },
  secondaryButton: {
    backgroundColor: "#ece5d8",
    borderRadius: 16,
    alignItems: "center",
    paddingVertical: 15,
    marginTop: 8,
  },
  secondaryButtonText: {
    color: "#1f1f1a",
    fontSize: 15,
    fontWeight: "800",
  },
  googleButton: {
    backgroundColor: "#f5f1e8",
    borderWidth: 1,
    borderColor: "#d9d1c4",
    borderRadius: 16,
    alignItems: "center",
    paddingVertical: 15,
  },
  googleButtonText: {
    color: "#1f1f1a",
    fontSize: 15,
    fontWeight: "700",
  },
  disabledButton: {
    opacity: 0.6,
  },
  dividerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#d9d1c4",
  },
  dividerText: {
    color: "#6b675d",
    fontSize: 13,
    textTransform: "uppercase",
  },
  helperText: {
    color: "#6b675d",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
  errorBox: {
    backgroundColor: "#fff0ef",
    borderColor: "#f6c5be",
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  errorText: {
    color: "#b42318",
    fontSize: 13,
    lineHeight: 18,
  },
  noticeBox: {
    backgroundColor: "#f7f3e7",
    borderColor: "#e1d5b8",
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 4,
  },
  noticeTitle: {
    color: "#5a4512",
    fontSize: 14,
    fontWeight: "800",
  },
  noticeBody: {
    color: "#6f5a26",
    fontSize: 13,
    lineHeight: 18,
  },
  switchRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  switchLabel: {
    color: "#2f352f",
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#f4efe7",
  },
  loadingText: {
    color: "#1f1f1a",
    fontSize: 15,
    fontWeight: "600",
  },
  dashboardScreen: {
    flex: 1,
    backgroundColor: "#f4efe7",
    justifyContent: "center",
    padding: 20,
  },
  dashboardCard: {
    backgroundColor: "#fffdf8",
    borderRadius: 28,
    padding: 24,
    gap: 12,
  },
  dashboardTitle: {
    color: "#1f1f1a",
    fontSize: 28,
    fontWeight: "800",
  },
  dashboardText: {
    color: "#4b5149",
    fontSize: 15,
  },
});
