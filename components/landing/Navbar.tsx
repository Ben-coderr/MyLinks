"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { Link2, LogOut, LayoutDashboard, Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface NavbarProps {
  user?: {
    id?: string;
    email?: string | null;
    role?: string;
    username?: string;
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#0A0A0A]/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
            <Link2 className="w-4 h-4" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">
            My<span className="text-sky-400">Links</span>
          </span>
        </Link>

        <nav className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              {user.role === "ADMIN" && (
                <Link href="/admin">
                  <Button variant="ghost" size="sm" className="gap-1.5 text-sky-400 hover:text-sky-300">
                    <Shield className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Admin</span>
                  </Button>
                </Link>
              )}
              <Link href="/dashboard">
                <Button variant="primary" size="sm" className="gap-1.5">
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/" })}
                aria-label="Sign out"
                className="text-neutral-400 hover:text-white"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">
                  Claim Link
                </Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
