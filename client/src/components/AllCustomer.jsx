import React, { useState } from "react";

const customers = [
  {
    id: 1,
    name: "Rahul Sharma",
    email: "rahul@gmail.com",
    contact: "+91 9876543210",
    totalPayment: "₹12,500",
    due: "₹2,000",
    orders: 8,
  },
  {
    id: 2,
    name: "Ayesha Khan",
    email: "ayesha@gmail.com",
    contact: "+91 9876543210",
    totalPayment: "₹8,200",
    due: "₹0",
    orders: 5,
  },
  {
    id: 3,
    name: "Vikram Singh",
    email: "vikram@gmail.com",
    contact: "+91 9876543210",
    totalPayment: "₹15,000",
    due: "₹1,500",
    orders: 12,
  },
  {
    id: 4,
    name: "Priya Patel",
    email: "priya@gmail.com",
    contact: "+91 9876543210",
    totalPayment: "₹5,500",
    due: "₹0",
    orders: 3,
  },
];

const avatarPalettes = [
  { bg: "linear-gradient(135deg,#4f46e5,#6366f1)" },
  { bg: "linear-gradient(135deg,#0891b2,#06b6d4)" },
  { bg: "linear-gradient(135deg,#059669,#10b981)" },
  { bg: "linear-gradient(135deg,#d97706,#f59e0b)" },
  { bg: "linear-gradient(135deg,#dc2626,#ef4444)" },
  { bg: "linear-gradient(135deg,#7c3aed,#8b5cf6)" },
];

function getInitials(name) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getDueNumber(due) {
  return parseInt(due.replace("₹", "").replace(",", "")) || 0;
}

const CustomerCard = ({ customer }) => {
  const isPaid = customer.due === "₹0";
  const dueAmount = getDueNumber(customer.due);
  const palette = avatarPalettes[(customer.id - 1) % avatarPalettes.length];
  const initials = getInitials(customer.name);

  return (
    <div
      className="group relative bg-white border border-blue-100 rounded-2xl overflow-hidden
                 transition-all duration-300 hover:-translate-y-1
                 hover:shadow-[0_12px_32px_rgba(59,130,246,0.12)] hover:border-blue-300"
    >
      {/* Top accent stripe */}
      <div
        className="h-[3px] w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: "linear-gradient(90deg,#3b82f6,#6366f1)" }}
      />

      <div className="p-5">
        {/* Header Row */}
        <div className="flex items-center gap-3 mb-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div
              className="w-11 h-11 rounded-[14px] flex items-center justify-center
                         text-white text-base font-bold tracking-wide shadow-md
                         transition-transform duration-200 group-hover:scale-105"
              style={{ background: palette.bg }}
            >
              {initials}
            </div>
            {/* Status dot */}
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-[10px] h-[10px] rounded-full border-2 border-white
                          ${isPaid ? "bg-emerald-400" : "bg-amber-400"}`}
            />
          </div>

          {/* Name & Email */}
          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] font-bold text-gray-800 truncate tracking-tight">
              {customer.name}
            </h3>
            <p className="text-xs text-gray-400 truncate mt-0.5">
              {customer.email}
            </p>
          </div>

          {/* Badge */}
          <span
            className={`flex-shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full tracking-wide
                        ${
                          isPaid
                            ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200"
                            : "bg-amber-50 text-amber-600 ring-1 ring-amber-200"
                        }`}
          >
            {isPaid ? "Paid" : "Pending"}
          </span>
        </div>

        {/* Contact */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4 rounded-lg px-3 py-2">
          <svg
            className="w-3.5 h-3.5 text-blue-400 flex-shrink-0"
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
          {customer.contact}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {/* Revenue */}
          <div className="bg-yellow-50 border border-blue-100 rounded-xl p-3">
            <p className="text-[10px] uppercase tracking-widest text-yellow-400 font-medium mb-1">
              Revenue
            </p>
            <p className="text-sm font-bold text-yellow-700">
              {customer.totalPayment}
            </p>
          </div>

          {/* Due */}
          <div
            className={`rounded-xl p-3 border ${dueAmount > 0 ? "bg-red-50 border-red-100" : "bg-emerald-50 border-emerald-100"}`}
          >
            <p
              className={`text-[10px] uppercase tracking-widest font-medium mb-1 ${dueAmount > 0 ? "text-red-400" : "text-emerald-400"}`}
            >
              Due
            </p>
            <p
              className={`text-sm font-bold ${dueAmount > 0 ? "text-red-600" : "text-emerald-600"}`}
            >
              {customer.due}
            </p>
          </div>

          {/* Orders */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3">
            <p className="text-[10px] uppercase tracking-widest text-indigo-400 font-medium mb-1">
              Orders
            </p>
            <p className="text-sm font-bold text-indigo-700">
              {customer.orders}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3.5 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <svg
              className="w-3.5 h-3.5 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <span className="text-gray-700 font-semibold">
              {customer.orders}
            </span>
            <span>orders placed</span>
          </div>

          <button
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 border border-blue-200
                       rounded-lg px-3 py-1.5 bg-white transition-all duration-200
                       hover:bg-blue-600 hover:border-blue-600 hover:text-white"
          >
            Profile
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

const AllCustomer = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const paidCount = filteredCustomers.filter((c) => c.due === "₹0").length;
  const pendingCount = filteredCustomers.length - paidCount;

  return (
    <div className="md:ml-72 md:mt-0 mt-12 ml-0 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-800">
            Customers
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage and track all your customer relationships
          </p>
        </div>

        {/* Stat Chips */}
        <div className="flex gap-3 flex-wrap">
          {[
            {
              label: "Total",
              value: filteredCustomers.length,
              color: "text-blue-600",
              ring: "border-blue-100",
            },
            {
              label: "Cleared",
              value: paidCount,
              color: "text-emerald-600",
              ring: "border-emerald-100",
            },
            {
              label: "Pending",
              value: pendingCount,
              color: "text-amber-500",
              ring: "border-amber-100",
            },
          ].map(({ label, value, color, ring }) => (
            <div
              key={label}
              className={`bg-white border ${ring} rounded-xl px-4 py-2.5 min-w-[80px] shadow-sm`}
            >
              <p className="text-[11px] uppercase tracking-widest text-gray-400 font-medium">
                {label}
              </p>
              <p className={`text-xl font-extrabold mt-0.5 ${color}`}>
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm mb-6 md:mb-8">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <svg
            className="w-4 h-4 text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 bg-white border border-blue-100 rounded-xl shadow-sm
                     text-sm text-gray-700 placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400
                     transition-all duration-200"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Grid */}
      {filteredCustomers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCustomers.map((customer) => (
            <CustomerCard key={customer.id} customer={customer} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div
            className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-2xl
                          flex items-center justify-center mb-5 shadow-sm"
          >
            <svg
              className="w-6 h-6 text-blue-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-700 mb-2">
            No customers found
          </h3>
          <p className="text-sm text-gray-400 mb-5">
            {searchTerm
              ? `No results for "${searchTerm}"`
              : "Add your first customer to get started"}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500
                         transition-colors px-5 py-2 rounded-xl shadow-sm"
            >
              Clear Search
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AllCustomer;
