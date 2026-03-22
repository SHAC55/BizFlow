import { useState } from "react";
import { useForm } from "react-hook-form";
import { MdBusiness, MdPerson, MdPhone } from "react-icons/md";
import { useOnboarding } from "../hooks/useAuth";
import { useAuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const Onboarding = () => {
  const { user, isLoading } = useAuthContext();
  const {
    completeOnboarding,
    isLoading: isSubmitting,
    error,
  } = useOnboarding();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    completeOnboarding({
      username: data.username,
      phone: data.phone,
      businessName: data.businessName,
    });
  };

  // wait for session check
  if (isLoading) {
    return (
      <div className="min-h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // not logged in at all
  if (!user) return <Navigate to="/signin" replace />;

  // already completed onboarding
  if (user.mobile && user.name && user.business) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <section className="min-h-screen w-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 lg:p-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
            <MdBusiness className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Almost There!
          </h1>
          <p className="text-gray-500">
            Hi <span className="font-semibold text-blue-600">{user.email}</span>
            ! Just a few more details to set up your account.
          </p>
        </div>

        {/* API Error */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Username */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              Username
            </label>
            <div className="relative">
              <MdPerson className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
              <input
                placeholder="Choose a username"
                {...register("username", {
                  required: "Username is required",
                  minLength: {
                    value: 3,
                    message: "Username must be at least 3 characters",
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9_]+$/,
                    message: "Only letters, numbers, and underscores",
                  },
                })}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  errors.username ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              Mobile Number
            </label>
            <div className="relative">
              <MdPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
              <input
                type="tel"
                placeholder="Enter your mobile number"
                {...register("phone", {
                  required: "Mobile number is required",
                  minLength: {
                    value: 7,
                    message: "Please enter a valid mobile number",
                  },
                })}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Business Name */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              Business Name
            </label>
            <div className="relative">
              <MdBusiness className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
              <input
                placeholder="Enter your business name"
                {...register("businessName", {
                  required: "Business name is required",
                  minLength: {
                    value: 2,
                    message: "Business name must be at least 2 characters",
                  },
                })}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  errors.businessName ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>
            {errors.businessName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.businessName.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin" />
                <span>Setting up...</span>
              </div>
            ) : (
              "Complete Setup"
            )}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Onboarding;
