import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { Link2, LogOut, Shield } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  let profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    include: {
      links: {
        orderBy: { order: "asc" },
      },
      socials: {
        orderBy: { order: "asc" },
      },
    },
  });

  // Fallback: If profile doesn't exist, generate one based on email prefix
  if (!profile) {
    const defaultUsername = session.user.email
      .split("@")[0]
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "");

    profile = await prisma.profile.create({
      data: {
        userId: session.user.id,
        username: defaultUsername,
        name: defaultUsername.charAt(0).toUpperCase() + defaultUsername.slice(1),
        title: "Creator",
        isPublished: true,
      },
      include: {
        links: { orderBy: { order: "asc" } },
        socials: { orderBy: { order: "asc" } },
      },
    });
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col">
      {/* Top Main Navigation */}
      <header className="border-b border-white/[0.08] bg-[#0A0A0A]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
                <Link2 className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-white tracking-tight">
                My<span className="text-sky-400">Links</span>
              </span>
            </Link>
            <Badge variant="outline" className="hidden sm:inline-flex text-[11px]">
              Dashboard
            </Badge>
          </div>

          <div className="flex items-center gap-2.5">
            {session.user.role === "ADMIN" && (
              <Link href="/admin">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-sky-400 hover:text-sky-300"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Admin Panel</span>
                </Button>
              </Link>
            )}

            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="gap-1.5 text-neutral-400 hover:text-white"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Dashboard Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:py-8">
        <DashboardClient
          initialUser={{
            id: session.user.id,
            email: session.user.email,
            role: session.user.role,
          }}
          initialProfile={profile}
          initialLinks={profile.links}
          initialSocials={profile.socials}
        />
      </main>
    </div>
  );
}
