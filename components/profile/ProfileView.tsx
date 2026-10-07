"use client";

import * as React from "react";
import Link from "next/link";
import {
  MapPin,
  ExternalLink,
  Share2,
  Sparkles,
  Link2,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { SocialIcon } from "./SocialIcon";
import { LinkIcon } from "./LinkIcon";
import { ShareQrModal } from "@/components/share/ShareQrModal";
import { SocialPlatform } from "@prisma/client";
import { cn } from "@/lib/utils";

export interface ProfileViewLink {
  id: string;
  title: string;
  subtitle?: string | null;
  url: string;
  icon?: string | null;
  featured?: boolean;
  clicks?: number;
  isVisible?: boolean;
}

export interface ProfileViewSocial {
  id: string;
  platform: SocialPlatform | string;
  url: string;
}

export interface ProfileViewProps {
  profile: {
    username: string;
    name: string;
    title?: string | null;
    bio?: string | null;
    location?: string | null;
    avatarUrl?: string | null;
    showLinks?: boolean;
  };
  links: ProfileViewLink[];
  socials: ProfileViewSocial[];
  isPreview?: boolean;
}

export function ProfileView({
  profile,
  links,
  socials,
  isPreview = false,
}: ProfileViewProps) {
  const [isShareOpen, setIsShareOpen] = React.useState(false);

  const visibleLinks = links.filter((l) => l.isVisible !== false);
  const currentYear = new Date().getFullYear();

  return (
    <div className="w-full max-w-[480px] mx-auto px-4 py-8 sm:py-12 flex flex-col items-center min-h-screen">
      {/* Top action row */}
      <div className="w-full flex justify-end mb-4">
        <button
          type="button"
          onClick={() => setIsShareOpen(true)}
          aria-label="Share this profile"
          className="p-2.5 rounded-full bg-[#141414] border border-white/10 hover:border-white/25 hover:bg-[#1a1a1a] text-neutral-300 hover:text-white transition-all shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Profile Header */}
      <div className="flex flex-col items-center text-center w-full">
        <Avatar
          src={profile.avatarUrl}
          name={profile.name}
          size="xl"
          glow={true}
          className="mb-4"
        />

        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center justify-center gap-1.5">
          {profile.name}
        </h1>

        {profile.title && (
          <p className="text-sm font-medium text-neutral-400 mt-1 max-w-sm">
            {profile.title}
          </p>
        )}

        {profile.location && (
          <div className="flex items-center gap-1 text-xs text-neutral-400 mt-2">
            <MapPin className="w-3.5 h-3.5 text-neutral-400" />
            <span>{profile.location}</span>
          </div>
        )}

        {profile.bio && (
          <p className="text-sm text-neutral-300 mt-3 max-w-md leading-relaxed whitespace-pre-line">
            {profile.bio}
          </p>
        )}
      </div>

      {/* Social Icons Row */}
      {socials.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2.5 my-6">
          {socials.map((social) => (
            <a
              key={social.id}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${social.platform}`}
              className="w-10 h-10 rounded-full bg-[#141414] border border-white/10 flex items-center justify-center text-neutral-300 hover:text-white hover:border-white/30 hover:bg-[#1a1a1a] hover:scale-105 transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              <SocialIcon platform={social.platform} className="w-4 h-4" />
            </a>
          ))}
        </div>
      )}

      {/* Links List - Omitted when showLinks is false (Social Card Mode) */}
      {profile.showLinks !== false ? (
        <div className="w-full space-y-3.5 mt-2 flex-1">
          {visibleLinks.length === 0 ? (
            <div className="text-center py-10 px-4 rounded-2xl bg-[#141414]/50 border border-white/5">
              <Link2 className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
              <p className="text-sm text-neutral-400">No links added yet.</p>
            </div>
          ) : (
            visibleLinks.map((link) => {
              const href = isPreview
                ? link.url
                : `/api/click/${link.id}`;

              return (
                <a
                  key={link.id}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "card-hover group relative block w-full rounded-2xl p-4 text-left border transition-all duration-200 select-none",
                    link.featured
                      ? "bg-[#181818] border-sky-400/40 shadow-[0_0_20px_rgba(56,189,248,0.08)] ring-1 ring-sky-400/20"
                      : "bg-[#141414] border-white/10 hover:border-white/25"
                  )}
                >
                  {link.featured && (
                    <span className="absolute -top-2.5 right-4 inline-flex items-center gap-1 rounded-full bg-sky-500/20 border border-sky-400/30 px-2 py-0.5 text-[10px] font-semibold text-sky-300 backdrop-blur-sm">
                      <Sparkles className="w-2.5 h-2.5 text-sky-400" />
                      Featured
                    </span>
                  )}

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-2">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-neutral-300 group-hover:text-sky-300 group-hover:border-sky-400/30 transition-colors shrink-0">
                        <LinkIcon name={link.icon} className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white text-[15px] leading-snug group-hover:text-sky-300 transition-colors truncate">
                          {link.title}
                        </p>
                        {link.subtitle && (
                          <p className="text-xs text-neutral-400 mt-0.5 leading-normal line-clamp-2">
                            {link.subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 text-neutral-500 group-hover:text-white transition-colors">
                      <ExternalLink className="link-arrow w-4 h-4" />
                    </div>
                  </div>
                </a>
              );
            })
          )}
        </div>
      ) : (
        <div className="w-full flex-1" />
      )}

      {/* Footer */}
      <footer className="w-full mt-12 pt-6 border-t border-white/5 text-center space-y-2">
        <p className="text-xs text-neutral-400">
          © {currentYear} {profile.name}
        </p>
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors group"
          >
            <span>Create your own page with</span>
            <span className="font-bold text-white group-hover:underline">
              MyLinks
            </span>
          </Link>
        </div>
      </footer>

      {/* Share Modal with QR code */}
      <ShareQrModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        username={profile.username}
        name={profile.name}
        avatarUrl={profile.avatarUrl}
      />
    </div>
  );
}
