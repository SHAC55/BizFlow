import React from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Mail, ArrowLeft } from "lucide-react";
import { useForgotPassword } from "../hooks/useAuth";

const ForgotPassword = () => {
  const { sendResetLink, isLoading, error, isSuccess } = useForgotPassword();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    await sendResetLink(data.email);
  };

  return (
    <section className="min-h-screen w-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-blue-100 bg-white/90 p-8 shadow-xl">
        <Link
          to="/signin"
          className="mb-6 inline-flex items-center gap-2 text-sm text-blue-700 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>

        <h1 className="text-3xl font-bold text-gray-800">Forgot Password</h1>
        <p className="mt-2 text-sm text-gray-500">
          Enter your email address and we&apos;ll send you a password reset
          link.
        </p>

        {error && (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {isSuccess && (
          <div className="mt-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            Password reset email sent. Check your inbox.
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                {...register("email", {
                  required: "Email is required",
                })}
                className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="Enter your email"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 py-3 font-semibold text-white transition hover:from-blue-700 hover:to-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? "Sending..." : "Send reset link"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default ForgotPassword;
