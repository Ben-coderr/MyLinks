"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function UsernameClaimInput() {
  const router = useRouter();
  const [username, setUsername] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    if (clean) {
      router.push(`/register?username=${encodeURIComponent(clean)}`);
    } else {
      router.push("/register");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md mx-auto flex flex-col sm:flex-row items-center gap-2 p-1.5 rounded-2xl bg-[#141414] border border-white/10 shadow-2xl focus-within:border-sky-400/50 transition-colors"
    >
      <div className="flex items-center w-full px-3 py-2 text-sm">
        <span className="text-neutral-500 font-mono select-none">mylink.com/</span>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="yourname"
          aria-label="Desired username"
          className="w-full bg-transparent text-white font-medium placeholder-neutral-600 focus:outline-none ml-1 lowercase font-mono"
        />
      </div>
      <Button
        type="submit"
        variant="primary"
        size="md"
        className="w-full sm:w-auto shrink-0 shadow-lg"
      >
        <span>Claim Link</span>
        <ArrowRight className="w-4 h-4 ml-1.5" />
      </Button>
    </form>
  );
}
