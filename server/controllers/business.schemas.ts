import z from "zod";

export const createBusinessSchema = z.object({
  name: z.string().trim().min(1).max(255),
});

export const updateBusinessSchema = z
  .object({
    name: z.string().trim().min(1).max(255).optional(),
    gstNumber: z
      .string()
      .trim()
      .max(30)
      .optional()
      .transform((value) => (value === undefined ? undefined : value || null)),
    address: z
      .string()
      .trim()
      .max(500)
      .optional()
      .transform((value) => (value === undefined ? undefined : value || null)),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "at least one field is required",
  });
