import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  Eye,
  Users,
  DollarSign,
  CreditCard,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Clock,
  Package,
  Calendar,
} from "lucide-react";

const Sales = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Dummy data (replace with API later)
  const salesData = Array.from({ length: 45 }, (_, i) => ({
    id: i + 1,
    customerName: `Customer ${i + 1}`,
    customerEmail: `customer${i + 1}@example.com`,
    totalAmount: Math.floor(Math.random() * 10000) + 1000,
    paid: Math.floor(Math.random() * 10000),
    date: `2024-03-${String((i % 28) + 1).padStart(2, '0')}`,
    status: ["paid", "partial", "pending"][Math.floor(Math.random() * 3)],
    products: [
      { name: `Product ${i + 1}`, quantity: Math.floor(Math.random() * 5) + 1, price: Math.floor(Math.random() * 2000) + 500 }
    ],
  }));

  // Filter and search logic
  const filteredSales = salesData.filter((sale) => {
    const matchesSearch = sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || sale.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Pagination
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSales = filteredSales.slice(startIndex, endIndex);

  const getStatusBadge = (status) => {
    switch (status) {
      case "paid":
        return { icon: CheckCircle, text: "Paid", color: "bg-emerald-100 text-emerald-700" };
      case "partial":
        return { icon: Clock, text: "Partial", color: "bg-amber-100 text-amber-700" };
      case "pending":
        return { icon: AlertCircle, text: "Pending", color: "bg-red-100 text-red-700" };
      default:
        return { icon: AlertCircle, text: "Unknown", color: "bg-gray-100 text-gray-700" };
    }
  };

  // Calculate summary statistics
  const totalRevenue = salesData.reduce((sum, sale) => sum + sale.paid, 0);
  const totalOutstanding = salesData.reduce((sum, sale) => sum + (sale.totalAmount - sale.paid), 0);
  const totalSales = salesData.length;

  return (
    <div className="min-h-screen w-full md:ml-72 bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50/20 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Compact Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h1 className="text-xl md:text-2xl font-bold text-slate-800">Sales Overview</h1>
            </div>
            <p className="text-xs text-slate-500 ml-7">{totalSales} total transactions</p>
          </div>
          
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all">
              Export
            </button>
          </div>
        </div>

        {/* Compact Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-1">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <DollarSign className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <span className="text-xs text-slate-400">Revenue</span>
            </div>
            <div className="text-lg font-bold text-slate-800">
              ₹{(totalRevenue / 1000).toFixed(1)}K
            </div>
            <div className="text-xs text-green-600 mt-1">+12.5%</div>
          </div>

          <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-1">
              <div className="p-1.5 bg-amber-100 rounded-lg">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <span className="text-xs text-slate-400">Outstanding</span>
            </div>
            <div className="text-lg font-bold text-slate-800">
              ₹{(totalOutstanding / 1000).toFixed(1)}K
            </div>
            <div className="text-xs text-red-600 mt-1">{Math.round((totalOutstanding / totalRevenue) * 100)}% due</div>
          </div>

          <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-1">
              <div className="p-1.5 bg-purple-100 rounded-lg">
                <Users className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <span className="text-xs text-slate-400">Customers</span>
            </div>
            <div className="text-lg font-bold text-slate-800">
              {new Set(salesData.map(s => s.customerName)).size}
            </div>
            <div className="text-xs text-slate-500 mt-1">unique buyers</div>
          </div>
        </div>

        {/* Compact Search & Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-3 mb-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search customer..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8 pr-6 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white cursor-pointer"
              >
                <option value="all">All</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Compact Sales Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-600">Customer</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-600">Products</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-600">Date</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-600">Amount</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-600">Status</th>
                  <th className="text-center px-4 py-2.5 text-xs font-semibold text-slate-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {currentSales.map((sale) => {
                  const owes = sale.totalAmount - sale.paid;
                  const statusBadge = getStatusBadge(sale.status);
                  const StatusIcon = statusBadge.icon;

                  return (
                    <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Customer */}
                      <td className="px-4 py-2.5">
                        <div>
                          <div className="text-sm font-medium text-slate-800">{sale.customerName}</div>
                          <div className="text-xs text-slate-400">{sale.customerEmail}</div>
                        </div>
                      </td>

                      {/* Products */}
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1">
                          <Package className="w-3 h-3 text-slate-400" />
                          <span className="text-xs text-slate-600">
                            {sale.products[0].quantity} × {sale.products[0].name}
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span className="text-xs text-slate-600">
                            {new Date(sale.date).toLocaleDateString()}
                          </span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-2.5 text-right">
                        <div className="text-sm font-semibold text-slate-800">
                          ₹{sale.totalAmount.toLocaleString()}
                        </div>
                        <div className="text-xs text-green-600">
                          Paid: ₹{sale.paid.toLocaleString()}
                        </div>
                        {owes > 0 && (
                          <div className="text-xs text-red-600">
                            Due: ₹{owes.toLocaleString()}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-2.5 text-right">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${statusBadge.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusBadge.text}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-2.5 text-center">
                        <button
                          onClick={() => navigate(`/sales/${sale.id}`)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {currentSales.length === 0 && (
            <div className="p-8 text-center">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No transactions found</p>
            </div>
          )}

          {/* Compact Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-slate-100 px-4 py-3 flex items-center justify-between bg-slate-50/50">
              <div className="text-xs text-slate-500">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredSales.length)} of {filteredSales.length}
              </div>
              
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 text-slate-600 hover:bg-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-7 h-7 text-xs font-medium rounded-lg transition-colors ${
                          currentPage === pageNum
                            ? "bg-blue-600 text-white"
                            : "text-slate-600 hover:bg-white"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 text-slate-600 hover:bg-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats Footer */}
        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
          <div className="bg-white rounded-lg p-2 shadow-sm border border-slate-100">
            <div className="text-slate-500 mb-1">Collection Rate</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-200 rounded-full h-1.5">
                <div 
                  className="bg-green-600 h-1.5 rounded-full"
                  style={{ width: `${(totalRevenue / (totalRevenue + totalOutstanding)) * 100}%` }}
                />
              </div>
              <span className="font-semibold text-slate-800">
                {Math.round((totalRevenue / (totalRevenue + totalOutstanding)) * 100)}%
              </span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-2 shadow-sm border border-slate-100">
            <div className="text-slate-500 mb-1">Avg. Transaction</div>
            <div className="font-semibold text-slate-800">
              ₹{Math.round((totalRevenue + totalOutstanding) / totalSales).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sales;