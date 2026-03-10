import React from "react";
import { NavLink } from "react-router-dom";

const LandingHeader = () => {
  return (
    <nav className="w-full bg-white ">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        
        {/* Logo */}
        <h1 className="text-3xl font-bold  cursor-pointer">
          Biz<span className="text-blue-600">Ezy</span>
        </h1>

        {/* Buttons */}
        <div className="flex items-center gap-4">
          <NavLink 
            to="/signin" 
            className="px-4 py-2 text-gray-700 font-medium hover:text-blue-600 transition"
          >
            Login
          </NavLink>

          <NavLink 
            to="/signup" 
            className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
            Sign Up
          </NavLink>
        </div>

      </div>
    </nav>
  );
};

export default LandingHeader;