import React, { useState } from "react";
import {
  LayoutDashboard,
  TrendingUp,
  Boxes,
  CreditCard,
  Users,
  LogOut,
  Menu,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useLogout } from "../hooks/useAuth";

const LogoutConfirmModal = ({ onConfirm, onCancel, isLoading }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
    {/* Backdrop */}
    <div
      className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      onClick={onCancel}
    />

    {/* Modal */}
    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200">
      {/* Icon */}
      <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center mx-auto mb-4">
        <LogOut size={20} className="text-white" />
      </div>

      {/* Text */}
      <h2 className="text-base font-bold text-black text-center">
        Log out?
      </h2>
      <p className="text-sm text-black/40 text-center mt-1.5 leading-relaxed">
        You'll need to sign in again to access your dashboard.
      </p>

      {/* Divider */}
      <div className="border-t border-black/8 my-5" />

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 py-2.5 rounded-xl border border-black/10 text-sm font-medium text-black/60 hover:bg-black/[0.03] hover:text-black active:scale-[0.98] transition-all disabled:opacity-40"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="flex-1 py-2.5 rounded-xl bg-black text-white text-sm font-medium hover:bg-black/80 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Logging out…
            </>
          ) : (
            "Log out"
          )}
        </button>
      </div>
    </div>
  </div>
);

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { logout, isLoading: isLoggingOut } = useLogout();

  const links = [
    { to: "/dashboard", icon: LayoutDashboard },
    { to: "/sales", icon: TrendingUp },
    { to: "/inventory", icon: Boxes },
    { to: "/payments", icon: CreditCard },
    { to: "/customers", icon: Users },
  ];

  const handleLogoutConfirm = async () => {
    await logout();
    setShowLogoutModal(false);
  };

  const Sidebar = () => (
    <nav className="h-screen w-20 p-4 bg-gradient-to-b from-neutral-900 to-black flex flex-col items-center py-5 gap-6">
      {/* Logo */}
      <div className="w-10 h-10 rounded-2xl bg-[#f1eadf] flex items-center justify-center">
        <span className="text-black font-semibold">Bz</span>
      </div>

      {/* Links */}
      <div className="flex flex-col items-center gap-5 mt-2">
        {links.map((item, i) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={i}
              to={item.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `p-2.5 rounded-xl transition ${
                  isActive
                    ? "bg-white text-black"
                    : "text-neutral-500 hover:text-white"
                }`
              }
            >
              <Icon size={18} />
            </NavLink>
          );
        })}
      </div>

      {/* Logout */}
      <div className="mt-auto">
        <button
          onClick={() => setShowLogoutModal(true)}
          className="p-2.5 text-neutral-500 hover:text-white transition"
        >
          <LogOut size={18} />
        </button>
      </div>
    </nav>
  );

  return (
    <>
      {/* Logout Modal */}
      {showLogoutModal && (
        <LogoutConfirmModal
          onConfirm={handleLogoutConfirm}
          onCancel={() => setShowLogoutModal(false)}
          isLoading={isLoggingOut}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden md:block">
        <Sidebar />
      </aside>

      {/* Mobile Top Bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-neutral-900 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2 text-white">
          <div className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center font-semibold text-sm">
            Bz
          </div>
          <span className="font-semibold">Bizezy</span>
        </div>
        <button onClick={() => setOpen(true)} className="text-white">
          <Menu size={22} />
        </button>
      </header>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition ${
          open ? "visible" : "invisible"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/40 transition ${
            open ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setOpen(false)}
        />
        <div
          className={`absolute left-0 top-0 transition-transform duration-300 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar />
        </div>
      </div>

      {/* Mobile spacer */}
      <div className="h-14 md:hidden" />
    </>
  );
};

export default Navbar;