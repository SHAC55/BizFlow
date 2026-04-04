import z from "zod";

export const createProductSchema = z.object({
  name: z.string().trim().min(1).max(255),
  price: z.number().nonnegative(),
  quantity: z.number().int().nonnegative(),
  minimumQuantity: z.number().int().nonnegative(),
  sku: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .optional()
    .transform((value) => value || undefined),
});

export const updateProductSchema = z
  .object({
    name: z.string().trim().min(1).max(255).optional(),
    price: z.number().nonnegative().optional(),
    quantity: z.number().int().nonnegative().optional(),
    minimumQuantity: z.number().int().nonnegative().optional(),
    sku: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .nullable()
      .optional()
      .transform((value) => value || undefined),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "at least one field is required",
  });

export const getProductsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  search: z
    .string()
    .trim()
    .max(255)
    .optional()
    .transform((value) => value || undefined),
  lowStockOnly: z.coerce.boolean().optional().default(false),
});
