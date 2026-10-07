"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

// 1. CHANGE EMAIL
export async function changeEmail(newEmail: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    const emailSchema = z
      .string()
      .email("Please enter a valid email address")
      .toLowerCase()
      .trim();

    const parsed = emailSchema.safeParse(newEmail);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message || "Invalid email" };
    }

    const cleanEmail = parsed.data;

    // Check if taken
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true },
    });
    if (existing && existing.id !== session.user.id) {
      return { error: "This email address is already in use by another account" };
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { email: cleanEmail },
    });

    return { success: true, email: cleanEmail };
  } catch (error) {
    console.error("Change email error:", error);
    return { error: "Failed to update email address" };
  }
}

// 2. CHANGE PASSWORD
export async function changePassword(
  currentPass: string,
  newPass: string
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    if (!newPass || newPass.length < 8) {
      return { error: "New password must be at least 8 characters" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, passwordHash: true },
    });

    if (!user || !user.passwordHash) {
      return { error: "User account not found or has no password set" };
    }

    const isMatch = await bcrypt.compare(currentPass, user.passwordHash);
    if (!isMatch) {
      return { error: "Current password is incorrect" };
    }

    const newHash = await bcrypt.hash(newPass, 10);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { passwordHash: newHash },
    });

    return { success: true };
  } catch (error) {
    console.error("Change password error:", error);
    return { error: "Failed to update password" };
  }
}

// 3. DELETE ACCOUNT
export async function deleteAccount(confirmationUsername: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: { username: true, avatarUrl: true },
    });

    if (!profile) {
      return { error: "Profile not found" };
    }

    if (
      confirmationUsername.toLowerCase().trim() !==
      profile.username.toLowerCase().trim()
    ) {
      return {
        error: "Confirmation username does not match. Account was not deleted.",
      };
    }

    // Clean up local avatar file if exists
    if (profile.avatarUrl?.startsWith("/uploads/avatars/")) {
      const filename = path.basename(profile.avatarUrl);
      const filePath = path.join(
        process.cwd(),
        "public",
        "uploads",
        "avatars",
        filename
      );
      try {
        await fs.unlink(filePath);
      } catch {
        // Ignore error
      }
    }

    // Cascade delete: Deleting user removes User, Profile, Link, Social automatically
    await prisma.user.delete({
      where: { id: session.user.id },
    });

    return { success: true };
  } catch (error) {
    console.error("Delete account error:", error);
    return { error: "Failed to delete account" };
  }
}
