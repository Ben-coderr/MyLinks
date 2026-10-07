import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

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

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    // 1. Validate File Size
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
    const fileName = `${session.user.id}-${Date.now()}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");

    // Ensure directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    // 3. Find and remove previous local avatar file if exists
    const currentProfile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: { avatarUrl: true },
    });

    if (currentProfile?.avatarUrl?.startsWith("/uploads/avatars/")) {
      const oldFilename = path.basename(currentProfile.avatarUrl);
      const oldPath = path.join(uploadDir, oldFilename);
      try {
        await fs.unlink(oldPath);
      } catch {
        // Ignore if old file doesn't exist
      }
    }

    // 4. Save new file to disk
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/avatars/${fileName}`;

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json(
      { error: "Failed to process image upload" },
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

    const currentProfile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: { avatarUrl: true },
    });

    if (currentProfile?.avatarUrl?.startsWith("/uploads/avatars/")) {
      const oldFilename = path.basename(currentProfile.avatarUrl);
      const oldPath = path.join(
        process.cwd(),
        "public",
        "uploads",
        "avatars",
        oldFilename
      );
      try {
        await fs.unlink(oldPath);
      } catch {
        // Ignore error
      }
    }

    await prisma.profile.update({
      where: { userId: session.user.id },
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
