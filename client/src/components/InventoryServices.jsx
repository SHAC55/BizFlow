import React, { useDeferredValue, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Edit2,
  Search,
  Tag,
  Trash2,
  TrendingUp,
  Wrench,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDeleteService, useServices } from "../hooks/useServices";

const fmt = (v) => `₹${Number(v || 0).toLocaleString("en-IN")}`;

const initialsFor = (name) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");

const InventoryServices = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const deferredSearch = useDeferredValue(search);

  const {
    services = [],
    pagination = {},
    summary = {},
    isLoading,
    error,
    refetch,
  } = useServices({
    page,
    limit: 10,
    search: deferredSearch,
  });

  const { page: currentPage = 1, totalPages = 0 } = pagination;

  const { deleteService, isLoading: isDeleting } = useDeleteService();

  const { totalServices = 0, averagePrice = 0, projectedMargin = 0 } = summary;

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm("Delete this service? This action cannot be undone."))
      return;
    await deleteService(serviceId);
    if (services.length === 1 && page > 1) {
      setPage((p) => p - 1);
      return;
    }
    refetch();
  };

  const STATS = [
    {
      label: "Services",
      value: totalServices,
      icon: Wrench,
      accentBg: "bg-[#EFF6FF]",
      accentText: "text-[#1D4ED8]",
      circleBg: "bg-[#BFDBFE]",
      valueColor: "text-[#1D4ED8]",
    },
    {
      label: "Avg. Price",
      value: fmt(averagePrice),
      icon: Tag,
      accentBg: "bg-[#F5F3FF]",
      accentText: "text-[#6D28D9]",
      circleBg: "bg-[#DDD6FE]",
      valueColor: "text-[#6D28D9]",
    },
    {
      label: "Projected Margin",
      value: fmt(projectedMargin),
      icon: TrendingUp,
      accentBg: projectedMargin >= 0 ? "bg-[#ECFDF5]" : "bg-[#FFF1F2]",
      accentText: projectedMargin >= 0 ? "text-[#065F46]" : "text-[#BE123C]",
      circleBg: projectedMargin >= 0 ? "bg-[#A7F3D0]" : "bg-[#FECDD3]",
      valueColor: projectedMargin >= 0 ? "text-[#065F46]" : "text-[#BE123C]",
    },
  ];

  return (
    <div className="bg-white text-black w-full">
      <div className="px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-7">
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`relative overflow-hidden rounded-2xl p-4 border border-black/8 ${stat.accentBg}`}
              >
                <div
                  className={`absolute top-0 right-0 w-14 h-14 rounded-full ${stat.circleBg} opacity-60 translate-x-3 -translate-y-3`}
                />
                <div className="relative">
                  <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm mb-2">
                    <Icon className={`w-3.5 h-3.5 ${stat.accentText}`} />
                  </div>
                  <p
                    className={`text-lg font-bold leading-tight ${stat.valueColor || "text-black"}`}
                  >
                    {stat.value}
                  </p>
                  <p
                    className={`text-[11px] font-medium mt-0.5 ${stat.accentText}`}
                  >
                    {stat.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Table Card */}
        <div className="border border-black/8 rounded-2xl overflow-hidden bg-white">
          {/* Toolbar */}
          <div className="px-4 py-3.5 border-b border-black/5 flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search name or code…"
                className="w-full pl-9 pr-8 py-2 rounded-xl border border-black/10 bg-white text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black/25 focus:ring-2 focus:ring-black/5 transition-all"
              />
              {search && (
                <button
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-black/25 hover:text-black/50 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="px-5 py-3 text-sm text-[#BE123C] bg-[#FFF1F2] border-b border-[#FECDD3]">
              {error}
            </div>
          )}

          {/* Table (desktop) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-black text-white">
                  {[
                    "Service",
                    "Code",
                    "Cost",
                    "Selling",
                    "Margin",
                    "Actions",
                  ].map((h, i) => (
                    <th
                      key={h}
                      className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-widest whitespace-nowrap ${
                        i >= 2 ? "text-right" : "text-left"
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="py-14 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-7 h-7 rounded-full border-2 border-black/10 border-t-black/50 animate-spin" />
                        <span className="text-xs text-black/30">
                          Loading services…
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : services.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-16 text-center">
                      <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center mx-auto mb-3">
                        <Wrench className="w-5 h-5 text-black/20" />
                      </div>
                      <p className="text-sm text-black/40">No services yet</p>
                      <p className="text-xs text-black/25 mt-1">
                        Add your first service to start selling
                      </p>
                    </td>
                  </tr>
                ) : (
                  services.map((service) => {
                    const margin = service.price - (service.costPrice || 0);
                    return (
                      <tr
                        key={service.id}
                        className="hover:bg-black/[0.015] transition-colors duration-100 group"
                      >
                        {/* Service */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                              {initialsFor(service.name)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-black">
                                {service.name}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Code */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-xs font-mono text-black/40">
                            {service.code || "—"}
                          </span>
                        </td>

                        {/* Cost */}
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <span className="text-sm text-black/60">
                            ₹{service.costPrice || 0}
                          </span>
                        </td>

                        {/* Selling */}
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <span className="text-sm font-semibold text-black">
                            ₹{service.price}
                          </span>
                        </td>

                        {/* Margin */}
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <span
                            className={`text-sm font-semibold ${margin >= 0 ? "text-[#15803D]" : "text-[#BE123C]"}`}
                          >
                            ₹{margin}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() =>
                                navigate(`/add-service?serviceId=${service.id}`)
                              }
                              className="p-1.5 rounded-lg text-black/25 hover:text-black hover:bg-black/5 transition-all"
                              title="Edit service"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteService(service.id)}
                              disabled={isDeleting}
                              className="p-1.5 rounded-lg text-black/25 hover:text-[#BE123C] hover:bg-[#FFF1F2] transition-all disabled:opacity-30"
                              title="Delete service"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-black/5">
            {isLoading ? (
              <div className="flex flex-col items-center gap-3 py-12">
                <div className="w-7 h-7 rounded-full border-2 border-black/10 border-t-black/50 animate-spin" />
                <span className="text-xs text-black/30">Loading…</span>
              </div>
            ) : services.length === 0 ? (
              <div className="py-14 text-center px-4">
                <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center mx-auto mb-3">
                  <Wrench className="w-5 h-5 text-black/20" />
                </div>
                <p className="text-sm text-black/40">No services yet</p>
              </div>
            ) : (
              services.map((service) => {
                const margin = service.price - (service.costPrice || 0);
                return (
                  <div
                    key={service.id}
                    className="p-4 hover:bg-black/[0.015] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                          {initialsFor(service.name)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-black leading-tight">
                            {service.name}
                          </p>
                          {service.code && (
                            <p className="text-[11px] font-mono text-black/30 mt-0.5">
                              {service.code}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="bg-black/[0.02] rounded-xl p-2.5">
                        <p className="text-[10px] text-black/35 uppercase tracking-wide">
                          Selling
                        </p>
                        <p className="text-sm font-bold text-black mt-0.5">
                          ₹{service.price}
                        </p>
                      </div>
                      <div className="bg-black/[0.02] rounded-xl p-2.5">
                        <p className="text-[10px] text-black/35 uppercase tracking-wide">
                          Cost
                        </p>
                        <p className="text-sm font-bold text-black/60 mt-0.5">
                          ₹{service.costPrice || 0}
                        </p>
                      </div>
                      <div className="bg-black/[0.02] rounded-xl p-2.5">
                        <p className="text-[10px] text-black/35 uppercase tracking-wide">
                          Margin
                        </p>
                        <p
                          className={`text-sm font-bold mt-0.5 ${margin >= 0 ? "text-[#15803D]" : "text-[#BE123C]"}`}
                        >
                          ₹{margin}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            navigate(`/add-service?serviceId=${service.id}`)
                          }
                          className="p-1.5 rounded-lg text-black/25 hover:text-black hover:bg-black/5 transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteService(service.id)}
                          disabled={isDeleting}
                          className="p-1.5 rounded-lg text-black/25 hover:text-[#BE123C] hover:bg-[#FFF1F2] transition-all disabled:opacity-30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-black/5 bg-black/[0.01]">
              <p className="text-xs text-black/35">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-black/10 bg-white text-xs text-black/50 hover:text-black hover:border-black/20 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Prev
                </button>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() =>
                    setPage((p) => Math.min(p + 1, totalPages))
                  }
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-black/10 bg-white text-xs text-black/50 hover:text-black hover:border-black/20 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryServices;
