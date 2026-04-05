import React, { Suspense, lazy } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import PageLoader from "./components/PageLoader";
import {
  OnboardingRoute,
  ProtectedRoute,
  PublicOnlyRoute,
} from "./components/ProtectedRoute";

const LandingPage = lazy(() => import("./pages/LandingPage"));
const Privacy = lazy(() => import("./pages/Privacy"));
const SignIn = lazy(() => import("./pages/SignIn"));
const SignUp = lazy(() => import("./pages/SignUp"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Sales = lazy(() => import("./pages/Sales"));
const Customers = lazy(() => import("./pages/Customers"));
const Payments = lazy(() => import("./pages/Payments"));
const Inventory = lazy(() => import("./pages/Inventory"));
const AddItemForm = lazy(() => import("./pages/AddItemForm"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const AddCustomer = lazy(() => import("./pages/AddCustomer"));
const CustomerDetails = lazy(() => import("./pages/CustomerDetails"));
const AddTransaction = lazy(() => import("./pages/AddTransaction"));
const SaleDetail = lazy(() => import("./pages/SaleDetail"));

const App = () => {
  const location = useLocation();

  //  Pages where Navbar should NOT show
  const hideNavbarRoutes = [
    "/",
    "/signin",
    "/signup",
    "/onboarding",
    "/add-item",
    "/add-inventory",
    "/login",
    "/forgot-password",
    "/password/reset",
    "/add-customer",
    "/add-transaction",
  ];

  const shouldHideNavbar =
    hideNavbarRoutes.includes(location.pathname) ||
    location.pathname.startsWith("/email/verify/");

  return (
    <div className="flex min-w-[350px]">
      <div className="fixed">{!shouldHideNavbar && <Navbar />}</div>
      <Toaster position="top-right" />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route
            path="/signup"
            element={
              <PublicOnlyRoute>
                <SignUp />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/signin"
            element={
              <PublicOnlyRoute>
                <SignIn />
              </PublicOnlyRoute>
            }
          />
          <Route path="/login" element={<Navigate to="/signin" replace />} />
          <Route
            path="/forgot-password"
            element={
              <PublicOnlyRoute>
                <ForgotPassword />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/password/reset"
            element={
              <PublicOnlyRoute>
                <ResetPassword />
              </PublicOnlyRoute>
            }
          />
          <Route path="/email/verify/:code" element={<VerifyEmail />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/onboarding"
            element={
              <OnboardingRoute>
                <Onboarding />
              </OnboardingRoute>
            }
          />
          <Route
            path="/sales"
            element={
              <ProtectedRoute>
                <Sales />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <Customers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers/:customerId"
            element={
              <ProtectedRoute>
                <CustomerDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payments"
            element={
              <ProtectedRoute>
                <Payments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <Inventory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-inventory"
            element={
              <ProtectedRoute>
                <AddItemForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-item"
            element={<Navigate to="/add-inventory" replace />}
          />
          <Route
            path="/add-customer"
            element={
              <ProtectedRoute>
                <AddCustomer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-transaction"
            element={
              <ProtectedRoute>
                <AddTransaction />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales/:id"
            element={
              <ProtectedRoute>
                <SaleDetail />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </div>
  );
};

export default App;
