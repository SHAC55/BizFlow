import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import type { DashboardSale } from "../types/dashboard";
import type { User } from "../types/auth";

const fmt = (v: number) =>
  `₹${Number(v || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

const dueDateFromCreated = (value: string) => {
  const d = new Date(value);
  d.setDate(d.getDate() + 15);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
};

const statusConfig = (status: string) => {
  const map: Record<string, { bg: string; color: string; dot: string; label: string }> = {
    paid:    { bg: "#ecfdf5", color: "#065f46", dot: "#10b981", label: "Paid" },
    partial: { bg: "#fffbeb", color: "#78350f", dot: "#f59e0b", label: "Partially Paid" },
    unpaid:  { bg: "#fef2f2", color: "#7f1d1d", dot: "#ef4444", label: "Unpaid" },
  };
  return map[status] ?? map.unpaid;
};

export const generateInvoiceHTML = (sale: DashboardSale, user: User): string => {
  const businessName  = user.business?.name ?? "My Store";
  const ownerName     = user.name    ?? "Owner";
  const ownerPhone    = user.mobile  ?? "";
  const ownerEmail    = user.email   ?? "";

  // ── Dummy fallbacks until real fields are wired ──────────────────────────
  const ownerAddress  = (user.business as any)?.address  ?? "123, MG Road, Andheri West\nMumbai, Maharashtra 400058";
  const gstNumber     = (user.business as any)?.gstNumber ?? "27AABCU9603R1ZX";
  // ─────────────────────────────────────────────────────────────────────────

  const invNumber     = sale.id.slice(0, 8).toUpperCase();
  const status        = statusConfig(sale.status);
  const hasGst        = sale.gstAmount > 0;
  const hasDiscount   = sale.discountAmount > 0;

  const initials = businessName
    .split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase();

  const customerPhone   = (sale.customer as any).phone   ?? "";
  const customerAddress = (sale.customer as any).address ?? "";
  const customerGst     = (sale.customer as any).gstNumber ?? "";

  const itemRows = sale.items.map((item) => {
    const lineGst = item.unitPrice > 0
      ? Math.round(((sale.gstRate ?? 0) / 100) * item.unitPrice * item.quantity * 100) / 100
      : 0;
    return `
    <tr>
      <td class="td-desc">
        <div class="item-name">${item.product.name}</div>
        ${(item as any).sku ? `<div class="item-sku">${(item as any).sku}</div>` : ""}
      </td>
      <td class="td-r">${fmt(item.unitPrice)}</td>
      <td class="td-r qty">${item.quantity}</td>
      ${hasGst ? `<td class="td-r">${fmt(lineGst)}</td>` : ""}
      <td class="td-r amount">${fmt(item.quantity * item.unitPrice)}</td>
    </tr>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Invoice #${invNumber}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@400;500&family=Geist:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --ink: #0f0f0f; --ink-soft: #4b5563; --ink-muted: #9ca3af;
    --surface: #ffffff; --surface-2: #f9fafb; --surface-3: #f3f4f6;
    --accent: #111827; --border: #e5e7eb; --border-strong: #d1d5db;
    --serif: 'Instrument Serif', Georgia, serif;
    --mono:  'DM Mono', 'Courier New', monospace;
    --sans:  'Geist', system-ui, sans-serif;
  }
  body { font-family: var(--sans); background: #f0f0ee; padding: 48px 24px; color: var(--ink); -webkit-print-color-adjust: exact; print-color-adjust: exact; font-size: 13px; line-height: 1.5; }
  .invoice { background: var(--surface); max-width: 800px; margin: 0 auto; border: 1px solid var(--border-strong); border-radius: 2px; overflow: hidden; }

  /* HEADER */
  .header { display: flex; align-items: stretch; border-bottom: 1px solid var(--border); }
  .header-brand { flex: 1; padding: 36px 40px 32px; border-right: 1px solid var(--border); }
  .brand-mark { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; }
  .brand-initials { width: 40px; height: 40px; background: var(--ink); color: #fff; font-family: var(--serif); font-size: 15px; display: flex; align-items: center; justify-content: center; border-radius: 2px; flex-shrink: 0; }
  .brand-name { font-size: 15px; font-weight: 600; color: var(--ink); letter-spacing: -0.01em; }
  .brand-gst  { font-size: 11px; color: var(--ink-muted); font-family: var(--mono); margin-top: 2px; }
  .brand-address { font-size: 12px; color: var(--ink-soft); line-height: 1.75; }
  .brand-address a { color: var(--ink-soft); text-decoration: none; }
  .header-meta { width: 270px; flex-shrink: 0; padding: 36px 40px 32px; background: var(--surface-2); }
  .meta-label { font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-muted); margin-bottom: 4px; }
  .meta-invoice-num { font-family: var(--mono); font-size: 20px; font-weight: 500; color: var(--ink); letter-spacing: 0.04em; margin-bottom: 24px; }
  .meta-row { display: flex; justify-content: space-between; font-size: 12px; color: var(--ink-soft); margin-bottom: 8px; gap: 12px; }
  .meta-row strong { color: var(--ink); font-weight: 500; text-align: right; }
  .status-pill { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 100px; font-size: 11px; font-weight: 500; }
  .status-dot  { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

  /* AMOUNT HERO */
  .amount-hero { padding: 26px 40px; background: var(--accent); display: flex; align-items: center; justify-content: space-between; }
  .amount-label { font-size: 10px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255,255,255,0.38); margin-bottom: 5px; }
  .amount-value { font-family: var(--serif); font-size: 42px; color: #fff; letter-spacing: -1.5px; line-height: 1; }
  .amount-sub   { font-size: 11.5px; color: rgba(255,255,255,0.45); margin-top: 7px; }
  .amount-sub span { color: rgba(255,255,255,0.82); font-weight: 500; }
  .billed-to    { text-align: right; }
  .billed-label { font-size: 10px; color: rgba(255,255,255,0.35); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 5px; }
  .billed-name  { font-family: var(--serif); font-size: 17px; color: #fff; }
  .billed-phone { font-size: 11.5px; color: rgba(255,255,255,0.42); margin-top: 4px; }

  /* PARTIES */
  .parties { display: grid; grid-template-columns: 1fr 1px 1fr; border-bottom: 1px solid var(--border); }
  .party { padding: 26px 40px; }
  .party-divider { background: var(--border); }
  .party-heading { font-size: 10px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-muted); margin-bottom: 10px; }
  .party-name    { font-family: var(--serif); font-size: 17px; color: var(--ink); line-height: 1.3; margin-bottom: 7px; }
  .party-detail  { font-size: 12px; color: var(--ink-soft); line-height: 1.75; }
  .party-gst     { display: inline-block; margin-top: 8px; font-family: var(--mono); font-size: 10.5px; color: var(--ink-muted); background: var(--surface-3); padding: 3px 8px; border-radius: 4px; }

  /* LINE ITEMS */
  .items-wrap  { padding: 0 40px; }
  .items-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
  .col-desc  { width: auto; }
  .col-price { width: 110px; }
  .col-qty   { width: 56px; }
  .col-gst   { width: 92px; }
  .col-amt   { width: 112px; }
  .items-table thead tr { border-bottom: 1.5px solid var(--ink); }
  .items-table thead th { font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-muted); padding: 14px 0 10px; white-space: nowrap; overflow: hidden; }
  .items-table thead th.l { text-align: left; }
  .items-table thead th.r { text-align: right; }
  .items-table tbody tr { border-bottom: 1px solid var(--border); }
  .items-table tbody tr:last-child { border-bottom: none; }
  .items-table tbody tr:nth-child(even) td { background: #fafafa; }
  .td-desc { padding: 15px 16px 15px 0; vertical-align: middle; }
  .item-name { font-size: 13px; font-weight: 500; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .item-sku  { display: inline-flex; align-items: center; gap: 5px; font-family: var(--mono); font-size: 10.5px; color: var(--ink-muted); margin-top: 3px; }
  .item-sku::before { content: ''; display: inline-block; width: 3px; height: 3px; border-radius: 50%; background: var(--ink-muted); flex-shrink: 0; }
  .td-r { padding: 15px 0 15px 12px; vertical-align: middle; text-align: right; font-size: 12.5px; color: var(--ink-soft); font-variant-numeric: tabular-nums; white-space: nowrap; }
  .td-r.qty    { font-family: var(--mono); font-size: 12.5px; font-weight: 500; color: var(--ink); }
  .td-r.amount { color: var(--ink); font-weight: 600; font-size: 13px; }

  /* BOTTOM */
  .bottom       { display: grid; grid-template-columns: 1fr 280px; border-top: 1px solid var(--border); }
  .bottom-left  { padding: 28px 40px; border-right: 1px solid var(--border); }
  .bottom-right { padding: 28px 40px; }
  .section-heading { font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-muted); margin-bottom: 8px; }
  .notes-text { font-size: 12px; color: var(--ink-soft); line-height: 1.75; }
  .totals-table { width: 100%; border-collapse: collapse; }
  .totals-table td { padding: 5px 0; font-size: 12.5px; font-variant-numeric: tabular-nums; }
  .totals-table td:last-child { text-align: right; }
  .subtotal-label { color: var(--ink-soft); }
  .subtotal-val   { color: var(--ink); }
  .discount-val   { color: #059669; font-weight: 500; }
  .tax-label      { color: var(--ink-soft); }
  .totals-divider { border: none; border-top: 1px solid var(--border); margin: 10px 0; }
  .grand-row td              { padding: 8px 0; font-size: 14px; font-weight: 600; color: var(--ink); }
  .grand-row td:last-child   { font-family: var(--serif); font-size: 20px; font-weight: 400; }
  .payment-section { margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border); }
  .payment-row { display: flex; justify-content: space-between; font-size: 12px; padding: 4px 0; font-variant-numeric: tabular-nums; }
  .paid-label { color: #059669; font-weight: 500; }
  .paid-val   { color: #059669; font-weight: 600; }
  .due-label  { color: #dc2626; font-weight: 600; }
  .due-val    { color: #dc2626; font-weight: 700; font-size: 13px; }
  .signature-block { margin-top: 28px; padding-top: 20px; border-top: 1px solid var(--border); }
  .signature-name  { font-family: var(--serif); font-style: italic; font-size: 28px; color: var(--ink); line-height: 1; margin-bottom: 8px; }
  .signature-label { font-size: 12px; color: var(--ink-soft); }

  /* FOOTER */
  .footer       { display: flex; align-items: center; justify-content: space-between; padding: 14px 40px; background: var(--surface-2); border-top: 1px solid var(--border); }
  .footer-left  { font-size: 11px; color: var(--ink-muted); }
  .footer-right { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--ink-muted); }
  .footer-brand { font-weight: 600; color: var(--ink-soft); }

  @media print {
    body { background: #fff; padding: 0; }
    .invoice { max-width: 100%; border: none; border-radius: 0; }
  }
</style>
</head>
<body>
<div class="invoice">

  <!-- HEADER -->
  <div class="header">
    <div class="header-brand">
      <div class="brand-mark">
        <div class="brand-initials">${initials}</div>
        <div>
          <div class="brand-name">${businessName}</div>
          <div class="brand-gst">GSTIN ${gstNumber}</div>
        </div>
      </div>
      <div class="brand-address">
        ${ownerAddress.replace(/\n/g, "<br>")}<br>
        ${ownerPhone && ownerEmail
          ? `${ownerPhone} &nbsp;·&nbsp; <a href="mailto:${ownerEmail}">${ownerEmail}</a>`
          : ownerPhone ? ownerPhone : ownerEmail ? `<a href="mailto:${ownerEmail}">${ownerEmail}</a>` : ""}
      </div>
    </div>
    <div class="header-meta">
      <div class="meta-label">Tax Invoice</div>
      <div class="meta-invoice-num">#${invNumber}</div>
      <div class="meta-row"><span>Issue date</span><strong>${formatDate(sale.createdAt)}</strong></div>
      <div class="meta-row"><span>Due date</span><strong>${dueDateFromCreated(sale.createdAt)}</strong></div>
      <div class="meta-row" style="margin-top:16px;align-items:center;">
        <span>Status</span>
        <span class="status-pill" style="background:${status.bg};color:${status.color};">
          <span class="status-dot" style="background:${status.dot};"></span>
          ${status.label}
        </span>
      </div>
    </div>
  </div>

  <!-- AMOUNT HERO -->
  

  <!-- PARTIES -->
  <div class="parties">
    <div class="party">
      <div class="party-heading">From</div>
      <div class="party-name">${businessName}</div>
      <div class="party-detail">
        ${ownerAddress.replace(/\n/g, ", ")}<br>
        ${ownerPhone ? `${ownerPhone}<br>` : ""}
        ${ownerEmail ? ownerEmail : ""}
      </div>
      <div class="party-gst">GSTIN: ${gstNumber}</div>
    </div>
    <div class="party-divider"></div>
    <div class="party">
      <div class="party-heading">Bill To</div>
      <div class="party-name">${sale.customer.name}</div>
      <div class="party-detail">
        ${customerAddress ? `${customerAddress.replace(/\n/g, ", ")}<br>` : ""}
        ${customerPhone ? customerPhone : ""}
      </div>
      ${customerGst ? `<div class="party-gst">GSTIN: ${customerGst}</div>` : ""}
    </div>
  </div>

  <!-- LINE ITEMS -->
  <div class="items-wrap" style="padding-top:6px;padding-bottom:6px;">
    <table class="items-table">
      <colgroup>
        <col class="col-desc">
        <col class="col-price">
        <col class="col-qty">
        ${hasGst ? `<col class="col-gst">` : ""}
        <col class="col-amt">
      </colgroup>
      <thead>
        <tr>
          <th class="l">Item / Description</th>
          <th class="r">Unit Price</th>
          <th class="r">Qty</th>
          ${hasGst ? `<th class="r">GST (${sale.gstRate}%)</th>` : ""}
          <th class="r">Amount</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>
  </div>

  <!-- BOTTOM -->
  <div class="bottom">
    <div class="bottom-left">
      <div class="section-heading">Notes</div>
      <div class="notes-text">
        ${(sale as any).notes ?? "Thank you for your continued business. Please make payment by the due date."}
      </div>
    </div>
    <div class="bottom-right">
      <table class="totals-table">
        <tr><td class="subtotal-label">Subtotal</td><td class="subtotal-val">${fmt(sale.subtotalAmount)}</td></tr>
        ${hasGst ? `<tr><td class="tax-label">GST (${sale.gstRate}%)</td><td class="subtotal-val">${fmt(sale.gstAmount)}</td></tr>` : ""}
        ${hasDiscount ? `<tr><td class="subtotal-label">Discount</td><td class="discount-val">− ${fmt(sale.discountAmount)}</td></tr>` : ""}
      </table>
      <hr class="totals-divider">
      <table class="totals-table">
        <tr class="grand-row"><td>Total</td><td>${fmt(sale.totalAmount)}</td></tr>
      </table>
      <div class="payment-section">
        <div class="payment-row">
          <span class="paid-label">Amount Paid</span>
          <span class="paid-val">${fmt(sale.paidAmount)}</span>
        </div>
        ${sale.dueAmount > 0 ? `
        <div class="payment-row" style="margin-top:4px;">
          <span class="due-label">Balance Due</span>
          <span class="due-val">${fmt(sale.dueAmount)}</span>
        </div>` : ""}
      </div>
     
    </div>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    <div class="footer-left">Invoice #${invNumber} &nbsp;·&nbsp; ${formatDate(sale.createdAt)}</div>
    <div class="footer-right">GSTIN: <span class="footer-brand">${gstNumber}</span> &nbsp;·&nbsp; Generated by <span class="footer-brand">BizEzy</span></div>
  </div>

</div>
</body>
</html>`;
};

export const handleGenerateInvoice = async (sale: DashboardSale, user: User) => {
  const html = generateInvoiceHTML(sale, user);
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      dialogTitle: `Invoice #${sale.id.slice(0, 8).toUpperCase()} – ${user.business?.name ?? "Invoice"}`,
      UTI: "com.adobe.pdf",
    });
  } else {
    await Print.printAsync({ uri });
  }
};