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

const App = () => {
  const location = useLocation();

  //  Pages where Navbar should NOT show
  const hideNavbarRoutes = ["/","/signin", "/signup", "/onboarding","/add-item"];

  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <div className="flex min-w-[350px]">
      
      <div className="fixed">
      {!shouldHideNavbar && <Navbar />}
      </div>
      <Toaster position="top-right" />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/add-item" element={<AddItemForm />} />
      </Routes>
    </div>
  );
};

export default App;