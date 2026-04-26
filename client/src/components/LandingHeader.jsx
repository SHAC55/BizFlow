import React from "react";
import { NavLink } from "react-router-dom";

const LandingHeader = () => {
  return (
    <nav className="w-full bg-black">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <h1 className="text-3xl font-bold cursor-pointer text-white">
          Biz<span className="text-gray-400">Ezy</span>
        </h1>

        {/* Buttons */}
        <div className="flex items-center gap-4">
          <NavLink
            to="/signin"
            className="px-4 py-2 text-gray-300 font-medium hover:text-white transition"
          >
            Login
          </NavLink>

          <NavLink
            to="/signup"
            className="px-5 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition"
          >
            Sign Up
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default LandingHeader;