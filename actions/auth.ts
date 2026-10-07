"use server";

import { headers } from "next/headers";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { isReservedUsername } from "@/lib/constants";

export async function registerUser(input: RegisterInput) {
  try {
    // 1. Rate Limiting Check
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

    const rateLimit = checkRateLimit(`register:${ip}`, 5, 60000); // 5 attempts per min
    if (!rateLimit.success) {
      return {
        error: `Too many registration attempts. Please wait ${rateLimit.resetInSeconds} seconds.`,
      };
    }

    // 2. Validate input with Zod
    const parsed = registerSchema.safeParse(input);
    if (!parsed.success) {
      return {
        error: parsed.error.issues[0]?.message || "Invalid registration data",
      };
    }

    const { email, password, username } = parsed.data;
    const lowerEmail = email.toLowerCase().trim();
    const lowerUsername = username.toLowerCase().trim();

    // 3. Check reserved username
    if (isReservedUsername(lowerUsername)) {
      return {
        error: "This username is reserved and cannot be registered",
      };
    }

    // 4. Check if email already registered
    const existingUser = await prisma.user.findUnique({
      where: { email: lowerEmail },
      select: { id: true },
    });
    if (existingUser) {
      return {
        error: "An account with this email already exists",
      };
    }

    // 5. Check if username already taken
    const existingProfile = await prisma.profile.findUnique({
      where: { username: lowerUsername },
      select: { id: true },
    });
    if (existingProfile) {
      return {
        error: "This username is already taken. Please choose another.",
      };
    }

    // 6. Role determination:
    // "The first registered account, or an email set in the ADMIN_EMAIL env variable, becomes ADMIN."
    const adminEmail = (process.env.ADMIN_EMAIL || "admin@mylinks.com").toLowerCase();
    const totalUsers = await prisma.user.count();

    const role =
      lowerEmail === adminEmail || totalUsers === 0 ? Role.ADMIN : Role.USER;

    // 7. Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Initial display name based on username
    const formattedName =
      lowerUsername.charAt(0).toUpperCase() + lowerUsername.slice(1);

    // 8. Create user and profile in a transaction
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: lowerEmail,
          passwordHash,
          role,
        },
      });

      await tx.profile.create({
        data: {
          userId: user.id,
          username: lowerUsername,
          name: formattedName,
          title: "Creator & Innovator",
          bio: `Welcome to my personal page! Check out my links below.`,
          isPublished: true,
        },
      });
    });

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      error: "An unexpected error occurred during registration. Please try again.",
    };
  }
}
