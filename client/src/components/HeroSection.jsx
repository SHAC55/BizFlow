import React, { useEffect, useState } from "react";

/* ─── Phone sub-components ─────────────────────────────── */

const PhoneScreen = ({ title, avatar, children }) => (
  <div className="flex flex-col gap-1.5 h-full">
    <div className="flex items-center justify-between mb-1">
      <span className="text-[10px] font-semibold text-white tracking-tight">{title}</span>
      <div className="w-[18px] h-[18px] rounded-full bg-blue-500 flex items-center justify-center text-[7px] font-bold text-white">
        {avatar}
      </div>
    </div>
    {children}
  </div>
);

const PhoneCard = ({ label, value, sub, subColor = "text-green-400" }) => (
  <div className="bg-white/10 rounded-xl p-2">
    <div className="text-[6.5px] uppercase tracking-widest text-white/50 mb-1">{label}</div>
    <div className="text-[13px] font-bold text-white tracking-tight leading-none">{value}</div>
    {sub && <div className={`text-[6.5px] mt-1 font-medium ${subColor}`}>{sub}</div>}
  </div>
);

const PhoneRow = ({ dot, name, sub, amount, amtColor = "text-white" }) => (
  <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-2 py-1.5">
    <div className={`w-[5px] h-[5px] rounded-full flex-shrink-0 ${dot}`} />
    <div className="flex-1 min-w-0">
      <div className="text-[7px] font-semibold text-white/90 truncate">{name}</div>
      <div className="text-[6px] text-white/40">{sub}</div>
    </div>
    <div className={`text-[7.5px] font-bold ${amtColor}`}>{amount}</div>
  </div>
);

/* ─── Main Component ────────────────────────────────────── */

const HeroSection = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative min-h-screen bg-[#f9f9f8] flex flex-col justify-center overflow-hidden pt-24 pb-16 px-6">

      {/* Spotlights */}
      <div
        className="pointer-events-none absolute top-0 right-0 w-[600px] h-[600px] z-0"
        style={{ background: "radial-gradient(ellipse at top right, rgba(59,130,246,0.09) 0%, transparent 65%)" }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 w-[400px] h-[400px] z-0"
        style={{ background: "radial-gradient(ellipse at bottom left, rgba(59,130,246,0.05) 0%, transparent 65%)" }}
      />

      {/* Two-column grid */}
      <div
        className={`relative z-10 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-6 items-center transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {/* ── LEFT: Text content ── */}
        <div className="flex flex-col items-start text-left">

          {/* Launch offer banner */}
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-1.5 mb-4 shadow-sm">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span className="text-[12px] font-semibold text-blue-700">
              Launch Offer — 2 Months Free on Registration
            </span>
          </div>

          {/* Live pill */}
          {/* <div className="inline-flex items-center gap-2 bg-white border border-zinc-200 rounded-full px-4 py-1.5 mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
            <span className="text-[12px] font-medium text-zinc-600">
              Product launch — officially live today
            </span>
          </div> */}

          {/* Headline */}
          <h1
            className="text-5xl sm:text-6xl lg:text-[64px] font-semibold leading-[1.05] mb-5 text-zinc-900"
            style={{ letterSpacing: "-2.5px" }}
          >
            BizEzy is<br />
            <span className="text-blue-600">Now Live.</span>
          </h1>

          {/* Sub */}
          <p className="text-[16px] text-zinc-500 leading-relaxed max-w-md mb-8">
            The all-in-one business management app to manage inventory, sales,
            customers, invoices, and analytics — with ease.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <button className="flex items-center gap-2 bg-zinc-900 text-white text-sm font-semibold px-6 py-3.5 rounded-xl hover:bg-zinc-700 transition-colors active:scale-95">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v12M7 14l5 5 5-5M3 19h18" />
              </svg>
              Get Started Free
            </button>
            <button className="text-zinc-800 text-sm font-medium px-6 py-3.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 transition-colors">
              Explore Features →
            </button>
          </div>

          {/* Trust badges row */}
          <div className="flex flex-wrap items-center gap-3 mb-8 text-[12px] text-zinc-400">
            <span className="flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span className="text-zinc-500 font-medium">All features included</span>
            </span>
            <span className="w-1 h-1 rounded-full bg-zinc-300" />
            <span className="flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span className="text-zinc-500 font-medium">No credit card required</span>
            </span>
            <span className="w-1 h-1 rounded-full bg-zinc-300" />
            <span className="flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span className="text-zinc-500 font-medium">2 months free</span>
            </span>
          </div>

          {/* Store badges */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2.5 bg-white border border-zinc-200 rounded-xl px-4 py-2.5 shadow-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect width="24" height="24" rx="5" fill="#0f0f0f" />
                <path d="M12 5L8.5 12H15.5L12 5Z" fill="white" />
                <path d="M7 13L5.5 16H18.5L17 13H7Z" fill="white" opacity="0.7" />
              </svg>
              <div className="leading-tight">
                <div className="text-[9px] text-zinc-400 uppercase tracking-wide">Available on</div>
                <div className="text-[13px] font-semibold text-zinc-900 tracking-tight">App Store</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 bg-white border border-zinc-200 rounded-xl px-4 py-2.5 shadow-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect width="24" height="24" rx="5" fill="#0f0f0f" />
                <path d="M6 4.5L13.5 12L6 19.5V4.5Z" fill="#34d399" />
                <path d="M6 4.5L13.5 12L10 13.5L6 4.5Z" fill="#60a5fa" />
                <path d="M6 19.5L13.5 12L10 10.5L6 19.5Z" fill="#f87171" />
                <path d="M13.5 12L18 9.5V14.5L13.5 12Z" fill="#fbbf24" />
              </svg>
              <div className="leading-tight">
                <div className="text-[9px] text-zinc-400 uppercase tracking-wide">Get it on</div>
                <div className="text-[13px] font-semibold text-zinc-900 tracking-tight">Play Store</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Phone scene ── */}
        <div
          className={`relative flex items-end justify-center h-[400px] lg:h-[480px] transition-all duration-1000 delay-300 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Floating badge — revenue */}
          <div
            className="absolute z-20 flex items-center gap-2 bg-white border border-zinc-200 rounded-xl px-3 py-2 shadow-lg whitespace-nowrap"
            style={{ bottom: 220, left: 0, animation: "bizezy-float 4s ease-in-out infinite" }}
          >
            <div className="w-[26px] h-[26px] rounded-lg bg-green-100 flex items-center justify-center text-sm flex-shrink-0">✅</div>
            <div className="leading-tight">
              <div className="text-[9px] text-zinc-400">Revenue today</div>
              <div className="text-[12px] font-semibold text-zinc-900">₹24,800</div>
            </div>
          </div>

          {/* Floating badge — new sale */}
          <div
            className="absolute z-20 flex items-center gap-2 bg-white border border-zinc-200 rounded-xl px-3 py-2 shadow-lg whitespace-nowrap"
            style={{ top: 24, right: 4, animation: "bizezy-float 4.5s ease-in-out infinite 0.5s" }}
          >
            <div className="w-[26px] h-[26px] rounded-lg bg-blue-100 flex items-center justify-center text-sm flex-shrink-0">📦</div>
            <div className="leading-tight">
              <div className="text-[9px] text-zinc-400">New sale</div>
              <div className="text-[12px] font-semibold text-zinc-900">3 items · ₹3,200</div>
            </div>
          </div>

          {/* Floating badge — low stock */}
          <div
            className="absolute z-20 flex items-center gap-2 bg-white border border-zinc-200 rounded-xl px-3 py-2 shadow-lg whitespace-nowrap"
            style={{ bottom: 80, right: 0, animation: "bizezy-float 3.8s ease-in-out infinite 0.9s" }}
          >
            <div className="w-[26px] h-[26px] rounded-lg bg-orange-100 flex items-center justify-center text-sm flex-shrink-0">🔔</div>
            <div className="leading-tight">
              <div className="text-[9px] text-zinc-400">Low stock alert</div>
              <div className="text-[12px] font-semibold text-zinc-900">Printer Paper</div>
            </div>
          </div>

          {/* Left phone — Analytics */}
          <div
            className="relative bg-zinc-900 border-2 border-zinc-700 overflow-hidden flex-shrink-0 shadow-xl"
            style={{ width: 140, height: 252, borderRadius: 22, transform: "translateY(48px)", opacity: 0.72 }}
          >
            <div className="w-10 h-2 bg-zinc-800 rounded-b-lg mx-auto mt-2.5" />
            <div className="px-2.5 pb-3 pt-1.5" style={{ height: "calc(100% - 26px)" }}>
              <PhoneScreen title="Analytics" avatar="A">
                <PhoneCard label="This month" value="₹1.2L" sub="↑ 18% vs last" />
                <div className="flex gap-1.5">
                  <PhoneCard label="Orders" value="142" />
                  <PhoneCard label="Customers" value="38" />
                </div>
              </PhoneScreen>
            </div>
          </div>

          {/* Center phone — Dashboard */}
          <div
            className="relative bg-zinc-900 border-2 border-zinc-700 overflow-hidden flex-shrink-0 z-10 mx-3"
            style={{ width: 168, height: 310, borderRadius: 26, boxShadow: "0 28px 64px rgba(0,0,0,0.30)" }}
          >
            <div className="w-10 h-2 bg-zinc-800 rounded-b-lg mx-auto mt-2.5" />
            <div className="px-2.5 pb-3 pt-1.5" style={{ height: "calc(100% - 26px)" }}>
              <PhoneScreen title="Dashboard" avatar="B">
                <PhoneCard label="Total Revenue" value="₹84,320" sub="↑ 12.4% this week" />
                <div className="flex gap-1.5">
                  <PhoneCard label="Sales" value="64" />
                  <PhoneCard label="Due" value="₹8.2k" sub="" />
                </div>
                <PhoneRow dot="bg-green-400" name="Ravi Kumar" sub="Paid · Today" amount="₹4,200" />
                <PhoneRow dot="bg-red-400" name="Meena Stores" sub="Due · 3 days" amount="₹1,800" amtColor="text-red-400" />
                <PhoneRow dot="bg-blue-400" name="Arjun Traders" sub="Partial · Today" amount="₹6,500" />
              </PhoneScreen>
            </div>
          </div>

          {/* Right phone — Inventory */}
          <div
            className="relative bg-zinc-900 border-2 border-zinc-700 overflow-hidden flex-shrink-0 shadow-xl"
            style={{ width: 148, height: 272, borderRadius: 24, transform: "translateY(28px)" }}
          >
            <div className="w-10 h-2 bg-zinc-800 rounded-b-lg mx-auto mt-2.5" />
            <div className="px-2.5 pb-3 pt-1.5" style={{ height: "calc(100% - 26px)" }}>
              <PhoneScreen title="Inventory" avatar="C">
                <PhoneCard label="Total Products" value="218" sub="4 low stock alerts" subColor="text-red-400" />
                <PhoneRow dot="bg-red-400" name="A4 Paper" sub="2 units left" amount="Low" amtColor="text-red-400" />
                <PhoneRow dot="bg-green-400" name="Blue Pen Box" sub="120 units" amount="OK" amtColor="text-green-400" />
                <PhoneRow dot="bg-green-400" name="Stapler Set" sub="44 units" amount="OK" amtColor="text-green-400" />
              </PhoneScreen>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bizezy-float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;