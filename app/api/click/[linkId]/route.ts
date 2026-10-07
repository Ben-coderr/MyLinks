import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const BOT_USER_AGENTS = [
  "bot",
  "crawl",
  "spider",
  "slurp",
  "facebookexternalhit",
  "mediapartners-google",
  "whatsapp",
  "telegrambot",
  "twitterbot",
  "slackbot",
  "discordbot",
];

function isBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some((pattern) => ua.includes(pattern));
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ linkId: string }> }
) {
  try {
    const { linkId } = await params;
    if (!linkId) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const link = await prisma.link.findUnique({
      where: { id: linkId },
      select: { id: true, url: true, isVisible: true },
    });

    if (!link || !link.isVisible) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Bot filtering: only count clicks from actual browsers
    const userAgent = request.headers.get("user-agent");
    if (!isBot(userAgent)) {
      // Increment clicks asynchronously
      prisma.link
        .update({
          where: { id: link.id },
          data: { clicks: { increment: 1 } },
        })
        .catch((err) => console.error("Failed to increment click count:", err));
    }

    // Minimal latency 302 redirect to target URL
    return NextResponse.redirect(new URL(link.url));
  } catch (error) {
    console.error("Link redirect error:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }
}
