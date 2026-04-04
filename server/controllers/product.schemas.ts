import z from "zod";

const booleanQuerySchema = z.preprocess((value) => {
  if (typeof value === "string") {
    if (value === "true") {
      return true;
    }

    if (value === "false") {
      return false;
    }
  }

  return value;
}, z.boolean());

export const createProductSchema = z.object({
  name: z.string().trim().min(1).max(255),
  category: z.string().trim().min(1).max(100),
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
    category: z.string().trim().min(1).max(100).optional(),
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
  category: z
    .string()
    .trim()
    .max(100)
    .optional()
    .transform((value) => value || undefined),
  search: z
    .string()
    .trim()
    .max(255)
    .optional()
    .transform((value) => value || undefined),
  lowStockOnly: booleanQuerySchema.optional().default(false),
});

export const adjustStockSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("INCREASE"),
    quantity: z.number().int().positive(),
    reason: z.string().trim().min(1).max(255),
    notes: z.string().trim().max(1000).optional(),
  }),
  z.object({
    type: z.literal("DECREASE"),
    quantity: z.number().int().positive(),
    reason: z.string().trim().min(1).max(255),
    notes: z.string().trim().max(1000).optional(),
  }),
  z.object({
    type: z.literal("SET"),
    quantity: z.number().int().nonnegative(),
    reason: z.string().trim().min(1).max(255),
    notes: z.string().trim().max(1000).optional(),
  }),
]);
