import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isReservedUsername, USERNAME_REGEX } from "@/lib/constants";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const username = searchParams.get("username")?.toLowerCase().trim() || "";

    if (!username) {
      return NextResponse.json(
        { available: false, message: "Username cannot be empty" },
        { status: 400 }
      );
    }

    if (!USERNAME_REGEX.test(username)) {
      return NextResponse.json({
        available: false,
        message: "3-24 characters, lowercase letters, numbers, '-', and '_'",
      });
    }

    if (isReservedUsername(username)) {
      return NextResponse.json({
        available: false,
        message: "This username is reserved by the platform",
      });
    }

    const existing = await prisma.profile.findUnique({
      where: { username },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json({
        available: false,
        message: "Username is already taken",
      });
    }

    return NextResponse.json({
      available: true,
      message: "Username is available!",
    });
  } catch (error) {
    console.error("Username check error:", error);
    return NextResponse.json(
      { available: false, message: "Error checking username" },
      { status: 500 }
    );
  }
}
