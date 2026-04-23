import { Pressable, Text, View } from "react-native";
import { FormField } from "../components/FormField";
import { authStyles as styles } from "../styles/authStyles";

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
  <>
    <View style={styles.formHeader}>
      <Text style={styles.formTitle}>Welcome Back!</Text>
      <Text style={styles.formSubtitle}>
        Ready to take control of your business? Sign in to continue.
      </Text>
    </View>

    <View style={styles.form}>
      <FormField
        label="Username"
        value={form.username}
        onChangeText={(value) =>
          onChangeForm((current) => ({ ...current, username: value }))
        }
        placeholder="Enter your username"
        leading="person"
      />

      <FormField
        label="Password"
        value={form.password}
        onChangeText={(value) =>
          onChangeForm((current) => ({ ...current, password: value }))
        }
        placeholder="Enter your password"
        secureTextEntry={!showPassword}
        leading="lock"
        trailing={
          <Pressable onPress={onTogglePasswordVisibility} hitSlop={8}>
            <Text style={styles.trailingText}>{showPassword ? "Hide" : "Show"}</Text>
          </Pressable>
        }
      />

      <View style={styles.inlineRow}>
        <Pressable onPress={onToggleRememberMe} style={styles.rememberRow}>
          <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
            {rememberMe ? <Text style={styles.checkboxTick}>✓</Text> : null}
          </View>
          <Text style={styles.rememberText}>Remember me</Text>
        </Pressable>
        <Text style={styles.loginLinkText}>Forgot Password?</Text>
      </View>

      <Pressable
        onPress={onSubmit}
        disabled={isBusy || isDisabled}
        style={[styles.primaryButton, (isBusy || isDisabled) && styles.disabledButton]}
      >
        <Text style={styles.primaryButtonText}>
          {isBusy ? "Signing in..." : "Sign In"}
        </Text>
      </Pressable>
    </View>
  </>
);
