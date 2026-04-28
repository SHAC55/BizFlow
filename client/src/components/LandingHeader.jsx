import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Testimonials", href: "#testimonials" },
];

const LandingHeader = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/90 backdrop-blur-xl border-b border-zinc-200/80 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
            <span className="text-white font-bold text-[12px] tracking-tight">
              BE
            </span>
          </div>
          <span className="text-[16px] font-semibold text-zinc-900 tracking-tight">
            Biz<span className="text-zinc-400 font-medium">Ezy</span>
          </span>
        </NavLink>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="relative px-4 py-2 text-[13px] font-medium text-zinc-500 hover:text-zinc-900 rounded-lg hover:bg-zinc-100 transition-all duration-200"
            >
              {label}
            </a>
          ))}
        </div>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-2">
          <NavLink
            to="/signin"
            className="px-4 py-2 text-[13px] font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-all duration-200"
          >
            Sign In
          </NavLink>
          <NavLink
            to="/signup"
            className="px-4 py-2 bg-zinc-900 text-white text-[13px] font-semibold rounded-lg hover:bg-zinc-700 transition-all duration-200 active:scale-95"
          >
            Get Started Free
          </NavLink>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-zinc-100 px-6 py-5 space-y-1">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="block px-3 py-2.5 text-[14px] font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {label}
            </a>
          ))}

          <div className="pt-4 space-y-2 border-t border-zinc-100 mt-2">
            <NavLink
              to="/signin"
              className="block w-full text-center py-2.5 text-[14px] font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Sign In
            </NavLink>
            <NavLink
              to="/signup"
              className="block w-full text-center py-2.5 bg-zinc-900 text-white text-[14px] font-semibold rounded-lg hover:bg-zinc-700 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Get Started Free
            </NavLink>
          </div>
        </div>
      )}
    </nav>
  );
};

export default LandingHeader;
