import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Image, SafeAreaView, Text } from "react-native";
import { authAssets } from "../constants/auth";
import { authStyles as styles } from "../styles/authStyles";

export const LoadingPage = () => (
  <SafeAreaView style={styles.loadingScreen}>
    <StatusBar style="dark" />
    <Image
      source={authAssets.logoImage}
      style={styles.loadingLogo}
      resizeMode="contain"
    />
    <ActivityIndicator size="large" color="#2563eb" />
    <Text style={styles.loadingText}>Loading BizEazy session...</Text>
  </SafeAreaView>
);
