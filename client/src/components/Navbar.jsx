import React, { useState } from "react";
import {
  LayoutDashboard,
  TrendingUp,
  Boxes,
  CreditCard,
  Users,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  const links = [
    { to: "/dashboard", icon: LayoutDashboard },
    { to: "/sales", icon: TrendingUp },
    { to: "/inventory", icon: Boxes },
    { to: "/payments", icon: CreditCard },
    { to: "/customers", icon: Users },
  ];

  const Sidebar = () => (
    <nav
      className="
      h-screen
      w-20
      p-4
      bg-gradient-to-b from-neutral-900 to-black
      flex flex-col
      items-center
      py-5
      gap-6
    "
    >
      {/* logo */}
      <div className="w-10 h-10 rounded-2xl bg-[#f1eadf] flex items-center justify-center">
        <span className="text-black font-semibold">Bz</span>
      </div>

      {/* links */}
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

      {/* logout */}
      <div className="mt-auto">
        <button className="p-2.5 text-neutral-500 hover:text-white transition">
          <LogOut size={18} />
        </button>
      </div>
    </nav>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden md:block">
        <Sidebar />
      </aside>

      {/* Mobile Top Bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-neutral-900 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2 text-white">
          <div className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center">
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
        {/* overlay */}
        <div
          className={`absolute inset-0 bg-black/40 transition ${
            open ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setOpen(false)}
        />

        {/* drawer */}
        <div
          className={`absolute left-0 top-0 transition-transform duration-300 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar />
        </div>
      </div>

      {/* mobile spacer */}
      <div className="h-14 md:hidden" />
    </>
  );
};

export default Navbar;