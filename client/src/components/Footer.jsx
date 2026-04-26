import React from "react";
import { FaXTwitter, FaInstagram, FaLinkedin } from "react-icons/fa6";
import { NavLink } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="w-full bg-black border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 md:px-16 py-12">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          {/* Brand with enhanced styling */}
          <div className="space-y-2">
            <div className="text-2xl font-bold text-white">
              Biz<span className="text-gray-400">Ezy</span>
            </div>
            <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
              Make business management easy with our all-in-one platform
            </p>
          </div>

          {/* Navigation with better spacing and indicators */}
          <div className="flex flex-wrap items-center gap-8">
            <NavLink
              to="/privacy"
              className={({ isActive }) =>
                `text-sm font-medium transition-all duration-300 relative group ${
                  isActive
                    ? "text-gray-300"
                    : "text-gray-400 hover:text-gray-300"
                }`
              }
            >
              Privacy & Policy
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-400 transition-all group-hover:w-full"></span>
            </NavLink>
          </div>
        </div>

        {/* Divider with gradient */}
        <div className="my-8 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Copyright with improved styling */}
          <p className="text-sm text-gray-400 order-2 md:order-1">
            © {new Date().getFullYear()}
            <span className="font-medium text-gray-300 mx-1">BizEzy</span>
            All rights reserved.
          </p>

          {/* Social Icons with modern design */}
          <div className="flex items-center gap-4 order-1 md:order-2">
            <NavLink
              to="https://x.com/Bizezyapp"
              aria-label="Twitter"
              className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 transform hover:scale-110 hover:rotate-3 shadow-sm hover:shadow-lg"
            >
              <FaXTwitter className="text-lg" />
            </NavLink>
            <NavLink
              to="https://www.instagram.com/bizezyapp/"
              aria-label="Instagram"
              className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 transform hover:scale-110 hover:-rotate-3 shadow-sm hover:shadow-lg"
            >
              <FaInstagram className="text-lg" />
            </NavLink>
            <NavLink
              to="https://www.linkedin.com/company/bizezy/"
              aria-label="LinkedIn"
              className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 transform hover:scale-110 hover:rotate-3 shadow-sm hover:shadow-lg"
            >
              <FaLinkedin className="text-lg" />
            </NavLink>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
