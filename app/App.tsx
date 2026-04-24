import "./global.css";
import { useState } from "react";
import { AuthProvider, useAuth } from "./src/providers/AuthProvider";
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

const AppContent = () => {
  const { session, isReady, logout } = useAuth();
  const [screen, setScreen] = useState<AppScreen>({ route: "dashboard" });

  const navigate = (route: AppRoute) => setScreen({ route });

  if (!isReady) {
    return <LoadingPage />;
  }

  if (session) {
    if (session.needsOnboarding) {
      return <OnboardingPage session={session} onLogout={logout} />;
    }

    if (screen.route === "inventory") {
      return (
        <InventoryPage
          onAddInventory={() => setScreen({ route: "addInventory" })}
          onBack={() => setScreen({ route: "dashboard" })}
          onNavigate={navigate}
          onOpenProduct={(productId) => setScreen({ route: "productDetail", productId })}
        />
      );
    }

    if (screen.route === "addInventory") {
      return (
        <AddInventoryPage
          productId={screen.productId}
          onBackToInventory={() => setScreen({ route: "inventory" })}
          onCreated={(productId) =>
            setScreen(
              productId
                ? { route: "productDetail", productId }
                : { route: "inventory" },
            )
          }
          onNavigate={navigate}
        />
      );
    }

    if (screen.route === "productDetail") {
      return (
        <ProductDetailPage
          onBack={() => setScreen({ route: "inventory" })}
          onEdit={() =>
            setScreen({ route: "addInventory", productId: screen.productId })
          }
          onNavigate={navigate}
          productId={screen.productId}
        />
      );
    }

    if (screen.route === "sales") {
      return (
        <SalesPage
          onNavigate={navigate}
          onOpenAddSale={() => setScreen({ route: "addSale" })}
          onOpenSale={(saleId) => setScreen({ route: "saleDetail", saleId })}
        />
      );
    }

    if (screen.route === "addSale") {
      return (
        <AddSalePage
          onBack={() => setScreen({ route: "sales" })}
          onCreated={(saleId) => setScreen({ route: "saleDetail", saleId })}
          onNavigate={navigate}
        />
      );
    }

    if (screen.route === "saleDetail") {
      return (
        <SaleDetailPage
          onBack={() => setScreen({ route: "sales" })}
          onNavigate={navigate}
          saleId={screen.saleId}
        />
      );
    }

    if (screen.route === "customers") {
      return (
        <CustomersPage
          onNavigate={navigate}
          onOpenAddCustomer={() => setScreen({ route: "addCustomer" })}
          onOpenCustomer={(customerId) =>
            setScreen({ route: "customerDetail", customerId })
          }
        />
      );
    }

    if (screen.route === "addCustomer") {
      return (
        <AddCustomerPage
          customerId={screen.customerId}
          onBack={() => setScreen({ route: "customers" })}
          onCreated={(customerId) =>
            setScreen(
              customerId
                ? { route: "customerDetail", customerId }
                : { route: "customers" },
            )
          }
          onNavigate={navigate}
        />
      );
    }

    if (screen.route === "customerDetail") {
      return (
        <CustomerDetailPage
          customerId={screen.customerId}
          onBack={() => setScreen({ route: "customers" })}
          onEdit={() =>
            setScreen({ route: "addCustomer", customerId: screen.customerId })
          }
          onNavigate={navigate}
          onOpenSale={(saleId) => setScreen({ route: "saleDetail", saleId })}
        />
      );
    }

    return (
      <DashboardPage
        session={session}
        onLogout={logout}
        onOpenAddInventory={() => setScreen({ route: "addInventory" })}
        onOpenCustomers={() => setScreen({ route: "addCustomer" })}
        onOpenInventory={() => setScreen({ route: "inventory" })}
        onOpenSales={() => setScreen({ route: "addSale" })}
        onNavigate={navigate}
      />
    );
  }

  return <AuthPage />;
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
