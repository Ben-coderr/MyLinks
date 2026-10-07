import Link from "next/link";
import {
  Sparkles,
  QrCode,
  Zap,
  ShieldCheck,
  MousePointerClick,
  Layers,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { auth } from "@/auth";
import { Navbar } from "@/components/landing/Navbar";
import { UsernameClaimInput } from "@/components/landing/UsernameClaimInput";
import { LandingDemoPreview } from "@/components/landing/LandingDemoPreview";
import { Button } from "@/components/ui/Button";

export default async function HomePage() {
  const session = await auth();
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-white">
      <Navbar user={session?.user} />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
            {/* Announcement badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-xs text-neutral-300 mb-8 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Next-Generation Link-in-Bio Architecture</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
              One link for everything you{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-300 to-white">
                build and share.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-base sm:text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
              Curate your portfolio, projects, and social presence on a blazing fast,
              dark-mode optimized profile. Includes instant offline QR codes,
              printable cards, and real-time click tracking.
            </p>

            {/* Username claim form */}
            <div className="mt-10">
              <UsernameClaimInput />
            </div>

            {/* Value Highlights */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-400">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-sky-400" />
                Sub-second redirects
              </span>
              <span className="flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-indigo-400" />
                Offline QR code engine
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                No tracking cookies
              </span>
            </div>
          </div>

          {/* Interactive Live Demo Phone Preview */}
          <div className="mt-16 max-w-5xl mx-auto px-4">
            <LandingDemoPreview />
          </div>
        </section>

        {/* FEATURES GRID */}
        <section className="py-20 border-t border-white/[0.06] bg-[#0E0E0E]/60">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Built for professionals who care about design
              </h2>
              <p className="text-sm sm:text-base text-neutral-400 mt-3">
                No cluttered social clutter, no slow load times. Just clean,
                purpose-built links that convert visitors into readers and clients.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="p-6 rounded-2xl bg-[#141414] border border-white/[0.08] hover:border-white/20 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-5 text-sky-400 group-hover:scale-110 transition-transform">
                  <QrCode className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-white text-lg">
                  Offline QR Engine
                </h3>
                <p className="text-sm text-neutral-400 mt-2 leading-relaxed">
                  Generate scan-ready high-contrast QR codes directly in your browser.
                  Export 1024px PNGs or vector SVGs ready for physical stickers and
                  business cards.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 rounded-2xl bg-[#141414] border border-white/[0.08] hover:border-white/20 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5 text-emerald-400 group-hover:scale-110 transition-transform">
                  <MousePointerClick className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-white text-lg">
                  Click & Scan Analytics
                </h3>
                <p className="text-sm text-neutral-400 mt-2 leading-relaxed">
                  Real-time click counts per link and scan tracking with integrated
                  bot filtering. See which links drive real audience engagement.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 rounded-2xl bg-[#141414] border border-white/[0.08] hover:border-white/20 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-5 text-purple-400 group-hover:scale-110 transition-transform">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-white text-lg">
                  Drag & Drop Organization
                </h3>
                <p className="text-sm text-neutral-400 mt-2 leading-relaxed">
                  Effortlessly reorder links with fluid drag-and-drop mechanics. Highlight
                  priority links with featured glows to maximize click-throughs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* EXPLORE LIVE PROFILES */}
        <section className="py-20 border-t border-white/[0.06]">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Explore Live Creator Pages
            </h2>
            <p className="text-sm text-neutral-400 mt-2">
              See how members use MyLinks in production right now.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/ahmed"
                className="card-hover p-5 rounded-2xl bg-[#141414] border border-white/10 flex items-center justify-between text-left group"
              >
                <div>
                  <p className="font-semibold text-white group-hover:text-sky-300 transition-colors">
                    Ahmed Al-Mansoor
                  </p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Senior Full-Stack Engineer • @ahmed
                  </p>
                </div>
                <ExternalLink className="link-arrow w-4 h-4 text-neutral-500 group-hover:text-white" />
              </Link>

              <Link
                href="/sarah"
                className="card-hover p-5 rounded-2xl bg-[#141414] border border-white/10 flex items-center justify-between text-left group"
              >
                <div>
                  <p className="font-semibold text-white group-hover:text-sky-300 transition-colors">
                    Sarah Jenkins
                  </p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Staff Product Designer • @sarah
                  </p>
                </div>
                <ExternalLink className="link-arrow w-4 h-4 text-neutral-500 group-hover:text-white" />
              </Link>
            </div>
          </div>
        </section>

        {/* CALL TO ACTION */}
        <section className="py-20 border-t border-white/[0.06] relative overflow-hidden bg-gradient-to-b from-[#0A0A0A] to-[#121212]">
          <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Ready to claim your personal link?
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base mt-3 max-w-lg mx-auto">
              Set up your profile, links, and socials in under two minutes. Completely free.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/register">
                <Button variant="primary" size="lg">
                  <span>Create Your Page</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="secondary" size="lg">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.06] py-10 bg-[#0A0A0A]">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© {currentYear} MyLinks. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-neutral-300 transition-colors">
              Home
            </Link>
            <Link href="/login" className="hover:text-neutral-300 transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="hover:text-neutral-300 transition-colors">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
