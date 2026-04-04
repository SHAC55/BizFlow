import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext";
import {
  loginAPI,
  registerAPI,
  logoutAPI,
  completeOnboardingAPI,
  forgotPasswordAPI,
  resetPasswordAPI,
  verifyEmailAPI,
} from "../api/auth.api";
import { hasCompletedOnboarding } from "../lib/auth";

export const useLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loginUser = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await loginAPI(data);
      login(response.user);
      toast.success("Login successful");
      const redirectPath = location.state?.from?.pathname;
      navigate(
        hasCompletedOnboarding(response.user)
          ? redirectPath || "/dashboard"
          : "/onboarding",
      );
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return { login: loginUser, isLoading, error };
};

export const useRegister = () => {
  const navigate = useNavigate();
  const { login } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const register = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await registerAPI(data);
      login(response);
      toast.success("Account created successfully");
      navigate("/dashboard");
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return { register, isLoading, error };
};

export const useForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const sendResetLink = async (email) => {
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      const response = await forgotPasswordAPI(email);
      setIsSuccess(true);
      toast.success(response.message || "Password reset email sent");
      return response;
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to send password reset email";
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { sendResetLink, isLoading, error, isSuccess };
};

export const useResetPassword = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const resetPassword = async (data) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await resetPasswordAPI(data);
      toast.success(response.message || "Password reset successful");
      navigate("/signin", {
        replace: true,
        state: { resetSuccess: true },
      });
      return response;
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to reset password";
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { resetPassword, isLoading, error };
};

export const useVerifyEmail = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const verifyEmail = async (code) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await verifyEmailAPI(code);
      toast.success(response.message || "Email verified");
      return response;
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to verify email";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { verifyEmail, isLoading, error };
};

export const useLogout = () => {
  const navigate = useNavigate();
  const { logout } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);

  const logoutUser = async () => {
    setIsLoading(true);
    try {
      await logoutAPI();
      logout();
      toast.success("Logged out");
      navigate("/signin");
    } catch {
      toast.error("Logout failed");
    } finally {
      setIsLoading(false);
    }
  };

  return { logout: logoutUser, isLoading };
};

export const useOnboarding = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const completeOnboarding = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      await completeOnboardingAPI(data);
      await refreshUser();
      toast.success("Setup complete!");
      navigate("/dashboard");
    } catch (err) {
      const message = err.response?.data?.message || "Onboarding failed";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return { completeOnboarding, isLoading, error };
};
