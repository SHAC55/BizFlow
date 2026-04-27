import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type FormBottomSheetProps = {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: ReactNode;
};

export const FormBottomSheet = ({
  title,
  subtitle,
  onClose,
  children,
}: FormBottomSheetProps) => {
  const modalRef = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ["92%"], []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      modalRef.current?.present();
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <BottomSheetModal
      ref={modalRef}
      index={0}
      snapPoints={snapPoints}
      android_keyboardInputMode="adjustResize"
      enableDynamicSizing={false}
      enablePanDownToClose
      keyboardBehavior="interactive"
      onDismiss={onClose}
      backgroundStyle={{ backgroundColor: "#F8FAFC" }}
      handleIndicatorStyle={{ backgroundColor: "#CBD5E1", width: 44 }}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.36}
          pressBehavior="close"
        />
      )}
    >
      <View className="px-5 pb-3 pt-2">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-[24px] font-bold text-slate-900">
              {title}
            </Text>
            <Text className="mt-1 text-[13px] leading-5 text-slate-500">
              {subtitle}
            </Text>
          </View>

          <Pressable
            onPress={onClose}
            android_ripple={{ color: "rgba(0,0,0,0.08)", borderless: false }}
            className="h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white"
          >
            <MaterialIcons name="close" size={20} color="#0F172A" />
          </Pressable>
        </View>
      </View>

      <BottomSheetScrollView
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 12) }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
};
