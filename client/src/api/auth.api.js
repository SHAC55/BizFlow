import API from "../lib/axios";

export const loginAPI = async (data) => {
  const response = await API.post("/auth/login", data);
  return response.data;
};

export const registerAPI = async (data) => {
  const response = await API.post("/auth/register", data);
  return response.data;
};

export const logoutAPI = async () => {
  const response = await API.get("/auth/logout");
  return response.data;
};

export const googleAuthURL = () => {
  return `${import.meta.env.VITE_API_URL}/auth/google`;
};

export const completeOnboardingAPI = async (data) => {
  const response = await API.post("/auth/onboarding", data);
  return response.data;
};

export const forgotPasswordAPI = async (email) => {
  const response = await API.post("/auth/password/forgot", { email });
  return response.data;
};

export const resetPasswordAPI = async (data) => {
  const response = await API.post("/auth/password/reset", data);
  return response.data;
};

export const verifyEmailAPI = async (code) => {
  const response = await API.get(`/auth/email/verify/${code}`);
  return response.data;
};
