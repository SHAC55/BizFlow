import React from "react";

const Pricing = () => {
  return (
    <section className="min-h-screen bg-black text-white px-6 py-16">
      <div className="max-w-6xl mx-auto text-center">
        <p className="text-sm uppercase tracking-widest text-gray-400 mb-3">
          Pricing Plans
        </p>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Simple Pricing for Every Business
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto mb-14">
          Start free, upgrade anytime. Launch offer available for early users.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-left hover:border-white/20 transition">
            <h2 className="text-2xl font-semibold mb-2">Free Plan</h2>
            <p className="text-gray-400 mb-6">
              Perfect for individuals & small startups.
            </p>

            <div className="mb-6">
              <span className="text-5xl font-bold">₹0</span>
              <span className="text-gray-400"> /month</span>
            </div>

            <ul className="space-y-4 text-gray-300 mb-8">
              <li>✔ Basic Dashboard Access</li>
              <li>✔ Inventory Management</li>
              <li>✔ Customer Management</li>
              <li>✔ Sales Tracking</li>
              <li>✔ Limited Reports</li>
            </ul>

            <button className="w-full py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-200 transition">
              Get Started Free
            </button>
          </div>

          {/* Premium Plan */}
          <div className="bg-gradient-to-b from-white to-gray-100 text-black rounded-3xl p-8 text-left relative shadow-2xl scale-105">
            <span className="absolute top-5 right-5 bg-black text-white text-xs px-3 py-1 rounded-full">
              Launch Offer
            </span>

            <h2 className="text-2xl font-semibold mb-2">Premium Plan</h2>
            <p className="text-gray-600 mb-6">
              Best for growing businesses that need everything.
            </p>

            <div className="mb-2 flex items-end gap-3">
              <span className="text-gray-400 line-through text-2xl">
                ₹99/mo
              </span>
              <span className="text-5xl font-bold">₹49</span>
              <span className="text-gray-600 mb-2">/month</span>
            </div>

            <p className="text-green-600 font-medium mb-6">
              Free for first 2 months, then ₹49/month
            </p>

            <ul className="space-y-4 text-gray-700 mb-8">
              <li>✔ All Free Plan Features</li>
              <li>✔ Unlimited Products</li>
              <li>✔ Unlimited Customers</li>
              {/* <li>✔ Advanced Analytics</li> */}
              <li>✔ Invoice Generation</li>
              <li>✔ Due Reminder </li>
              {/* <li>✔ Priority Support</li> */}
            </ul>

            <button className="w-full py-3 rounded-xl bg-black text-white font-semibold hover:bg-gray-800 transition">
              Start Free Trial
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
