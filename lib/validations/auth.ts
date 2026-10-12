import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(1, "Phone number is required").regex(/^\(\d{3}\)\s\d{3}-\d{4}$/, "Must be a valid 10-digit number"),
  address: z.string().min(1, "Address is required"),
  password: z.string().min(1, "Password is required"),
  captcha: z.string().min(1, "Please complete the captcha verification"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  captcha: z.string().min(1, "Please complete the captcha verification"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
