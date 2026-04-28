import React, { useEffect, useRef, useState } from "react";

const Icon = ({ d, size = 20, stroke = "currentColor", strokeWidth = 1.8 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={stroke}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {Array.isArray(d) ? (
      d.map((path, i) => <path key={i} d={path} />)
    ) : (
      <path d={d} />
    )}
  </svg>
);

const CHECK = "M20 6 9 17 4 12";
const CROSS = "M18 6 6 18M6 6l12 12";
const ARROW = "M5 12h14M13 6l6 6-6 6";
const STAR =
  "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";
const ZAP = "M13 2 3 14h9l-1 8 10-12h-9l1-8z";

const Feature = ({ text, included, accent = "#2563eb" }) => (
  <li className="flex items-start gap-2.5 text-[13px]">
    <span
      className={`mt-0.5 shrink-0 w-4 h-4 rounded-full flex items-center justify-center`}
      style={{ background: included ? accent + "18" : "#f4f4f5" }}
    >
      <Icon
        d={included ? CHECK : CROSS}
        size={9}
        stroke={included ? accent : "#a1a1aa"}
        strokeWidth={2.8}
      />
    </span>
    <span
      className={
        included
          ? "text-zinc-700"
          : "text-zinc-400 line-through decoration-zinc-300"
      }
    >
      {text}
    </span>
  </li>
);

const Pricing = () => {
  const [visible, setVisible] = useState(false);
  const [annual, setAnnual] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const plans = [
    {
      name: "Free",
      badge: null,
      price: 0,
      originalPrice: null,
      period: "forever",
      desc: "Perfect for getting started and trying out BizEzy with no commitment.",
      accent: "#64748b",
      tagBg: "#f8fafc",
      tagColor: "#64748b",
      border: "border-zinc-200",
      bg: "bg-white",
      ctaStyle: "bg-zinc-100 hover:bg-zinc-200 text-zinc-800",
      cta: "Get Started Free",
      features: [
        { text: "Up to 50 customers", included: true },
        { text: "Up to 100 sales/month", included: true },
        { text: "Basic inventory (50 items)", included: true },
        { text: "Payment tracking", included: true },
        { text: "Basic dashboard", included: true },
        { text: "Invoice generation", included: false },
        { text: "WhatsApp reminders", included: false },
        { text: "Low stock alerts", included: false },
        { text: "Unlimited customers", included: false },
        { text: "Unlimited sales", included: false },
      ],
    },
    {
      name: "Pro",
      badge: "Most Popular",
      price: annual ? 39 : 49,
      originalPrice: annual ? 49 : 99,
      period: annual ? "/ mo · billed yearly" : "/ month",
      desc: "Everything your business needs — payments, invoices, inventory, and automation.",
      accent: "#2563eb",
      tagBg: "#eff4ff",
      tagColor: "#2563eb",
      border: "border-blue-500",
      bg: "bg-white",
      ctaStyle:
        "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-200",
      cta: "Start Free — 2 Months On Us",
      features: [
        { text: "Unlimited customers", included: true },
        { text: "Unlimited sales", included: true },
        { text: "Unlimited inventory items", included: true },
        { text: "Payment tracking", included: true },
        { text: "Advanced dashboard", included: true },
        { text: "Invoice generation (PDF)", included: true },
        { text: "WhatsApp auto-reminders", included: true },
        { text: "Low stock alerts (WhatsApp)", included: true },
        { text: "Customer records & history", included: true },
        { text: "Analytics & reports", included: true },
      ],
    },
  ];

  return (
    <section className="relative bg-[#f9f9f8] py-24 px-6 overflow-hidden">
      {/* Bg glow */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(37,99,235,0.055) 0%, transparent 65%)",
        }}
      />

      <div
        ref={ref}
        className={`relative z-10 max-w-4xl mx-auto transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      >
        {/* ── Header ── */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200/80 rounded-full px-4 py-1.5 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <span className="text-[11px] font-semibold text-blue-700 tracking-widest uppercase">
              Simple Pricing
            </span>
          </div>
          <h2
            className="text-[clamp(30px,5vw,48px)] font-semibold text-zinc-900 leading-[1.1] mb-4"
            style={{
              letterSpacing: "-1.5px",
              fontFamily: "Georgia, 'Times New Roman', serif",
            }}
          >
            Start free, scale
            <br />
            <em className="text-blue-600 not-italic">when you're ready.</em>
          </h2>
          <p className="text-[14.5px] text-zinc-500 leading-relaxed max-w-md mx-auto">
            No hidden fees. No credit card required. Get all Pro features free
            for 2 months on registration.
          </p>
        </div>

        {/* ── Launch Banner ── */}
        <div
          className={`flex items-center gap-3 bg-zinc-900 text-white rounded-2xl px-5 py-4 mb-8 transition-all duration-700 delay-100 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
            <Icon d={ZAP} size={16} stroke="white" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold leading-tight">
              🎉 Launch Offer — 2 Months Completely Free
            </div>
            <div className="text-[12px] text-white/50 mt-0.5">
              Register today and get full Pro access free for 60 days. No card
              needed.
            </div>
          </div>
          <div className="shrink-0 hidden sm:block">
            <div className="text-[10px] text-white/40 uppercase tracking-widest mb-0.5 text-right">
              Limited time
            </div>
            <div className="text-[13px] font-bold text-blue-400">
              Grab it free →
            </div>
          </div>
        </div>

        {/* ── Toggle ── */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <span
            className={`text-[13px] font-medium transition-colors ${!annual ? "text-zinc-900" : "text-zinc-400"}`}
          >
            Monthly
          </span>
          <button
            onClick={() => setAnnual((a) => !a)}
            className="relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none"
            style={{ background: annual ? "#2563eb" : "#d4d4d8" }}
          >
            <span
              className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300"
              style={{
                transform: annual ? "translateX(22px)" : "translateX(2px)",
              }}
            />
          </button>
          <span
            className={`text-[13px] font-medium transition-colors ${annual ? "text-zinc-900" : "text-zinc-400"}`}
          >
            Yearly
          </span>
          {annual && (
            <span className="text-[10.5px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200">
              Save 20%
            </span>
          )}
        </div>

        {/* ── Plans ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
          {plans.map((plan, pi) => (
            <div
              key={pi}
              className={`
                relative flex flex-col rounded-2xl border-2 ${plan.border} ${plan.bg} overflow-hidden
                transition-all duration-500
                ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}
                ${plan.badge ? "shadow-xl shadow-blue-100" : "shadow-sm"}
              `}
              style={{ transitionDelay: `${pi * 120}ms` }}
            >
              {/* Popular badge */}
              {plan.badge && (
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center gap-1 bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                    <svg
                      width="9"
                      height="9"
                      viewBox="0 0 24 24"
                      fill="#fbbf24"
                      stroke="#fbbf24"
                      strokeWidth="1"
                    >
                      <path d={STAR} />
                    </svg>
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="p-7 flex flex-col flex-1">
                {/* Plan name + icon */}
                <div className="flex items-center gap-2.5 mb-5">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: plan.tagBg }}
                  >
                    <Icon
                      d={
                        plan.name === "Free"
                          ? "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                          : ZAP
                      }
                      size={16}
                      stroke={plan.accent}
                      strokeWidth={2}
                    />
                  </div>
                  <span
                    className="text-[13px] font-bold uppercase tracking-widest"
                    style={{ color: plan.accent }}
                  >
                    {plan.name}
                  </span>
                </div>

                {/* Price */}
                <div className="mb-1 flex items-end gap-2">
                  {plan.originalPrice && (
                    <span className="text-[18px] font-semibold text-zinc-300 line-through mb-0.5">
                      ₹{plan.originalPrice}
                    </span>
                  )}
                  <span
                    className="text-[44px] font-bold text-zinc-900 leading-none tracking-tight"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    {plan.price === 0 ? "Free" : `₹${plan.price}`}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-[12.5px] text-zinc-400 mb-2">
                      {plan.period}
                    </span>
                  )}
                </div>

                {plan.originalPrice && !annual && (
                  <div className="inline-flex items-center gap-1.5 mb-4">
                    <span className="text-[11px] font-bold bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full">
                      50% OFF — Launch Offer
                    </span>
                  </div>
                )}

                <p className="text-[13px] text-zinc-500 leading-relaxed mb-6">
                  {plan.desc}
                </p>

                {/* Features */}
                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f, fi) => (
                    <Feature
                      key={fi}
                      text={f.text}
                      included={f.included}
                      accent={plan.accent}
                    />
                  ))}
                </ul>

                {/* CTA */}
                <button
                  className={`w-full py-3.5 rounded-xl text-[14px] font-semibold transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 ${plan.ctaStyle}`}
                >
                  {plan.cta}
                  <Icon
                    d={ARROW}
                    size={14}
                    stroke="currentColor"
                    strokeWidth={2.2}
                  />
                </button>

                {plan.name === "Pro" && (
                  <p className="text-[11px] text-zinc-400 text-center mt-3">
                    First 2 months free · Cancel anytime
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── Comparison note ── */}
        <div
          className={`bg-white border border-zinc-200 rounded-2xl p-6 transition-all duration-700 delay-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <div className="flex items-center gap-2 mb-4">
            <Icon
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
              size={16}
              stroke="#2563eb"
              strokeWidth={2}
            />
            <span className="text-[12px] font-bold text-zinc-700 uppercase tracking-widest">
              Why upgrade to Pro?
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
                color: "#16a34a",
                bg: "#f0fdf4",
                title: "Auto WhatsApp Reminders",
                desc: "Never chase payments manually again — reminders go out automatically on due dates.",
              },
              {
                icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
                color: "#0d9488",
                bg: "#f0fdfa",
                title: "GST Invoice Generation",
                desc: "Create and share professional PDF invoices in seconds via WhatsApp or email.",
              },
              {
                icon: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96 12 12.01l8.73-5.05M12 22.08V12",
                color: "#ea580c",
                bg: "#fff7ed",
                title: "Low Stock WhatsApp Alerts",
                desc: "Get instant alerts when products run low — restock before you run out.",
              },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: item.bg }}
                >
                  <Icon
                    d={item.icon}
                    size={14}
                    stroke={item.color}
                    strokeWidth={1.9}
                  />
                </div>
                <div>
                  <div className="text-[12.5px] font-semibold text-zinc-800 mb-0.5">
                    {item.title}
                  </div>
                  <div className="text-[11.5px] text-zinc-500 leading-relaxed">
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom reassurance ── */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 mt-8">
          {[
            "No credit card required",
            "Cancel anytime",
            "2 months free on registration",
            "Instant setup",
          ].map((t, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 text-[12.5px] text-zinc-400"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#22c55e"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {t}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
