import type { ReactNode } from "react";
import Animated, { Easing, FadeInDown } from "react-native-reanimated";

type Props = { children: ReactNode; screenKey: string };

export const ScreenTransition = ({ children, screenKey }: Props) => (
  <Animated.View
    key={screenKey}
    entering={FadeInDown.duration(280).easing(Easing.out(Easing.poly(4)))}
    style={{ flex: 1 }}
  >
    {children}
  </Animated.View>
);
