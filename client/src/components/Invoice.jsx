import React, { forwardRef } from "react";
import { useAuthContext } from "../context/AuthContext";

const Invoice = forwardRef(({ sale }, ref) => {
  const { user, isLoading } = useAuthContext();

  const totalUnits = sale.items.reduce((s, i) => s + i.quantity, 0);
  const isPaid = sale.dueAmount <= 0;
  const issueDate = new Date(sale.createdAt);
  const dueDate = new Date(issueDate);
  dueDate.setDate(dueDate.getDate() + 15);

  const fmt = (n) =>
    Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 });

  const dateOpts = { day: "numeric", month: "long", year: "numeric" };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center px-6 py-12">
      <div
        ref={ref}
        className="font-sans bg-white w-full max-w-3xl border border-gray-300 rounded-sm mx-auto mt-10"
        style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}
      >
        {/* ── Top bar ── */}
        <div className="h-1 bg-gray-900" />

        {/* ── Header ── */}
        <div className="px-11 pt-9 pb-7 flex justify-between items-start border-b border-gray-200">
          <div>
            <div className="text-[26px] font-extrabold text-gray-900 tracking-tight leading-none mb-1.5">
              {user.business?.name || "-"}
            </div>
            <div className="text-[11px] text-gray-500 leading-loose">
              123 Business Avenue, Tech Park
              <br />
              <span className="text-gray-400">
                Contact: {user.mobile || "-"}
              </span>
              <br />
              <span className="text-gray-400">GST: 29ABCDE1234F1Z5</span>
              &nbsp;&nbsp;
              <span className="text-gray-300">|</span>
              &nbsp;&nbsp;
            </div>
          </div>

          <div className="text-right">
            <div className="text-[11px] tracking-[3px] uppercase text-gray-400 mb-1.5">
              Invoice
            </div>
            <div className="text-[22px] font-extrabold text-gray-900 tracking-tight mb-4">
              #{sale.id.slice(0, 8).toUpperCase()}
            </div>
            <div className="text-xs text-gray-500" style={{ lineHeight: 2.1 }}>
              <div>
                <span className="text-gray-400">Issue Date&nbsp;&nbsp;</span>
                <span className="font-semibold text-gray-800">
                  {issueDate.toLocaleDateString("en-IN", dateOpts)}
                </span>
              </div>
              <div>
                <span className="text-gray-400">
                  Due Date&nbsp;&nbsp;&nbsp;&nbsp;
                </span>
                <span className="font-semibold text-gray-800">
                  {dueDate.toLocaleDateString("en-IN", dateOpts)}
                </span>
              </div>
              <div>
                <span className="text-gray-400">
                  Terms&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </span>
                <span className="font-semibold text-gray-800">Net 15</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bill To ── */}
        <div className="px-11 py-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-[9px] tracking-[2.5px] uppercase text-gray-400 font-semibold mb-2.5">
                Billed To
              </div>
              <div className="text-[17px] font-bold text-gray-900 mb-1">
                {sale.customer.name}
              </div>
              <div className="text-xs text-gray-500 mb-0.5">
                {sale.customer.mobile}
              </div>
              {sale.customer.email && (
                <div className="text-xs text-gray-500">
                  {sale.customer.email}
                </div>
              )}
            </div>

            <div className="text-right">
              <div className="text-[9px] tracking-[2.5px] uppercase text-gray-400 font-semibold mb-2.5">
                Order Info
              </div>
              <div className="text-xs text-gray-500" style={{ lineHeight: 2 }}>
                <div>
                  <span className="text-gray-400">Order ID&nbsp;&nbsp;</span>
                  <span className="font-semibold text-gray-800">
                    {sale.id.slice(0, 12)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">
                    Status&nbsp;&nbsp;&nbsp;&nbsp;
                  </span>
                  <span
                    className={`font-bold ${isPaid ? "text-gray-900" : "text-gray-500"}`}
                  >
                    {isPaid
                      ? "Paid"
                      : sale.paidAmount > 0
                        ? "Partially Paid"
                        : "Unpaid"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="px-11">
          <table
            className="w-full border-collapse text-xs mt-1"
            style={{ tableLayout: "fixed" }}
          >
            <colgroup>
              <col style={{ width: "4%" }} />
              <col style={{ width: "30%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "21%" }} />
              <col style={{ width: "21%" }} />
            </colgroup>
            <thead>
              <tr className="border-b-2 border-gray-900">
                {[
                  "#",
                  "Item Description",
                  "HSN/SKU",
                  "Qty",
                  "Unit Price (₹)",
                  "Total (₹)",
                ].map((h, i) => (
                  <th
                    key={h}
                    className={`py-2.5 px-2 text-[9px] font-bold text-gray-500 uppercase tracking-[1.5px] ${
                      i <= 1 ? "text-left" : "text-right"
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sale.items.map((item, idx) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-4 px-2 text-gray-300 text-[11px]">
                    {idx + 1}
                  </td>
                  <td className="py-4 px-2">
                    <div className="font-semibold text-gray-900 mb-0.5">
                      {item.product.name}
                    </div>
                    {item.product.category && (
                      <div className="text-[10px] text-gray-400 tracking-[0.5px]">
                        {item.product.category}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-2 text-right text-gray-400">
                    {item.product.sku || "—"}
                  </td>
                  <td className="py-4 px-2 text-right text-gray-600 font-semibold">
                    {item.quantity}
                  </td>
                  <td className="py-4 px-2 text-right text-gray-500">
                    ₹{fmt(item.unitPrice)}
                  </td>
                  <td className="py-4 px-2 text-right font-bold text-gray-900">
                    ₹{fmt(item.totalAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Totals ── */}
        <div className="px-11 pt-5 pb-8 flex justify-end">
          <div className="w-[270px]">
            <div className="flex justify-between py-1.5 text-xs text-gray-500">
              <span>Subtotal</span>
              <span>₹{fmt(sale.subtotalAmount)}</span>
            </div>

            {sale.discountAmount > 0 && (
              <div className="flex justify-between py-1.5 text-xs text-gray-500 border-b border-gray-100">
                <span>Discount</span>
                <span className="text-gray-600 font-semibold">
                  − ₹{fmt(sale.discountAmount)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center py-3 mt-1.5 border-t-2 border-b-2 border-gray-900">
              <span className="text-[13px] font-bold text-gray-900">
                Total Amount
              </span>
              <span className="text-xl font-extrabold text-gray-900 tracking-tight">
                ₹{fmt(sale.subtotalAmount - (sale.discountAmount || 0))}
              </span>
            </div>

            <div className="flex justify-between pt-2 pb-1 text-xs text-gray-500">
              <span>Amount Paid</span>
              <span className="font-bold text-gray-900">
                ₹{fmt(sale.paidAmount)}
              </span>
            </div>

            {!isPaid && (
              <div className="flex justify-between py-1 text-xs">
                <span className="text-gray-500">Balance Due</span>
                <span className="font-bold text-gray-900">
                  ₹{fmt(sale.dueAmount)}
                </span>
              </div>
            )}

            {isPaid && (
              <div className="mt-2.5 px-3 py-1.5 border border-[1.5px] border-gray-900 inline-block text-[9px] font-bold tracking-[2px] uppercase text-gray-900">
                ✓ Fully Settled
              </div>
            )}
          </div>
        </div>

        {/* ── Terms ── */}
        <div className="px-11 pb-8">
          <div className="border-t border-gray-200 pt-4">
            <div className="text-[9px] tracking-[2.5px] uppercase text-gray-400 font-bold mb-2.5">
              Terms &amp; Conditions
            </div>
            <div className="text-[11px] text-gray-400 leading-loose">
              1. Payment is due within 15 days of the invoice date.
              <br />
              2. Please include the invoice number in your payment reference.
              <br />
              3. Goods once sold will not be taken back or exchanged.
              <br />
              4. Interest @18% p.a. will be charged on delayed payments.
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="border-t border-gray-200 px-11 py-3.5 flex justify-between items-center bg-gray-50">
          <div className="text-[11px] text-gray-400">
            Thank you for your business.
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] text-gray-300 font-mono">
              bizezy.in
            </span>
            <span className="text-gray-300">|</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-900 flex-shrink-0" />
              <span className="text-[10px] font-bold text-gray-900 tracking-[0.5px]">
                Generated by Bizezy
              </span>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="h-1 bg-gray-900" />
      </div>
    </div>
  );
});

export default Invoice;
