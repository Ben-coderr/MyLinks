import Link from "next/link";
import { Compass, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#141414] border border-white/10 flex items-center justify-center mb-6 shadow-xl">
        <Compass className="w-8 h-8 text-neutral-400" />
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
        Profile Not Found
      </h1>

      <p className="text-neutral-400 text-sm sm:text-base mt-2 max-w-md">
        The link you followed doesn&apos;t exist or has been made private by its owner.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
        <Link href="/">
          <Button variant="primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
        <Link href="/register">
          <Button variant="secondary">
            Claim This Username
          </Button>
        </Link>
      </div>

      <p className="text-xs text-neutral-400 mt-12">
        Powered by <span className="font-semibold text-neutral-300">MyLinks</span>
      </p>
    </div>
  );
}
