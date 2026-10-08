import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getBaseUrl() {
  if (
    process.env.NEXT_PUBLIC_SITE_URL &&
    process.env.NEXT_PUBLIC_SITE_URL !== "http://localhost:3000"
  ) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  return "https://my-links-liart.vercel.app";
}

export function sanitizeUrl(url: string): string {
  if (!url) return "#";
  const trimmed = url.trim();
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("tel:")
  ) {
    return trimmed;
  }
  // If user entered google.com, prepend https://
  if (!trimmed.includes(":") && !trimmed.startsWith("//")) {
    return `https://${trimmed}`;
  }
  return "#";
}

export function formatUrlDisplay(url: string): string {
  try {
    return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  } catch {
    return url;
  }
}
