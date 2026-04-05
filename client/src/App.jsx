import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import { Toaster } from "react-hot-toast";
import Privacy from "./pages/Privacy";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import Navbar from "./components/Navbar";
import Sales from "./pages/Sales";
import Customers from "./pages/Customers";
import Payments from "./pages/Payments";
import Inventory from "./pages/Inventory";
import AddItemForm from "./pages/AddItemForm";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import {
  OnboardingRoute,
  ProtectedRoute,
  PublicOnlyRoute,
} from "./components/ProtectedRoute";
import { Navigate } from "react-router-dom";
import AddCustomer from "./pages/AddCustomer";
import CustomerDetails from "./pages/CustomerDetails";

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
    "/add-customer"
  ];

  const shouldHideNavbar =
    hideNavbarRoutes.includes(location.pathname) ||
    location.pathname.startsWith("/email/verify/");

  return (
    <div className="flex min-w-[350px]">
      
      <div className="fixed">
      {!shouldHideNavbar && <Navbar />}
      </div>
      <Toaster position="top-right" />

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
        <Route
          path="/email/verify/:code"
          element={<VerifyEmail />}
        />
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
      </Routes>
    </div>
  );
};

export default App;
