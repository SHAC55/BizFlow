import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  TrendingUp,
  Boxes,
  CreditCard,
  Users,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useAuthContext } from "../context/AuthContext";
import { NavLink, useNavigate } from "react-router-dom";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
  { name: "Sales", icon: TrendingUp, to: "/sales" },
  { name: "Inventory", icon: Boxes, to: "/inventory" },
  { name: "Payments", icon: CreditCard, to: "/payments" },
  { name: "Customers", icon: Users, to: "/customers" },
];

const Navbar = () => {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Prevent scroll when menu open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "unset";
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const NavItem = ({ item, mobile }) => {
    const Icon = item.icon;

    return (
      <NavLink
        to={item.to}
        end={item.to === "/dashboard"} // fix partial matching
        onClick={() => setIsMobileMenuOpen(false)}
        className={({ isActive }) =>
          `
          flex items-center gap-3 px-4 py-3 rounded-xl transition-all
          ${
            isActive
              ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600"
              : "text-gray-600 hover:bg-gray-50"
          }
        `
        }
      >
        <Icon size={20} />
        <span className="font-medium flex-1">{item.name}</span>
      </NavLink>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-72 h-screen bg-white border-r fixed z-30">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-blue-600">Bizezy</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </nav>

        {/* User */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 text-white rounded-xl flex items-center justify-center">
              {user?.username?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">{user?.username}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <button onClick={handleLogout}>
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b z-50 px-4 py-3 flex justify-between">
        <h1 className="font-bold text-lg text-blue-600">Bizezy</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-40  md:hidden transition ${
          isMobileMenuOpen ? "visible" : "invisible"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Drawer */}
        <div
          className={`absolute left-0 top-0 h-full w-72 bg-white shadow transform transition-transform ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-6 border-b flex justify-between">
            <h1 className="font-bold text-xl text-blue-600">Bizezy</h1>
            <X onClick={() => setIsMobileMenuOpen(false)} />
          </div>

          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <NavItem key={item.name} item={item} mobile />
            ))}
          </nav>

          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-500"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="md:hidden h-16" />
    </>
  );
};

export default Navbar;