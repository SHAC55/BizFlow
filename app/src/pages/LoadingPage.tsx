import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Image, Text, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { authAssets } from "../constants/auth";

const DOT_COUNT = 3;
const DOT_DELAY = 160;

const Dot = ({ index }: { index: number }) => {
  const opacity = useSharedValue(0.25);

  useEffect(() => {
    opacity.value = withDelay(
      index * DOT_DELAY,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) }),
          withTiming(0.25, { duration: 400, easing: Easing.in(Easing.quad) }),
        ),
        -1,
        false,
      ),
    );
  }, [opacity, index]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        {
          width: 7,
          height: 7,
          borderRadius: 4,
          backgroundColor: "#ffffff",
          marginHorizontal: 4,
        },
        style,
      ]}
    />
  );
};

export const LoadingPage = () => {
  const logoScale = useSharedValue(0.88);
  const logoOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) });
    logoScale.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.back(1.4)) });
    subtitleOpacity.value = withDelay(
      340,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) }),
    );
  }, [logoOpacity, logoScale, subtitleOpacity]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000000" }}>
      <StatusBar style="light" />

      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        {/* Logo */}
        <Animated.View style={[{ alignItems: "center" }, logoStyle]}>
          <Image
            source={authAssets.logoImage}
            style={{ width: 160, height: 52 }}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Tagline */}
        <Animated.View style={[{ marginTop: 14, alignItems: "center" }, subtitleStyle]}>
          <Text
            style={{
              fontSize: 13,
              color: "#71717A",
              letterSpacing: 0.4,
              fontWeight: "500",
            }}
          >
            Your business, under control.
          </Text>
        </Animated.View>
      </View>

      {/* Bottom dots */}
      <Animated.View
        entering={FadeIn.delay(500).duration(400)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          paddingBottom: 48,
        }}
      >
        {Array.from({ length: DOT_COUNT }, (_, i) => (
          <Dot key={i} index={i} />
        ))}
      </Animated.View>
    </SafeAreaView>
  );
};
