import z from "zod";

export const usernameSchema = z.string().min(3).max(100);
export const passwordSchema = z.string().min(6).max(255);
export const phoneSchema = z.string().min(7).max(20);
export const verificationCodeSchema = z.string().min(1).max(100);

export const loginSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
  userAgent: z.string().optional(),
});

export const registerSchema = z
  .object({
    businessName: z.string().min(1).max(255),
    username: usernameSchema,
    email: z.string().email().max(255).optional(),
    phone: phoneSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(6).max(255),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "passwords do not match",
    path: ["confirmPassword"],
  });

export const resetPasswordSchema = z.object({
  password: passwordSchema,
  verificationCode: verificationCodeSchema,
});

export const onboardingSchema = z.object({
  username: z.string().min(3).max(100),
  phone: z.string().min(7).max(20),
  businessName: z.string().min(1).max(255),
});
