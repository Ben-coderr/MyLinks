import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Link2 } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to manage your link-in-bio profile and analytics.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col justify-between p-4 sm:p-6">
      {/* Top Bar with Logo */}
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
            <Link2 className="w-4 h-4" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">
            My<span className="text-sky-400">Links</span>
          </span>
        </Link>
      </div>

      {/* Center Form */}
      <div className="my-auto py-8">
        <React.Suspense
          fallback={
            <div className="w-full max-w-md mx-auto p-8 rounded-3xl bg-[#141414] border border-white/10 text-center text-neutral-400">
              Loading...
            </div>
          }
        >
          <LoginForm />
        </React.Suspense>
      </div>

      {/* Bottom Footer */}
      <div className="text-center text-xs text-neutral-500 py-4">
        <p>© {new Date().getFullYear()} MyLinks. Built with Next.js & Tailwind CSS.</p>
      </div>
    </div>
  );
}
