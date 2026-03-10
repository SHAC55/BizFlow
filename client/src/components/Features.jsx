import React from "react";
import { Users, CreditCard, BellRing, BarChart3 } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: <Users className="w-10 h-10 text-blue-600" />,
      title: "Customer Management",
      description:
        "Keep track of your customers with ease. Manage customer information, interactions, and history in one centralized platform.",
    },
    {
      icon: <CreditCard className="w-10 h-10 text-blue-600" />,
      title: "Record Sales & Payments",
      description:
        "Easily add sales, generate bills, and record payments. Our intuitive interface helps you stay organized.",
    },
    {
      icon: <BellRing className="w-10 h-10 text-blue-600" />,
      title: "Track Due Payments",
      description:
        "Never miss a payment with smart reminders and due-date tracking for all your receivables.",
    },
    {
      icon: <BarChart3 className="w-10 h-10 text-blue-600" />,
      title: "View Reports",
      description:
        "Gain insights into your business performance with clear and detailed reports.",
    },
  ];

  return (
    <section className="bg-[#f1f4fc] py-20 px-6 md:px-16">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Heading */}
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Powerful Features for Your Business
          </h2>
          <p className="text-gray-600 mt-3">
            Everything you need to manage and grow your business efficiently.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-xl border border-gray-200 bg-white hover:shadow-lg transition"
            >
              <div className="mb-4">{feature.icon}</div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>

              <p className="text-gray-600 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Features;