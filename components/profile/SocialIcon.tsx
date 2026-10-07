import * as React from "react";
import {
  FaInstagram,
  FaGithub,
  FaLinkedin,
  FaWhatsapp,
  FaXTwitter,
  FaYoutube,
  FaTelegram,
  FaEnvelope,
} from "react-icons/fa6";
import { Globe } from "lucide-react";
import { SocialPlatform } from "@prisma/client";

interface SocialIconProps {
  platform: SocialPlatform | string;
  className?: string;
}

export function SocialIcon({ platform, className = "w-5 h-5" }: SocialIconProps) {
  const p = platform.toLowerCase();

  switch (p) {
    case "instagram":
      return <FaInstagram className={className} />;
    case "github":
      return <FaGithub className={className} />;
    case "linkedin":
      return <FaLinkedin className={className} />;
    case "whatsapp":
      return <FaWhatsapp className={className} />;
    case "x":
      return <FaXTwitter className={className} />;
    case "youtube":
      return <FaYoutube className={className} />;
    case "telegram":
      return <FaTelegram className={className} />;
    case "email":
      return <FaEnvelope className={className} />;
    default:
      return <Globe className={className} />;
  }
}

export const PLATFORM_NAMES: Record<SocialPlatform, string> = {
  [SocialPlatform.instagram]: "Instagram",
  [SocialPlatform.github]: "GitHub",
  [SocialPlatform.linkedin]: "LinkedIn",
  [SocialPlatform.whatsapp]: "WhatsApp",
  [SocialPlatform.email]: "Email",
  [SocialPlatform.x]: "X (Twitter)",
  [SocialPlatform.youtube]: "YouTube",
  [SocialPlatform.telegram]: "Telegram",
};
