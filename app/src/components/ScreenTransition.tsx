import type { ReactNode } from "react";
import Animated, {
  Easing,
  FadeIn,
  SlideInLeft,
  SlideInRight,
} from "react-native-reanimated";

type Props = { children: ReactNode; screenKey: string };

export type TransitionDirection =
  | "left-to-right"
  | "right-to-left"
  | "none";

let pendingTransitionDirection: TransitionDirection = "none";

export const setPendingTransitionDirection = (
  direction: TransitionDirection,
) => {
  pendingTransitionDirection = direction;
};

const consumePendingTransitionDirection = () => {
  const direction = pendingTransitionDirection;
  pendingTransitionDirection = "none";
  return direction;
};

const transitionCurve = Easing.bezier(0.22, 1, 0.36, 1);

export const ScreenTransition = ({ children, screenKey }: Props) => {
  const direction = consumePendingTransitionDirection();

  const entering =
    direction === "left-to-right"
      ? SlideInRight.duration(320).easing(transitionCurve)
      : direction === "right-to-left"
        ? SlideInLeft.duration(320).easing(transitionCurve)
        : FadeIn.duration(180).easing(Easing.out(Easing.quad));

  return (
    <Animated.View
      key={screenKey}
      entering={entering}
      style={{ flex: 1 }}
    >
      {children}
    </Animated.View>
  );
};
