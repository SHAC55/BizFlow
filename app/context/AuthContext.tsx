import React, { createContext, useContext, useState } from "react";
import api from "../services/api";
import { router } from "expo-router";
import { Alert } from "react-native";

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState(null);

  // LOGIN
  const login = async (email: string, password: string) => {
    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      setUser(res.data.user);

      Alert.alert("Success", "Login successful", [
        {
          text: "OK",
          onPress: () => router.replace("/(tabs)"),
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        "Login Failed",
        error?.response?.data?.message || "Invalid email or password"
      );
    }
  };

  // SIGNUP
  const signup = async (data: any) => {
    try {
      const res = await api.post("/auth/register", data);

      setUser(res.data.user);

      Alert.alert("Success", "Account created successfully", [
        {
          text: "OK",
          onPress: () => router.replace("/(tabs)"),
        },
      ]);

      return { success: true };
    } catch (error: any) {
      Alert.alert(
        "Signup Failed",
        error?.response?.data?.message || "Signup failed"
      );

      return {
        success: false,
      };
    }
  };

  // LOGOUT
  const logout = () => {
    setUser(null);

    router.replace("/(auth)/signin");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);