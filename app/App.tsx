import "react-native-gesture-handler";
import "./global.css";

import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryClientProvider } from "@tanstack/react-query";
import * as ExpoLinking from "expo-linking";
import {
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

import { MainTabs } from "./src/components/MainTabs";
import { AuthPage } from "./src/pages/AuthPage";
import { AddCustomerPage } from "./src/pages/AddCustomerPage";
import { AddInventoryPage } from "./src/pages/AddInventoryPage";
import { AddSalePage } from "./src/pages/AddSalePage";
import { CustomerDetailPage } from "./src/pages/CustomerDetailPage";
import { LoadingPage } from "./src/pages/LoadingPage";
import { OnboardingPage } from "./src/pages/OnboardingPage";
import { ProductDetailPage } from "./src/pages/ProductDetailPage";
import { SaleDetailPage } from "./src/pages/SaleDetailPage";
import { UserDetailPage } from "./src/pages/UserDetailPage";
import { queryClient } from "./src/lib/query";
import { AuthProvider, useAuth } from "./src/providers/AuthProvider";

import type { RootStackParamList } from "./src/types/navigation";

const Stack = createNativeStackNavigator<RootStackParamList>();

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [ExpoLinking.createURL("/")],
  config: {
    screens: {
      MainTabs: "home",
      AddInventory: "inventory/form/:productId?",
      ProductDetail: "inventory/product/:productId",
      AddSale: "sales/new",
      SaleDetail: "sales/detail/:saleId",
      AddCustomer: "customers/form/:customerId?",
      CustomerDetail: "customers/detail/:customerId",
      UserDetail: "profile",
    },
  },
};

const stackScreenOptions = {
  headerShown: false,
  animation: "slide_from_right" as const,
  gestureEnabled: true,
};

const sheetScreenOptions = {
  headerShown: false,
  animation: "none" as const,
  presentation: "transparentModal" as const,
  contentStyle: { backgroundColor: "transparent" },
};

type ScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

const MainTabsScreen = ({ navigation }: ScreenProps<"MainTabs">) => {
  const { session } = useAuth();
  if (!session) return null;

  return (
    <MainTabs
      session={session}
      onOpenProduct={(productId) => navigation.navigate("ProductDetail", { productId })}
      onOpenSale={(saleId) => navigation.navigate("SaleDetail", { saleId })}
      onOpenCustomer={(customerId) => navigation.navigate("CustomerDetail", { customerId })}
      onOpenAddInventory={() => navigation.navigate("AddInventory")}
      onOpenAddSale={() => navigation.navigate("AddSale")}
      onOpenAddCustomer={() => navigation.navigate("AddCustomer")}
    />
  );
};

const AddInventoryScreen = ({ navigation, route }: ScreenProps<"AddInventory">) => (
  <AddInventoryPage
    productId={route.params?.productId}
    onBackToInventory={() => navigation.goBack()}
    onCreated={(productId) => {
      if (productId) {
        navigation.replace("ProductDetail", { productId });
        return;
      }
      navigation.goBack();
    }}
    onNavigate={() => {}}
    onRequestClose={() => navigation.goBack()}
    presentation="sheet"
  />
);

const ProductDetailScreen = ({ navigation, route }: ScreenProps<"ProductDetail">) => (
  <ProductDetailPage
    productId={route.params.productId}
    onBack={() => navigation.goBack()}
    onEdit={() => navigation.navigate("AddInventory", { productId: route.params.productId })}
    onNavigate={() => {}}
  />
);

const AddSaleScreen = ({ navigation }: ScreenProps<"AddSale">) => (
  <AddSalePage
    onBack={() => navigation.goBack()}
    onCreated={(saleId) => navigation.replace("SaleDetail", { saleId })}
    onNavigate={() => {}}
  />
);

const SaleDetailScreen = ({ navigation, route }: ScreenProps<"SaleDetail">) => (
  <SaleDetailPage
    saleId={route.params.saleId}
    onBack={() => navigation.goBack()}
    onNavigate={() => {}}
  />
);

const AddCustomerScreen = ({ navigation, route }: ScreenProps<"AddCustomer">) => (
  <AddCustomerPage
    customerId={route.params?.customerId}
    onBack={() => navigation.goBack()}
    onCreated={(customerId) => {
      if (customerId) {
        navigation.replace("CustomerDetail", { customerId });
        return;
      }
      navigation.goBack();
    }}
    onNavigate={() => {}}
    onRequestClose={() => navigation.goBack()}
    presentation="sheet"
  />
);

const CustomerDetailScreen = ({ navigation, route }: ScreenProps<"CustomerDetail">) => (
  <CustomerDetailPage
    customerId={route.params.customerId}
    onBack={() => navigation.goBack()}
    onEdit={() => navigation.navigate("AddCustomer", { customerId: route.params.customerId })}
    onNavigate={() => {}}
    onOpenSale={(saleId) => navigation.navigate("SaleDetail", { saleId })}
  />
);

const UserDetailScreen = ({ navigation }: ScreenProps<"UserDetail">) => (
  <UserDetailPage
    onBack={() => navigation.goBack()}
    onNavigate={() => {}}
  />
);

const AppNavigator = () => (
  <NavigationContainer linking={linking}>
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={stackScreenOptions}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabsScreen}
        options={{ animation: "none" }}
      />
      <Stack.Screen name="AddInventory" component={AddInventoryScreen} options={sheetScreenOptions} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="AddSale" component={AddSaleScreen} />
      <Stack.Screen name="SaleDetail" component={SaleDetailScreen} />
      <Stack.Screen name="AddCustomer" component={AddCustomerScreen} options={sheetScreenOptions} />
      <Stack.Screen name="CustomerDetail" component={CustomerDetailScreen} />
      <Stack.Screen name="UserDetail" component={UserDetailScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

const AppContent = () => {
  const { session, isReady, logout } = useAuth();

  if (!isReady) return <LoadingPage />;
  if (!session) return <AuthPage />;

  if (session.needsOnboarding) {
    return <OnboardingPage session={session} onLogout={logout} />;
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
        <Toast position="bottom" bottomOffset={90} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
