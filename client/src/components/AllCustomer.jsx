import React, { useState } from "react";
import {
  ArrowUpDown,
  Clock3,
  Funnel,
  User,
  UserRoundSearch,
  Mail,
  Phone,
  ShoppingBag,
  IndianRupee,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCustomers } from "../hooks/useCustomers";
import PageHeader from "./PageHeader";
import PageLoader from "./loaders/PageLoader";

const getInitials = (name) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const CustomerCard = ({ customer }) => {
  const navigate = useNavigate();
  const isPaid = customer.due <= 0;
  const dueAmount = Number(customer.due || 0);
  const initials = getInitials(customer.name);

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:border-gray-400 hover:shadow-xl hover:shadow-gray-200/50">
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-700 via-gray-900 to-black opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="p-6">
        {/* Header Section */}
        <div className="mb-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-gray-800 to-black text-base font-bold tracking-wide text-white shadow-md">
                {initials}
              </div>
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
                  isPaid ? "bg-green-500" : "bg-yellow-500"
                }`}
              />
            </div>

            {/* Name & Email */}
            <div>
              <h3 className="text-base font-bold text-gray-900 line-clamp-1">
                {customer.name}
              </h3>
              <div className="flex items-center gap-1 mt-0.5">
                <Mail className="h-3 w-3 text-gray-400" />
                <p className="text-xs text-gray-500 line-clamp-1">
                  {customer.email || "No email"}
                </p>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <span
            className={`flex-shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide ${
              isPaid
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-yellow-50 text-yellow-700 border border-yellow-200"
            }`}
          >
            {isPaid ? "Paid" : "Pending"}
          </span>
        </div>

        {/* Contact Info */}
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
          <Phone className="h-3.5 w-3.5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            {customer.mobile}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="mb-5 grid grid-cols-3 gap-2">
          {/* Revenue */}
          <div className="rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <IndianRupee className="h-3 w-3 text-gray-600" />
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                Revenue
              </p>
            </div>
            <p className="text-sm font-bold text-gray-900">
              {formatCurrency(customer.totalPayment)}
            </p>
          </div>

          {/* Due */}
          <div
            className={`rounded-lg p-3 text-center ${
              dueAmount > 0
                ? "bg-gradient-to-br from-red-50 to-red-100"
                : "bg-gradient-to-br from-green-50 to-green-100"
            }`}
          >
            <p
              className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${
                dueAmount > 0 ? "text-red-600" : "text-green-600"
              }`}
            >
              Due
            </p>
            <p
              className={`text-sm font-bold ${
                dueAmount > 0 ? "text-red-700" : "text-green-700"
              }`}
            >
              {formatCurrency(customer.due)}
            </p>
          </div>

          {/* Orders */}
          <div className="rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <ShoppingBag className="h-3 w-3 text-gray-600" />
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                Orders
              </p>
            </div>
            <p className="text-sm font-bold text-gray-900">{customer.orders}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-xs text-gray-500">
              Since {formatDate(customer.createdAt)}
            </span>
          </div>

          <button
            onClick={() => navigate(`/customers/${customer.id}`)}
            className="rounded-lg border border-gray-300 px-4 py-1.5 text-xs font-semibold text-gray-700 transition-all duration-200 hover:border-gray-900 hover:bg-gray-900 hover:text-white"
          >
            View Profile
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

  return (
    <div className="min-h-screen bg-gray-50 p-5">
      <div className="">
    

        {/* Filters Section */}
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_repeat(4,minmax(0,0.8fr))]">
            {/* Search */}
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <UserRoundSearch className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search name, email, or phone..."
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>

            {/* Due Status Filter */}
            <select
              value={dueStatus}
              onChange={(event) => {
                setDueStatus(event.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              <option value="all">All balances</option>
              <option value="pending">Pending only</option>
              <option value="cleared">Cleared only</option>
              <option value="high_due">High due</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(event) => {
                setSortBy(event.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              <option value="recent">Newest first</option>
              <option value="name">Name</option>
              <option value="due">Due amount</option>
              <option value="revenue">Revenue</option>
              <option value="orders">Orders</option>
            </select>

            {/* Sort Order */}
            <button
              onClick={() => {
                setSortOrder((current) =>
                  current === "desc" ? "asc" : "desc",
                );
                setPage(1);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50"
            >
              <ArrowUpDown className="h-4 w-4" />
              {sortOrder === "desc" ? "Descending" : "Ascending"}
            </button>

            {/* Toggle Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setRecentOnly((current) => !current);
                  setPage(1);
                }}
                className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-all ${
                  recentOnly
                    ? "bg-gray-900 text-white"
                    : "border border-gray-200 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
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
                className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-all ${
                  includeArchived
                    ? "bg-gray-900 text-white"
                    : "border border-gray-200 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                }`}
              >
                <Funnel className="h-4 w-4" />
                Archived
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-72 animate-pulse rounded-2xl border border-gray-200 bg-white"
              />
            ))}
          </div>
        ) : customers.length > 0 ? (
          <>
            {/* Customers Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {customers.map((customer) => (
                <CustomerCard key={customer.id} customer={customer} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-6 py-4 shadow-sm">
                <p className="text-sm text-gray-600">
                  Page <span className="font-semibold">{pagination.page}</span>{" "}
                  of{" "}
                  <span className="font-semibold">{pagination.totalPages}</span>
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={pagination.page <= 1}
                    onClick={() =>
                      setPage((current) => Math.max(current - 1, 1))
                    }
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
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
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white py-20 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
              <UserRoundSearch className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-gray-900">
              No customers found
            </h3>
            <p className="mb-6 text-sm text-gray-500">
              {searchTerm
                ? `No results found for "${searchTerm}"`
                : "Get started by adding your first customer"}
            </p>
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setPage(1);
                }}
                className="rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-gray-800"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllCustomer;
