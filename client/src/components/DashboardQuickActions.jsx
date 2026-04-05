import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import { Users, CreditCard, Boxes } from "lucide-react";
import { prefetchRouteData } from "../lib/prefetchRoutes";
import { useNavigate } from "react-router-dom";

const actions = [
  {
    name: "Add Inventory",
    icon: Boxes,
    color: "bg-blue-100 text-blue-600",
    path: "/add-inventory",
  },
  {
    name: "Add Customer",
    icon: Users,
    color: "bg-green-100 text-green-600",
    path: "/add-customer",
  },
  {
    name: "Add Sale Transaction",
    icon: CreditCard,
    color: "bg-purple-100 text-purple-600",
    path: "/add-transaction",
  },
];

const DashboardQuickActions = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return (
    <div className="mt-4 px-4 md:px-6">
      <h2 className="text-base sm:text-lg font-semibold mb-3 text-gray-700">
        Quick Actions
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;

          return (
            <button
              key={index}
              onClick={() => navigate(action.path)}
              onMouseEnter={() => prefetchRouteData(queryClient, action.path)}
              onFocus={() => prefetchRouteData(queryClient, action.path)}
              className="
                flex items-center gap-2 sm:gap-3 
                p-3 sm:p-4 
                bg-white rounded-xl sm:rounded-2xl 
                shadow-sm hover:shadow-md 
                active:scale-95 sm:hover:scale-[1.02]
                transition-all duration-200
              "
            >
              {/* Icon */}
              <div
                className={`
                  p-2 sm:p-3 rounded-lg sm:rounded-xl 
                  ${action.color} shrink-0
                `}
              >
                <Icon size={18} className="sm:w-5 sm:h-5" />
              </div>

              {/* Text */}
              <span className="
                font-medium text-gray-700 
                text-xs sm:text-sm md:text-base
                truncate
              ">
                {action.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardQuickActions;
