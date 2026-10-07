import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getBaseUrl() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  return "http://localhost:3000";
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
