import { useState } from "react";
import { useAuth } from "../providers/AuthProvider";
import type { LoginForm } from "../pages/SignInPage";
import type { RegisterForm } from "../pages/SignUpPage";

export type AuthMode = "login" | "register";

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

export const useAuthPageState = () => {
  const { isBusy, login, loginWithGoogle, register } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [error, setError] = useState<string | null>(null);
  const [loginForm, setLoginForm] = useState(initialLoginForm);
  const [registerForm, setRegisterForm] = useState(initialRegisterForm);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] =
    useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const isLogin = mode === "login";
  const isApiConfigured = Boolean(process.env.EXPO_PUBLIC_API_URL?.trim());
  const screenBackground = isLogin ? "#e5e7eb" : "#eef2ff";

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError(null);
  };

  const toggleFooterMode = () => {
    switchMode(isLogin ? "register" : "login");
  };

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

  return {
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
    toggleRememberMe: () => setRememberMe((current) => !current),
    toggleRegisterTerms: () =>
      setRegisterForm((current) => ({
        ...current,
        acceptedTerms: !current.acceptedTerms,
      })),
    toggleShowLoginPassword: () =>
      setShowLoginPassword((current) => !current),
    toggleShowRegisterConfirmPassword: () =>
      setShowRegisterConfirmPassword((current) => !current),
    toggleShowRegisterPassword: () =>
      setShowRegisterPassword((current) => !current),
  };
};
