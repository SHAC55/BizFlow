import React, { useState } from "react";
import { Bell, Search, X } from "lucide-react";

const DashboardHeader = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="flex items-center justify-between px-8 py-4 border-b border-gray-100">
      
      {/* Left Section - Minimal */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Dashboard
          <span className="ml-2 text-sm font-normal text-gray-400">
            / overview
          </span>
        </h1>
      </div>

      {/* Right Section - Minimal */}
      <div className="flex items-center gap-2">
        
        {/* Expandable Search */}
        {isSearchOpen ? (
          <div className="flex items-center bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent outline-none ml-2 text-sm w-48"
              autoFocus
            />
            <button 
              onClick={() => setIsSearchOpen(false)}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Search size={20} />
          </button>
        )}

        {/* Notification */}
        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Avatar */}
        <button className="ml-1 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-300 transition-colors">
          <span className="text-sm font-medium">JD</span>
        </button>

      </div>
    </div>
  );
};

export default DashboardHeader;