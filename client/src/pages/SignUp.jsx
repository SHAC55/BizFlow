import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { FcGoogle } from "react-icons/fc";
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdBusiness, MdPerson, MdPhone } from "react-icons/md";
import signupImg from "../assets/signup.jpg";
import { NavLink } from "react-router-dom";

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch("password");

  const onSubmit = async (data) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log(data);
    setIsLoading(false);
  };

  const handleGoogleSignUp = () => {
    console.log("Google sign up");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <section className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 overflow-hidden">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-5xl w-full flex flex-col md:flex-row h-[90vh] max-h-[850px]">
        
        {/* FORM SECTION - Left side with scrollable content if needed */}
        <div className="md:w-1/2 p-8 lg:p-10 overflow-y-auto">
          <div className="mb-6">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
              Create Account
            </h1>
            <p className="text-base text-gray-600">
              Join us to streamline your business management
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
            {/* Business Name Field */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                Business Name
              </label>
              <div className="relative">
                <MdBusiness className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  placeholder="Enter your business name"
                  {...register("businessName", { 
                    required: "Business name is required",
                    minLength: {
                      value: 2,
                      message: "Business name must be at least 2 characters"
                    }
                  })}
                  className={`w-full pl-10 pr-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.businessName ? "border-red-500" : "border-gray-300"
                  }`}
                />
              </div>
              {errors.businessName && (
                <p className="text-red-500 text-sm mt-1">{errors.businessName.message}</p>
              )}
            </div>

            {/* Username Field */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                Username
              </label>
              <div className="relative">
                <MdPerson className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  placeholder="Choose a username"
                  {...register("username", { 
                    required: "Username is required",
                    minLength: {
                      value: 3,
                      message: "Username must be at least 3 characters"
                    },
                    pattern: {
                      value: /^[a-zA-Z0-9_]+$/,
                      message: "Username can only contain letters, numbers, and underscores"
                    }
                  })}
                  className={`w-full pl-10 pr-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.username ? "border-red-500" : "border-gray-300"
                  }`}
                />
              </div>
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
              )}
            </div>

            {/* Mobile Number Field */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                Mobile Number
              </label>
              <div className="relative">
                <MdPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  type="tel"
                  placeholder="Enter your mobile number"
                  {...register("mobileNumber", { 
                    required: "Mobile number is required",
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: "Please enter a valid 10-digit mobile number"
                    }
                  })}
                  className={`w-full pl-10 pr-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.mobileNumber ? "border-red-500" : "border-gray-300"
                  }`}
                />
              </div>
              {errors.mobileNumber && (
                <p className="text-red-500 text-sm mt-1">{errors.mobileNumber.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                Password
              </label>
              <div className="relative">
                <MdLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  {...register("password", { 
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters"
                    },
                    pattern: {
                      value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/,
                      message: "Password must contain at least one letter and one number"
                    }
                  })}
                  className={`w-full pl-10 pr-12 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <MdLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  {...register("confirmPassword", { 
                    required: "Please confirm your password",
                    validate: value => value === password || "Passwords do not match"
                  })}
                  className={`w-full pl-10 pr-12 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.confirmPassword ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Terms and Conditions Checkbox */}
            <div>
              <label className="flex items-center space-x-2 mt-5 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("terms", { 
                    required: "You must accept the terms and conditions" 
                  })}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  I accept the{" "}
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-800 font-semibold hover:underline"
                  >
                    Terms and Conditions
                  </button>
                </span>
              </label>
              {errors.terms && (
                <p className="text-red-500 text-sm mt-1">{errors.terms.message}</p>
              )}
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 rounded-lg font-semibold text-base hover:from-blue-700 hover:to-blue-800 transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
                  <span>Creating account...</span>
                </div>
              ) : (
                "Sign Up"
              )}
            </button>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or sign up with</span>
              </div>
            </div>

            {/* Google Sign Up Button */}
            <button
              type="button"
              onClick={handleGoogleSignUp}
              className="w-full flex items-center justify-center space-x-3 bg-white border border-gray-300 text-gray-700 py-3.5 rounded-lg font-medium text-base hover:bg-gray-50 transform hover:scale-[1.02] transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <FcGoogle className="text-2xl" />
              <span>Sign up with Google</span>
            </button>

            {/* Sign In Link */}
            <p className="text-center text-gray-600 text-sm mt-4">
              Already have an account?{" "}
              <NavLink to="/signin" className="text-blue-600 hover:text-blue-800 font-semibold hover:underline">
                Sign In
              </NavLink>
            </p>
          </form>
        </div>

        {/* IMAGE SECTION - Right side */}
        <div className="md:w-1/2 relative overflow-hidden hidden md:block">
          <div className="absolute inset-0 z-10"></div>
          <img
            src={signupImg}
            alt="Business team collaboration"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  );
};

export default SignUp;