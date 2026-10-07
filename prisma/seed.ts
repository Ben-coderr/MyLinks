import { PrismaClient, Role, SocialPlatform } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing data cleanly in order of relations
  await prisma.social.deleteMany();
  await prisma.link.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  const saltRounds = 10;
  const adminPasswordHash = await bcrypt.hash("AdminPassword123!", saltRounds);
  const userPasswordHash = await bcrypt.hash("Password123!", saltRounds);

  const adminEmail = process.env.ADMIN_EMAIL || "admin@mylinks.com";

  // 1. Admin Account
  const adminUser = await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      profile: {
        create: {
          username: "admin",
          name: "Alex River",
          title: "Platform Admin & Lead Architect",
          bio: "Building next-gen link management and creator tools.",
          location: "San Francisco, CA",
          avatarUrl:
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
          isPublished: true,
          links: {
            create: [
              {
                title: "Official MyLinks Platform",
                subtitle: "Create your free bio page in under 60 seconds",
                url: "http://localhost:3002",
                icon: "sparkles",
                featured: true,
                order: 0,
                clicks: 142,
              },
              {
                title: "Platform Source & Architecture",
                subtitle: "Next.js App Router, Prisma ORM, Tailwind CSS",
                url: "https://github.com",
                icon: "code",
                featured: false,
                order: 1,
                clicks: 89,
              },
            ],
          },
          socials: {
            create: [
              {
                platform: SocialPlatform.x,
                url: "https://x.com",
                order: 0,
              },
              {
                platform: SocialPlatform.github,
                url: "https://github.com",
                order: 1,
              },
              {
                platform: SocialPlatform.email,
                url: `mailto:${adminEmail}`,
                order: 2,
              },
            ],
          },
        },
      },
    },
  });

  // 2. Sample User: Ahmed (Me)
  const ahmedUser = await prisma.user.create({
    data: {
      email: "ahmed@mylinks.com",
      passwordHash: userPasswordHash,
      role: Role.USER,
      profile: {
        create: {
          username: "ahmed",
          name: "Ahmed Al-Mansoor",
          title: "Senior Full-Stack Engineer & Open Source Creator",
          bio: "Crafting high-performance web applications, distributed systems, and modern developer tooling. TypeScript & Rust enthusiast.",
          location: "London, UK",
          avatarUrl:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
          isPublished: true,
          links: {
            create: [
              {
                title: "HyperQuery: In-Memory Data Store",
                subtitle: "High throughput caching engine with sub-millisecond p99 latency",
                url: "https://github.com",
                icon: "rocket",
                featured: true,
                order: 0,
                clicks: 312,
              },
              {
                title: "Engineering Deep-Dives Blog",
                subtitle: "Architecture patterns, React 19 internals & DB optimization",
                url: "https://hashnode.com",
                icon: "file-text",
                featured: false,
                order: 1,
                clicks: 184,
              },
              {
                title: "Keynote: Scaling Modern Web Apps",
                subtitle: "Watch the recorded talk from London Tech Summit 2026",
                url: "https://youtube.com",
                icon: "mic",
                featured: false,
                order: 2,
                clicks: 95,
              },
              {
                title: "Support My Open-Source Work",
                subtitle: "Help fund server infrastructure and library development",
                url: "https://buymeacoffee.com",
                icon: "coffee",
                featured: false,
                order: 3,
                clicks: 44,
              },
            ],
          },
          socials: {
            create: [
              {
                platform: SocialPlatform.github,
                url: "https://github.com",
                order: 0,
              },
              {
                platform: SocialPlatform.x,
                url: "https://x.com",
                order: 1,
              },
              {
                platform: SocialPlatform.linkedin,
                url: "https://linkedin.com",
                order: 2,
              },
              {
                platform: SocialPlatform.youtube,
                url: "https://youtube.com",
                order: 3,
              },
              {
                platform: SocialPlatform.whatsapp,
                url: "https://wa.me/447700900077",
                order: 4,
              },
              {
                platform: SocialPlatform.email,
                url: "mailto:ahmed@mylinks.com",
                order: 5,
              },
            ],
          },
        },
      },
    },
  });

  // 3. Sample User: Sarah (Friend)
  const sarahUser = await prisma.user.create({
    data: {
      email: "sarah@mylinks.com",
      passwordHash: userPasswordHash,
      role: Role.USER,
      profile: {
        create: {
          username: "sarah",
          name: "Sarah Jenkins",
          title: "Staff Product Designer & Design Systems Lead",
          bio: "Designing clean, accessible human interfaces. Design systems speaker, mentor, and typography lover.",
          location: "New York, NY",
          avatarUrl:
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
          isPublished: true,
          links: {
            create: [
              {
                title: "2026 Design Portfolio & Case Studies",
                subtitle: "Interactive prototypes for fintech and creative apps",
                url: "https://dribbble.com",
                icon: "portfolio",
                featured: true,
                order: 0,
                clicks: 420,
              },
              {
                title: "Lumina UI: Open Figma Community Kit",
                subtitle: "300+ accessible components, tokens, and micro-interactions",
                url: "https://figma.com",
                icon: "palette",
                featured: false,
                order: 1,
                clicks: 280,
              },
              {
                title: "Book a 1:1 Design Mentorship Session",
                subtitle: "Weekly portfolio reviews and career advisory on ADPList",
                url: "https://adplist.org",
                icon: "calendar",
                featured: false,
                order: 2,
                clicks: 110,
              },
            ],
          },
          socials: {
            create: [
              {
                platform: SocialPlatform.instagram,
                url: "https://instagram.com",
                order: 0,
              },
              {
                platform: SocialPlatform.linkedin,
                url: "https://linkedin.com",
                order: 1,
              },
              {
                platform: SocialPlatform.x,
                url: "https://x.com",
                order: 2,
              },
              {
                platform: SocialPlatform.telegram,
                url: "https://t.me/sarahdesigns",
                order: 3,
              },
              {
                platform: SocialPlatform.email,
                url: "mailto:sarah@mylinks.com",
                order: 4,
              },
            ],
          },
        },
      },
    },
  });

  console.log("Database seeded cleanly without emojis!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
