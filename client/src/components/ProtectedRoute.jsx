import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { hasCompletedOnboarding } from "../lib/auth";

const FullPageLoader = () => (
  <div className="min-h-screen w-screen flex items-center justify-center bg-blue-50">
    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

export const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { user, isLoading } = useAuthContext();

  if (isLoading) {
    return <FullPageLoader />;
  }

  if (!user) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  if (!hasCompletedOnboarding(user)) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

export const PublicOnlyRoute = ({ children }) => {
  const { user, isLoading } = useAuthContext();

  if (isLoading) {
    return <FullPageLoader />;
  }

  if (!user) {
    return children;
  }

  return (
    <Navigate
      to={hasCompletedOnboarding(user) ? "/dashboard" : "/onboarding"}
      replace
    />
  );
};

export const OnboardingRoute = ({ children }) => {
  const { user, isLoading } = useAuthContext();

  if (isLoading) {
    return <FullPageLoader />;
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  if (hasCompletedOnboarding(user)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
