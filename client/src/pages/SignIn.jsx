import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { FcGoogle } from "react-icons/fc";
import {
  MdPerson,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
} from "react-icons/md";
import loginImg from "../assets/login.jpg";
import { NavLink } from "react-router-dom";
import { useLogin } from "../hooks/useAuth";
import { googleAuthURL } from "../api/auth.api";

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    login({ username: data.username, password: data.password });
  };

  const handleGoogleSignIn = () => {
    window.location.href = googleAuthURL();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-5xl w-full flex flex-col md:flex-row transform transition-all duration-500 hover:shadow-3xl">
        {/* IMAGE SECTION */}
        <div className="md:w-1/2 relative overflow-hidden hidden md:block">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <img
            src={loginImg}
            alt="Business dashboard"
            className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-700"
          />
        </div>

        {/* FORM SECTION */}
        <div className="md:w-1/2 p-8 lg:p-12">
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
              Welcome Back!
            </h1>
            <p className="text-gray-600">
              Ready to take control of your business? Sign in to continue.
            </p>
          </div>

          {/* API Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Username Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">
                Username
              </label>
              <div className="relative">
                <MdPerson className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  placeholder="Enter your username"
                  {...register("username", {
                    required: "Username is required",
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

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <NavLink
                  to="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Forgot Password?
                </NavLink>
              </div>
              <div className="relative">
                <MdLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <MdVisibilityOff size={20} />
                  ) : (
                    <MdVisibility size={20} />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...register("rememberMe")}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Remember me</span>
              </label>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center space-x-3 bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transform hover:scale-[1.02] transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <FcGoogle className="text-2xl" />
              <span>Sign in with Google</span>
            </button>

            {/* Create Account Link */}
            <p className="text-center text-gray-600 mt-6">
              Don't have an account?{" "}
              <NavLink
                to="/signup"
                className="text-blue-600 hover:text-blue-800 font-semibold hover:underline"
              >
                Create Account
              </NavLink>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default SignIn;

