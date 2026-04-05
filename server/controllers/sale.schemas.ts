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
    totalAmount: z.number().positive(),
    paidAmount: z.number().nonnegative().optional().default(0),
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

    if (data.totalAmount > subtotal) {
      context.addIssue({
        code: "custom",
        path: ["totalAmount"],
        message: "total amount cannot exceed item subtotal",
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
