import { MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import type { ComponentProps, ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import type { AppRoute } from "../types/navigation";

type AppLayoutProps = {
  children: ReactNode;
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  title: string;
  subtitle: string;
  eyebrow?: string;
};

const NAV_ITEMS: Array<{
  label: string;
  icon: ComponentProps<typeof MaterialIcons>["name"];
  route: AppRoute;
}> = [
  { label: "Dashboard", icon: "space-dashboard", route: "dashboard" },
  { label: "Inventory", icon: "inventory-2", route: "inventory" },
  { label: "Sales", icon: "receipt-long", route: "sales" },
  { label: "Customers", icon: "groups", route: "customers" },
];

export const AppLayout = ({
  children,
  currentRoute,
  eyebrow,
  onNavigate,
  subtitle,
  title,
}: AppLayoutProps) => {
  const insets = useSafeAreaInsets();
  const initials = title?.charAt(0)?.toUpperCase() || "U";

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <StatusBar style="light" />

      {/* TOP SAFE AREA */}
      <SafeAreaView edges={["top"]} style={{ backgroundColor: "#000000" }}>
        {/* HEADER */}
        <View
          style={{
            paddingHorizontal: 18,
            paddingTop: 8,
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: "#111111",
            backgroundColor: "#000000",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* LEFT */}
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "800",
                  color: "#FFFFFF",
                  letterSpacing: -0.4,
                }}
              >
                {title}
              </Text>

              <Text
                style={{
                  marginTop: 4,
                  fontSize: 13,
                  color: "#A1A1AA",
                }}
              >
                {subtitle}
              </Text>
            </View>

            {/* PROFILE */}
            <Pressable
              android_ripple={{ color: "rgba(255,255,255,0.1)", borderless: false }}
              style={{
                height: 48,
                width: 48,
                borderRadius: 16,
                backgroundColor: "#111111",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: "#222222",
              }}
            >
              {/* <Text
                style={{
                  fontSize: 16,
                  fontWeight: "800",
                  color: "#FFFFFF",
                }}
              >
                {initials}
              </Text> */}
            </Pressable>
          </View>
        </View>
      </SafeAreaView>

      {/* PAGE CONTENT */}
      <View style={{ flex: 1 }}>{children}</View>

      {/* BOTTOM NAV */}
      <SafeAreaView
        edges={["bottom"]}
        style={{
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: 8,
            paddingTop: 6,
            paddingBottom: 8,
          }}
        >
          {NAV_ITEMS.map((item) => {
            const active = currentRoute === item.route;

            return (
              <Pressable
                key={item.route}
                onPress={() => onNavigate(item.route)}
                android_ripple={{ color: "rgba(0,0,0,0.08)", borderless: false }}
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 8,
                }}
              >
                {active ? (
                  <View
                    style={{
                      position: "absolute",
                      top: 0,
                      width: 28,
                      height: 3,
                      borderRadius: 999,
                      backgroundColor: "#000000",
                    }}
                  />
                ) : null}

                <MaterialIcons
                  name={item.icon}
                  size={22}
                  color={active ? "#000000" : "#94A3B8"}
                />

                <Text
                  style={{
                    marginTop: 4,
                    fontSize: 10,
                    fontWeight: "700",
                    color: active ? "#000000" : "#94A3B8",
                  }}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </SafeAreaView>
    </View>
  );
};
