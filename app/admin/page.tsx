import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Shield, ArrowLeft } from "lucide-react";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const userCount = await prisma.user.count();
  const profileCount = await prisma.profile.count();
  const linkCount = await prisma.link.count();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col">
      <header className="border-b border-white/[0.08] bg-[#141414]/60 backdrop-blur-md px-4 py-3 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-bold text-lg text-white">
              My<span className="text-sky-400">Links</span>
            </Link>
            <Badge variant="accent" className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              <span>Admin Panel</span>
            </Badge>
          </div>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="p-6 rounded-3xl bg-[#141414] border border-white/10 mb-8 shadow-xl">
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Shield className="w-6 h-6 text-sky-400" />
            Admin Overview
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Privileged administrative control panel. Total Users: {userCount} • Profiles: {profileCount} • Links: {linkCount}
          </p>
        </div>
      </main>
    </div>
  );
}
