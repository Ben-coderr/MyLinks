"use client";

import * as React from "react";
import Link from "next/link";
import {
  ExternalLink,
  Copy,
  Check,
  MousePointerClick,
  QrCode,
  Link2,
  Globe,
  Lock,
  UserCheck,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getBaseUrl, formatUrlDisplay } from "@/lib/utils";
import { togglePublishStatus } from "@/actions/dashboard";

interface DashboardHeaderProps {
  profile: {
    id: string;
    username: string;
    name: string;
    isPublished: boolean;
    qrScans: number;
    showLinks?: boolean;
  };
  totalClicks: number;
  totalLinks: number;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onPublishToggle: (newStatus: boolean) => void;
}

export function DashboardHeader({
  profile,
  totalClicks,
  totalLinks,
  activeTab,
  onTabChange,
  onPublishToggle,
}: DashboardHeaderProps) {
  const [copied, setCopied] = React.useState(false);
  const [isTogglingPublish, setIsTogglingPublish] = React.useState(false);

  const baseUrl = getBaseUrl();
  const profileUrl = `${baseUrl}/${profile.username}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast.success("Profile link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleTogglePublish = async () => {
    setIsTogglingPublish(true);
    const nextStatus = !profile.isPublished;
    try {
      const res = await togglePublishStatus(nextStatus);
      if (res.error) {
        toast.error(res.error);
      } else {
        onPublishToggle(nextStatus);
        toast.success(
          nextStatus
            ? "Your profile is now live and public!"
            : "Your profile is now private (returns 404 to visitors)"
        );
      }
    } catch {
      toast.error("Failed to update status");
    } finally {
      setIsTogglingPublish(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "links", label: `Links (${totalLinks})` },
    { id: "socials", label: "Socials" },
    { id: "qr", label: "QR Code" },
    { id: "settings", label: "Settings" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Profile Summary Bar */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#141414] border border-white/10 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {profile.name}
            </h1>
            <span className="text-xs font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
              @{profile.username}
            </span>
            <button
              type="button"
              onClick={handleTogglePublish}
              disabled={isTogglingPublish}
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                profile.isPublished
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20"
              }`}
            >
              {profile.isPublished ? (
                <>
                  <Globe className="w-3 h-3" />
                  <span>Public</span>
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3" />
                  <span>Unpublished (Private)</span>
                </>
              )}
            </button>

            {/* Layout Mode Badge */}
            {profile.showLinks === false ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border bg-purple-500/10 text-purple-300 border-purple-500/20">
                <UserCheck className="w-3 h-3 text-purple-400" />
                <span>Social Card Only</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border bg-white/[0.04] text-neutral-400 border-white/10">
                <Layers className="w-3 h-3 text-sky-400" />
                <span>Standard Layout</span>
              </span>
            )}
          </div>

          <p className="text-xs text-neutral-400 mt-1 font-mono break-all">
            {formatUrlDisplay(profileUrl)}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleCopyLink}
            className="flex-1 md:flex-initial"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-neutral-400" />
            )}
            <span>{copied ? "Copied" : "Copy Link"}</span>
          </Button>

          <Link
            href={`/${profile.username}`}
            target="_blank"
            className="flex-1 md:flex-initial"
          >
            <Button variant="primary" size="sm" className="w-full">
              <span>View My Page</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Analytics Stats Row */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#141414] border border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
            <MousePointerClick className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-neutral-400">Total Clicks</p>
            <p className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {totalClicks.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#141414] border border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-neutral-400">QR Scans</p>
            <p className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {profile.qrScans.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#141414] border border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Link2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-neutral-400">Active Links</p>
            <p className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {totalLinks}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#141414] border border-white/10 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? "bg-white text-black shadow-sm"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
