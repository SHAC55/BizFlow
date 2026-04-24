import { MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import type { ComponentProps, ReactNode } from "react";
import { Pressable, SafeAreaView, Text, View } from "react-native";
import type { AppRoute } from "../types/navigation";

type AppLayoutProps = {
  children: ReactNode;
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  title: string;
  subtitle: string;
  eyebrow?: string;
  headerRight?: ReactNode;
};

const NAV_ITEMS: Array<{
  label: string;
  icon: ComponentProps<typeof MaterialIcons>["name"];
  route: AppRoute;
}> = [
  {
    label: "Home",
    icon: "space-dashboard",
    route: "dashboard",
  },
  {
    label: "Sales",
    icon: "receipt-long",
    route: "sales",
  },
  {
    label: "Customers",
    icon: "groups",
    route: "customers",
  },
];

export const AppLayout = ({
  children,
  currentRoute,
  eyebrow,
  headerRight,
  onNavigate,
  subtitle,
  title,
}: AppLayoutProps) => (
  <SafeAreaView className="flex-1 bg-[#f4f7fb]">
    <StatusBar style="dark" />

    <View className="absolute left-[-60px] top-[30px] h-[220px] w-[220px] rounded-full bg-[#dbeafe]" />
    <View className="absolute right-[-70px] top-[150px] h-[200px] w-[200px] rounded-full bg-[#dcfce7]" />
    <View className="absolute bottom-[140px] left-[40px] h-[180px] w-[180px] rounded-full bg-[#ede9fe]" />

    <View className="flex-1 px-4 pb-0 pt-2">
      <View
        className="overflow-hidden rounded-[30px] border border-white/70 bg-white/95 px-5 py-5"
        style={{
          shadowColor: "#0f172a",
          shadowOffset: { width: 0, height: 14 },
          shadowOpacity: 0.12,
          shadowRadius: 30,
          elevation: 10,
        }}
      >
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            {eyebrow ? (
              <View className="self-start rounded-full bg-[#eef2ff] px-3 py-1.5">
                <Text className="text-[11px] font-bold uppercase tracking-[1.8px] text-[#4338ca]">
                  {eyebrow}
                </Text>
              </View>
            ) : null}
            <Text className={`font-extrabold tracking-tight text-[#0f172a] ${eyebrow ? "mt-3 text-[28px]" : "text-[30px]"}`}>
              {title}
            </Text>
            <Text className="mt-1 text-[14px] leading-[21px] text-[#475569]">
              {subtitle}
            </Text>
          </View>

          {headerRight ? <View>{headerRight}</View> : null}
        </View>
      </View>

      <View className="flex-1 pt-4">{children}</View>
    </View>

    <View className="absolute bottom-5 left-4 right-4">
      <View
        className="flex-row items-center justify-between rounded-[30px] border border-black/5 bg-[#0f172a] px-3 py-3"
        style={{
          shadowColor: "#020617",
          shadowOffset: { width: 0, height: 18 },
          shadowOpacity: 0.2,
          shadowRadius: 28,
          elevation: 14,
        }}
      >
        {NAV_ITEMS.map((item) => {
          const active = currentRoute === item.route;

          return (
            <Pressable
              key={item.route}
              onPress={() => onNavigate(item.route)}
              className={`flex-1 flex-row items-center justify-center gap-2 rounded-[22px] px-3 py-3 ${
                active ? "bg-white" : ""
              }`}
            >
              <MaterialIcons
                name={item.icon}
                size={18}
                color={active ? "#0f172a" : "#cbd5e1"}
              />
              <Text
                className={`text-[12px] font-semibold ${
                  active ? "text-[#0f172a]" : "text-[#cbd5e1]"
                }`}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  </SafeAreaView>
);
