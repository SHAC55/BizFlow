import React from "react";
import { Clock } from "lucide-react";

const PageHeader = ({
  title,
  icon: Icon,
  subtitle = "Overview of your business performance",
  lastUpdated,
  isRefreshing = false,
}) => {
  const formattedLastUpdated = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : null;

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 max-w-7xl mx-auto">
      {/* Left - Icon & Title in one line, Subtitle below */}
      <div>
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5 text-blue-600" />}
          <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        </div>
        {subtitle && <p className="text-sm text-slate-500 mt-1 ">{subtitle}</p>}
      </div>

      {/* Right - Last Updated */}
      {lastUpdated && (
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Clock size={12} />
          <span>
            {isRefreshing
              ? "Updating..."
              : `Last updated ${formattedLastUpdated}`}
          </span>
        </div>
      )}
    </div>
  );
};

export default PageHeader;
