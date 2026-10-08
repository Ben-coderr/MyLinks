import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";
import { put, del } from "@vercel/blob";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

const EXT_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let userId = session.user.id;
    if (!userId && session.user.email) {
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email.toLowerCase() },
        select: { id: true },
      });
      if (dbUser) userId = dbUser.id;
    }

    if (!userId) {
      return NextResponse.json(
        { error: "User identification failed. Please log in again." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    // 1. Validate File Size (2MB max)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File exceeds 2MB limit. Please upload a smaller image." },
        { status: 400 }
      );
    }

    // 2. Validate MIME Type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPG, PNG, and WebP are supported." },
        { status: 400 }
      );
    }

    const ext = EXT_MAP[file.type] || "jpg";
    const fileName = `${userId}-${Date.now()}.${ext}`;

    // Get current avatar for cleanup if needed
    const currentProfile = await prisma.profile.findUnique({
      where: { userId },
      select: { avatarUrl: true },
    });

    // STRATEGY 1: VERCEL BLOB STORAGE (if BLOB_READ_WRITE_TOKEN is available)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blob = await put(`avatars/${fileName}`, file, {
          access: "public",
          contentType: file.type,
        });

        // Clean up previous blob if it was also hosted on Vercel Blob
        if (
          currentProfile?.avatarUrl &&
          currentProfile.avatarUrl.includes("vercel-storage.com")
        ) {
          try {
            await del(currentProfile.avatarUrl);
          } catch {
            // Non-critical cleanup failure
          }
        }

        const finalUrl = blob.url;
        await prisma.profile.update({
          where: { userId },
          data: { avatarUrl: finalUrl },
        });
        return NextResponse.json({ url: finalUrl });
      } catch (blobError) {
        console.warn("Vercel Blob upload failed, falling back to data URL:", blobError);
      }
    }

    // STRATEGY 2: LOCAL DISK STORAGE (Local dev only when not on Vercel serverless)
    const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
    if (!isVercel) {
      try {
        const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
        await fs.mkdir(uploadDir, { recursive: true });

        // Remove old local avatar file
        if (currentProfile?.avatarUrl?.startsWith("/uploads/avatars/")) {
          const oldFilename = path.basename(currentProfile.avatarUrl);
          const oldPath = path.join(uploadDir, oldFilename);
          try {
            await fs.unlink(oldPath);
          } catch {
            // Ignore error if missing
          }
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const filePath = path.join(uploadDir, fileName);
        await fs.writeFile(filePath, buffer);

        const publicUrl = `/uploads/avatars/${fileName}`;
        await prisma.profile.update({
          where: { userId },
          data: { avatarUrl: publicUrl },
        });
        return NextResponse.json({ url: publicUrl });
      } catch (localError) {
        console.warn("Local disk write failed, falling back to data URL:", localError);
      }
    }

    // STRATEGY 3: SERVERLESS ZERO-CONFIG FALLBACK (High-Fidelity Base64 Data URI)
    // Directly persists in PostgreSQL profile.avatarUrl column without requiring external storage credentials
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64Data}`;

    await prisma.profile.update({
      where: { userId },
      data: { avatarUrl: dataUrl },
    });

    return NextResponse.json({ url: dataUrl });
  } catch (error) {
    console.error("Avatar upload handler error:", error);
    return NextResponse.json(
      { error: "Failed to process image upload. " + ((error as Error)?.message || "") },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let userId = session.user.id;
    if (!userId && session.user.email) {
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email.toLowerCase() },
        select: { id: true },
      });
      if (dbUser) userId = dbUser.id;
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentProfile = await prisma.profile.findUnique({
      where: { userId },
      select: { avatarUrl: true },
    });

    if (currentProfile?.avatarUrl) {
      // 1. If Vercel Blob
      if (
        process.env.BLOB_READ_WRITE_TOKEN &&
        currentProfile.avatarUrl.includes("vercel-storage.com")
      ) {
        try {
          await del(currentProfile.avatarUrl);
        } catch {
          // Ignore
        }
      }

      // 2. If Local Disk
      if (currentProfile.avatarUrl.startsWith("/uploads/avatars/")) {
        try {
          const oldFilename = path.basename(currentProfile.avatarUrl);
          const oldPath = path.join(
            process.cwd(),
            "public",
            "uploads",
            "avatars",
            oldFilename
          );
          await fs.unlink(oldPath);
        } catch {
          // Ignore error
        }
      }
    }

    await prisma.profile.update({
      where: { userId },
      data: { avatarUrl: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Avatar delete error:", error);
    return NextResponse.json(
      { error: "Failed to remove avatar" },
      { status: 500 }
    );
  }
}
