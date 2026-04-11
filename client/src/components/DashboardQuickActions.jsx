import React from "react";
import { Users, CreditCard, Boxes, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DashboardQuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      name: "Add Inventory",
      icon: Boxes,
      gradient: "from-indigo-500 to-blue-500",
      iconBg: "bg-indigo-500/20",
      iconColor: "text-indigo-300",
      path: "/add-inventory",
      description: "Stock new items",
    },
    {
      name: "Add Customer",
      icon: Users,
      gradient: "from-emerald-500 to-teal-500",
      iconBg: "bg-emerald-500/20",
      iconColor: "text-emerald-300",
      path: "/add-customer",
      description: "Register new client",
    },
    {
      name: "Add Sale",
      icon: CreditCard,
      gradient: "from-amber-500 to-orange-500",
      iconBg: "bg-amber-500/20",
      iconColor: "text-amber-300",
      path: "/add-transaction",
      description: "Record transaction",
    },
  ];

  return (
    <div className="px-4 sm:px-5 lg:mt-6 mt-12 ">
      <div className="relative overflow-hidden bg-gradient-to-br from-neutral-900/95 via-neutral-900 to-neutral-800/95 backdrop-blur-sm rounded-3xl border border-neutral-700/50">
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent pointer-events-none" />

        {/* Responsive container */}
        <div className="relative p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* LEFT */}
          <div className="space-y-2 max-w-full lg:max-w-md">
            <div className="flex items-center gap-2">
              <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-indigo-400 to-purple-400" />
              <p className="text-xs sm:text-sm font-medium tracking-wide text-neutral-400 uppercase">
                Quick Actions
              </p>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
              Add anything instantly
            </h2>

            <p className="text-xs sm:text-sm text-neutral-500">
              Streamline your workflow with one-click access to essential
              operations
            </p>
          </div>

          {/* RIGHT BUTTONS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex gap-3 sm:gap-4 w-full lg:w-auto">
            {actions.map((act, idx) => {
              const Icon = act.icon;

              return (
                <button
                  key={idx}
                  onClick={() => navigate(act.path)}
                  className="group relative overflow-hidden rounded-2xl p-[1px] transition-all duration-300 hover:scale-105 active:scale-95 w-full lg:w-auto"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${act.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md`}
                  />

                  <div className="relative bg-neutral-900 rounded-2xl p-4 min-w-0 sm:min-w-[140px] border border-neutral-700/50 group-hover:border-transparent transition-all duration-300">
                    <div className="flex flex-col items-center gap-3">
                      <div
                        className={`relative ${act.iconBg} p-3 rounded-xl transition-all duration-300 group-hover:scale-110`}
                      >
                        <Icon size={20} className={act.iconColor} />
                      </div>

                      <div className="text-center">
                        <span className="text-sm font-semibold text-white block">
                          {act.name}
                        </span>
                        <span className="text-xs text-neutral-500 group-hover:text-neutral-400 transition-colors duration-300">
                          {act.description}
                        </span>
                      </div>

                      <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                        <ArrowRight size={14} className="text-neutral-400" />
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 rounded-full blur-2xl" />
      </div>
    </div>
  );
};

export default DashboardQuickActions;
