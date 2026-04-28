import React, { useEffect, useRef, useState } from "react";

const Icon = ({ d, size = 20, stroke = "currentColor", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((path, i) => <path key={i} d={path} />) : <path d={d} />}
  </svg>
);

const CTA = () => {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.2 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="relative bg-[#f9f9f8] py-24 px-6 overflow-hidden">

      {/* Top divider line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-transparent to-zinc-200" />

      {/* Background glow */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(37,99,235,0.07) 0%, transparent 70%)" }}
      />

      {/* Grid texture */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.025]"
        style={{
          backgroundImage: "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div
        ref={ref}
        className={`relative z-10 max-w-4xl mx-auto transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      >
        {/* Main card */}
        <div className="relative bg-zinc-900 rounded-3xl overflow-hidden px-8 py-14 sm:px-16 sm:py-16 text-center">

          {/* Inner glow */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(59,130,246,0.18) 0%, transparent 60%)" }}
          />

          {/* Subtle grid inside card */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-32 h-32 opacity-20"
            style={{ background: "radial-gradient(circle at top left, rgba(59,130,246,0.6), transparent 70%)" }} />
          <div className="absolute bottom-0 right-0 w-48 h-48 opacity-15"
            style={{ background: "radial-gradient(circle at bottom right, rgba(59,130,246,0.5), transparent 70%)" }} />

          <div className="relative z-10">

            {/* Eyebrow pill */}
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 mb-7">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-[11px] font-semibold text-white/70 tracking-widest uppercase">Now Live — Launch Offer</span>
            </div>

            {/* Headline */}
            <h2
              className="text-[clamp(30px,5vw,52px)] font-semibold text-white leading-[1.1] mb-4 tracking-tight"
              style={{ letterSpacing: "-1.5px", fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              Your business, finally<br />
              <em className="text-blue-400 not-italic">under control.</em>
            </h2>

            {/* Sub */}
            <p className="text-[15px] text-white/50 leading-relaxed max-w-lg mx-auto mb-10">
              Join hundreds of shop owners already using BizEzy to track payments, manage inventory, and grow — all from one app.
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-10">
              {[
                { icon: "M20 6 9 17 4 12", text: "2 months free on sign-up" },
                { icon: "M20 6 9 17 4 12", text: "No credit card required" },
                { icon: "M20 6 9 17 4 12", text: "All features included" },
              ].map((b, i) => (
                <div key={i} className="flex items-center gap-2 text-[13px] text-white/50">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {b.text}
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
              <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-[14px] font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 active:scale-95 shadow-lg shadow-blue-900/40">
                <Icon d="M12 3v12M7 14l5 5 5-5M3 19h18" size={15} stroke="white" strokeWidth={2.2} />
                Get Started Free
              </button>
              <button className="flex items-center gap-2 bg-white/8 hover:bg-white/12 border border-white/15 text-white/80 text-[14px] font-medium px-7 py-3.5 rounded-xl transition-all duration-200">
                Explore Features
                <Icon d="M5 12h14M13 6l6 6-6 6" size={14} stroke="currentColor" strokeWidth={2} />
              </button>
            </div>

            {/* Store badges */}
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {/* App Store */}
              <div className="flex items-center gap-2.5 bg-white/8 border border-white/12 rounded-xl px-4 py-2.5 hover:bg-white/12 transition-colors cursor-pointer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect width="24" height="24" rx="5" fill="#1a1a1a" />
                  <path d="M12 5L8.5 12H15.5L12 5Z" fill="white" />
                  <path d="M7 13L5.5 16H18.5L17 13H7Z" fill="white" opacity="0.6" />
                </svg>
                <div className="text-left leading-tight">
                  <div className="text-[9px] text-white/40 uppercase tracking-wide">Download on the</div>
                  <div className="text-[12.5px] font-semibold text-white tracking-tight">App Store</div>
                </div>
              </div>

              {/* Play Store */}
              <div className="flex items-center gap-2.5 bg-white/8 border border-white/12 rounded-xl px-4 py-2.5 hover:bg-white/12 transition-colors cursor-pointer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect width="24" height="24" rx="5" fill="#1a1a1a" />
                  <path d="M6 4.5L13.5 12L6 19.5V4.5Z" fill="#34d399" />
                  <path d="M6 4.5L13.5 12L10 13.5L6 4.5Z" fill="#60a5fa" />
                  <path d="M6 19.5L13.5 12L10 10.5L6 19.5Z" fill="#f87171" />
                  <path d="M13.5 12L18 9.5V14.5L13.5 12Z" fill="#fbbf24" />
                </svg>
                <div className="text-left leading-tight">
                  <div className="text-[9px] text-white/40 uppercase tracking-wide">Get it on</div>
                  <div className="text-[12.5px] font-semibold text-white tracking-tight">Google Play</div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom social proof strip */}
        <div
          className={`mt-6 flex flex-wrap justify-center items-center gap-x-8 gap-y-3 transition-all duration-700 delay-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
        >
          {/* Avatars */}
          {/* <div className="flex items-center gap-2.5">
            <div className="flex -space-x-2">
              {["R", "M", "A", "S", "P"].map((l, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full border-2 border-[#f9f9f8] flex items-center justify-center text-[9px] font-bold text-white"
                  style={{ background: ["#3b82f6","#8b5cf6","#10b981","#f59e0b","#e11d48"][i] }}
                >
                  {l}
                </div>
              ))}
            </div>
            <span className="text-[12.5px] text-zinc-500 font-medium">500+ businesses joined</span>
          </div> */}

          <span className="w-px h-4 bg-zinc-300 hidden sm:block" />

          {/* Stars */}
          <div className="flex items-center gap-1.5">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
            <span className="text-[12.5px] text-zinc-500 font-medium">4.9 / 5 rating</span>
          </div>

          <span className="w-px h-4 bg-zinc-300 hidden sm:block" />

          <div className="flex items-center gap-1.5 text-[12.5px] text-zinc-500 font-medium">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Free for 2 months · No card needed
          </div>
        </div>

      </div>
    </section>
  );
};

export default CTA;