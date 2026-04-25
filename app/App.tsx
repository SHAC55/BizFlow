import "./global.css";
import { useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import { AuthProvider, useAuth } from "./src/providers/AuthProvider";
import { ScreenTransition } from "./src/components/ScreenTransition";

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

import type { AppRoute, AppScreen } from "./src/types/navigation";

const screenKey = (s: AppScreen): string => {
  const params =
    "productId" in s ? s.productId :
    "saleId" in s ? s.saleId :
    "customerId" in s ? (s.customerId ?? "") : "";
  return s.route + params;
};

const AppContent = () => {
  const { session, isReady, logout } = useAuth();

  const [screen, setScreen] = useState<AppScreen>({
    route: "dashboard",
  });

  const navigate = (route: AppRoute) => setScreen({ route });

  if (!isReady) return <LoadingPage />;

  if (session) {
    if (session.needsOnboarding) {
      return (
        <ScreenTransition screenKey="onboarding">
          <OnboardingPage session={session} onLogout={logout} />
        </ScreenTransition>
      );
    }

    if (screen.route === "inventory") {
      return (
        <ScreenTransition screenKey={screenKey(screen)}>
          <InventoryPage
            onAddInventory={() => setScreen({ route: "addInventory" })}
            onBack={() => setScreen({ route: "dashboard" })}
            onNavigate={navigate}
            onOpenProduct={(productId) =>
              setScreen({ route: "productDetail", productId })
            }
          />
        </ScreenTransition>
      );
    }

    if (screen.route === "addInventory") {
      return (
        <ScreenTransition screenKey={screenKey(screen)}>
          <AddInventoryPage
            productId={screen.productId}
            onBackToInventory={() => setScreen({ route: "inventory" })}
            onCreated={(productId) =>
              setScreen(
                productId
                  ? { route: "productDetail", productId }
                  : { route: "inventory" }
              )
            }
            onNavigate={navigate}
          />
        </ScreenTransition>
      );
    }

    if (screen.route === "productDetail") {
      return (
        <ScreenTransition screenKey={screenKey(screen)}>
          <ProductDetailPage
            productId={screen.productId}
            onBack={() => setScreen({ route: "inventory" })}
            onEdit={() =>
              setScreen({
                route: "addInventory",
                productId: screen.productId,
              })
            }
            onNavigate={navigate}
          />
        </ScreenTransition>
      );
    }

    if (screen.route === "sales") {
      return (
        <ScreenTransition screenKey={screenKey(screen)}>
          <SalesPage
            onNavigate={navigate}
            onOpenAddSale={() => setScreen({ route: "addSale" })}
            onOpenSale={(saleId) =>
              setScreen({ route: "saleDetail", saleId })
            }
          />
        </ScreenTransition>
      );
    }

    if (screen.route === "addSale") {
      return (
        <ScreenTransition screenKey={screenKey(screen)}>
          <AddSalePage
            onBack={() => setScreen({ route: "sales" })}
            onCreated={(saleId) =>
              setScreen({ route: "saleDetail", saleId })
            }
            onNavigate={navigate}
          />
        </ScreenTransition>
      );
    }

    if (screen.route === "saleDetail") {
      return (
        <ScreenTransition screenKey={screenKey(screen)}>
          <SaleDetailPage
            saleId={screen.saleId}
            onBack={() => setScreen({ route: "sales" })}
            onNavigate={navigate}
          />
        </ScreenTransition>
      );
    }

    if (screen.route === "customers") {
      return (
        <ScreenTransition screenKey={screenKey(screen)}>
          <CustomersPage
            onNavigate={navigate}
            onOpenAddCustomer={() =>
              setScreen({ route: "addCustomer" })
            }
            onOpenCustomer={(customerId) =>
              setScreen({
                route: "customerDetail",
                customerId,
              })
            }
          />
        </ScreenTransition>
      );
    }

    if (screen.route === "addCustomer") {
      return (
        <ScreenTransition screenKey={screenKey(screen)}>
          <AddCustomerPage
            customerId={screen.customerId}
            onBack={() => setScreen({ route: "customers" })}
            onCreated={(customerId) =>
              setScreen(
                customerId
                  ? { route: "customerDetail", customerId }
                  : { route: "customers" }
              )
            }
            onNavigate={navigate}
          />
        </ScreenTransition>
      );
    }

    if (screen.route === "customerDetail") {
      return (
        <ScreenTransition screenKey={screenKey(screen)}>
          <CustomerDetailPage
            customerId={screen.customerId}
            onBack={() => setScreen({ route: "customers" })}
            onEdit={() =>
              setScreen({
                route: "addCustomer",
                customerId: screen.customerId,
              })
            }
            onNavigate={navigate}
            onOpenSale={(saleId) =>
              setScreen({ route: "saleDetail", saleId })
            }
          />
        </ScreenTransition>
      );
    }

    return (
      <ScreenTransition screenKey="dashboard">
        <DashboardPage
          session={session}
          onLogout={logout}
          onOpenAddInventory={() =>
            setScreen({ route: "addInventory" })
          }
          onOpenCustomers={() =>
            setScreen({ route: "addCustomer" })
          }
          onOpenInventory={() =>
            setScreen({ route: "inventory" })
          }
          onOpenSales={() =>
            setScreen({ route: "addSale" })
          }
          onNavigate={navigate}
        />
      </ScreenTransition>
    );
  }

  return <AuthPage />;
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
      <Toast />
    </SafeAreaProvider>
  );
}
