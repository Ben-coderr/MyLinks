"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ProfileView } from "@/components/profile/ProfileView";
import { SocialPlatform } from "@prisma/client";

const SAMPLE_AHMED = {
  profile: {
    username: "ahmed",
    name: "Ahmed Al-Mansoor",
    title: "Senior Full-Stack Engineer & Open Source Creator",
    bio: "Crafting high-performance web applications, distributed systems, and modern developer tooling. TypeScript & Rust enthusiast.",
    location: "London, UK",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
  },
  links: [
    {
      id: "l1",
      title: "HyperQuery: In-Memory Data Store",
      subtitle: "High throughput caching engine with sub-millisecond p99 latency",
      url: "https://github.com",
      icon: "rocket",
      featured: true,
      clicks: 312,
    },
    {
      id: "l2",
      title: "Engineering Deep-Dives Blog",
      subtitle: "Architecture patterns, React 19 internals & DB optimization",
      url: "https://hashnode.com",
      icon: "file-text",
      featured: false,
      clicks: 184,
    },
    {
      id: "l3",
      title: "Keynote: Scaling Modern Web Apps",
      subtitle: "Watch the recorded talk from London Tech Summit 2026",
      url: "https://youtube.com",
      icon: "mic",
      featured: false,
      clicks: 95,
    },
  ],
  socials: [
    { id: "s1", platform: SocialPlatform.github, url: "https://github.com" },
    { id: "s2", platform: SocialPlatform.x, url: "https://x.com" },
    { id: "s3", platform: SocialPlatform.linkedin, url: "https://linkedin.com" },
    { id: "s4", platform: SocialPlatform.whatsapp, url: "https://wa.me/447700900077" },
  ],
};

const SAMPLE_SARAH = {
  profile: {
    username: "sarah",
    name: "Sarah Jenkins",
    title: "Staff Product Designer & Design Systems Lead",
    bio: "Designing clean, accessible human interfaces. Design systems speaker, mentor, and typography lover.",
    location: "New York, NY",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
  },
  links: [
    {
      id: "sl1",
      title: "2026 Design Portfolio & Case Studies",
      subtitle: "Interactive prototypes for fintech and creative apps",
      url: "https://dribbble.com",
      icon: "portfolio",
      featured: true,
      clicks: 420,
    },
    {
      id: "sl2",
      title: "Lumina UI: Open Figma Community Kit",
      subtitle: "300+ accessible components, tokens, and micro-interactions",
      url: "https://figma.com",
      icon: "palette",
      featured: false,
      clicks: 280,
    },
    {
      id: "sl3",
      title: "Book a 1:1 Design Mentorship Session",
      subtitle: "Weekly portfolio reviews and career advisory on ADPList",
      url: "https://adplist.org",
      icon: "calendar",
      featured: false,
      clicks: 110,
    },
  ],
  socials: [
    { id: "ss1", platform: SocialPlatform.instagram, url: "https://instagram.com" },
    { id: "ss2", platform: SocialPlatform.linkedin, url: "https://linkedin.com" },
    { id: "ss3", platform: SocialPlatform.x, url: "https://x.com" },
    { id: "ss4", platform: SocialPlatform.telegram, url: "https://t.me/sarahdesigns" },
  ],
};

export function LandingDemoPreview() {
  const [selected, setSelected] = React.useState<"ahmed" | "sarah">("ahmed");
  const data = selected === "ahmed" ? SAMPLE_AHMED : SAMPLE_SARAH;

  return (
    <div className="w-full flex flex-col items-center">
      {/* Switcher buttons */}
      <div className="inline-flex p-1 rounded-2xl bg-[#141414] border border-white/10 mb-6 shadow-md">
        <button
          type="button"
          onClick={() => setSelected("ahmed")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            selected === "ahmed"
              ? "bg-white text-black shadow"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          Ahmed (@ahmed)
        </button>
        <button
          type="button"
          onClick={() => setSelected("sarah")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            selected === "sarah"
              ? "bg-white text-black shadow"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          Sarah (@sarah)
        </button>
      </div>

      {/* Mock phone container */}
      <div className="relative w-full max-w-[420px] rounded-[44px] bg-[#0A0A0A] border-[8px] border-[#1C1C1E] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden">
        {/* Phone speaker/notch */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-[#1C1C1E] rounded-full z-20 flex items-center justify-center">
          <div className="w-12 h-1 bg-[#2C2C2E] rounded-full" />
        </div>

        {/* Live page link indicator */}
        <div className="bg-[#141414]/90 border-b border-white/5 py-2 px-4 flex items-center justify-between text-[11px] text-neutral-400 pt-7">
          <span className="font-mono text-sky-400 truncate">
            mylink.com/{data.profile.username}
          </span>
          <Link
            href={`/${data.profile.username}`}
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            <span>Visit live</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Profile Content */}
        <div className="p-2 sm:p-4 max-h-[640px] overflow-y-auto">
          <ProfileView
            profile={data.profile}
            links={data.links}
            socials={data.socials}
            isPreview={true}
          />
        </div>
      </div>
    </div>
  );
}
