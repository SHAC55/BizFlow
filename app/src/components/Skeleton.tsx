import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

type SkeletonBoxProps = {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: object;
};

export const SkeletonBox = ({
  width,
  height,
  borderRadius = 4,
  style,
}: SkeletonBoxProps) => {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.9, { duration: 700 }),
        withTiming(0.4, { duration: 700 }),
      ),
      -1,
      false,
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        { width, height, borderRadius, backgroundColor: "#E2E8F0" },
        animStyle,
        style,
      ]}
    />
  );
};

export const SkeletonProductRow = () => (
  <View className="flex-row gap-3 px-4 py-4 border-b border-slate-100">
    <SkeletonBox width={44} height={44} borderRadius={8} />
    <View className="flex-1">
      <SkeletonBox width="70%" height={14} />
      <SkeletonBox width="40%" height={11} style={{ marginTop: 6 }} />
      <View className="flex-row justify-between mt-2">
        <SkeletonBox width="30%" height={13} />
        <SkeletonBox width="35%" height={11} />
      </View>
    </View>
  </View>
);

export const SkeletonSaleRow = () => (
  <View className="flex-row items-center justify-between py-4 px-4 border-b border-slate-100">
    <View className="flex-1 pr-3">
      <SkeletonBox width="60%" height={15} />
      <SkeletonBox width="80%" height={12} style={{ marginTop: 6 }} />
    </View>
    <View className="items-end gap-1.5">
      <SkeletonBox width={80} height={15} />
      <SkeletonBox width={60} height={22} borderRadius={999} />
    </View>
  </View>
);

export const SkeletonCustomerRow = () => (
  <View className="flex-row gap-3 px-5 py-4 border-b border-black/5">
    <SkeletonBox width={48} height={48} borderRadius={9999} />
    <View className="flex-1">
      <SkeletonBox width="55%" height={15} />
      <SkeletonBox width="40%" height={12} style={{ marginTop: 6 }} />
      <View className="flex-row justify-between mt-3">
        <SkeletonBox width="30%" height={11} />
        <SkeletonBox width={70} height={22} borderRadius={999} />
      </View>
    </View>
  </View>
);
