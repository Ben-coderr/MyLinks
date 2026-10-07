"use client";

import * as React from "react";
import { QrCard } from "@/components/share/QrCard";
import { QrCode, Sparkles } from "lucide-react";

interface QrSectionProps {
  username: string;
  name: string;
  avatarUrl?: string | null;
}

export function QrSection({ username, name, avatarUrl }: QrSectionProps) {
  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-[#141414] border border-white/10 shadow-xl space-y-6">
      <div className="border-b border-white/5 pb-4">
        <div className="flex items-center gap-2">
          <QrCode className="w-5 h-5 text-sky-400" />
          <h2 className="text-xl font-bold text-white tracking-tight">
            Share & QR Code
          </h2>
        </div>
        <p className="text-xs text-neutral-400 mt-1">
          High-contrast QR code generated in your browser. Download in vector SVG or high-res 1024px PNG for print designs, stickers, and business cards.
        </p>
      </div>

      <div className="flex flex-col items-center max-w-sm mx-auto">
        <QrCard
          username={username}
          name={name}
          avatarUrl={avatarUrl}
          showPrintButton={true}
          className="w-full"
        />
      </div>

      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-neutral-400 space-y-1 text-center">
        <p className="font-semibold text-neutral-300">
          Print Ready Guidelines
        </p>
        <p>
          The QR code is rendered dark-on-white with a dedicated quiet zone so scanners can read it in any physical lighting.
        </p>
      </div>
    </div>
  );
}
