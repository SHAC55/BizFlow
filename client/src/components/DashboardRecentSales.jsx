import React from "react";
import {
  Calendar,
  CreditCard,
  ReceiptText,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });

const STATUS_CONFIG = {
  paid: {
    label: "Paid",
    dot: "bg-[#16A34A]",
    badge: "bg-[#F0FDF4] text-[#15803D]",
  },
  partial: {
    label: "Partial",
    dot: "bg-[#B45309]",
    badge: "bg-[#FFFBEB] text-[#B45309]",
  },
  pending: {
    label: "Pending",
    dot: "bg-[#BE123C]",
    badge: "bg-[#FFF1F2] text-[#BE123C]",
  },
};

const getStatus = (status) => STATUS_CONFIG[status] || STATUS_CONFIG.pending;

const DashboardRecentSales = ({ sales, isLoading, error }) => {
  const navigate = useNavigate();
  const recent = sales?.slice(0, 5) || [];

  return (
    <div className="mt-6 px-4 md:px-6">
      <div className="rounded-2xl border border-black/8 bg-white overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/5">
          <div>
            <h2 className="text-sm font-semibold text-black">Recent Sales</h2>
            <p className="text-xs text-black/40 mt-0.5">Latest transactions</p>
          </div>
          <button
            onClick={() => navigate("/sales")}
            className="group flex items-center gap-1 text-xs font-medium text-black/50 hover:text-black transition-colors"
          >
            View all
            <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* States */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-black/10 border-t-black/50 animate-spin" />
            <p className="text-xs text-black/30">Loading…</p>
          </div>
        ) : error ? (
          <div className="py-10 text-center px-4">
            <p className="text-sm text-[#BE123C]">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-xs text-black/40 underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        ) : recent.length === 0 ? (
          <div className="py-14 text-center px-4">
            <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center mx-auto mb-3">
              <ReceiptText className="h-4 w-4 text-black/25" />
            </div>
            <p className="text-sm text-black/40">No sales yet</p>
            <button
              onClick={() => navigate("/add-transaction")}
              className="mt-3 text-xs font-medium text-black underline underline-offset-2"
            >
              Add your first sale
            </button>
          </div>
        ) : (
          <div className="divide-y divide-black/5">
            {recent.map((sale) => {
              const cfg = getStatus(sale.status);
              const paidPct =
                sale.totalAmount > 0
                  ? Math.round((sale.paidAmount / sale.totalAmount) * 100)
                  : 0;

              return (
                <button
                  key={sale.id}
                  onClick={() => navigate(`/sales/${sale.id}`)}
                  className="w-full text-left px-5 py-4 hover:bg-black/[0.02] transition-colors duration-100 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Left: avatar + info */}
                    <div className="flex items-start gap-3 min-w-0">
                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 mt-0.5">
                        {sale.customer.name.charAt(0).toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        {/* Name + badge */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-black leading-tight">
                            {sale.customer.name}
                          </p>
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${cfg.badge}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                            {cfg.label}
                          </span>
                        </div>

                        {/* Items */}
                        <p className="text-xs text-black/40 mt-0.5 truncate max-w-[220px]">
                          {sale.items
                            .slice(0, 2)
                            .map((i) => `${i.quantity}× ${i.product.name}`)
                            .join(" · ")}
                          {sale.items.length > 2 &&
                            ` · +${sale.items.length - 2} more`}
                        </p>

                        {/* Date */}
                        <p className="text-[11px] text-black/30 mt-1">
                          {formatDate(sale.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Right: amounts */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-black">
                        {formatCurrency(sale.totalAmount)}
                      </p>
                      {sale.dueAmount > 0 ? (
                        <p className="text-[11px] text-[#B45309] mt-0.5">
                          Due {formatCurrency(sale.dueAmount)}
                        </p>
                      ) : (
                        <p className="text-[11px] text-[#15803D] mt-0.5">
                          Fully paid
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Progress bar for partial
                  {sale.status === "partial" && (
                    <div className="mt-3 ml-12">
                      <div className="flex justify-between text-[10px] text-black/30 mb-1">
                        <span>Payment progress</span>
                        <span>{paidPct}%</span>
                      </div>
                      <div className="h-1 bg-black/8 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#B45309] rounded-full transition-all duration-500"
                          style={{ width: `${paidPct}%` }}
                        />
                      </div>
                    </div>
                  )} */}
                </button>
              );
            })}
          </div>
        )}

        {/* Footer — total count hint */}
        {!isLoading && !error && sales?.length > 5 && (
          <div className="px-5 py-3 border-t border-black/5 bg-black/[0.01]">
            <button
              onClick={() => navigate("/sales")}
              className="text-xs text-black/40 hover:text-black transition-colors w-full text-center"
            >
              +{sales.length - 5} more transactions — view all
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardRecentSales;