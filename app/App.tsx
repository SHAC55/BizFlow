import "react-native-gesture-handler";
import "./global.css";

import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryClientProvider } from "@tanstack/react-query";
import * as ExpoLinking from "expo-linking";
import {
  CommonActions,
  NavigationContainer,
  type NavigationProp,
  type LinkingOptions,
} from "@react-navigation/native";
import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import {
  ScreenTransition,
  setPendingTransitionDirection,
} from "./src/components/ScreenTransition";
import { AuthPage } from "./src/pages/AuthPage";
import { AddCustomerPage } from "./src/pages/AddCustomerPage";
import { AddInventoryPage } from "./src/pages/AddInventoryPage";
import { AddSalePage } from "./src/pages/AddSalePage";
import { CustomerDetailPage } from "./src/pages/CustomerDetailPage";
import { CustomersPage } from "./src/pages/CustomersPage";
import { DashboardPage } from "./src/pages/DashboardPage";
import { InventoryPage } from "./src/pages/InventoryPage";
import { LoadingPage } from "./src/pages/LoadingPage";
import { OnboardingPage } from "./src/pages/OnboardingPage";
import { ProductDetailPage } from "./src/pages/ProductDetailPage";
import { SaleDetailPage } from "./src/pages/SaleDetailPage";
import { SalesPage } from "./src/pages/SalesPage";
import { queryClient } from "./src/lib/query";
import { AuthProvider, useAuth } from "./src/providers/AuthProvider";

import type { AppRoute, RootStackParamList } from "./src/types/navigation";

const Stack = createNativeStackNavigator<RootStackParamList>();

const ROOT_ROUTE_MAP: Record<AppRoute, keyof RootStackParamList> = {
  dashboard: "Dashboard",
  inventory: "Inventory",
  addInventory: "AddInventory",
  sales: "Sales",
  customers: "Customers",
};

const APP_ROUTE_ORDER: Record<AppRoute, number> = {
  dashboard: 0,
  inventory: 1,
  addInventory: 1,
  sales: 2,
  customers: 3,
};

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [ExpoLinking.createURL("/")],
  config: {
    screens: {
      Dashboard: "dashboard",
      Inventory: "inventory",
      AddInventory: "inventory/form/:productId?",
      ProductDetail: "inventory/product/:productId",
      Sales: "sales",
      AddSale: "sales/new",
      SaleDetail: "sales/detail/:saleId",
      Customers: "customers",
      AddCustomer: "customers/form/:customerId?",
      CustomerDetail: "customers/detail/:customerId",
    },
  },
};

const resetToRoute = (
  navigation: NavigationProp<RootStackParamList>,
  route: AppRoute,
) => {
  applyTransitionDirection(
    getCurrentAppRoute(navigation),
    route,
  );

  if (route === "addInventory") {
    navigation.navigate("AddInventory");
    return;
  }

  const name = ROOT_ROUTE_MAP[route];
  navigation.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name }],
    }),
  );
};

const getBackHandler = (
  navigation: NavigationProp<RootStackParamList>,
  fallback: AppRoute,
) => () => {
  if (navigation.canGoBack()) {
    applyTransitionDirection(
      getCurrentAppRoute(navigation),
      getPreviousAppRouteFromStack(navigation),
    );
    navigation.goBack();
    return;
  }

  resetToRoute(navigation, fallback);
};

const screenOptions = {
  headerShown: false,
  animation: "none" as const,
  gestureEnabled: true,
};

const sheetScreenOptions = {
  headerShown: false,
  animation: "none" as const,
  presentation: "transparentModal" as const,
  contentStyle: { backgroundColor: "transparent" },
};

const getCurrentAppRoute = (
  navigation: NavigationProp<RootStackParamList>,
): AppRoute | undefined => {
  const state = navigation.getState();
  const currentName = state.routes[state.index]?.name;

  switch (currentName) {
    case "Dashboard":
      return "dashboard";
    case "Inventory":
    case "AddInventory":
    case "ProductDetail":
      return "inventory";
    case "Sales":
    case "AddSale":
    case "SaleDetail":
      return "sales";
    case "Customers":
    case "AddCustomer":
    case "CustomerDetail":
      return "customers";
    default:
      return undefined;
  }
};

const getPreviousAppRouteFromStack = (
  navigation: NavigationProp<RootStackParamList>,
): AppRoute | undefined => {
  const state = navigation.getState();
  const previousRoute = state.routes[state.index - 1];

  if (!previousRoute) return undefined;

  switch (previousRoute.name) {
    case "Dashboard":
      return "dashboard";
    case "Inventory":
    case "AddInventory":
    case "ProductDetail":
      return "inventory";
    case "Sales":
    case "AddSale":
    case "SaleDetail":
      return "sales";
    case "Customers":
    case "AddCustomer":
    case "CustomerDetail":
      return "customers";
    default:
      return undefined;
  }
};

const applyTransitionDirection = (
  currentRoute: AppRoute | undefined,
  nextRoute: AppRoute | undefined,
) => {
  if (!currentRoute || !nextRoute || currentRoute === nextRoute) {
    setPendingTransitionDirection("none");
    return;
  }

  setPendingTransitionDirection(
    APP_ROUTE_ORDER[nextRoute] > APP_ROUTE_ORDER[currentRoute]
      ? "left-to-right"
      : "right-to-left",
  );
};

type ScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

const DashboardScreen = ({
  navigation,
}: ScreenProps<"Dashboard">) => {
  const { logout, session } = useAuth();
  if (!session) return null;

  const handleTabNavigate = (route: AppRoute) =>
    resetToRoute(navigation, route);

  return (
    <ScreenTransition screenKey="dashboard">
      <DashboardPage
        session={session}
        onOpenAddInventory={() => navigation.navigate("AddInventory")}
        onOpenCustomers={() => navigation.navigate("AddCustomer")}
        onOpenInventory={() => resetToRoute(navigation, "inventory")}
        onOpenSales={() => {
          applyTransitionDirection(getCurrentAppRoute(navigation), "sales");
          navigation.navigate("AddSale");
        }}
        onNavigate={handleTabNavigate}
      />
    </ScreenTransition>
  );
};

const InventoryScreen = ({
  navigation,
}: ScreenProps<"Inventory">) => {
  const handleTabNavigate = (route: AppRoute) =>
    resetToRoute(navigation, route);

  return (
    <ScreenTransition screenKey="inventory">
      <InventoryPage
        onAddInventory={() => {
          setPendingTransitionDirection("none");
          navigation.navigate("AddInventory");
        }}
        onBack={getBackHandler(navigation, "dashboard")}
        onNavigate={handleTabNavigate}
        onOpenProduct={(productId) =>
          navigation.navigate("ProductDetail", { productId })
        }
      />
    </ScreenTransition>
  );
};

const AddInventoryScreen = ({
  navigation,
  route,
}: ScreenProps<"AddInventory">) => {
  const handleTabNavigate = (nextRoute: AppRoute) =>
    resetToRoute(navigation, nextRoute);

  return (
    <ScreenTransition
      screenKey={`addInventory-${route.params?.productId ?? "new"}`}
    >
      <AddInventoryPage
        productId={route.params?.productId}
        onBackToInventory={getBackHandler(navigation, "inventory")}
        onCreated={(productId) => {
          if (productId) {
            navigation.replace("ProductDetail", { productId });
            return;
          }

          navigation.replace("Inventory");
        }}
        onNavigate={handleTabNavigate}
        onRequestClose={getBackHandler(navigation, "inventory")}
        presentation="sheet"
      />
    </ScreenTransition>
  );
};

const ProductDetailScreen = ({
  navigation,
  route,
}: ScreenProps<"ProductDetail">) => {
  const handleTabNavigate = (nextRoute: AppRoute) =>
    resetToRoute(navigation, nextRoute);

  return (
    <ScreenTransition screenKey={`product-${route.params.productId}`}>
      <ProductDetailPage
        productId={route.params.productId}
        onBack={getBackHandler(navigation, "inventory")}
        onEdit={() =>
          navigation.navigate("AddInventory", {
            productId: route.params.productId,
          })
        }
        onNavigate={handleTabNavigate}
      />
    </ScreenTransition>
  );
};

const SalesScreen = ({
  navigation,
}: ScreenProps<"Sales">) => {
  const handleTabNavigate = (route: AppRoute) =>
    resetToRoute(navigation, route);

  return (
    <ScreenTransition screenKey="sales">
      <SalesPage
        onNavigate={handleTabNavigate}
        onOpenAddSale={() => {
          setPendingTransitionDirection("none");
          navigation.navigate("AddSale");
        }}
        onOpenSale={(saleId) => navigation.navigate("SaleDetail", { saleId })}
      />
    </ScreenTransition>
  );
};

const AddSaleScreen = ({
  navigation,
}: ScreenProps<"AddSale">) => {
  const handleTabNavigate = (route: AppRoute) =>
    resetToRoute(navigation, route);

  return (
    <ScreenTransition screenKey="addSale">
      <AddSalePage
        onBack={getBackHandler(navigation, "sales")}
        onCreated={(saleId) => navigation.replace("SaleDetail", { saleId })}
        onNavigate={handleTabNavigate}
      />
    </ScreenTransition>
  );
};

const SaleDetailScreen = ({
  navigation,
  route,
}: ScreenProps<"SaleDetail">) => {
  const handleTabNavigate = (nextRoute: AppRoute) =>
    resetToRoute(navigation, nextRoute);

  return (
    <ScreenTransition screenKey={`sale-${route.params.saleId}`}>
      <SaleDetailPage
        saleId={route.params.saleId}
        onBack={getBackHandler(navigation, "sales")}
        onNavigate={handleTabNavigate}
      />
    </ScreenTransition>
  );
};

const CustomersScreen = ({
  navigation,
}: ScreenProps<"Customers">) => {
  const handleTabNavigate = (route: AppRoute) =>
    resetToRoute(navigation, route);

  return (
    <ScreenTransition screenKey="customers">
      <CustomersPage
        onNavigate={handleTabNavigate}
        onOpenAddCustomer={() => navigation.navigate("AddCustomer")}
        onOpenCustomer={(customerId) =>
          navigation.navigate("CustomerDetail", { customerId })
        }
      />
    </ScreenTransition>
  );
};

const AddCustomerScreen = ({
  navigation,
  route,
}: ScreenProps<"AddCustomer">) => {
  const handleTabNavigate = (nextRoute: AppRoute) =>
    resetToRoute(navigation, nextRoute);

  return (
    <ScreenTransition
      screenKey={`addCustomer-${route.params?.customerId ?? "new"}`}
    >
      <AddCustomerPage
        customerId={route.params?.customerId}
        onBack={getBackHandler(navigation, "customers")}
        onCreated={(customerId) => {
          if (customerId) {
            navigation.replace("CustomerDetail", { customerId });
            return;
          }

          navigation.replace("Customers");
        }}
        onNavigate={handleTabNavigate}
        onRequestClose={getBackHandler(navigation, "customers")}
        presentation="sheet"
      />
    </ScreenTransition>
  );
};

const CustomerDetailScreen = ({
  navigation,
  route,
}: ScreenProps<"CustomerDetail">) => {
  const handleTabNavigate = (nextRoute: AppRoute) =>
    resetToRoute(navigation, nextRoute);

  return (
    <ScreenTransition screenKey={`customer-${route.params.customerId}`}>
      <CustomerDetailPage
        customerId={route.params.customerId}
        onBack={getBackHandler(navigation, "customers")}
        onEdit={() =>
          navigation.navigate("AddCustomer", {
            customerId: route.params.customerId,
          })
        }
        onNavigate={handleTabNavigate}
        onOpenSale={(saleId) => navigation.navigate("SaleDetail", { saleId })}
      />
    </ScreenTransition>
  );
};

const AppNavigator = () => (
  <NavigationContainer linking={linking}>
      <Stack.Navigator initialRouteName="Dashboard" screenOptions={screenOptions}>
      <Stack.Screen component={DashboardScreen} name="Dashboard" />
      <Stack.Screen component={InventoryScreen} name="Inventory" />
      <Stack.Screen
        component={AddInventoryScreen}
        name="AddInventory"
        options={sheetScreenOptions}
      />
      <Stack.Screen component={ProductDetailScreen} name="ProductDetail" />
      <Stack.Screen component={SalesScreen} name="Sales" />
      <Stack.Screen component={AddSaleScreen} name="AddSale" />
      <Stack.Screen component={SaleDetailScreen} name="SaleDetail" />
      <Stack.Screen component={CustomersScreen} name="Customers" />
      <Stack.Screen
        component={AddCustomerScreen}
        name="AddCustomer"
        options={sheetScreenOptions}
      />
      <Stack.Screen component={CustomerDetailScreen} name="CustomerDetail" />
    </Stack.Navigator>
  </NavigationContainer>
);

const AppContent = () => {
  const { session, isReady, logout } = useAuth();

  if (!isReady) return <LoadingPage />;
  if (!session) return <AuthPage />;

  if (session.needsOnboarding) {
    return (
      <ScreenTransition screenKey="onboarding">
        <OnboardingPage session={session} onLogout={logout} />
      </ScreenTransition>
    );
  }

  return <AppNavigator />;
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <BottomSheetModalProvider>
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          </BottomSheetModalProvider>
        </QueryClientProvider>
        <Toast />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
