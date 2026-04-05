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
    img: "https://via.placeholder.com/40",
  },
  {
    id: 2,
    name: "Ayesha Khan",
    email: "ayesha@gmail.com",
    contact: "+91 9876543210",
    totalPayment: "₹8,200",
    due: "₹0",
    orders: 5,
    img: "https://via.placeholder.com/40",
  },
  {
    id: 3,
    name: "Vikram Singh",
    email: "vikram@gmail.com",
    contact: "+91 9876543210",
    totalPayment: "₹15,000",
    due: "₹1,500",
    orders: 12,
    img: "https://via.placeholder.com/40",
  },
  {
    id: 4,
    name: "Priya Patel",
    email: "priya@gmail.com",
    contact: "+91 9876543210",
    totalPayment: "₹5,500",
    due: "₹0",
    orders: 3,
    img: "https://via.placeholder.com/40",
  },
];

const AllCustomer = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter customers based on search term
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="md:ml-72 md:mt-0 mt-12 ml-0 p-3 md:p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      
      {/* Header with Stats and Search */}
      <div className="mb-4 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg md:text-2xl font-bold text-gray-800">
              All Customers
            </h2>
            <p className="text-xs text-gray-500 mt-0.5 md:mt-1">
              Manage and view all customer details
            </p>
          </div>
          
          {/* Quick Stats - Hidden on mobile */}
          <div className="hidden sm:flex gap-3">
            <div className="bg-white/90 backdrop-blur rounded-xl px-3 py-2 shadow-sm">
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-lg font-bold text-gray-800">{filteredCustomers.length}</p>
            </div>
            <div className="bg-white/90 backdrop-blur rounded-xl px-3 py-2 shadow-sm">
              <p className="text-xs text-gray-500">Active</p>
              <p className="text-lg font-bold text-green-600">
                {filteredCustomers.filter(c => c.due === "₹0").length}
              </p>
            </div>
          </div>
        </div>

        {/* Modern Search Bar */}
        <div className="mt-3 md:mt-6">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 md:h-5 md:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-9 md:pl-10 pr-10 md:pr-12 py-2 md:py-3 bg-white/90 backdrop-blur border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="h-3 w-3 md:h-4 md:w-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Search Results Count - Hidden on mobile */}
          {searchTerm && (
            <p className="hidden md:block text-xs text-gray-500 mt-2">
              Found {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {/* Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
        
        {filteredCustomers.map((customer) => {
          const isPaid = customer.due === "₹0";
          const dueAmount = parseInt(customer.due.replace('₹', '')) || 0;
          
          return (
            <div
              key={customer.id}
              className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100"
            >
              
              {/* Card Content */}
              <div className="p-3 md:p-5">
                
                {/* Customer Info Section - Compact on mobile */}
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="relative">
                    <img
                      src={customer.img}
                      alt={customer.name}
                      className="w-8 h-8 md:w-12 md:h-12 rounded-full object-cover ring-2 ring-gray-100 group-hover:ring-blue-100 transition-all"
                    />
                    {!isPaid && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 md:w-3 md:h-3 bg-yellow-400 rounded-full ring-2 ring-white animate-pulse"></span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm md:text-base font-semibold text-gray-800 truncate">
                      {customer.name}
                    </h3>
                    <p className="text-xs text-gray-500 truncate hidden md:block">
                      {customer.email}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {customer.contact}
                    </p>
                  </div>
                  
                  {/* Status Badge - Compact on mobile */}
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] md:text-xs px-1.5 py-0.5 md:px-3 md:py-1 rounded-full font-medium ${
                      isPaid
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    <span className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full ${
                      isPaid ? 'bg-green-500' : 'bg-yellow-500'
                    }`}></span>
                    <span className="hidden md:inline">{isPaid ? "Paid" : "Pending"}</span>
                    <span className="md:hidden">{isPaid ? "Paid" : "Due"}</span>
                  </span>
                </div>

                {/* Stats Grid - Compact on mobile */}
                <div className="grid grid-cols-2 gap-2 mt-3 md:mt-4">
                  
                  {/* Total Payment */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-2 md:p-3">
                    <div className="flex items-center gap-1 mb-0.5 md:mb-1">
                      <svg className="w-2.5 h-2.5 md:w-3 md:h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-[9px] md:text-xs text-gray-500 uppercase tracking-wide">Payment</p>
                    </div>
                    <p className="text-xs md:text-base font-bold text-gray-800">
                      {customer.totalPayment}
                    </p>
                  </div>

                  {/* Due Amount */}
                  <div className={`rounded-lg p-2 md:p-3 ${
                    dueAmount > 0 ? 'bg-red-50' : 'bg-green-50'
                  }`}>
                    <div className="flex items-center gap-1 mb-0.5 md:mb-1">
                      <svg className={`w-2.5 h-2.5 md:w-3 md:h-3 ${
                        dueAmount > 0 ? 'text-red-400' : 'text-green-400'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-[9px] md:text-xs text-gray-500 uppercase tracking-wide">Due</p>
                    </div>
                    <p className={`text-xs md:text-base font-bold ${
                      dueAmount > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {customer.due}
                    </p>
                  </div>
                </div>

                {/* Mobile: Additional compact info row */}
                <div className="mt-3 pt-2 border-t border-gray-100 md:hidden">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-gray-500">{customer.email}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <span className="text-gray-600 font-medium">{customer.orders} orders</span>
                    </div>
                  </div>
                </div>

                {/* Desktop: Full orders section with progress bar */}
                <div className="hidden md:block mt-4">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <p className="text-xs text-blue-600 uppercase tracking-wide font-medium">
                          Total Orders
                        </p>
                      </div>
                      <p className="text-base font-bold text-blue-700">
                        {customer.orders}
                      </p>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-2 w-full bg-blue-100 rounded-full h-1">
                      <div 
                        className="bg-blue-500 h-1 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((customer.orders / 10) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Desktop: Action Button */}
                <div className="hidden md:flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                  <div></div>
                  <button className="text-xs text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-1">
                    View Details
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/80 rounded-full mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No customers found</h3>
          <p className="text-gray-500 text-sm">
            {searchTerm ? `No customers matching "${searchTerm}"` : "Add your first customer to get started"}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear search
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AllCustomer;