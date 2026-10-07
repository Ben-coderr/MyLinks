import { z } from "zod";
import { isReservedUsername, USERNAME_REGEX } from "@/lib/constants";

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password cannot exceed 128 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(24, "Username cannot exceed 24 characters")
    .toLowerCase()
    .trim()
    .regex(
      USERNAME_REGEX,
      "Username can only contain lowercase letters, numbers, hyphens, and underscores"
    )
    .refine((val) => !isReservedUsername(val), {
      message: "This username is reserved and cannot be chosen",
    }),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .toLowerCase()
    .trim(),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;
