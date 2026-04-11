import React from "react";
import { RefreshCcw, ChevronDown } from "lucide-react";
import { useAuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Header = ({ title, para, onRefresh }) => {

    const{ user } = useAuthContext();

    const  navigate  =  useNavigate()
  return (
    <header className="w-full bg-white/80 backdrop-blur-md border-b border-neutral-100 ">
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Title Section - Responsive */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 truncate">
              {title}
            </h1>
            {para && (
              <p className="text-sm text-neutral-500 truncate">
                {para}
              </p>
            )}
          </div>

          {/* Actions Section */}
          <div className="flex items-center gap-2 flex-shrink-0">
            
            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              className="p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 transition-all duration-200 active:scale-95"
              aria-label="Refresh"
            >
              <RefreshCcw size={18} className="text-neutral-700" />
            </button>

            {/* User Profile - Compact */}
            <button  onClick={()=>navigate("/profile")} className="flex items-center gap-2 pl-2 border-l border-neutral-200">
              <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition">
                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-semibold shadow-sm">
                  {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                </div>
                <div className="hidden md:flex items-center gap-1">
                  <span className="text-sm font-medium text-neutral-700">
                    {user?.name?.split(' ')[0] || "User"}
                  </span>
                  <ChevronDown size={14} className="text-neutral-400" />
                </div>
              </div>
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;