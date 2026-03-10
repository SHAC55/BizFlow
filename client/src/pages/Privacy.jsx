import React from "react";
import { Shield, Mail, Lock, Eye, FileText, CheckCircle } from "lucide-react";

const Privacy = () => {
  const policySections = [
    {
      icon: <Eye className="w-6 h-6 text-indigo-600" />,
      title: "Information We Collect",
      description:
        "When you join our waitlist or contact us, we may collect your email address and basic contact information to provide you with the best service experience.",
      details: [
        "Email address and contact details",
        "Usage data and preferences",
        "Communication history",
      ],
    },
    {
      icon: <Mail className="w-6 h-6 text-indigo-600" />,
      title: "How We Use Your Information",
      description:
        "Your information helps us improve our services and keep you informed about important updates and opportunities.",
      details: [
        "Product updates and feature announcements",
        "Early access opportunities",
        "Service improvements and personalization",
        "Customer support responses",
      ],
    },
    {
      icon: <Lock className="w-6 h-6 text-indigo-600" />,
      title: "Data Protection & Security",
      description:
        "We implement industry-standard security measures to protect your personal data from unauthorized access or disclosure.",
      details: [
        "256-bit encryption for data transmission",
        "Regular security audits",
        "Strict access controls",
        "No third-party data selling",
      ],
    },
    {
      icon: <Shield className="w-6 h-6 text-indigo-600" />,
      title: "Your Privacy Rights",
      description:
        "You have full control over your personal information and can exercise your privacy rights at any time.",
      details: [
        "Access and review your data",
        "Request data deletion",
        "Opt-out of communications",
        "Data portability",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 text-white pb-8">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-24">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-indigo-200" />
            <span className="text-indigo-200 font-medium tracking-wider">PRIVACY & SECURITY</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 max-w-3xl leading-tight">
            Your Privacy is Our
            <span className="text-indigo-200 block mt-2">Top Priority</span>
          </h1>
          <p className="text-lg md:text-xl text-indigo-100 max-w-2xl leading-relaxed">
            We're committed to protecting your personal information and being transparent about how we use it.
          </p>
        </div>

        {/* Decorative Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-auto" viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" fillOpacity="1"/>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">
        {/* Last Updated Badge */}
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-2 text-gray-600 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
            <FileText className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium">Last Updated: March 11, 2026</span>
          </div>
          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-full">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">GDPR Compliant</span>
          </div>
        </div>

        {/* Introduction Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-12">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                Our Commitment to Privacy
              </h2>
              <p className="text-gray-600 leading-relaxed">
                At BizEzy, we believe that privacy is a fundamental right. This policy 
                outlines how we collect, use, and protect your information. We've designed 
                our practices to be transparent and give you control over your data.
              </p>
            </div>
          </div>
        </div>

        {/* Policy Sections Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {policySections.map((section, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  {section.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {section.title}
                </h3>
              </div>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                {section.description}
              </p>

              <ul className="space-y-3">
                {section.details.map((detail, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Additional Information */}
        <div className="bg-indigo-50 rounded-2xl p-8 border border-indigo-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Questions About Your Privacy?
          </h3>
          <p className="text-gray-700 mb-6">
            If you have any questions or concerns about how we handle your data, 
            our privacy team is here to help. We typically respond within 24-48 hours.
          </p>
          <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/25">
           bizezystartup@gmail.com
          </button>
        </div>

        {/* Footer Links */}
       
      </div>
    </div>
  );
};

export default Privacy;