import React, { useState } from "react";
import {
  ArrowUpDown,
  Clock3,
  Funnel,
  User,
  UserRoundSearch,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCustomers } from "../hooks/useCustomers";
import PageHeader from "./PageHeader";
import PageLoader from "./loaders/PageLoader";

const avatarPalettes = [
  { bg: "linear-gradient(135deg,#4f46e5,#6366f1)" },
  { bg: "linear-gradient(135deg,#0891b2,#06b6d4)" },
  { bg: "linear-gradient(135deg,#059669,#10b981)" },
  { bg: "linear-gradient(135deg,#d97706,#f59e0b)" },
  { bg: "linear-gradient(135deg,#dc2626,#ef4444)" },
  { bg: "linear-gradient(135deg,#7c3aed,#8b5cf6)" },
];

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const getInitials = (name) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const CustomerCard = ({ customer }) => {
  const navigate = useNavigate();
  const isPaid = customer.due <= 0;
  const dueAmount = Number(customer.due || 0);
  const palette = avatarPalettes[customer.name.length % avatarPalettes.length];

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-blue-100 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-[0_12px_32px_rgba(59,130,246,0.12)]">
      <div
        className="h-[3px] w-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: "linear-gradient(90deg,#3b82f6,#6366f1)" }}
      />

      <div className="p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-[14px] text-base font-bold tracking-wide text-white shadow-md transition-transform duration-200 group-hover:scale-105"
              style={{ background: palette.bg }}
            >
              {getInitials(customer.name)}
            </div>
            <span
              className={`absolute -bottom-0.5 -right-0.5 h-[10px] w-[10px] rounded-full border-2 border-white ${
                isPaid ? "bg-emerald-400" : "bg-amber-400"
              }`}
            />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-[15px] font-bold tracking-tight text-gray-800">
              {customer.name}
            </h3>
            <p className="mt-0.5 truncate text-xs text-gray-400">
              {customer.email || "No email added"}
            </p>
          </div>

          <span
            className={`flex-shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide ${
              isPaid
                ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200"
                : "bg-amber-50 text-amber-600 ring-1 ring-amber-200"
            }`}
          >
            {isPaid ? "Paid" : "Pending"}
          </span>
        </div>

        <div className="mb-4 flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-gray-500">
          <svg
            className="h-3.5 w-3.5 flex-shrink-0 text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
          {customer.mobile}
        </div>

        <div className="mb-4 grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-blue-100 bg-yellow-50 p-3">
            <p className="mb-1 text-[10px] font-medium uppercase tracking-widest text-yellow-400">
              Revenue
            </p>
            <p className="text-sm font-bold text-yellow-700">
              {formatCurrency(customer.totalPayment)}
            </p>
          </div>

          <div
            className={`rounded-xl border p-3 ${
              dueAmount > 0
                ? "border-red-100 bg-red-50"
                : "border-emerald-100 bg-emerald-50"
            }`}
          >
            <p
              className={`mb-1 text-[10px] font-medium uppercase tracking-widest ${
                dueAmount > 0 ? "text-red-400" : "text-emerald-400"
              }`}
            >
              Due
            </p>
            <p
              className={`text-sm font-bold ${
                dueAmount > 0 ? "text-red-600" : "text-emerald-600"
              }`}
            >
              {formatCurrency(customer.due)}
            </p>
          </div>

          <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3">
            <p className="mb-1 text-[10px] font-medium uppercase tracking-widest text-indigo-400">
              Orders
            </p>
            <p className="text-sm font-bold text-indigo-700">
              {customer.orders}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 pt-3.5">
          <span className="text-xs font-semibold text-gray-500">
            Added {formatDate(customer.createdAt)}
          </span>

          <button
            onClick={() => navigate(`/customers/${customer.id}`)}
            className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-600 transition-all duration-200 hover:border-blue-600 hover:bg-blue-600 hover:text-white"
          >
            Profile
          </button>
        </div>
      </div>
    </div>
  );
};

const AllCustomer = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [dueStatus, setDueStatus] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [sortOrder, setSortOrder] = useState("desc");
  const [recentOnly, setRecentOnly] = useState(false);
  const [includeArchived, setIncludeArchived] = useState(false);

  const { customers, pagination, summary, isLoading, error } = useCustomers({
    page,
    limit: 12,
    search: searchTerm,
    dueStatus,
    sortBy,
    sortOrder,
    recentOnly,
    includeArchived,
  });

  // if (isLoading) {
  //   return <PageLoader />;
  // }

  return (
    <div className=" min-h-screen bg-gradient-to-br from-blue-100 to-indigo-50 p-4 md:ml-72 md:mt-0 md:p-8 mt-12">
      <PageHeader
        title="Customers"
        icon={User}
        subtitle="Manage your customers and their transactions"
      />
      <div className="mb-6 flex flex-col gap-4 md:mb-8 xl:flex-row xl:items-start xl:justify-between">
        {/* <div className="flex flex-wrap gap-3">
          {[
            {
              label: "Total",
              value: summary.totalCustomers,
              color: "text-blue-600",
              ring: "border-blue-100",
            },
            {
              label: "Cleared",
              value: summary.clearedCustomers,
              color: "text-emerald-600",
              ring: "border-emerald-100",
            },
            {
              label: "Pending",
              value: summary.pendingCustomers,
              color: "text-amber-500",
              ring: "border-amber-100",
            },
          ].map(({ label, value, color, ring }) => (
            <div
              key={label}
              className={`min-w-[96px] rounded-xl border bg-white px-4 py-2.5 shadow-sm ${ring}`}
            >
              <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400">
                {label}
              </p>
              <p className={`mt-0.5 text-xl font-extrabold ${color}`}>{value}</p>
            </div>
          ))}
        </div> */}
      </div>

      <div className="mb-6 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm md:mb-8 max-w-7xl  mx-auto">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_repeat(4,minmax(0,0.8fr))]">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <UserRoundSearch className="h-4 w-4 text-blue-400" />
            </div>
            <input
              type="text"
              placeholder="Search name, email, or phone"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-blue-100 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-700 transition-all placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <select
            value={dueStatus}
            onChange={(event) => {
              setDueStatus(event.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-blue-100 px-3 py-2.5 text-sm text-gray-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="all">All balances</option>
            <option value="pending">Pending only</option>
            <option value="cleared">Cleared only</option>
            <option value="high_due">High due</option>
          </select>

          <select
            value={sortBy}
            onChange={(event) => {
              setSortBy(event.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-blue-100 px-3 py-2.5 text-sm text-gray-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="recent">Newest first</option>
            <option value="name">Name</option>
            <option value="due">Due amount</option>
            <option value="revenue">Revenue</option>
            <option value="orders">Orders</option>
          </select>

          <button
            onClick={() => {
              setSortOrder((current) => (current === "desc" ? "asc" : "desc"));
              setPage(1);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-100 px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-blue-50"
          >
            <ArrowUpDown className="h-4 w-4" />
            {sortOrder === "desc" ? "Descending" : "Ascending"}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setRecentOnly((current) => !current);
                setPage(1);
              }}
              className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                recentOnly
                  ? "bg-blue-100 text-blue-700"
                  : "border border-blue-100 text-gray-700 hover:bg-blue-50"
              }`}
            >
              <Clock3 className="h-4 w-4" />
              Recent
            </button>

            <button
              onClick={() => {
                setIncludeArchived((current) => !current);
                setPage(1);
              }}
              className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                includeArchived
                  ? "bg-slate-200 text-slate-700"
                  : "border border-blue-100 text-gray-700 hover:bg-blue-50"
              }`}
            >
              <Funnel className="h-4 w-4" />
              Archived
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-7xl mx-auto">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-64 animate-pulse rounded-2xl border border-blue-100 bg-white/70"
            />
          ))}
        </div>
      ) : customers.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-7xl mx-auto">
          {customers.map((customer) => (
            <CustomerCard key={customer.id} customer={customer} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 shadow-sm">
            <UserRoundSearch className="h-6 w-6 text-blue-300" />
          </div>
          <h3 className="mb-2 text-lg font-bold text-gray-700">
            No customers found
          </h3>
          <p className="mb-5 text-sm text-gray-400">
            {searchTerm
              ? `No results for "${searchTerm}"`
              : "Add your first customer to get started"}
          </p>
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                setPage(1);
              }}
              className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-500"
            >
              Clear Search
            </button>
          )}
        </div>
      )}

      {pagination.totalPages > 0 && (
        <div className="mt-6 flex items-center justify-between rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm shadow-sm max-w-7xl mx-auto">
          <p className="text-gray-500">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => setPage((current) => Math.max(current - 1, 1))}
              className="rounded-lg border border-blue-100 px-3 py-1.5 text-gray-600 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() =>
                setPage((current) =>
                  Math.min(current + 1, pagination.totalPages),
                )
              }
              className="rounded-lg border border-blue-100 px-3 py-1.5 text-gray-600 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllCustomer;
