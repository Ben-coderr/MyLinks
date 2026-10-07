import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getBaseUrl } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();

  const profiles = await prisma.profile.findMany({
    where: { isPublished: true },
    select: { username: true, updatedAt: true },
  });

  const profileUrls: MetadataRoute.Sitemap = profiles.map((p) => ({
    url: `${baseUrl}/${p.username}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    ...profileUrls,
  ];
}
