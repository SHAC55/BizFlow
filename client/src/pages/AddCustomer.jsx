import React from "react";
import { useForm } from "react-hook-form";
import { User, Phone, Mail, CreditCard, ShoppingBag, ArrowRight, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const AddCustomer = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: {
      name: "",
      contact: "",
      email: "",
      paymentDue: 0,
      totalOrders: 0,
    },
  });

  const navigate = useNavigate();

  const onSubmit = async (data) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Customer Data:", data);
    reset();
    toast.success("Customer added successfully!");
    navigate("/customers");
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-blue-50 px-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white rounded-2xl shadow-sm mb-3">
            <User className="w-7 h-7 text-slate-700" />
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-800 tracking-tight">
            Add New Customer
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Enter customer details to create a new profile
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8">
            <div className="space-y-5">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    {...register("name", { required: "Name is required" })}
                    className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                      errors.name
                        ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500"
                        : "border-slate-200 focus:ring-slate-200 focus:border-slate-300"
                    }`}
                    placeholder="John Doe"
                  />
                </div>
                {errors.name && (
                  <p className="text-rose-500 text-xs mt-1.5 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-rose-500" />
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Contact Field */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Contact Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="tel"
                    {...register("contact", {
                      required: "Contact number is required",
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: "Enter a valid 10-digit number",
                      },
                    })}
                    className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                      errors.contact
                        ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500"
                        : "border-slate-200 focus:ring-slate-200 focus:border-slate-300"
                    }`}
                    placeholder="9876543210"
                  />
                </div>
                {errors.contact && (
                  <p className="text-rose-500 text-xs mt-1.5 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-rose-500" />
                    {errors.contact.message}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/,
                        message: "Enter a valid email address",
                      },
                    })}
                    className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                      errors.email
                        ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500"
                        : "border-slate-200 focus:ring-slate-200 focus:border-slate-300"
                    }`}
                    placeholder="customer@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-rose-500 text-xs mt-1.5 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-rose-500" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Two Column Row for Payment Due & Orders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Payment Due */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Payment Due
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CreditCard className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="number"
                      {...register("paymentDue")}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300 transition-all"
                      placeholder="0"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">Amount pending from customer</p>
                </div>

                {/* Total Orders */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Total Orders
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <ShoppingBag className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="number"
                      {...register("totalOrders")}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300 transition-all"
                      placeholder="0"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">Number of orders placed</p>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="mt-8 pt-5 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => reset()}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    Add Customer
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Hint Text */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Fields marked with <span className="text-rose-500">*</span> are required
        </p>
      </div>
    </div>
  );
};

export default AddCustomer;