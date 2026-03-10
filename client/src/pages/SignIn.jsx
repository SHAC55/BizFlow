import React from "react";

const SignIn = () => {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-50 px-6">

      <div className="max-w-lg w-full bg-white shadow-sm rounded-xl p-10 text-center">

        {/* Brand */}
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Biz<span className="text-blue-600">Ezy</span>
        </h1>

        {/* Heading */}
        <h2 className="text-3xl font-bold text-gray-900 mt-4 mb-4">
          Sign In Coming Soon
        </h2>

        {/* Message */}
        <p className="text-gray-600 mb-6">
          BizEzy is currently in development. Sign in will be available
          when the product launches.
        </p>

        <p className="text-gray-500 text-sm mb-8">
          Join the waitlist to get early access and updates.
        </p>

        {/* Button */}
        <a
          href="/"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Back to Home
        </a>

      </div>

    </section>
  );
};

export default SignIn;