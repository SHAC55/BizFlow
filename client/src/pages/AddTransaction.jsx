import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  ShoppingCart,
  User,
  DollarSign,
  Package,
  CreditCard,
  Receipt,
  Users,
  Calculator,
  TrendingUp,
  Loader2,
  CheckCircle,
  AlertCircle,
  Search,
  PlusCircle,
  X,
  Radio,
  Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProducts } from "../hooks/useProducts";
import { useCustomers } from "../hooks/useCustomers";
import { toast } from "react-hot-toast";

const AddTransaction = () => {
  const navigate = useNavigate();

  // Products API
  const { products = [], isLoading: productsLoading } = useProducts({
    page: 1,
    limit: 100,
  });

  // Customer states
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomerData, setSelectedCustomerData] = useState(null);
  const [isCustomCustomer, setIsCustomCustomer] = useState(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("pending");

  // Customers API (Search)
  const { customers = [], isLoading: customersLoading } = useCustomers({
    search: customerSearch,
    page: 1,
    limit: 10,
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const selectedProductId = watch("product");
  const quantity = watch("quantity") || 0;
  const paid = watch("paid") || 0;
  const editablePrice = watch("editablePrice") || 0;

  // Auto set price when product changes
  useEffect(() => {
    const product = products.find(
      (p) => p.id === selectedProductId || p._id === selectedProductId
    );
    if (product && !watch("priceEdited")) {
      setValue("editablePrice", product.price);
      setValue("price", product.price);
    }
  }, [selectedProductId, products, setValue, watch]);

  const price = editablePrice;
  const total = price * quantity;
  const owing = total - paid;
  const isFullyPaid = owing <= 0;

  // Auto-update status based on payment
  useEffect(() => {
    if (total > 0) {
      if (paid >= total) {
        setSelectedStatus("paid");
      } else if (paid > 0 && paid < total) {
        setSelectedStatus("partial");
      } else {
        setSelectedStatus("pending");
      }
    }
  }, [paid, total]);

  // Final customer name
  const customerName = isCustomCustomer 
    ? customerSearch 
    : selectedCustomerData?.name || "";

  const onSubmit = async (data) => {
    const transactionData = {
      productId: selectedProductId,
      productName: products.find(p => p.id === selectedProductId || p._id === selectedProductId)?.name,
      quantity: Number(data.quantity),
      price: Number(price),
      total: total,
      customer: customerName,
      customerId: selectedCustomerData?.id || selectedCustomerData?._id || null,
      paid: Number(data.paid),
      owing: owing > 0 ? owing : 0,
      status: selectedStatus,
      date: new Date().toISOString(),
      notes: data.notes || "",
    };

    console.log("Transaction:", transactionData);
    toast.success("Transaction saved successfully!");
    
    // Here you would call your API
    // await saveTransaction(transactionData);
    
    // Reset form
    reset();
    setCustomerSearch("");
    setSelectedCustomerData(null);
    setIsCustomCustomer(false);
    setSelectedStatus("pending");
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomerData(customer);
    setCustomerSearch(customer.name);
    setIsCustomCustomer(false);
    setShowCustomerDropdown(false);
  };

  const handleCustomCustomer = () => {
    setIsCustomCustomer(true);
    setSelectedCustomerData(null);
    setShowCustomerDropdown(false);
  };

  const clearCustomer = () => {
    setCustomerSearch("");
    setSelectedCustomerData(null);
    setIsCustomCustomer(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "partial":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "pending":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50/20 px-4 py-8">
      <div className="w-full max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <ShoppingCart className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight">
            Add Transaction
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Record a new sale or transaction
          </p>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate("/sales")}
          className="group inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-all mb-5 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm hover:shadow"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Transactions
        </button>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8">
            <div className="space-y-6">
              {/* Product Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Select Product <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Package className="h-5 w-5 text-slate-400" />
                  </div>
                  <select
                    {...register("product", {
                      required: "Please select a product",
                    })}
                    disabled={productsLoading}
                    className={`w-full pl-10 pr-10 py-3 bg-slate-50 border-2 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 transition-all appearance-none cursor-pointer ${
                      errors.product
                        ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                        : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-400"
                    } ${productsLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <option value="">Choose a product</option>
                    {!productsLoading &&
                      products.map((p) => (
                        <option key={p.id || p._id} value={p.id || p._id}>
                          {p.name} - ₹{p.price.toLocaleString()}
                        </option>
                      ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {errors.product && (
                  <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                    {errors.product.message}
                  </p>
                )}
              </div>

              {/* Price & Quantity Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Editable Price */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Price <span className="text-red-500">*</span>
                    <span className="text-xs font-normal text-slate-500 ml-2">(editable)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      {...register("editablePrice", {
                        required: "Price is required",
                        min: {
                          value: 0.01,
                          message: "Price must be greater than 0",
                        },
                      })}
                      onChange={(e) => {
                        setValue("price", Number(e.target.value));
                        setValue("priceEdited", true);
                      }}
                      className={`w-full pl-10 pr-3 py-3 bg-white border-2 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                        errors.editablePrice
                          ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                          : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-400"
                      }`}
                      placeholder="Enter price"
                    />
                  </div>
                  {errors.editablePrice && (
                    <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                      <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                      {errors.editablePrice.message}
                    </p>
                  )}
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Package className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="number"
                      {...register("quantity", {
                        required: "Quantity is required",
                        min: {
                          value: 1,
                          message: "Quantity must be at least 1",
                        },
                      })}
                      className={`w-full pl-10 pr-3 py-3 bg-white border-2 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all appearance-none ${
                        errors.quantity
                          ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                          : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-400"
                      }`}
                      placeholder="Enter quantity"
                    />
                  </div>
                  {errors.quantity && (
                    <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                      <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                      {errors.quantity.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Customer Section */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Customer Information
                </label>
                
                {/* Customer Search Input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Users className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    value={customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value);
                      setSelectedCustomerData(null);
                      setIsCustomCustomer(false);
                      setShowCustomerDropdown(true);
                    }}
                    onFocus={() => setShowCustomerDropdown(true)}
                    placeholder="Search existing customer or enter new name..."
                    className="w-full pl-10 pr-24 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-2">
                    {customerSearch && (
                      <button
                        type="button"
                        onClick={clearCustomer}
                        className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <X className="h-4 w-4 text-slate-400" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleCustomCustomer}
                      className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      Add New
                    </button>
                  </div>
                </div>

                {/* Customer Dropdown */}
                {showCustomerDropdown && customerSearch && !isCustomCustomer && (
                  <div className="absolute z-10 w-full max-w-2xl mt-1 bg-white border-2 border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {customersLoading ? (
                      <div className="flex items-center justify-center gap-2 p-4">
                        <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                        <span className="text-sm text-slate-500">Searching...</span>
                      </div>
                    ) : customers.length > 0 ? (
                      <>
                        {customers.map((customer) => (
                          <div
                            key={customer.id || customer._id}
                            onClick={() => handleCustomerSelect(customer)}
                            className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-slate-100 last:border-0"
                          >
                            <div className="font-medium text-slate-800">{customer.name}</div>
                            {customer.email && (
                              <div className="text-xs text-slate-500 mt-0.5">{customer.email}</div>
                            )}
                            {customer.phone && (
                              <div className="text-xs text-slate-500">{customer.phone}</div>
                            )}
                          </div>
                        ))}
                        <div
                          onClick={handleCustomCustomer}
                          className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors border-t border-slate-200 bg-slate-50"
                        >
                          <div className="flex items-center gap-2 text-blue-600">
                            <PlusCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">Add "{customerSearch}" as new customer</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div
                        onClick={handleCustomCustomer}
                        className="p-4 hover:bg-blue-50 cursor-pointer transition-colors text-center"
                      >
                        <PlusCircle className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                        <div className="text-sm font-medium text-slate-700">Add new customer</div>
                        <div className="text-xs text-slate-500 mt-1">"{customerSearch}"</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Selected Customer Display */}
                {selectedCustomerData && !isCustomCustomer && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">
                          Selected: {selectedCustomerData.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={clearCustomer}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                )}

                {/* Custom Customer Info */}
                {isCustomCustomer && customerSearch && (
                  <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <PlusCircle className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-900">
                          New Customer: {customerSearch}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={clearCustomer}
                        className="text-xs text-purple-600 hover:text-purple-800"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Paid Amount */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Amount Paid <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CreditCard className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    {...register("paid", {
                      required: "Paid amount is required",
                      min: {
                        value: 0,
                        message: "Paid amount cannot be negative",
                      },
                    })}
                    className={`w-full pl-10 pr-3 py-3 bg-white border-2 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all appearance-none ${
                      errors.paid
                        ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                        : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-400"
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {errors.paid && (
                  <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                    {errors.paid.message}
                  </p>
                )}
              </div>

              {/* Status Selection - Radio Buttons */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Payment Status <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Pending Status */}
                  <label
                    className={`relative flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedStatus === "pending"
                        ? "border-red-400 bg-red-50"
                        : "border-slate-200 hover:border-red-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value="pending"
                      checked={selectedStatus === "pending"}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-2 w-full">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedStatus === "pending" 
                          ? "border-red-500 bg-red-500" 
                          : "border-slate-300"
                      }`}>
                        {selectedStatus === "pending" && (
                          <div className="w-2 h-2 rounded-full bg-white m-0.5"></div>
                        )}
                      </div>
                      <AlertCircle className={`w-4 h-4 ${
                        selectedStatus === "pending" ? "text-red-600" : "text-slate-400"
                      }`} />
                      <span className={`text-sm font-medium ${
                        selectedStatus === "pending" ? "text-red-700" : "text-slate-600"
                      }`}>
                        Pending
                      </span>
                    </div>
                  </label>

                  {/* Partial Status */}
                  <label
                    className={`relative flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedStatus === "partial"
                        ? "border-amber-400 bg-amber-50"
                        : "border-slate-200 hover:border-amber-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value="partial"
                      checked={selectedStatus === "partial"}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-2 w-full">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedStatus === "partial" 
                          ? "border-amber-500 bg-amber-500" 
                          : "border-slate-300"
                      }`}>
                        {selectedStatus === "partial" && (
                          <div className="w-2 h-2 rounded-full bg-white m-0.5"></div>
                        )}
                      </div>
                      <Clock className={`w-4 h-4 ${
                        selectedStatus === "partial" ? "text-amber-600" : "text-slate-400"
                      }`} />
                      <span className={`text-sm font-medium ${
                        selectedStatus === "partial" ? "text-amber-700" : "text-slate-600"
                      }`}>
                        Partial
                      </span>
                    </div>
                  </label>

                  {/* Paid Status */}
                  <label
                    className={`relative flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedStatus === "paid"
                        ? "border-emerald-400 bg-emerald-50"
                        : "border-slate-200 hover:border-emerald-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value="paid"
                      checked={selectedStatus === "paid"}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-2 w-full">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedStatus === "paid" 
                          ? "border-emerald-500 bg-emerald-500" 
                          : "border-slate-300"
                      }`}>
                        {selectedStatus === "paid" && (
                          <div className="w-2 h-2 rounded-full bg-white m-0.5"></div>
                        )}
                      </div>
                      <CheckCircle className={`w-4 h-4 ${
                        selectedStatus === "paid" ? "text-emerald-600" : "text-slate-400"
                      }`} />
                      <span className={`text-sm font-medium ${
                        selectedStatus === "paid" ? "text-emerald-700" : "text-slate-600"
                      }`}>
                        Paid
                      </span>
                    </div>
                  </label>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Status is automatically calculated based on payment, but you can manually override
                </p>
              </div>

              {/* Notes (Optional) */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Notes <span className="text-xs font-normal text-slate-500">(optional)</span>
                </label>
                <textarea
                  {...register("notes")}
                  rows={3}
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none"
                  placeholder="Add any additional notes about this transaction..."
                />
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                {/* Total Card */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                  <div className="flex items-center gap-2 text-slate-600 mb-2">
                    <Calculator className="h-5 w-5 text-blue-600" />
                    <span className="text-xs font-bold uppercase tracking-wide text-blue-700">
                      Total Amount
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-slate-800">
                    ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-slate-500 mt-2">
                    {quantity} × ₹{price.toLocaleString()}
                  </div>
                </div>

                {/* Status Card */}
                <div className={`rounded-xl p-5 border ${getStatusColor(selectedStatus)}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {selectedStatus === "paid" && <CheckCircle className="h-5 w-5" />}
                    {selectedStatus === "partial" && <Clock className="h-5 w-5" />}
                    {selectedStatus === "pending" && <AlertCircle className="h-5 w-5" />}
                    <span className="text-xs font-bold uppercase tracking-wide">
                      Payment Status
                    </span>
                  </div>
                  <div className="text-2xl font-bold capitalize">
                    {selectedStatus}
                  </div>
                  <div className="text-xs mt-2 opacity-90">
                    {selectedStatus === "paid" && "Full payment received"}
                    {selectedStatus === "partial" && `Pending: ₹${owing.toLocaleString()}`}
                    {selectedStatus === "pending" && "No payment received yet"}
                  </div>
                </div>
              </div>

              {/* Loading Products */}
              {productsLoading && (
                <div className="flex items-center justify-center gap-3 text-slate-500 py-6">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="text-sm">Loading products...</span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="mt-8 pt-6 border-t-2 border-slate-100">
              <button
                type="submit"
                disabled={isSubmitting || productsLoading || !selectedProductId || !customerName}
                className="w-full px-6 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing Transaction...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Save Transaction
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTransaction;