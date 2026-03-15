import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext";
import {
  loginAPI,
  registerAPI,
  logoutAPI,
  completeOnboardingAPI,
} from "../api/auth.api";

export const useLogin = () => {
  const navigate = useNavigate();
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
      navigate("/dashboard");
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
      login(response.user);
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
      navigate("/login");
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
  const { setUser } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const completeOnboarding = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await completeOnboardingAPI(data);
      setUser(response.user);
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
