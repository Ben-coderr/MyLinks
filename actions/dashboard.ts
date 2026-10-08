"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  profileSchema,
  type ProfileInput,
  linkSchema,
  type LinkInput,
  socialSchema,
  type SocialInput,
} from "@/lib/validations/profile";
import { sanitizeUrl } from "@/lib/utils";
import { isReservedUsername } from "@/lib/constants";
import { SocialPlatform } from "@prisma/client";

// Helper: Ensure authenticated user owns target profile (or is ADMIN)
async function getAuthorizedProfile(targetUserId?: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // 1. Resolve effective user ID reliably
  let userId = session.user.id;
  if (!userId && session.user.email) {
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email.toLowerCase() },
      select: { id: true, role: true },
    });
    if (dbUser) {
      userId = dbUser.id;
      if (!session.user.role) session.user.role = dbUser.role;
    }
  }

  if (!userId) {
    throw new Error("User identification failed. Please log in again.");
  }

  const effectiveUserId =
    session.user.role === "ADMIN" && targetUserId
      ? targetUserId
      : userId;

  let profile = await prisma.profile.findUnique({
    where: { userId: effectiveUserId },
  });

  // 2. If profile is missing, automatically create it
  if (!profile && session.user.email) {
    const rawUsername = session.user.email
      .split("@")[0]
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "");

    let chosenUsername = rawUsername || "user";
    const existing = await prisma.profile.findUnique({
      where: { username: chosenUsername },
      select: { id: true },
    });
    if (existing) {
      chosenUsername = `${chosenUsername}-${Math.random().toString(36).substring(2, 6)}`;
    }

    profile = await prisma.profile.create({
      data: {
        userId: effectiveUserId,
        username: chosenUsername,
        name: rawUsername ? (rawUsername.charAt(0).toUpperCase() + rawUsername.slice(1)) : "User",
        title: "Creator",
        isPublished: true,
      },
    });
  }

  if (!profile) {
    throw new Error("Profile not found");
  }

  return { session, profile };
}

// 1. UPDATE PROFILE
export async function updateProfile(data: ProfileInput, targetUserId?: string) {
  try {
    const { profile } = await getAuthorizedProfile(targetUserId);

    const parsed = profileSchema.safeParse(data);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message || "Invalid profile data" };
    }

    const { name, title, bio, location, username, avatarUrl, showLinks } = parsed.data;
    const lowerUsername = username.toLowerCase().trim();

    // If username is changing, check availability
    if (lowerUsername !== profile.username) {
      if (isReservedUsername(lowerUsername)) {
        return { error: "This username is reserved and cannot be chosen." };
      }

      const existing = await prisma.profile.findUnique({
        where: { username: lowerUsername },
        select: { id: true },
      });
      if (existing) {
        return { error: "This username is already taken by another account." };
      }
    }

    const oldUsername = profile.username;

    const updated = await prisma.profile.update({
      where: { id: profile.id },
      data: {
        name,
        title: title || null,
        bio: bio || null,
        location: location || null,
        username: lowerUsername,
        avatarUrl: avatarUrl !== undefined ? avatarUrl : profile.avatarUrl,
        showLinks: showLinks !== undefined ? showLinks : (profile.showLinks ?? true),
      },
    });

    revalidatePath(`/${oldUsername}`);
    revalidatePath(`/${lowerUsername}`);
    revalidatePath("/dashboard");

    return { success: true, profile: updated };
  } catch (error) {
    console.error("Update profile error:", error);
    return { error: (error as Error).message || "Failed to update profile" };
  }
}

// 2. TOGGLE PUBLISH STATUS
export async function togglePublishStatus(
  isPublished: boolean,
  targetUserId?: string
) {
  try {
    const { profile } = await getAuthorizedProfile(targetUserId);

    const updated = await prisma.profile.update({
      where: { id: profile.id },
      data: { isPublished },
    });

    revalidatePath(`/${profile.username}`);
    revalidatePath("/dashboard");

    return { success: true, isPublished: updated.isPublished };
  } catch (error) {
    console.error("Toggle publish error:", error);
    return { error: "Failed to update publish status" };
  }
}

// 3. CREATE LINK
export async function createLink(data: LinkInput, targetUserId?: string) {
  try {
    const { profile } = await getAuthorizedProfile(targetUserId);

    const parsed = linkSchema.safeParse(data);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message || "Invalid link data" };
    }

    const cleanUrl = sanitizeUrl(parsed.data.url);

    // Get current max order
    const lastLink = await prisma.link.findFirst({
      where: { profileId: profile.id },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    const nextOrder = (lastLink?.order ?? -1) + 1;

    const newLink = await prisma.link.create({
      data: {
        profileId: profile.id,
        title: parsed.data.title,
        subtitle: parsed.data.subtitle || null,
        url: cleanUrl,
        icon: parsed.data.icon || null,
        featured: parsed.data.featured ?? false,
        isVisible: parsed.data.isVisible ?? true,
        order: nextOrder,
      },
    });

    revalidatePath(`/${profile.username}`);
    revalidatePath("/dashboard");

    return { success: true, link: newLink };
  } catch (error) {
    console.error("Create link error:", error);
    return { error: "Failed to create link" };
  }
}

// 4. UPDATE LINK
export async function updateLink(
  linkId: string,
  data: Partial<LinkInput>,
  targetUserId?: string
) {
  try {
    const { profile } = await getAuthorizedProfile(targetUserId);

    // Ownership check on link
    const link = await prisma.link.findFirst({
      where: { id: linkId, profileId: profile.id },
    });
    if (!link) {
      return { error: "Link not found or permission denied" };
    }

    const updateData: Record<string, any> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.subtitle !== undefined) updateData.subtitle = data.subtitle;
    if (data.url !== undefined) updateData.url = sanitizeUrl(data.url);
    if (data.icon !== undefined) updateData.icon = data.icon;
    if (data.featured !== undefined) updateData.featured = data.featured;
    if (data.isVisible !== undefined) updateData.isVisible = data.isVisible;

    const updated = await prisma.link.update({
      where: { id: linkId },
      data: updateData,
    });

    revalidatePath(`/${profile.username}`);
    revalidatePath("/dashboard");

    return { success: true, link: updated };
  } catch (error) {
    console.error("Update link error:", error);
    return { error: "Failed to update link" };
  }
}

// 5. DELETE LINK
export async function deleteLink(linkId: string, targetUserId?: string) {
  try {
    const { profile } = await getAuthorizedProfile(targetUserId);

    const link = await prisma.link.findFirst({
      where: { id: linkId, profileId: profile.id },
    });
    if (!link) {
      return { error: "Link not found or permission denied" };
    }

    await prisma.link.delete({
      where: { id: linkId },
    });

    revalidatePath(`/${profile.username}`);
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Delete link error:", error);
    return { error: "Failed to delete link" };
  }
}

// 6. REORDER LINKS
export async function reorderLinks(
  orderedIds: string[],
  targetUserId?: string
) {
  try {
    const { profile } = await getAuthorizedProfile(targetUserId);

    // Verify all IDs belong to this profile
    const profileLinks = await prisma.link.findMany({
      where: { profileId: profile.id },
      select: { id: true },
    });
    const profileLinkIds = new Set(profileLinks.map((l) => l.id));

    const validIds = orderedIds.filter((id) => profileLinkIds.has(id));

    await prisma.$transaction(
      validIds.map((id, index) =>
        prisma.link.update({
          where: { id },
          data: { order: index },
        })
      )
    );

    revalidatePath(`/${profile.username}`);
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Reorder links error:", error);
    return { error: "Failed to save link order" };
  }
}

// FORMAT SOCIAL URL HELPER
function normalizeSocialUrl(platform: SocialPlatform, input: string): string {
  const trimmed = input.trim();

  if (platform === SocialPlatform.whatsapp) {
    // If it's already a wa.me or whatsapp.com link, return it
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
    // Clean phone number (strip spaces, dashes, parentheses)
    const digitsOnly = trimmed.replace(/[^0-9+]/g, "").replace(/^\+/, "");
    return `https://wa.me/${digitsOnly}`;
  }

  if (platform === SocialPlatform.email) {
    if (trimmed.startsWith("mailto:")) return trimmed;
    return `mailto:${trimmed}`;
  }

  // If user entered full URL
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  // If user entered handle without URL:
  const cleanHandle = trimmed.replace(/^@/, "");
  switch (platform) {
    case SocialPlatform.github:
      return `https://github.com/${cleanHandle}`;
    case SocialPlatform.x:
      return `https://x.com/${cleanHandle}`;
    case SocialPlatform.instagram:
      return `https://instagram.com/${cleanHandle}`;
    case SocialPlatform.linkedin:
      return cleanHandle.startsWith("in/")
        ? `https://linkedin.com/${cleanHandle}`
        : `https://linkedin.com/in/${cleanHandle}`;
    case SocialPlatform.youtube:
      return `https://youtube.com/@${cleanHandle}`;
    case SocialPlatform.telegram:
      return `https://t.me/${cleanHandle}`;
    default:
      return `https://${cleanHandle}`;
  }
}

// 7. CREATE / ADD SOCIAL
export async function createSocial(data: SocialInput, targetUserId?: string) {
  try {
    const { profile } = await getAuthorizedProfile(targetUserId);

    const parsed = socialSchema.safeParse(data);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message || "Invalid social data" };
    }

    const formattedUrl = normalizeSocialUrl(parsed.data.platform, parsed.data.url);

    // Compute order
    const lastSocial = await prisma.social.findFirst({
      where: { profileId: profile.id },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    const nextOrder = (lastSocial?.order ?? -1) + 1;

    const newSocial = await prisma.social.create({
      data: {
        profileId: profile.id,
        platform: parsed.data.platform,
        url: formattedUrl,
        order: nextOrder,
      },
    });

    revalidatePath(`/${profile.username}`);
    revalidatePath("/dashboard");

    return { success: true, social: newSocial };
  } catch (error) {
    console.error("Create social error:", error);
    return { error: "Failed to add social platform" };
  }
}

// 8. UPDATE SOCIAL
export async function updateSocial(
  socialId: string,
  data: SocialInput,
  targetUserId?: string
) {
  try {
    const { profile } = await getAuthorizedProfile(targetUserId);

    const social = await prisma.social.findFirst({
      where: { id: socialId, profileId: profile.id },
    });
    if (!social) {
      return { error: "Social not found or permission denied" };
    }

    const formattedUrl = normalizeSocialUrl(data.platform, data.url);

    const updated = await prisma.social.update({
      where: { id: socialId },
      data: {
        platform: data.platform,
        url: formattedUrl,
      },
    });

    revalidatePath(`/${profile.username}`);
    revalidatePath("/dashboard");

    return { success: true, social: updated };
  } catch (error) {
    console.error("Update social error:", error);
    return { error: "Failed to update social" };
  }
}

// 9. DELETE SOCIAL
export async function deleteSocial(socialId: string, targetUserId?: string) {
  try {
    const { profile } = await getAuthorizedProfile(targetUserId);

    const social = await prisma.social.findFirst({
      where: { id: socialId, profileId: profile.id },
    });
    if (!social) {
      return { error: "Social not found or permission denied" };
    }

    await prisma.social.delete({
      where: { id: socialId },
    });

    revalidatePath(`/${profile.username}`);
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Delete social error:", error);
    return { error: "Failed to remove social platform" };
  }
}

// 10. REORDER SOCIALS
export async function reorderSocials(
  orderedIds: string[],
  targetUserId?: string
) {
  try {
    const { profile } = await getAuthorizedProfile(targetUserId);

    const currentSocials = await prisma.social.findMany({
      where: { profileId: profile.id },
      select: { id: true },
    });
    const socialIds = new Set(currentSocials.map((s) => s.id));
    const validIds = orderedIds.filter((id) => socialIds.has(id));

    await prisma.$transaction(
      validIds.map((id, index) =>
        prisma.social.update({
          where: { id },
          data: { order: index },
        })
      )
    );

    revalidatePath(`/${profile.username}`);
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Reorder socials error:", error);
    return { error: "Failed to save social order" };
  }
}
