import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import type { DashboardSale } from "../types/dashboard";
import type { User } from "../types/auth";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (v: number) => `₹${Number(v || 0).toLocaleString("en-IN")}`;

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const statusBadge = (status: string) => {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    paid:    { bg: "#e6f4ea", color: "#1a6632", label: "Paid" },
    partial: { bg: "#fff8e1", color: "#7a5800", label: "Partial" },
    unpaid:  { bg: "#fce8e8", color: "#9b1c1c", label: "Unpaid" },
  };
  const s = map[status] ?? map.unpaid;
  return `<span style="background:${s.bg};color:${s.color};font-size:9px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;padding:3px 10px;border-radius:2px;">${s.label}</span>`;
};

// ─── HTML generator ───────────────────────────────────────────────────────────
export const generateInvoiceHTML = (
  sale: DashboardSale,
  user: User,
): string => {
  const businessName = user.business?.name ?? "My Store";
  const ownerName    = user.name    ?? "Owner";
  const ownerPhone   = user.mobile  ?? "";
  const ownerEmail   = user.email   ?? "";
  const ownerAddress = (user as any).address ?? "";
  const gstNumber    = (user.business as any)?.gstNumber ?? "";
  const invNumber    = sale.id.slice(0, 6).toUpperCase();

  const initials = businessName
    .split(" ")
    .slice(0, 2)
    .map((w: string) => w[0])
    .join("")
    .toUpperCase();

  // ── Line item rows ──────────────────────────────────────────────────────────
  const itemRows = sale.items
    .map(
      (item, i) => `
      <tr style="background:${i % 2 === 0 ? "#fff" : "#fafafa"};">
        <td style="padding:13px 16px 13px 0;border-bottom:1px solid #ebebeb;vertical-align:top;">
          <div style="font-weight:600;font-size:12.5px;color:#111;font-family:'Georgia',serif;">${item.product.name}</div>
        </td>
        <td style="padding:13px 16px;border-bottom:1px solid #ebebeb;text-align:center;font-size:12px;color:#444;">${fmt(item.unitPrice)}</td>
        <td style="padding:13px 16px;border-bottom:1px solid #ebebeb;text-align:center;font-size:12px;color:#444;">${item.quantity}</td>
        <td style="padding:13px 0 13px 16px;border-bottom:1px solid #ebebeb;text-align:right;font-size:12.5px;font-weight:700;color:#111;">${fmt(item.quantity * item.unitPrice)}</td>
      </tr>`,
    )
    .join("");

  // ── Summary rows ────────────────────────────────────────────────────────────
  const discountRow =
    sale.discountAmount > 0
      ? `<tr>
           <td style="font-size:12px;color:#555;padding:5px 0;">Discount (${Math.round((sale.discountAmount / sale.subtotalAmount) * 100)}%)</td>
           <td style="text-align:right;font-size:12px;color:#059669;font-weight:600;padding:5px 0;">− ${fmt(sale.discountAmount)}</td>
         </tr>`
      : "";

  const taxVatRow =
    sale.gstAmount > 0
      ? `<tr>
           <td style="font-size:12px;color:#555;padding:5px 0;">Tax (GST ${sale.gstRate}%)</td>
           <td style="text-align:right;font-size:12px;color:#111;padding:5px 0;">${fmt(sale.gstAmount)}</td>
         </tr>`
      : "";

  const dueRow =
    sale.dueAmount > 0
      ? `<tr>
           <td style="font-size:11px;color:#dc2626;padding:4px 0;font-weight:600;">Balance Due</td>
           <td style="text-align:right;font-size:11px;color:#dc2626;font-weight:700;padding:4px 0;">${fmt(sale.dueAmount)}</td>
         </tr>`
      : "";

  const customerPhone = (sale.customer as any).phone ?? "";
  const customerAddress = (sale.customer as any).address ?? "";
  const customerGst = (sale.customer as any).gstNumber ?? "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Invoice ${invNumber} – ${businessName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    body{
      font-family:'DM Sans',sans-serif;
      background:#e8e8e4;
      padding:32px 20px;
      -webkit-print-color-adjust:exact;
      print-color-adjust:exact;
    }
    .page{
      background:#fff;
      max-width:720px;
      margin:0 auto;
      border:1px solid #d8d8d4;
    }
    @media print{
      body{background:#fff;padding:0;}
      .page{max-width:100%;border:none;}
    }
  </style>
</head>
<body>
<div class="page">

  <!-- ══ TOP HEADER BAR ══ -->
  <div style="background:#111;padding:10px 40px;display:flex;align-items:center;justify-content:space-between;">
    <div style="display:flex;align-items:center;gap:10px;">
      <!-- Logo grid icon -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px;width:22px;height:22px;">
        <div style="background:#fff;border-radius:1px;"></div>
        <div style="background:#fff;border-radius:1px;opacity:0.5;"></div>
        <div style="background:#fff;border-radius:1px;opacity:0.5;"></div>
        <div style="background:#fff;border-radius:1px;"></div>
      </div>
      <span style="font-size:13px;font-weight:600;color:#fff;letter-spacing:0.04em;">${businessName}</span>
      ${gstNumber ? `<span style="font-size:10px;color:rgba(255,255,255,0.4);margin-left:4px;">GST: ${gstNumber}</span>` : ""}
    </div>
    <span style="font-size:10px;color:rgba(255,255,255,0.45);letter-spacing:0.08em;text-transform:uppercase;">Tax Invoice</span>
  </div>

  <!-- ══ INVOICE TITLE + META ══ -->
  <div style="padding:36px 40px 28px;display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid #ebebeb;">

    <div>
      <div style="font-family:'EB Garamond',Georgia,serif;font-size:48px;font-weight:400;color:#111;line-height:1;letter-spacing:-1.5px;">Invoice</div>
      <div style="margin-top:14px;display:flex;flex-direction:column;gap:5px;">
        <div style="display:flex;gap:20px;font-size:11.5px;">
          <span style="color:#999;min-width:70px;">Invoice #</span>
          <span style="font-weight:600;color:#111;font-family:monospace;letter-spacing:0.05em;">${invNumber}</span>
        </div>
        <div style="display:flex;gap:20px;font-size:11.5px;">
          <span style="color:#999;min-width:70px;">Date</span>
          <span style="color:#333;">${formatDate(sale.createdAt)}</span>
        </div>
        <div style="display:flex;gap:20px;font-size:11.5px;align-items:center;">
          <span style="color:#999;min-width:70px;">Status</span>
          ${statusBadge(sale.status)}
        </div>
      </div>
    </div>

    <div style="text-align:right;">
      <div style="font-size:10px;color:#aaa;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:6px;">Total Due</div>
      <div style="font-family:'EB Garamond',Georgia,serif;font-size:36px;font-weight:600;color:#111;line-height:1;">${fmt(sale.totalAmount)}</div>
      ${sale.dueAmount > 0 && sale.dueAmount !== sale.totalAmount
        ? `<div style="font-size:11px;color:#dc2626;margin-top:5px;">Balance: ${fmt(sale.dueAmount)}</div>`
        : ""}
    </div>
  </div>

  <!-- ══ BILL FROM / BILL TO ══ -->
  <div style="display:flex;padding:24px 40px;border-bottom:1px solid #ebebeb;gap:40px;">

    <!-- From -->
    <div style="flex:1;">
      <div style="font-size:9px;font-weight:600;color:#aaa;text-transform:uppercase;letter-spacing:0.14em;margin-bottom:10px;">From</div>
      <div style="font-size:14px;font-weight:600;color:#111;font-family:'EB Garamond',Georgia,serif;">${businessName}</div>
      ${ownerAddress
        ? `<div style="font-size:11.5px;color:#666;margin-top:4px;line-height:1.6;">${ownerAddress.replace(/\n/g, "<br>")}</div>`
        : ""}
      ${ownerPhone ? `<div style="font-size:11.5px;color:#666;margin-top:4px;">${ownerPhone}</div>` : ""}
      ${ownerEmail ? `<div style="font-size:11.5px;color:#666;margin-top:2px;">${ownerEmail}</div>` : ""}
      ${gstNumber ? `<div style="font-size:11px;color:#888;margin-top:6px;font-weight:500;">GST: ${gstNumber}</div>` : ""}
    </div>

    <!-- Divider -->
    <div style="width:1px;background:#ebebeb;flex-shrink:0;"></div>

    <!-- To -->
    <div style="flex:1;">
      <div style="font-size:9px;font-weight:600;color:#aaa;text-transform:uppercase;letter-spacing:0.14em;margin-bottom:10px;">Bill To</div>
      <div style="font-size:14px;font-weight:600;color:#111;font-family:'EB Garamond',Georgia,serif;">${sale.customer.name}</div>
      ${customerAddress
        ? `<div style="font-size:11.5px;color:#666;margin-top:4px;line-height:1.6;">${customerAddress.replace(/\n/g, "<br>")}</div>`
        : ""}
      ${customerPhone ? `<div style="font-size:11.5px;color:#666;margin-top:4px;">${customerPhone}</div>` : ""}
      ${customerGst ? `<div style="font-size:11px;color:#888;margin-top:6px;font-weight:500;">GST: ${customerGst}</div>` : ""}
    </div>
  </div>

  <!-- ══ LINE ITEMS ══ -->
  <div style="padding:0 40px;">
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr style="border-bottom:2px solid #111;">
          <th style="text-align:left;font-size:9.5px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:0.12em;padding:12px 16px 12px 0;">Item Description</th>
          <th style="text-align:center;font-size:9.5px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:0.12em;padding:12px 16px;width:110px;">Price</th>
          <th style="text-align:center;font-size:9.5px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:0.12em;padding:12px 16px;width:60px;">Qty</th>
          <th style="text-align:right;font-size:9.5px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:0.12em;padding:12px 0 12px 16px;width:110px;">Total</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>
  </div>

  <!-- ══ BOTTOM SECTION: CONTACT LEFT + TOTALS RIGHT ══ -->
  <div style="display:flex;padding:28px 40px 36px;gap:40px;border-top:2px solid #111;margin-top:0;">

    <!-- LEFT: Contact + Terms -->
    <div style="flex:1;min-width:0;">
      <div style="font-size:9.5px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:9px;">Contact</div>
      <div style="font-size:11.5px;color:#444;line-height:1.9;">
        ${ownerAddress ? `${ownerAddress.replace(/\n/g, ", ")}<br>` : ""}
        ${ownerPhone ? `${ownerPhone}<br>` : ""}
        ${ownerEmail ? `${ownerEmail}<br>` : ""}
        ${gstNumber ? `GST No: ${gstNumber}` : ""}
      </div>

      <div style="margin-top:20px;">
        <div style="font-size:9.5px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:7px;">Terms &amp; Conditions</div>
        <div style="font-size:11px;color:#bbb;line-height:1.7;">
          Payment due within 15 days of invoice date.<br>
          Goods once sold are non-refundable unless defective.
        </div>
      </div>
    </div>

    <!-- RIGHT: Totals + Signature -->
    <div style="width:240px;flex-shrink:0;">

      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="font-size:12px;color:#555;padding:5px 0;">Sub Total</td>
          <td style="text-align:right;font-size:12px;color:#111;padding:5px 0;">${fmt(sale.subtotalAmount)}</td>
        </tr>
        ${taxVatRow}
        ${discountRow}
      </table>

      <div style="border-top:1.5px solid #111;margin:10px 0;"></div>

      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:10px;">
        <span style="font-size:13px;font-weight:700;color:#111;">Grand Total</span>
        <span style="font-family:'EB Garamond',Georgia,serif;font-size:20px;font-weight:600;color:#111;">${fmt(sale.totalAmount)}</span>
      </div>

      <div style="border-top:1px solid #ebebeb;margin:8px 0;"></div>

      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="font-size:11.5px;color:#059669;padding:4px 0;">Amount Paid</td>
          <td style="text-align:right;font-size:11.5px;color:#059669;font-weight:600;padding:4px 0;">${fmt(sale.paidAmount)}</td>
        </tr>
        ${dueRow}
      </table>

      <!-- Signature block -->
      <div style="margin-top:32px;padding-top:16px;border-top:1px solid #ddd;">
        <div style="font-family:'EB Garamond',Georgia,serif;font-style:italic;font-size:26px;color:#111;line-height:1;margin-bottom:8px;">${ownerName}</div>
        <div style="font-size:11.5px;font-weight:600;color:#111;">${ownerName}</div>
        <div style="font-size:11px;color:#999;margin-top:2px;">${businessName}</div>
      </div>
    </div>
  </div>

  <!-- ══ FOOTER ══ -->
  <div style="background:#f5f5f3;border-top:1px solid #e0e0dc;padding:10px 40px;display:flex;align-items:center;justify-content:space-between;">
    <span style="font-size:10px;color:#aaa;">Thank you for your business</span>
    <div style="display:flex;align-items:center;gap:6px;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:2px;width:14px;height:14px;">
        <div style="background:#333;border-radius:1px;"></div>
        <div style="background:#333;border-radius:1px;opacity:0.4;"></div>
        <div style="background:#333;border-radius:1px;opacity:0.4;"></div>
        <div style="background:#333;border-radius:1px;"></div>
      </div>
      <span style="font-size:10px;color:#aaa;">Generated by </span>
      <span style="font-size:10px;font-weight:700;color:#333;">Bizezy</span>
    </div>
  </div>

</div>
</body>
</html>`;
};

// ─── Entry point called from SaleDetailPage ───────────────────────────────────
export const handleGenerateInvoice = async (
  sale: DashboardSale,
  user: User,
) => {
  const html = generateInvoiceHTML(sale, user);
  const { uri } = await Print.printToFileAsync({ html, base64: false });

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      dialogTitle: `Invoice #${sale.id.slice(0, 6).toUpperCase()} – ${user.business?.name ?? "Invoice"}`,
      UTI: "com.adobe.pdf",
    });
  } else {
    await Print.printAsync({ uri });
  }
};