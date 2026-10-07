import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ExternalLink, LogOut, Shield, User as UserIcon } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    include: {
      links: true,
      socials: true,
    },
  });

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col">
      {/* Dashboard Top Navbar */}
      <header className="border-b border-white/[0.08] bg-[#141414]/60 backdrop-blur-md px-4 py-3 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-bold text-lg text-white">
              My<span className="text-sky-400">Links</span>
            </Link>
            <Badge variant="outline" className="hidden sm:inline-flex">
              Dashboard
            </Badge>
            {session.user.role === "ADMIN" && (
              <Badge variant="accent">ADMIN</Badge>
            )}
          </div>

          <div className="flex items-center gap-3">
            {profile && (
              <Link
                href={`/${profile.username}`}
                target="_blank"
                className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/25 transition-all"
              >
                <span>View my page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
            {session.user.role === "ADMIN" && (
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="text-sky-400 gap-1.5">
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
              <Button variant="ghost" size="sm" type="submit" className="text-neutral-400 hover:text-white gap-1.5">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="p-6 rounded-3xl bg-[#141414] border border-white/10 mb-8 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Welcome back, {profile?.name || session.user.email}
              </h1>
              <p className="text-sm text-neutral-400 mt-1">
                Signed in as <span className="font-medium text-white">{session.user.email}</span> • Username:{" "}
                <span className="text-sky-400 font-mono">@{profile?.username}</span>
              </p>
            </div>
            {profile && (
              <Link href={`/${profile.username}`} target="_blank">
                <Button variant="primary" size="sm">
                  <span>Visit Public Page</span>
                  <ExternalLink className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="p-8 rounded-3xl bg-[#141414]/50 border border-white/5 text-center">
          <p className="text-neutral-400 text-sm">
            Phase 2 Authentication & Route Protection active. Full Phase 3 Dashboard editor (live phone preview, dnd links reordering, avatar upload, socials, publish toggle) ready for next phase.
          </p>
        </div>
      </main>
    </div>
  );
}
