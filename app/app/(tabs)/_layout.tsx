import AppHeader from "@/components/AppHeader";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const TabLayout = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
      <Tabs
        screenOptions={{
          header: () => <AppHeader />,

          //  Theme Colors (Black & White Minimal)
          tabBarActiveTintColor: "#ffffff",
          tabBarInactiveTintColor: "#6b7280",

          tabBarStyle: {
            backgroundColor: "#000",
            borderTopWidth: 0.5,
            borderTopColor: "#1f2937",
            height: 70,
            paddingTop: 8,
            paddingBottom: 12,
          },

          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "500",
          },
        }}
      >
        {/* Dashboard */}
        <Tabs.Screen
          name="index"
          options={{
            title: "Dashboard",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="grid-outline" size={size} color={color} />
            ),
          }}
        />

        {/* Sales */}
        <Tabs.Screen
          name="Sales"
          options={{
            title: "Sales",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="trending-up-outline" size={size} color={color} />
            ),
          }}
        />

        {/* Inventory */}
        <Tabs.Screen
          name="Inventory"
          options={{
            title: "Inventory",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="cube-outline" size={size} color={color} />
            ),
          }}
        />

        {/* Payments */}
        <Tabs.Screen
          name="Payment"
          options={{
            title: "Payments",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="card-outline" size={size} color={color} />
            ),
          }}
        />

        {/* Customers */}
        <Tabs.Screen
          name="Customers"
          options={{
            title: "Customers",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="people-outline" size={size} color={color} />
            ),
          }}
        />

        {/* Hidden Profile */}
        <Tabs.Screen
          name="Profile"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="AddInventory"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="AddTransaction"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
};

export default TabLayout;
