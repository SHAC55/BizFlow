import { View, Text, TextInput, Pressable } from "react-native";
import React, { useState } from "react";
import { Link } from "expo-router";
import { useAuth } from "@/context/AuthContext";

const SignIn = () => {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    login(email, password);
  };

  return (
    <View className="flex-1 bg-white px-6 justify-center">
      <Text className="text-3xl font-bold mb-2">Welcome Back</Text>

      <Text className="text-gray-500 mb-8">Sign in to continue</Text>

      <Text className="text-gray-600 mb-1">Email</Text>
      <TextInput
        placeholder="Enter email"
        value={email}
        onChangeText={setEmail}
        className="border border-gray-300 rounded-xl px-4 py-3 mb-4"
      />

      <Text className="text-gray-600 mb-1">Password</Text>
      <TextInput
        placeholder="Enter password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        className="border border-gray-300 rounded-xl px-4 py-3 mb-6"
      />

      <Pressable
        onPress={handleLogin}
        className="bg-black py-4 rounded-xl mb-6"
      >
        <Text className="text-white text-center font-semibold">
          Sign In
        </Text>
      </Pressable>

      <View className="flex-row justify-center">
        <Text className="text-gray-500">Don't have an account? </Text>

        <Link href="/(auth)/signup" className="text-black font-semibold">
          Sign Up
        </Link>
      </View>
    </View>
  );
};

export default SignIn;