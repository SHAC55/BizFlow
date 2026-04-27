import { MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useCallback, useRef, useState, type ComponentProps } from "react";
import {
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import PagerView from "react-native-pager-view";
import Reanimated, { FadeIn, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { PagerModeProvider } from "./AppLayout";
import { ProfileMenu } from "./ProfileMenu";
import { CustomersPage } from "../pages/CustomersPage";
import { DashboardPage } from "../pages/DashboardPage";
import { InventoryPage } from "../pages/InventoryPage";
import { SalesPage } from "../pages/SalesPage";
import type { AuthSession } from "../types/auth";
import type { AppRoute } from "../types/navigation";

type Props = {
  session: AuthSession;
  onOpenProduct: (productId: string) => void;
  onOpenSale: (saleId: string) => void;
  onOpenCustomer: (customerId: string) => void;
  onOpenAddInventory: () => void;
  onOpenAddSale: () => void;
  onOpenAddCustomer: () => void;
};

const TAB_META = [
  { route: "dashboard" as AppRoute, title: "Dashboard", subtitle: "Here's your business today." },
  { route: "inventory" as AppRoute, title: "Inventory Atlas", subtitle: "Monitor stock health, value and product flow." },
  { route: "sales" as AppRoute, title: "Sales Dashboard", subtitle: "Track collections, dues and transaction flow." },
  { route: "customers" as AppRoute, title: "Customer Book", subtitle: "Track relationships & payments" },
] as const;

const NAV_ITEMS: Array<{
  label: string;
  icon: ComponentProps<typeof MaterialIcons>["name"];
}> = [
  { label: "Dashboard", icon: "space-dashboard" },
  { label: "Inventory", icon: "inventory-2" },
  { label: "Sales", icon: "receipt-long" },
  { label: "Customers", icon: "groups" },
];

const INDICATOR_WIDTH = 28;

export const MainTabs = ({
  session,
  onOpenProduct,
  onOpenSale,
  onOpenCustomer,
  onOpenAddInventory,
  onOpenAddSale,
  onOpenAddCustomer,
}: Props) => {
  const pagerRef = useRef<PagerView>(null);
  const [activePage, setActivePage] = useState(0);
  const { width: screenWidth } = useWindowDimensions();

  const tabWidth = (screenWidth - 16) / 4;
  const indicatorBaseX = 8 + (tabWidth - INDICATOR_WIDTH) / 2;

  const scrollProgress = useSharedValue(0);

  const handlePageScroll = useCallback(
    (e: { nativeEvent: { position: number; offset: number } }) => {
      scrollProgress.value = e.nativeEvent.position + e.nativeEvent.offset;
    },
    [scrollProgress],
  );

  const handlePageSelected = useCallback((e: { nativeEvent: { position: number } }) => {
    setActivePage(e.nativeEvent.position);
  }, []);

  const goToPage = useCallback((index: number) => {
    pagerRef.current?.setPage(index);
  }, []);

  const onNavigate = useCallback(
    (route: AppRoute) => {
      const idx = TAB_META.findIndex((t) => t.route === route);
      if (idx >= 0) goToPage(idx);
    },
    [goToPage],
  );

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: scrollProgress.value * tabWidth + indicatorBaseX }],
  }));

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <StatusBar style="light" />

      {/* Shared header */}
      <SafeAreaView edges={["top"]} style={{ backgroundColor: "#000000" }}>
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
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Reanimated.View
              key={`hdr-${activePage}`}
              entering={FadeIn.duration(180)}
              style={{ flex: 1, paddingRight: 12 }}
            >
              <Text style={{ fontSize: 24, fontWeight: "800", color: "#FFFFFF", letterSpacing: -0.4 }}>
                {TAB_META[activePage].title}
              </Text>
              <Text style={{ marginTop: 4, fontSize: 13, color: "#A1A1AA" }}>
                {TAB_META[activePage].subtitle}
              </Text>
            </Reanimated.View>
            <ProfileMenu />
          </View>
        </View>
      </SafeAreaView>

      {/* Pages */}
      <PagerModeProvider>
        <PagerView
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={0}
          overdrag={false}
          onPageScroll={handlePageScroll}
          onPageSelected={handlePageSelected}
        >
          <View key="0" style={{ flex: 1 }}>
            <DashboardPage
              session={session}
              onOpenAddInventory={onOpenAddInventory}
              onOpenCustomers={onOpenAddCustomer}
              onOpenInventory={() => goToPage(1)}
              onOpenSales={onOpenAddSale}
              onNavigate={onNavigate}
            />
          </View>
          <View key="1" style={{ flex: 1 }}>
            <InventoryPage
              onBack={() => goToPage(0)}
              onAddInventory={onOpenAddInventory}
              onOpenProduct={onOpenProduct}
              onNavigate={onNavigate}
            />
          </View>
          <View key="2" style={{ flex: 1 }}>
            <SalesPage
              onOpenAddSale={onOpenAddSale}
              onOpenSale={onOpenSale}
              onNavigate={onNavigate}
            />
          </View>
          <View key="3" style={{ flex: 1 }}>
            <CustomersPage
              onOpenAddCustomer={onOpenAddCustomer}
              onOpenCustomer={onOpenCustomer}
              onNavigate={onNavigate}
            />
          </View>
        </PagerView>
      </PagerModeProvider>

      {/* Animated bottom nav */}
      <SafeAreaView
        edges={["bottom"]}
        style={{ backgroundColor: "#ffffff", borderTopWidth: 1, borderTopColor: "#E5E7EB" }}
      >
        <View style={{ paddingHorizontal: 8, paddingTop: 6, paddingBottom: 8 }}>
          {/* Sliding indicator */}
          <Reanimated.View
            style={[
              {
                position: "absolute",
                top: 6,
                left: 0,
                width: INDICATOR_WIDTH,
                height: 3,
                borderRadius: 999,
                backgroundColor: "#000000",
              },
              indicatorStyle,
            ]}
          />

          <View style={{ flexDirection: "row" }}>
            {NAV_ITEMS.map((item, index) => {
              const active = activePage === index;
              return (
                <Pressable
                  key={item.label}
                  onPress={() => goToPage(index)}
                  android_ripple={{ color: "rgba(0,0,0,0.08)", borderless: false }}
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    paddingVertical: 8,
                  }}
                >
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
        </View>
      </SafeAreaView>
    </View>
  );
};
