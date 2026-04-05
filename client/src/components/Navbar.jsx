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
  ChevronRight,
} from "lucide-react";
import { useAuthContext } from "../context/AuthContext";
import { NavLink, useNavigate } from "react-router-dom";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
  { name: "Sales",     icon: TrendingUp,      to: "/sales"     },
  { name: "Inventory", icon: Boxes,           to: "/inventory" },
  { name: "Payments",  icon: CreditCard,      to: "/payments"  },
  { name: "Customers", icon: Users,           to: "/customers" },
];

/* ── Avatar initials helper ── */
const getInitials = (name = "") =>
  name.slice(0, 2).toUpperCase() || "U";

/* ── Single nav link ── */
const NavItem = ({ item, onClick }) => {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.to === "/dashboard"}
      onClick={onClick}
      className={({ isActive }) =>
        `group flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 ${
          isActive
            ? "bg-blue-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.35)]"
            : "text-gray-500 hover:bg-[#f0f5ff] hover:text-blue-600"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span className={`flex-shrink-0 transition-transform duration-200 ${!isActive ? "group-hover:scale-110" : ""}`}>
            <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
          </span>
          <span className="text-[13.5px] font-semibold flex-1 tracking-tight">
            {item.name}
          </span>
          {isActive && (
            <ChevronRight size={14} className="opacity-60" />
          )}
        </>
      )}
    </NavLink>
  );
};

const Navbar = () => {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  /* Lock scroll + blur main content when drawer open */
  useEffect(() => {
    const main = document.getElementById("main-content");
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
      if (main) {
        main.style.filter = "blur(4px)";
        main.style.pointerEvents = "none";
        main.style.userSelect = "none";
        main.style.transition = "filter .25s ease";
      }
    } else {
      document.body.style.overflow = "unset";
      if (main) {
        main.style.filter = "";
        main.style.pointerEvents = "";
        main.style.userSelect = "";
      }
    }
    return () => {
      document.body.style.overflow = "unset";
      if (main) { main.style.filter = ""; main.style.pointerEvents = ""; }
    };
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const closeMobile = () => setIsMobileMenuOpen(false);

  /* ── Shared sidebar content ── */
  const SidebarContent = ({ onClose }) => (
    <div className="flex flex-col h-full">

      {/* Logo */}
      <div className="px-6 pt-7 pb-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
            <span className="text-white text-xs font-black tracking-tight">Bz</span>
          </div>
          <span className="text-[22px] font-extrabold tracking-tight text-gray-900">
            Bize<span className="text-blue-600">zy</span>
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
          >
            <X size={17} />
          </button>
        )}
      </div>

      {/* Section label */}
      <p className="px-5 mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
        Main Menu
      </p>

      {/* Nav links */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem key={item.name} item={item} onClick={onClose} />
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-5 my-3 h-px bg-gray-100" />

      {/* User card */}
      <div className="px-3 pb-5">
        <div className="flex items-center gap-3 bg-[#f5f7ff] border border-[#e8edf7] rounded-xl px-3.5 py-3">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center
                          text-sm font-bold shadow-sm flex-shrink-0">
            {getInitials(user?.username)}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-gray-800 truncate">{user?.username || "User"}</p>
            <p className="text-[11px] text-gray-400 truncate">{user?.email || ""}</p>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ══ Desktop Sidebar ══ */}
      <aside className="hidden md:flex flex-col w-72 h-screen bg-white border-r border-[#e8edf7] fixed z-30 shadow-[1px_0_0_#e8edf7]">
        <SidebarContent />
      </aside>

      {/* ══ Mobile Top Bar ══ */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-[#e8edf7] z-50
                          px-4 h-14 flex items-center justify-between
                          shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shadow">
            <span className="text-white text-[10px] font-black">Bz</span>
          </div>
          <span className="text-lg font-extrabold tracking-tight text-gray-900">
            Bize<span className="text-blue-600">zy</span>
          </span>
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 rounded-xl text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all"
        >
          <Menu size={20} />
        </button>
      </header>

      {/* ══ Mobile Drawer Overlay ══ */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
          isMobileMenuOpen ? "visible" : "invisible pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          onClick={closeMobile}
          className={`absolute inset-0 bg-gray-900/60 backdrop-blur-[2px] transition-opacity duration-300 ${
            isMobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Drawer panel */}
        <div
          className={`absolute left-0 top-0 h-full w-[280px] bg-white shadow-[4px_0_24px_rgba(0,0,0,0.1)]
                      transform transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                      }`}
        >
          <SidebarContent onClose={closeMobile} />
        </div>
      </div>

      {/* Mobile spacer */}
      <div className="md:hidden h-14" />
    </>
  );
};

export default Navbar;