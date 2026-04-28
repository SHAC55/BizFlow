import React, { useEffect, useRef, useState, useCallback } from "react";

const STAR_PATH =
  "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";

const TESTIMONIALS = [
  {
    name: "Kushal Patil",
    role: "Saloon Owner",
    location: "Powai, Mumbai",
    av: "KP",
    color: "#1a6aff",
    bg: "#e8f0ff",
    bgBorder: "#b3ceff",
    metric: { val: "₹40k+", label: "Dues recovered" },
    title: "Finally, no more missed payments!",
    text: "Before BizEzy, I used to forget which customers owed me money. The WhatsApp reminders go out automatically and I've recovered almost ₹40,000 in dues I'd given up on. The dashboard shows everything at a glance — I check it every morning before opening.",
  },
  {
    name: "Aseem Sharma",
    role: "Water Supplier",
    location: "Thane, Maharashtra",
    av: "AS",
    color: "#7c3aed",
    bg: "#f0ecff",
    bgBorder: "#c4b0f5",
    metric: { val: "200+", label: "Customers managed" },
    title: "Managing 200+ customers is now easy.",
    text: "With daily deliveries and so many customers, keeping records was a nightmare. BizEzy keeps every customer's history — what they bought, what they paid, what they owe. My accountant is happy and I'm finally stress-free at month end.",
  },
  {
    name: "Irshad Shaikh",
    role: "AC Service & Repair",
    location: "Nagpur, Maharashtra",
    av: "IS",
    color: "#0d9488",
    bg: "#e6faf7",
    bgBorder: "#9fd6d0",
    metric: { val: "2 hrs", label: "Saved daily" },
    title: "Inventory alerts saved my business.",
    text: "I used to run out of spare parts without realising it. BizEzy's low stock alert on WhatsApp tells me exactly what to reorder before it's too late. Invoice generation saves me 2 hours every day — my customers love the professional PDF bills.",
  },
  {
    name: "Ahmed Ansari",
    role: "Electronics Dealer",
    location: "Kurla, Mumbai",
    av: "AA",
    color: "#ea580c",
    bg: "#fff3ec",
    bgBorder: "#fdc09a",
    metric: { val: "3×", label: "More invoices sent" },
    title: "Best ₹49 I spend every month.",
    text: "I was skeptical about paying for an app but the 2 months free offer made it a no-brainer. Within the first week I generated more invoices than I did all of last month. Fast, simple, and designed for shops like mine — not big corporates.",
  },
];

const TRUST_ITEMS = [
  "Trusted by shop owners",
  "Across Maharashtra & beyond",
  "Growing Faster",
  "Real businesses, real results",
];

function StarRow({ color }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1">
          <path d={STAR_PATH} />
        </svg>
      ))}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ChevronIcon({ direction }) {
  return direction === "left" ? (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  ) : (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function GreenCheck() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function Testimonials() {
  const [active, setActive] = useState(0);
  const [fading, setFading] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(false);
  const headerRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setHeaderVisible(true); obs.disconnect(); }
      },
      { threshold: 0.15 }
    );
    if (headerRef.current) obs.observe(headerRef.current);
    return () => obs.disconnect();
  }, []);

  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setActive((a) => (a + 1) % TESTIMONIALS.length);
        setFading(false);
      }, 260);
    }, 4500);
  }, []);

  useEffect(() => {
    resetTimer();
    return () => clearInterval(timerRef.current);
  }, [resetTimer]);

  const goTo = useCallback((i) => {
    if (i === active || fading) return;
    setFading(true);
    setTimeout(() => {
      setActive(i);
      setFading(false);
    }, 260);
    resetTimer();
  }, [active, fading, resetTimer]);

  const handlePrev = () => goTo((active - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  const handleNext = () => goTo((active + 1) % TESTIMONIALS.length);

  const t = TESTIMONIALS[active];

  return (
    <section className="bg-white py-24 px-6">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        .testimonial-root { font-family: 'DM Sans', sans-serif; }
        .testimonial-serif { font-family: 'DM Serif Display', Georgia, serif; }
        @keyframes testimonial-bar { from { width: 0% } to { width: 100% } }
        .testimonial-bar-fill { animation: testimonial-bar 4.5s linear forwards; }
      `}</style>

      <div className="testimonial-root max-w-4xl mx-auto">

        {/* ── Header ── */}
        <div
          ref={headerRef}
          className="text-center max-w-2xl mx-auto mb-14"
          style={{
            opacity: headerVisible ? 1 : 0,
            transform: headerVisible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-4 py-1.5 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0" />
            <span className="text-[10.5px] font-medium text-zinc-500 tracking-widest uppercase">Real stories</span>
          </div>

          <h2
            className="testimonial-serif text-zinc-900 mb-3 leading-[1.08]"
            style={{ fontSize: "clamp(32px, 5vw, 50px)", fontWeight: 400, letterSpacing: "-0.02em" }}
          >
            Shops that run<br />
            <em className="not-italic text-blue-600">smarter with BizEzy.</em>
          </h2>
          <p className="text-sm font-light text-zinc-400 leading-relaxed">
            Real business owners. Real numbers. Zero fluff.
          </p>
        </div>

        {/* ── Person tabs ── */}
        <div
          className="flex flex-wrap justify-center gap-2 mb-9"
          style={{
            opacity: headerVisible ? 1 : 0,
            transform: headerVisible ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 0.6s ease 0.15s, transform 0.6s ease 0.15s",
          }}
        >
          {TESTIMONIALS.map((p, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="flex items-center gap-2 rounded-full px-4 py-1.5 text-[12.5px] border transition-all duration-200"
              style={
                i === active
                  ? { background: "#0c1526", borderColor: "#0c1526", color: "#fff" }
                  : { background: "#fff", borderColor: "#e4e4e7", color: "#71717a" }
              }
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-medium flex-shrink-0"
                style={{
                  background: i === active ? "rgba(255,255,255,0.18)" : p.bg,
                  color: i === active ? "#fff" : p.color,
                }}
              >
                {p.av}
              </div>
              {p.name.split(" ")[0]}
            </button>
          ))}
        </div>

        {/* ── Main card ── */}
        <div className="relative">
          <div
            className="border border-zinc-100 rounded-2xl overflow-hidden"
            style={{
              opacity: fading ? 0 : 1,
              transform: fading ? "translateY(8px)" : "translateY(0)",
              transition: "opacity 0.26s ease, transform 0.26s ease",
            }}
          >
            {/* Accent bar */}
            <div className="h-0.5 w-full" style={{ background: t.color }} />

            <div className="flex flex-col sm:flex-row">
              {/* Left column */}
              <div className="sm:w-52 flex-shrink-0 flex flex-col gap-5 p-8 sm:border-r border-zinc-100">
                {/* Avatar */}
                <div className="relative w-12 h-12">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-base font-medium text-white tracking-wide"
                    style={{ background: t.color }}
                  >
                    {t.av}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-[18px] h-[18px] bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <CheckIcon />
                  </div>
                </div>

                {/* Identity */}
                <div>
                  <p className="text-sm font-medium text-zinc-900 leading-tight">{t.name}</p>
                  <p className="text-xs font-light text-zinc-400 mt-0.5">{t.role}</p>
                  <div className="flex items-center gap-1 mt-1.5 text-zinc-400">
                    <PinIcon />
                    <span className="text-[11px] font-light">{t.location}</span>
                  </div>
                </div>

                <StarRow color={t.color} />

                {/* Metric */}
                <div
                  className="rounded-xl px-4 py-3.5 text-center border"
                  style={{ background: t.bg, borderColor: t.bgBorder }}
                >
                  <div
                    className="testimonial-serif leading-none tracking-tight italic mb-1"
                    style={{ fontSize: 28, color: t.color }}
                  >
                    {t.metric.val}
                  </div>
                  <div className="text-[10.5px] font-light text-zinc-400 tracking-wide">{t.metric.label}</div>
                </div>
              </div>

              {/* Right column */}
              <div className="flex-1 flex flex-col p-8 sm:p-10 min-w-0">
                <div
                  className="testimonial-serif leading-none select-none mb-3 -mt-1"
                  style={{ fontSize: 72, height: 36, overflow: "hidden", opacity: 0.1, color: "#0c1526" }}
                >
                  "
                </div>

                <h3
                  className="testimonial-serif text-zinc-900 mb-4 leading-snug"
                  style={{ fontSize: "clamp(18px, 2.5vw, 22px)", fontWeight: 400, letterSpacing: "-0.01em" }}
                >
                  "{t.title}"
                </h3>

                <p className="text-sm font-light text-zinc-400 leading-loose flex-1">{t.text}</p>

                {/* Progress bar */}
                <div className="flex items-center gap-3 mt-8">
                  <div className="flex-1 h-px bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      key={`bar-${active}`}
                      className="testimonial-bar-fill h-full rounded-full"
                      style={{ background: t.color }}
                    />
                  </div>
                  <span className="text-[11px] font-light text-zinc-400 whitespace-nowrap">
                    {active + 1} / {TESTIMONIALS.length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Nav buttons */}
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={handlePrev}
              className="w-9 h-9 rounded-full border border-zinc-200 bg-white flex items-center justify-center hover:bg-zinc-50 hover:border-zinc-300 transition-all active:scale-95 text-zinc-500"
              aria-label="Previous"
            >
              <ChevronIcon direction="left" />
            </button>
            <button
              onClick={handleNext}
              className="w-9 h-9 rounded-full border border-zinc-200 bg-white flex items-center justify-center hover:bg-zinc-50 hover:border-zinc-300 transition-all active:scale-95 text-zinc-500"
              aria-label="Next"
            >
              <ChevronIcon direction="right" />
            </button>
          </div>
        </div>

        {/* ── Trust strip ── */}
        <div
          className="flex flex-wrap justify-center gap-x-8 gap-y-2 mt-10 pt-7 border-t border-zinc-100"
          style={{
            opacity: headerVisible ? 1 : 0,
            transition: "opacity 0.6s ease 0.5s",
          }}
        >
          {TRUST_ITEMS.map((txt, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <GreenCheck />
              <span className="text-xs font-light text-zinc-400">{txt}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}