"use client";

import * as React from "react";
import Link from "next/link";
import { ExternalLink, Smartphone } from "lucide-react";
import { ProfileView } from "@/components/profile/ProfileView";
import { DashboardLinkItem } from "./LinksEditor";
import { DashboardSocialItem } from "./SocialsEditor";

interface LivePreviewPhoneProps {
  profile: {
    username: string;
    name: string;
    title?: string | null;
    bio?: string | null;
    location?: string | null;
    avatarUrl?: string | null;
    showLinks?: boolean;
  };
  links: DashboardLinkItem[];
  socials: DashboardSocialItem[];
}

export function LivePreviewPhone({
  profile,
  links,
  socials,
}: LivePreviewPhoneProps) {
  return (
    <div className="flex flex-col items-center sticky top-24">
      {/* Header Label */}
      <div className="w-full flex items-center justify-between mb-3 px-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400">
          <Smartphone className="w-3.5 h-3.5 text-sky-400" />
          Live Mobile Preview
        </span>
        <Link
          href={`/${profile.username}`}
          target="_blank"
          className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-mono transition-colors"
        >
          <span>Open tab</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {/* Phone Mockup Frame */}
      <div className="relative w-full max-w-[360px] h-[720px] rounded-[48px] bg-[#0A0A0A] border-[10px] border-[#1C1C1E] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col">
        {/* Dynamic Island / Speaker Notch */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-[#1C1C1E] rounded-full z-30 flex items-center justify-center">
          <div className="w-10 h-1 bg-[#2C2C2E] rounded-full" />
        </div>

        {/* Mock Browser URL Bar */}
        <div className="pt-7 pb-2 px-3 bg-[#141414]/90 border-b border-white/5 flex items-center justify-between text-[11px] text-neutral-400 select-none z-20">
          <span className="font-mono text-sky-400 truncate">
            mylink.com/{profile.username}
          </span>
          <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-neutral-300">
            Preview
          </span>
        </div>

        {/* Scrollable Public Page Preview */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-2">
          <ProfileView
            profile={profile}
            links={links}
            socials={socials}
            isPreview={true}
          />
        </div>
      </div>
    </div>
  );
}
