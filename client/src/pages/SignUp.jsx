import React from "react";

const SignUp = () => {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-50 px-6">

      <div className="max-w-lg w-full bg-white shadow-sm rounded-xl p-10 text-center">

        {/* Logo / Brand */}
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Biz<span className="text-blue-600">Ezy</span>
        </h1>

        {/* Heading */}
        <h2 className="text-3xl font-bold text-gray-900 mt-4 mb-4">
          You're on the waitlist 🎉
        </h2>

        {/* Message */}
        <p className="text-gray-600 mb-6">
          Thank you for signing up. We're working hard to build BizEzy.
          We'll notify you as soon as the product launches.
        </p>

        <p className="text-gray-500 text-sm mb-8">
          We appreciate your patience.
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

export default SignUp;