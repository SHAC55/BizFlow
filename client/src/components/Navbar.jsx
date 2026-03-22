import React, { useState } from "react";
import {
  LayoutDashboard,
  TrendingUp,
  Boxes,
  CheckCircle,
  CreditCard,
  Users,
  Truck,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { useAuthContext } from "../context/AuthContext";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "#" },
  { name: "Sales", icon: TrendingUp, href: "#" },
  { name: "Inventory", icon: Boxes, href: "#" },
  { name: "Quality", icon: CheckCircle, href: "#" },
  { name: "Payments", icon: CreditCard, href: "#" },
  { name: "Customers", icon: Users, href: "#" },
  { name: "Shipping", icon: Truck, href: "#" },
];

const Navbar = () => {

  const { user, isLoading } = useAuthContext();

  const [activeItem, setActiveItem] = useState("Dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/*  Desktop Sidebar - Modern Glassmorphism */}
      <div className="hidden md:flex flex-col w-72 h-screen bg-white/80 backdrop-blur-sm border-r border-gray-200/50 shadow-sm">
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              Bizezy
            </h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.name;
            
            return (
              <a
                key={item.name}
                href={item.href}
                onClick={() => setActiveItem(item.name)}
                className={`
                  relative group flex items-center justify-between px-4 py-3 rounded-2xl
                  transition-all duration-200 ease-in-out
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50/50 text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50/80 hover:text-gray-900'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon 
                    size={20} 
                    className={`
                      transition-colors duration-200
                      ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}
                    `} 
                  />
                  <span className={`font-medium ${isActive ? 'text-blue-600' : ''}`}>
                    {item.name}
                  </span>
                </div>
                
                {/* Badge */}
                {item.badge && (
                  <span className={`
                    px-2 py-1 rounded-lg text-xs font-medium
                    ${isActive 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                    }
                  `}>
                    {item.badge}
                  </span>
                )}

                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute left-0 w-1 h-8 bg-gradient-to-b from-blue-600 to-blue-400 rounded-r-full" />
                )}
              </a>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gray-50/50">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white font-semibold">
               {user?.username?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-700">{user?.username}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </div>
        </div>
      </div>

      {/*  Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 z-50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              Bizezy
            </h1>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={() => setIsMobileMenuOpen(false)}>
          <div 
            className="absolute right-0 top-0 bottom-0 w-64 bg-white shadow-xl animate-slide-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <nav className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeItem === item.name;
                  
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={() => {
                        setActiveItem(item.name);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-xl
                        transition-all duration-200
                        ${isActive 
                          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600' 
                          : 'text-gray-600 hover:bg-gray-50'
                        }
                      `}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.name}</span>
                      {item.badge && (
                        <span className="ml-auto px-2 py-1 rounded-lg bg-gray-100 text-xs">
                          {item.badge}
                        </span>
                      )}
                    </a>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/*  Modern Mobile Bottom Navigation */}
      <div className="fixed bottom-4 left-4 right-4 md:hidden">
        <div className="bg-white/90 backdrop-blur-md border border-gray-200/50 rounded-2xl shadow-lg shadow-black/5">
          <div className="flex justify-around items-center py-2 px-1">
            {navItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.name;
              
              return (
                <button
                  key={item.name}
                  onClick={() => setActiveItem(item.name)}
                  className={`
                    flex flex-col items-center py-2 px-3 rounded-xl
                    transition-all duration-200 relative
                    ${isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}
                  `}
                >
                  <Icon 
                    size={20} 
                    className={`
                      transition-transform duration-200
                      ${isActive ? 'scale-110' : ''}
                    `} 
                  />
                  <span className="text-[10px] font-medium mt-1">{item.name}</span>
                  
                  {/* Active Indicator Dot */}
                  {isActive && (
                    <div className="absolute -bottom-1 w-1 h-1 bg-blue-600 rounded-full" />
                  )}

                  {/* Badge for mobile */}
                  {item.badge && !isActive && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] flex items-center justify-center rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;