import z from "zod";

const customerBaseSchema = {
  name: z.string().trim().min(1).max(255),
  mobile: z.string().trim().min(7).max(20),
  email: z
    .string()
    .trim()
    .email()
    .max(255)
    .optional()
    .or(z.literal(""))
    .transform((value) => value || undefined),
  address: z
    .string()
    .trim()
    .max(500)
    .optional()
    .or(z.literal(""))
    .transform((value) => value || undefined),
  notes: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .or(z.literal(""))
    .transform((value) => value || undefined),
  openingBalance: z.number().nonnegative().optional().default(0),
};

export const createCustomerSchema = z.object(customerBaseSchema);

export const updateCustomerSchema = z
  .object({
    name: customerBaseSchema.name.optional(),
    mobile: customerBaseSchema.mobile.optional(),
    email: customerBaseSchema.email,
    address: customerBaseSchema.address,
    notes: customerBaseSchema.notes,
    openingBalance: z.number().nonnegative().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "at least one field is required",
});

export const getCustomersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(12),
  search: z
    .string()
    .trim()
    .max(255)
    .optional()
    .transform((value) => value || undefined),
  dueStatus: z
    .enum(["all", "pending", "cleared", "high_due"])
    .optional()
    .default("all"),
  sortBy: z
    .enum(["recent", "name", "due", "revenue", "orders"])
    .optional()
    .default("recent"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  recentOnly: z.coerce.boolean().optional().default(false),
  includeArchived: z.coerce.boolean().optional().default(false),
});
