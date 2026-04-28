import React, { useEffect, useRef, useState } from "react";

/* ─── Lucide-style inline SVG icons ──────────────────── */
const Icon = ({ d, size = 20, stroke = "currentColor", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((path, i) => <path key={i} d={path} />) : <path d={d} />}
  </svg>
);

const Icons = {
  wallet: [
    "M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5",
    "M16 12a2 2 0 1 0 4 0 2 2 0 0 0-4 0"
  ],
  whatsapp: [
    "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
  ],
  users: [
    "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2",
    "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    "M23 21v-2a4 4 0 0 0-3-3.87",
    "M16 3.13a4 4 0 0 1 0 7.75"
  ],
  invoice: [
    "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z",
    "M14 2v6h6",
    "M16 13H8M16 17H8M10 9H8"
  ],
  box: [
    "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z",
    "M3.27 6.96 12 12.01l8.73-5.05M12 22.08V12"
  ],
  chart: [
    "M18 20V10",
    "M12 20V4",
    "M6 20v-6"
  ],
};

/* ─── Mini mockup sub-components ─────────────────────── */
const MockRow = ({ name, sub, badge, badgeStyle }) => (
  <div className="flex items-center justify-between py-2 border-b border-zinc-100 last:border-0">
    <div className="flex items-center gap-2.5">
      <div className="w-6 h-6 rounded-full bg-zinc-200 flex items-center justify-center text-[9px] font-bold text-zinc-500 shrink-0">
        {name[0]}
      </div>
      <div>
        <div className="text-[11.5px] font-semibold text-zinc-800 leading-tight">{name}</div>
        <div className="text-[10px] text-zinc-400 leading-tight mt-0.5">{sub}</div>
      </div>
    </div>
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${badgeStyle}`}>{badge}</span>
  </div>
);

const InvLine = ({ label, value, total }) => (
  <div className={`flex justify-between py-1.5 border-b border-dashed border-zinc-100 last:border-0 ${total ? "font-bold text-zinc-900 text-[12.5px] mt-1" : "text-[11.5px] text-zinc-500"}`}>
    <span>{label}</span><span className="font-mono">{value}</span>
  </div>
);

const StockBar = ({ name, pct, count, color }) => (
  <div className="flex items-center gap-3 py-1.5">
    <span className="text-[11.5px] font-medium text-zinc-600 w-28 shrink-0 truncate">{name}</span>
    <div className="flex-1 h-[5px] rounded-full bg-zinc-100 overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
    </div>
    <span className="text-[10.5px] w-16 text-right shrink-0 font-semibold" style={{ color }}>{count}</span>
  </div>
);

const KpiBox = ({ val, lbl, delta, deltaColor = "#16a34a" }) => (
  <div className="flex-1 bg-white border border-zinc-100 rounded-xl p-3 flex flex-col gap-1 shadow-sm">
    <div className="text-[9.5px] uppercase tracking-widest text-zinc-400 font-semibold">{lbl}</div>
    <div className="text-[16px] font-bold text-zinc-900 tracking-tight leading-none">{val}</div>
    <div className="text-[10.5px] font-semibold" style={{ color: deltaColor }}>{delta}</div>
  </div>
);

/* ─── Feature Card ────────────────────────────────────── */
const FeatureCard = ({ accent, iconPaths, tagBg, tagColor, tag, title, desc, children, cta, delay = 0, className = "" }) => {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setTimeout(() => setVisible(true), delay); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        relative bg-white border border-zinc-200/80 rounded-2xl overflow-hidden cursor-default
        transition-all duration-500 flex flex-col
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}
        ${hovered ? "-translate-y-1 shadow-[0_16px_48px_rgba(0,0,0,0.10)]" : "shadow-[0_2px_8px_rgba(0,0,0,0.04)]"}
        ${className}
      `}
    >
      {/* Accent top stripe */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] transition-opacity duration-300"
        style={{ background: accent, opacity: hovered ? 1 : 0 }}
      />

      <div className="p-6 flex flex-col flex-1">
        {/* Icon + Tag row */}
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300"
            style={{ background: tagBg, color: tagColor, transform: hovered ? "scale(1.08)" : "scale(1)" }}
          >
            <Icon d={iconPaths} size={18} stroke={tagColor} strokeWidth={1.9} />
          </div>
          <span
            className="text-[10px] font-bold uppercase tracking-[0.1em] px-2.5 py-1 rounded-full"
            style={{ background: tagBg, color: tagColor }}
          >
            {tag}
          </span>
        </div>

        <h3 className="text-[15.5px] font-bold text-zinc-900 tracking-tight leading-snug mb-2">{title}</h3>
        <p className="text-[13px] text-zinc-500 leading-relaxed mb-4">{desc}</p>

        <div className="flex-1">{children}</div>

        {cta && (
          <button
            className="mt-5 inline-flex items-center gap-1.5 text-[12px] font-semibold transition-all duration-150 hover:gap-2.5 w-fit"
            style={{ color: accent }}
          >
            {cta}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

/* ─── Main Features Component ─────────────────────────── */
const Features = () => {
  const [headerVisible, setHeaderVisible] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setHeaderVisible(true); obs.disconnect(); } },
      { threshold: 0.2 }
    );
    if (headerRef.current) obs.observe(headerRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="relative bg-[#f9f9f8] py-24 px-6 overflow-hidden">

      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] z-0"
        style={{ background: "radial-gradient(ellipse at top, rgba(37,99,235,0.055) 0%, transparent 68%)" }}
      />

      <div className="relative z-10 max-w-5xl mx-auto">

        {/* ── Header ── */}
        <div
          ref={headerRef}
          className={`text-center max-w-xl mx-auto mb-12 transition-all duration-700 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
        >
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200/80 rounded-full px-4 py-1.5 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <span className="text-[11px] font-semibold text-blue-700 tracking-widest uppercase">Everything you need</span>
          </div>
          <h2
            className="text-[clamp(32px,5vw,50px)] font-semibold text-zinc-900 leading-[1.1] mb-4"
            style={{ letterSpacing: "-1.8px", fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Run your business<br />
            <em className="text-blue-600 not-italic">effortlessly.</em>
          </h2>
          <p className="text-[14.5px] text-zinc-500 leading-relaxed max-w-md mx-auto">
            BizEzy brings together every tool a growing business needs — payments, inventory, customers, and automation — in one simple app.
          </p>
        </div>

        {/* ── Stats Strip ── */}
        <div
          className={`grid grid-cols-2 sm:grid-cols-4 bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-sm mb-10 transition-all duration-700 delay-150 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          {[
            { num: "₹2.4L+", label: "Avg. monthly revenue tracked" },
            { num: "500+",   label: "Invoices generated daily" },
            { num: "99.8%", label: "WhatsApp reminder open rate" },
            { num: "0 hrs", label: "Manual follow-up time" },
          ].map((s, i) => (
            <div key={i} className="px-5 py-5 text-center border-r border-b border-zinc-100 last:border-r-0 [&:nth-child(2)]:border-r-0 sm:[&:nth-child(2)]:border-r sm:[&:nth-child(3)]:border-b-0 [&:nth-child(3)]:border-b-0 [&:nth-child(4)]:border-b-0">
              <div className="text-[24px] font-semibold text-zinc-900 tracking-tight leading-none mb-1.5" style={{ fontFamily: "Georgia, serif" }}>{s.num}</div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-400 leading-snug">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ════════════════════════════════════════
            ROW 1 — Payments (wide) + WhatsApp
        ════════════════════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">

          {/* Payments — spans 2 cols */}
          <FeatureCard
            className="lg:col-span-2"
            accent="#2563eb" iconPaths={Icons.wallet}
            tag="Payments" tagBg="#eff4ff" tagColor="#2563eb"
            title="Track Every Payment, Instantly"
            desc="Know who's paid, who owes, and how much — across every customer and transaction, in real time."
            cta="See payment tracker" delay={0}
          >
            <div className="bg-zinc-50/80 border border-zinc-100 rounded-xl px-3 pt-1 pb-0.5">
              <MockRow name="Ravi Kumar"    sub="Today · Order #1042"         badge="Paid ₹4,200"    badgeStyle="bg-green-50 text-green-700 border border-green-200" />
              <MockRow name="Meena Stores"  sub="Due in 3 days · Order #1038" badge="Due ₹1,800"     badgeStyle="bg-red-50 text-red-600 border border-red-200" />
              <MockRow name="Arjun Traders" sub="Partial · Order #1040"       badge="Pending ₹3,200" badgeStyle="bg-amber-50 text-amber-700 border border-amber-200" />
            </div>
          </FeatureCard>

          {/* WhatsApp — 1 col */}
          <FeatureCard
            accent="#16a34a" iconPaths={Icons.whatsapp}
            tag="Automation" tagBg="#f0fdf4" tagColor="#16a34a"
            title="WhatsApp Payment Reminders"
            desc="Automated reminders sent on due dates — zero manual follow-up required."
            delay={80}
          >
            <div className="bg-[#f0fdf4] border border-green-100 rounded-xl p-3 space-y-2">
              <div className="bg-[#dcfce7] rounded-xl rounded-bl-sm p-2.5">
                <div className="text-[10px] font-bold text-green-700 mb-1 flex items-center gap-1">
                  <Icon d={Icons.whatsapp} size={10} stroke="#15803d" strokeWidth={2.2} /> BizEzy Reminder
                </div>
                <div className="text-[11px] text-green-900 leading-relaxed">Hi Meena! Payment of <strong>₹1,800</strong> for Order #1038 is due today. Please pay at your earliest 🙏</div>
                <div className="text-[9px] text-green-600/60 text-right mt-1.5">10:02 AM ✓✓</div>
              </div>
              <div className="bg-white border border-zinc-100 rounded-xl rounded-br-sm p-2.5 max-w-[70%] ml-auto shadow-sm">
                <div className="text-[11px] text-zinc-700">Will pay by evening! 👍</div>
                <div className="text-[9px] text-zinc-400 text-right mt-1">10:05 AM</div>
              </div>
            </div>
          </FeatureCard>
        </div>

        {/* ════════════════════════════════════════
            ROW 2 — Customers · Invoicing · Analytics  (equal thirds)
        ════════════════════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">

          {/* Customers */}
          <FeatureCard
            accent="#7c3aed" iconPaths={Icons.users}
            tag="Customers" tagBg="#f5f3ff" tagColor="#7c3aed"
            title="All Customer Records, One Place"
            desc="Full history per customer — orders, payments, dues, and contact info always at hand."
            cta="Explore CRM" delay={0}
          >
            <ul className="space-y-2.5">
              {[
                "Full purchase & payment history",
                "Outstanding balance at a glance",
                "One-tap to call, message, or invoice",
                "Smart search across all contacts",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2.5 text-[12.5px] text-zinc-500">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </FeatureCard>

          {/* Invoicing */}
          <FeatureCard
            accent="#0d9488" iconPaths={Icons.invoice}
            tag="Invoicing" tagBg="#f0fdfa" tagColor="#0d9488"
            title="Generate Invoices in Seconds"
            desc="Professional GST-ready invoices instantly — share as PDF on WhatsApp, email, or print."
            delay={80}
          >
            <div className="bg-[#f0fdfa] border border-teal-100 rounded-xl p-3">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-teal-100">
                <div>
                  <div className="text-[10px] text-zinc-400 uppercase tracking-widest">Invoice</div>
                  <div className="text-[12px] font-bold text-teal-700">#INV-1042</div>
                </div>
                <span className="text-[10px] bg-teal-100 text-teal-700 font-semibold px-2.5 py-1 rounded-full">28 Apr 2026</span>
              </div>
              <InvLine label="A4 Paper Ream × 5" value="₹1,250" />
              <InvLine label="Blue Pen Box × 2"  value="₹480" />
              <InvLine label="GST (18%)"          value="₹312" />
              <InvLine label="Total"              value="₹2,042" total />
            </div>
          </FeatureCard>

          {/* Analytics */}
          <FeatureCard
            accent="#e11d48" iconPaths={Icons.chart}
            tag="Analytics" tagBg="#fff1f2" tagColor="#e11d48"
            title="Dashboard That Tells the Full Story"
            desc="Revenue, orders, dues, and trends — all summarised on your home screen every morning."
            cta="View dashboard" delay={160}
          >
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <KpiBox val="₹84.3k" lbl="Revenue" delta="↑ 12.4% this week" />
                <KpiBox val="142"    lbl="Orders"  delta="↑ 8 today" />
              </div>
              <KpiBox val="₹8.2k" lbl="Total Dues" delta="4 pending payments" deltaColor="#e11d48" />
            </div>
          </FeatureCard>
        </div>

        {/* ════════════════════════════════════════
            ROW 3 — Inventory full width
        ════════════════════════════════════════ */}
        <FeatureCard
          className="w-full"
          accent="#ea580c" iconPaths={Icons.box}
          tag="Inventory" tagBg="#fff7ed" tagColor="#ea580c"
          title="Smart Inventory with Low Stock Alerts"
          desc="Track every product in real time. Get instant WhatsApp alerts when stock dips below your threshold — never run out of a bestseller."
          cta="Manage inventory" delay={0}
        >
          {/* Two-column layout inside the full-width card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-1">

            {/* Stock bars */}
            <div className="bg-[#fff7ed] border border-orange-100 rounded-xl px-4 py-3 divide-y divide-orange-50">
              <StockBar name="A4 Paper"     pct={8}  count="2 left ⚠️"  color="#ef4444" />
              <StockBar name="Printer Ink"  pct={15} count="3 left ⚠️"  color="#ef4444" />
              <StockBar name="Stapler Set"  pct={44} count="44 units"   color="#f59e0b" />
              <StockBar name="Blue Pen Box" pct={80} count="120 units"  color="#22c55e" />
              <StockBar name="Sticky Notes" pct={62} count="88 units"   color="#22c55e" />
            </div>

            {/* Alert cards */}
            <div className="flex flex-col gap-2.5 justify-center">
              {[
                { color: "#ef4444", bg: "#fef2f2", border: "#fecaca", icon: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01", label: "Critical", name: "A4 Paper", sub: "Only 2 units remaining" },
                { color: "#f59e0b", bg: "#fffbeb", border: "#fde68a", icon: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01", label: "Low",      name: "Printer Ink", sub: "Only 3 units remaining" },
                { color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", icon: "M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3", label: "Restocked", name: "Blue Pen Box", sub: "120 units available" },
              ].map((a, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl px-3.5 py-3 border" style={{ background: a.bg, borderColor: a.border }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: a.color + "20" }}>
                    <Icon d={a.icon} size={15} stroke={a.color} strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11.5px] font-semibold text-zinc-800 leading-tight">{a.name}</div>
                    <div className="text-[10.5px] text-zinc-500 mt-0.5">{a.sub}</div>
                  </div>
                  <span className="text-[9.5px] font-bold px-2 py-1 rounded-full shrink-0" style={{ background: a.color + "20", color: a.color }}>{a.label}</span>
                </div>
              ))}
            </div>
          </div>
        </FeatureCard>

      </div>
    </section>
  );
};

export default Features;