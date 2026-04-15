import { View, Text, TextInput, Pressable } from "react-native";
import React, { useState } from "react";
import { Link } from "expo-router";
import { useAuth } from "@/context/AuthContext";

const SignUp = () => {
  const { signup } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = () => {
    signup({
      username: name,
      email,
      password,
    });
  };

  return (
    <View className="flex-1 bg-white px-6 justify-center">
      <Text className="text-3xl font-bold mb-2">Create Account</Text>

      <Text className="text-gray-500 mb-8">Sign up to get started</Text>

      <Text className="text-gray-600 mb-1">Name</Text>
      <TextInput
        placeholder="Enter name"
        value={name}
        onChangeText={setName}
        className="border border-gray-300 rounded-xl px-4 py-3 mb-4"
      />

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
        onPress={handleSignup}
        className="bg-black py-4 rounded-xl mb-6"
      >
        <Text className="text-white text-center font-semibold">
          Create Account
        </Text>
      </Pressable>

      <View className="flex-row justify-center">
        <Text className="text-gray-500">Already have an account? </Text>

        <Link href="/(auth)/signin" className="text-black font-semibold">
          Sign In
        </Link>
      </View>
    </View>
  );
};

export default SignUp;