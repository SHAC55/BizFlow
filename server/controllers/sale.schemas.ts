import z from "zod";

const saleStatusSchema = z.enum(["all", "paid", "partial", "pending"]);

export const createSaleSchema = z
  .object({
    customerId: z.string().uuid(),
    items: z
      .array(
        z.object({
          productId: z.string().uuid(),
          quantity: z.number().int().positive(),
          unitPrice: z.number().positive(),
        }),
      )
      .min(1),
    subtotalAmount: z.number().positive(),
    discountAmount: z.number().nonnegative().optional().default(0),
    gstRate: z.number().min(0).max(100).optional().default(0),
    gstAmount: z.number().nonnegative().optional().default(0),
    totalAmount: z.number().positive(),
    paidAmount: z.number().nonnegative().optional().default(0),
    reminderDate: z.coerce.date().optional(),
  })
  .superRefine((data, context) => {
    const productIds = new Set<string>();

    data.items.forEach((item, index) => {
      if (productIds.has(item.productId)) {
        context.addIssue({
          code: "custom",
          path: ["items", index, "productId"],
          message: "duplicate products are not allowed",
        });
      }

      productIds.add(item.productId);
    });

    const subtotal = data.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );

    const discountAmount = Number(data.discountAmount || 0);
    const taxableAmount = Math.max(subtotal - discountAmount, 0);
    const expectedGstAmount = Number(
      ((taxableAmount * Number(data.gstRate || 0)) / 100).toFixed(2),
    );
    const expectedTotalAmount = Number(
      (taxableAmount + expectedGstAmount).toFixed(2),
    );

    if (Math.abs(data.subtotalAmount - subtotal) > 0.01) {
      context.addIssue({
        code: "custom",
        path: ["subtotalAmount"],
        message: "subtotal amount does not match item subtotal",
      });
    }

    if (discountAmount > subtotal) {
      context.addIssue({
        code: "custom",
        path: ["discountAmount"],
        message: "discount amount cannot exceed item subtotal",
      });
    }

    if (Math.abs(data.gstAmount - expectedGstAmount) > 0.01) {
      context.addIssue({
        code: "custom",
        path: ["gstAmount"],
        message: "gst amount does not match subtotal, discount and gst rate",
      });
    }

    if (Math.abs(data.totalAmount - expectedTotalAmount) > 0.01) {
      context.addIssue({
        code: "custom",
        path: ["totalAmount"],
        message: "total amount does not match subtotal, discount and gst",
      });
    }

    if (data.paidAmount > data.totalAmount) {
      context.addIssue({
        code: "custom",
        path: ["paidAmount"],
        message: "paid amount cannot exceed total amount",
      });
    }
  });

export const saleReminderParamsSchema = z.object({
  id: z.string().uuid(),
});

export const getSalesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  search: z
    .string()
    .trim()
    .max(255)
    .optional()
    .transform((value) => value || undefined),
  status: saleStatusSchema.optional().default("all"),
});

export const createSalePaymentSchema = z.object({
  amount: z.number().positive(),
});
