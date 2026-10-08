"use client";

import * as React from "react";
import { Edit3, Smartphone } from "lucide-react";
import { DashboardHeader } from "./DashboardHeader";
import { ProfileEditor } from "./ProfileEditor";
import { LinksEditor, type DashboardLinkItem } from "./LinksEditor";
import { SocialsEditor, type DashboardSocialItem } from "./SocialsEditor";
import { QrSection } from "./QrSection";
import { SettingsEditor } from "./SettingsEditor";
import { LivePreviewPhone } from "./LivePreviewPhone";
import { type ProfileInput } from "@/lib/validations/profile";

interface DashboardClientProps {
  initialUser: {
    id: string;
    email: string;
    role: string;
  };
  initialProfile: {
    id: string;
    username: string;
    name: string;
    title?: string | null;
    bio?: string | null;
    location?: string | null;
    avatarUrl?: string | null;
    isPublished: boolean;
    showLinks?: boolean;
    qrScans: number;
  };
  initialLinks: DashboardLinkItem[];
  initialSocials: DashboardSocialItem[];
}

export function DashboardClient({
  initialUser,
  initialProfile,
  initialLinks,
  initialSocials,
}: DashboardClientProps) {
  const [profile, setProfile] = React.useState(initialProfile);
  const [links, setLinks] = React.useState<DashboardLinkItem[]>(initialLinks);
  const [socials, setSocials] = React.useState<DashboardSocialItem[]>(initialSocials);

  const [activeTab, setActiveTab] = React.useState<string>("profile");
  const [mobileView, setMobileView] = React.useState<"edit" | "preview">("edit");

  const totalClicks = links.reduce((sum, link) => sum + (link.clicks || 0), 0);

  const handleProfileUpdated = (updated: ProfileInput) => {
    setProfile((prev) => ({
      ...prev,
      name: updated.name,
      title: updated.title || null,
      bio: updated.bio || null,
      location: updated.location || null,
      username: updated.username,
      avatarUrl: updated.avatarUrl || null,
      showLinks: updated.showLinks !== undefined ? updated.showLinks : prev.showLinks,
    }));
  };

  const handlePublishToggle = (newStatus: boolean) => {
    setProfile((prev) => ({
      ...prev,
      isPublished: newStatus,
    }));
  };

  return (
    <div className="space-y-8">
      {/* Top Header Summary & Navigation Tabs */}
      <DashboardHeader
        profile={profile}
        totalClicks={totalClicks}
        totalLinks={links.length}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setMobileView("edit"); // switch back to edit on tab click
        }}
        onPublishToggle={handlePublishToggle}
      />

      {/* Mobile Tab Switcher (Edit vs Preview) */}
      <div className="lg:hidden flex items-center p-1 rounded-2xl bg-[#141414] border border-white/10">
        <button
          type="button"
          onClick={() => setMobileView("edit")}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            mobileView === "edit"
              ? "bg-white text-black shadow-sm"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Editor</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileView("preview")}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            mobileView === "preview"
              ? "bg-white text-black shadow-sm"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Live Phone Preview</span>
        </button>
      </div>

      {/* Main Grid: Form on Left, Live Phone Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Editors */}
        <div
          className={`lg:col-span-7 xl:col-span-7 space-y-6 ${
            mobileView === "preview" ? "hidden lg:block" : "block"
          }`}
        >
          {activeTab === "profile" && (
            <ProfileEditor
              initialProfile={profile}
              onProfileUpdated={handleProfileUpdated}
            />
          )}

          {activeTab === "links" && (
            <LinksEditor
              initialLinks={links}
              onLinksChanged={(updated) => setLinks(updated)}
              showLinks={profile.showLinks}
            />
          )}

          {activeTab === "socials" && (
            <SocialsEditor
              initialSocials={socials}
              onSocialsChanged={(updated) => setSocials(updated)}
            />
          )}

          {activeTab === "qr" && (
            <QrSection
              username={profile.username}
              name={profile.name}
              avatarUrl={profile.avatarUrl}
            />
          )}

          {activeTab === "settings" && (
            <SettingsEditor
              currentEmail={initialUser.email}
              username={profile.username}
            />
          )}
        </div>

        {/* Right Column: Live Phone Frame (Sticky on Desktop) */}
        <div
          className={`lg:col-span-5 xl:col-span-5 ${
            mobileView === "edit" ? "hidden lg:block" : "block"
          }`}
        >
          <LivePreviewPhone
            profile={profile}
            links={links}
            socials={socials}
          />
        </div>
      </div>
    </div>
  );
}
