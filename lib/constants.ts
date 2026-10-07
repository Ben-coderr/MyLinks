export const RESERVED_USERNAMES = new Set([
  "api",
  "admin",
  "administrator",
  "login",
  "signin",
  "logout",
  "signout",
  "register",
  "signup",
  "dashboard",
  "settings",
  "profile",
  "about",
  "contact",
  "help",
  "support",
  "privacy",
  "terms",
  "terms-of-service",
  "sitemap",
  "robots",
  "favicon",
  "auth",
  "static",
  "public",
  "assets",
  "click",
  "share",
  "qr",
]);

export function isReservedUsername(username: string): boolean {
  return RESERVED_USERNAMES.has(username.toLowerCase().trim());
}

export const USERNAME_REGEX = /^[a-z0-9_-]{3,24}$/;
