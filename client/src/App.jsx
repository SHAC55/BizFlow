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

const App = () => {
  const location = useLocation();

  //  Pages where Navbar should NOT show
  const hideNavbarRoutes = ["/","/signin", "/signup", "/onboarding"];

  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <div className="flex min-w-[350px]">
      {!shouldHideNavbar && <Navbar />}

      <Toaster position="top-right" />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/onboarding" element={<Onboarding />} />
      </Routes>
    </div>
  );
};

export default App;