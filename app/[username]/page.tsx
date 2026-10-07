import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ProfileView } from "@/components/profile/ProfileView";
import { getBaseUrl } from "@/lib/utils";

interface PageProps {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const BOT_PATTERNS = [
  "bot",
  "crawl",
  "spider",
  "slurp",
  "facebookexternalhit",
  "mediapartners-google",
  "whatsapp",
  "telegrambot",
  "twitterbot",
];

function isBot(ua: string | null): boolean {
  if (!ua) return false;
  const lower = ua.toLowerCase();
  return BOT_PATTERNS.some((pattern) => lower.includes(pattern));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username } = await params;
  const lowerUsername = username.toLowerCase();

  const profile = await prisma.profile.findUnique({
    where: { username: lowerUsername },
    select: {
      name: true,
      title: true,
      bio: true,
      avatarUrl: true,
      isPublished: true,
    },
  });

  if (!profile || !profile.isPublished) {
    return {
      title: "Profile Not Found",
      description: "The requested bio link could not be found.",
    };
  }

  const siteUrl = getBaseUrl();
  const canonicalUrl = `${siteUrl}/${lowerUsername}`;
  const title = `${profile.name} (@${lowerUsername})`;
  const description =
    profile.bio || profile.title || `Check out ${profile.name}'s bio links on MyLinks.`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "profile",
      images: profile.avatarUrl
        ? [
            {
              url: profile.avatarUrl,
              width: 400,
              height: 400,
              alt: profile.name,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: profile.avatarUrl ? [profile.avatarUrl] : undefined,
    },
  };
}

export default async function PublicProfilePage({
  params,
  searchParams,
}: PageProps) {
  const { username } = await params;
  const resolvedSearchParams = await searchParams;
  const lowerUsername = username.toLowerCase();

  const profile = await prisma.profile.findUnique({
    where: { username: lowerUsername },
    include: {
      links: {
        where: { isVisible: true },
        orderBy: { order: "asc" },
      },
      socials: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!profile || !profile.isPublished) {
    notFound();
  }

  // QR Scan Tracking (Section 11 D)
  // If user arrived via ?ref=qr and is not a crawler/bot, increment qrScans
  if (resolvedSearchParams?.ref === "qr") {
    const headersList = await headers();
    const userAgent = headersList.get("user-agent");
    if (!isBot(userAgent)) {
      prisma.profile
        .update({
          where: { id: profile.id },
          data: { qrScans: { increment: 1 } },
        })
        .catch((err) => console.error("Error updating QR scans:", err));
    }
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      <ProfileView
        profile={{
          username: profile.username,
          name: profile.name,
          title: profile.title,
          bio: profile.bio,
          location: profile.location,
          avatarUrl: profile.avatarUrl,
          showLinks: profile.showLinks,
        }}
        links={profile.links}
        socials={profile.socials}
        isPreview={false}
      />
    </main>
  );
}
