import { z } from "zod";
import { SocialPlatform } from "@prisma/client";
import { isReservedUsername, USERNAME_REGEX } from "@/lib/constants";
import { sanitizeUrl } from "@/lib/utils";

export const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(64, "Name is too long"),
  title: z.string().max(100, "Title is too long").optional().nullable(),
  bio: z.string().max(300, "Bio is too long (max 300 characters)").optional().nullable(),
  location: z.string().max(100, "Location is too long").optional().nullable(),
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
  avatarUrl: z.string().optional().nullable(),
  showLinks: z.boolean(),
});

export type ProfileInput = z.infer<typeof profileSchema>;

export const linkSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  subtitle: z.string().max(150, "Subtitle is too long").optional().nullable(),
  url: z
    .string()
    .min(1, "URL is required")
    .refine((u) => {
      const sanitized = sanitizeUrl(u);
      return sanitized !== "#" && !sanitized.toLowerCase().startsWith("javascript:");
    }, {
      message: "Please enter a valid URL (http, https, mailto, tel)",
    }),
  icon: z.string().optional().nullable(),
  featured: z.boolean().default(false),
  isVisible: z.boolean().default(true),
});

export type LinkInput = z.infer<typeof linkSchema>;

export const socialSchema = z.object({
  platform: z.nativeEnum(SocialPlatform),
  url: z.string().min(1, "URL or username is required"),
});

export type SocialInput = z.infer<typeof socialSchema>;
