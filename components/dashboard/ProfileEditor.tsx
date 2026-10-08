"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Upload,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  Save,
  ImageIcon,
  Layers,
  UserCheck,
  Check,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { profileSchema, type ProfileInput } from "@/lib/validations/profile";
import { updateProfile } from "@/actions/dashboard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

interface ProfileEditorProps {
  initialProfile: {
    id: string;
    name: string;
    title?: string | null;
    bio?: string | null;
    location?: string | null;
    username: string;
    avatarUrl?: string | null;
    showLinks?: boolean;
  };
  onProfileUpdated: (updated: ProfileInput) => void;
}

export function ProfileEditor({
  initialProfile,
  onProfileUpdated,
}: ProfileEditorProps) {
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(
    initialProfile.avatarUrl || null
  );
  const [isUploadingAvatar, setIsUploadingAvatar] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  // Username validation state
  const [usernameStatus, setUsernameStatus] = React.useState<{
    state: "idle" | "checking" | "available" | "unavailable";
    message: string;
  }>({ state: "idle", message: "" });

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
    setValue,
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: initialProfile.name,
      title: initialProfile.title || "",
      bio: initialProfile.bio || "",
      location: initialProfile.location || "",
      username: initialProfile.username,
      avatarUrl: initialProfile.avatarUrl || null,
      showLinks: initialProfile.showLinks !== false,
    },
  });

  const watchedUsername = watch("username");
  const isUsernameChanged =
    watchedUsername?.toLowerCase().trim() !== initialProfile.username;

  // Live availability check when username is changed
  React.useEffect(() => {
    if (!watchedUsername || !isUsernameChanged || watchedUsername.length < 3) {
      setUsernameStatus({ state: "idle", message: "" });
      return;
    }

    setUsernameStatus({ state: "checking", message: "Checking username..." });

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/username/check?username=${encodeURIComponent(watchedUsername)}`
        );
        const data = await res.json();
        if (data.available) {
          setUsernameStatus({ state: "available", message: "Username is available!" });
        } else {
          setUsernameStatus({
            state: "unavailable",
            message: data.message || "Username is not available",
          });
        }
      } catch {
        setUsernameStatus({ state: "idle", message: "" });
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [watchedUsername, isUsernameChanged]);

  // Handle avatar upload via /api/upload/avatar
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size exceeds 2MB limit");
      return;
    }

    setIsUploadingAvatar(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload/avatar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        toast.error(data.error || "Failed to upload image");
      } else {
        setAvatarUrl(data.url);
        setValue("avatarUrl", data.url, { shouldDirty: true });
        onProfileUpdated({
          name: watch("name"),
          title: watch("title"),
          bio: watch("bio"),
          location: watch("location"),
          username: watch("username"),
          avatarUrl: data.url,
          showLinks: watch("showLinks"),
        });
        toast.success("Avatar uploaded successfully!");
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveAvatar = async () => {
    setIsUploadingAvatar(true);
    try {
      const res = await fetch("/api/upload/avatar", { method: "DELETE" });
      if (res.ok) {
        setAvatarUrl(null);
        setValue("avatarUrl", null, { shouldDirty: true });
        onProfileUpdated({
          name: watch("name"),
          title: watch("title"),
          bio: watch("bio"),
          location: watch("location"),
          username: watch("username"),
          avatarUrl: null,
          showLinks: watch("showLinks"),
        });
        toast.success("Avatar removed");
      }
    } catch {
      toast.error("Failed to remove avatar");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const onSubmit = async (data: ProfileInput) => {
    if (usernameStatus.state === "unavailable") {
      toast.error("Please choose an available username before saving");
      return;
    }

    setIsSaving(true);
    try {
      // If avatarUrl is a large base64 data URI, it was already saved directly to the database
      // via /api/upload/avatar. Omit huge base64 strings from Server Action wire payload.
      const payload: ProfileInput = {
        ...data,
        avatarUrl: avatarUrl?.startsWith("data:") ? undefined : avatarUrl,
      };
      const res = await updateProfile(payload);

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Profile updated successfully!");
        onProfileUpdated({ ...payload, avatarUrl: avatarUrl || null });
      }
    } catch (err) {
      console.error("Profile save error:", err);
      toast.error((err as Error)?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-[#141414] border border-white/10 shadow-xl space-y-6">
      <div className="border-b border-white/5 pb-4">
        <h2 className="text-xl font-bold text-white tracking-tight">
          Profile Details
        </h2>
        <p className="text-xs text-neutral-400 mt-1">
          Customize how you appear on your public bio link page
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Avatar Upload Section */}
        <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
          <Avatar
            src={avatarUrl}
            name={watch("name") || "User"}
            size="lg"
            glow={true}
          />

          <div className="flex-1 space-y-2 text-center sm:text-left">
            <div>
              <p className="text-sm font-semibold text-white">Profile Picture</p>
              <p className="text-xs text-neutral-400">
                JPG, PNG, or WebP. 2MB max file size.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                isLoading={isUploadingAvatar}
              >
                <Upload className="w-3.5 h-3.5 mr-1" />
                <span>{avatarUrl ? "Replace" : "Upload Picture"}</span>
              </Button>

              {avatarUrl && (
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={handleRemoveAvatar}
                  disabled={isUploadingAvatar}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  <span>Remove</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Display Name */}
        <div>
          <Input
            label="Full Name / Display Name"
            placeholder="e.g. Alex Morgan"
            error={errors.name?.message}
            {...register("name")}
          />
        </div>

        {/* Professional Title */}
        <div>
          <Input
            label="Professional Title or Tagline"
            placeholder="e.g. Staff Software Engineer & Speaker"
            error={errors.title?.message}
            {...register("title")}
          />
        </div>

        {/* Location */}
        <div>
          <Input
            label="Location (Optional)"
            placeholder="e.g. San Francisco, CA"
            error={errors.location?.message}
            {...register("location")}
          />
        </div>

        {/* Bio */}
        <div>
          <Textarea
            label="Short Bio"
            rows={3}
            placeholder="Write a few lines about what you build, write, or design..."
            error={errors.bio?.message}
            helperText="Max 300 characters."
            {...register("bio")}
          />
        </div>

        {/* Username with availability and warning */}
        <div className="space-y-2">
          <Input
            label="Username (Public Link Handle)"
            placeholder="username"
            error={errors.username?.message}
            {...register("username")}
          />

          {/* Live feedback */}
          {isUsernameChanged && (
            <div className="min-h-[20px]">
              {usernameStatus.state === "checking" && (
                <p className="flex items-center gap-1.5 text-xs text-neutral-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{usernameStatus.message}</span>
                </p>
              )}
              {usernameStatus.state === "available" && (
                <p className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{usernameStatus.message}</span>
                </p>
              )}
              {usernameStatus.state === "unavailable" && (
                <p className="flex items-center gap-1.5 text-xs text-red-400">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>{usernameStatus.message}</span>
                </p>
              )}
            </div>
          )}

          {/* Warning banner when username is changed */}
          {isUsernameChanged && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <span>
                <strong>Warning:</strong> Changing your username will break your
                previous link (mylink.com/{initialProfile.username}) and regenerate
                your scannable QR code!
              </span>
            </div>
          )}
        </div>

        {/* Page Display Layout Option: Standard vs Social Card Only */}
        <div className="space-y-3 pt-1">
          <div>
            <label className="text-sm font-semibold text-white flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-sky-400" />
              <span>Page View Layout Mode</span>
            </label>
            <p className="text-xs text-neutral-400 mt-1">
              Choose how your public page is presented to visitors. You can toggle between full portfolio works or a focused social profile card.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Option 1: Standard Full Profile */}
            <button
              type="button"
              onClick={() => {
                setValue("showLinks", true, { shouldDirty: true });
                onProfileUpdated({
                  name: watch("name"),
                  title: watch("title"),
                  bio: watch("bio"),
                  location: watch("location"),
                  username: watch("username"),
                  avatarUrl,
                  showLinks: true,
                });
              }}
              className={cn(
                "p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer",
                watch("showLinks")
                  ? "bg-sky-500/[0.08] border-sky-400 ring-1 ring-sky-400/30"
                  : "bg-[#141414] border-white/10 hover:border-white/20"
              )}
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-sky-400">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full border flex items-center justify-center transition-colors",
                      watch("showLinks")
                        ? "border-sky-400 bg-sky-400 text-black"
                        : "border-neutral-600"
                    )}
                  >
                    {watch("showLinks") && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                </div>
                <h4 className="text-sm font-semibold text-white">
                  Standard Layout
                </h4>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  Full page with photo, name, bio, social media, plus all your job & work link cards.
                </p>
              </div>
              <span className="mt-3 inline-block text-[11px] font-medium text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-500/20 w-fit">
                Bio + Socials + Work Links
              </span>
            </button>

            {/* Option 2: Social Profile Card Only */}
            <button
              type="button"
              onClick={() => {
                setValue("showLinks", false, { shouldDirty: true });
                onProfileUpdated({
                  name: watch("name"),
                  title: watch("title"),
                  bio: watch("bio"),
                  location: watch("location"),
                  username: watch("username"),
                  avatarUrl,
                  showLinks: false,
                });
              }}
              className={cn(
                "p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer",
                !watch("showLinks")
                  ? "bg-sky-500/[0.08] border-sky-400 ring-1 ring-sky-400/30"
                  : "bg-[#141414] border-white/10 hover:border-white/20"
              )}
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-sky-400">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full border flex items-center justify-center transition-colors",
                      !watch("showLinks")
                        ? "border-sky-400 bg-sky-400 text-black"
                        : "border-neutral-600"
                    )}
                  >
                    {!watch("showLinks") && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                </div>
                <h4 className="text-sm font-semibold text-white">
                  Social Card Only
                </h4>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  Only photo, full name, description bio, and social media links. All work & job links are hidden.
                </p>
              </div>
              <span className="mt-3 inline-block text-[11px] font-medium text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20 w-fit">
                Photo + Bio + Socials Only
              </span>
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-2 flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSaving}
            className="w-full sm:w-auto font-semibold"
          >
            <Save className="w-4 h-4 mr-1.5" />
            <span>Save Profile</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
