import { Pressable, Text, View } from "react-native";
import { FormField } from "../components/FormField";
import { authStyles as styles } from "../styles/authStyles";

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
  <>
    <View style={styles.formHeader}>
      <Text style={styles.formTitle}>Create Account</Text>
      <Text style={styles.formSubtitle}>
        Join us to streamline your business management
      </Text>
    </View>

    <View style={styles.form}>
      <FormField
        label="Business Name"
        value={form.businessName}
        onChangeText={(value) =>
          onChangeForm((current) => ({ ...current, businessName: value }))
        }
        placeholder="Enter your business name"
        leading="business"
      />

      <FormField
        label="Username"
        value={form.username}
        onChangeText={(value) =>
          onChangeForm((current) => ({ ...current, username: value }))
        }
        placeholder="Choose a username"
        autoCapitalize="none"
        leading="person"
      />

      <FormField
        label="Mobile Number"
        value={form.mobileNumber}
        onChangeText={(value) =>
          onChangeForm((current) => ({ ...current, mobileNumber: value }))
        }
        placeholder="Enter your mobile number"
        keyboardType="phone-pad"
        leading="phone"
      />

      <FormField
        label="Email"
        value={form.email}
        onChangeText={(value) =>
          onChangeForm((current) => ({ ...current, email: value }))
        }
        placeholder="Enter your email (optional)"
        keyboardType="email-address"
        autoCapitalize="none"
        leading="mail"
      />

      <FormField
        label="Password"
        value={form.password}
        onChangeText={(value) =>
          onChangeForm((current) => ({ ...current, password: value }))
        }
        placeholder="Create a password"
        secureTextEntry={!showPassword}
        leading="lock"
        trailing={
          <Pressable onPress={onTogglePasswordVisibility} hitSlop={8}>
            <Text style={styles.trailingText}>{showPassword ? "Hide" : "Show"}</Text>
          </Pressable>
        }
      />

      <FormField
        label="Confirm Password"
        value={form.confirmPassword}
        onChangeText={(value) =>
          onChangeForm((current) => ({ ...current, confirmPassword: value }))
        }
        placeholder="Confirm your password"
        secureTextEntry={!showConfirmPassword}
        leading="lock"
        trailing={
          <Pressable onPress={onToggleConfirmPasswordVisibility} hitSlop={8}>
            <Text style={styles.trailingText}>
              {showConfirmPassword ? "Hide" : "Show"}
            </Text>
          </Pressable>
        }
      />

      <View style={styles.termsRow}>
        <Pressable onPress={onToggleTerms} style={styles.checkboxPressable}>
          <View
            style={[
              styles.checkbox,
              form.acceptedTerms && styles.checkboxBlueActive,
            ]}
          >
            {form.acceptedTerms ? <Text style={styles.checkboxTick}>✓</Text> : null}
          </View>
        </Pressable>
        <Text style={styles.termsText}>
          I accept the <Text style={styles.signUpLinkText}>Terms and Conditions</Text>
        </Text>
      </View>

      <Pressable
        onPress={onSubmit}
        disabled={isBusy || isDisabled}
        style={[styles.signUpButton, (isBusy || isDisabled) && styles.disabledButton]}
      >
        <Text style={styles.signUpButtonText}>
          {isBusy ? "Creating account..." : "Sign Up"}
        </Text>
      </Pressable>
    </View>
  </>
);
