import React from 'react';

const CTA = () => {
  return (
    <section className="bg-black py-20 px-6 md:px-16">
      <div className="max-w-5xl mx-auto">
        <div className="bg-black rounded-3xl p-8 md:p-12 text-center border border-gray-800">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <span className="text-xs font-medium text-gray-300 uppercase tracking-wider">
              Launch Offer
            </span>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Start Your Free Trial Today
          </h2>
          
          <p className="text-gray-400 text-lg mb-2">
            Get <span className="text-white font-semibold">2 months free</span> on all premium plans
          </p>
          <p className="text-gray-400 mb-8">
            Then just ₹49/month — cancel anytime
          </p>

          <div className="flex items-center justify-center gap-3 mb-10">
            <span className="text-gray-400 line-through text-2xl">₹99/mo</span>
            <span className="text-5xl font-bold text-white">₹49</span>
            <span className="text-gray-400">/month</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <img 
              src="https://developer.apple.com/app-store/marketing/guidelines/images/badge-download-on-the-app-store.svg" 
              alt="Download on App Store"
              className="h-12"
            />
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
              alt="Get it on Google Play"
              className="h-12"
            />
          </div>

          <p className="text-gray-500 text-xs">
            No credit card required • Free for first 2 months • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTA;