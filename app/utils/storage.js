import AsyncStorage from "@react-native-async-storage/async-storage";

export const setTokens = async (access, refresh) => {
  await AsyncStorage.setItem("accessToken", access);
  await AsyncStorage.setItem("refreshToken", refresh);
};

export const getAccessToken = async () => {
  return await AsyncStorage.getItem("accessToken");
};

export const getRefreshToken = async () => {
  return await AsyncStorage.getItem("refreshToken");
};

export const clearTokens = async () => {
  await AsyncStorage.removeItem("accessToken");
  await AsyncStorage.removeItem("refreshToken");
};