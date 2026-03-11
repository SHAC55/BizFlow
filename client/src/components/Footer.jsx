import React from "react";
import { FaXTwitter, FaInstagram, FaLinkedin } from "react-icons/fa6";
import { NavLink } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="w-full bg-gradient-to-b from-white to-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 md:px-16 py-12">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          {/* Brand with enhanced styling */}
          <div className="space-y-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
              Biz<span className="text-blue-600">Ezy</span>
            </div>
            <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
              Make business management easy with our all-in-one platform
            </p>
          </div>

          {/* Navigation with better spacing and indicators */}
          <div className="flex flex-wrap items-center gap-8">
            {/* <NavLink 
              to="/contact" 
              className={({ isActive }) =>
                `text-sm font-medium transition-all duration-300 relative group ${
                  isActive ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
                }`
              }
            >
              Contact
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
            </NavLink> */}
            <NavLink 
              to="/privacy" 
              className={({ isActive }) =>
                `text-sm font-medium transition-all duration-300 relative group ${
                  isActive ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
                }`
              }
            >
              Privacy & Policy
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
            </NavLink>
            {/* <NavLink 
              to="/terms" 
              className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-all duration-300 relative group"
            >
              Terms
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
            </NavLink> */}
          </div>
        </div>

        {/* Divider with gradient */}
        <div className="my-8 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Copyright with improved styling */}
          <p className="text-sm text-gray-500 order-2 md:order-1">
            © {new Date().getFullYear()} 
            <span className="font-medium text-gray-700 mx-1">BizEzy</span> 
            All rights reserved.
          </p>

          {/* Social Icons with modern design */}
          <div className="flex items-center gap-4 order-1 md:order-2">
            <NavLink
              to="https://x.com/Bizezyapp"
              aria-label="Twitter"
              className="w-10 h-10 bg-gray-100 hover:bg-blue-600 rounded-xl flex items-center justify-center text-gray-600 hover:text-white transition-all duration-300 transform hover:scale-110 hover:rotate-3 shadow-sm hover:shadow-lg"
            >
              <FaXTwitter className="text-lg" />
            </NavLink>
            <NavLink
              to="https://www.instagram.com/bizezyapp/"
              aria-label="Instagram"
              className="w-10 h-10 bg-gray-100 hover:bg-pink-600 rounded-xl flex items-center justify-center text-gray-600 hover:text-white transition-all duration-300 transform hover:scale-110 hover:-rotate-3 shadow-sm hover:shadow-lg"
            >
              <FaInstagram className="text-lg" />
            </NavLink>
            <NavLink
              to="https://www.linkedin.com/company/bizezy/"
              aria-label="LinkedIn"
              className="w-10 h-10 bg-gray-100 hover:bg-blue-700 rounded-xl flex items-center justify-center text-gray-600 hover:text-white transition-all duration-300 transform hover:scale-110 hover:rotate-3 shadow-sm hover:shadow-lg"
            >
              <FaLinkedin className="text-lg" />
            </NavLink>
          </div>
        </div>

        {/* Optional: Small decorative element */}
        {/* <div className="mt-8 text-center md:text-right">
          <span className="text-xs text-gray-400">
            Version 2.0 • Made with ❤️
          </span>
        </div> */}
      </div>
    </footer>
  );
};

export default Footer;