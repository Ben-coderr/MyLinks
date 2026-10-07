"use client";

import * as React from "react";
import { signOut } from "next-auth/react";
import { Mail, Lock, Trash2, AlertTriangle, Save, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { changeEmail, changePassword, deleteAccount } from "@/actions/settings";

interface SettingsEditorProps {
  currentEmail: string;
  username: string;
}

export function SettingsEditor({
  currentEmail,
  username,
}: SettingsEditorProps) {
  // Email state
  const [email, setEmail] = React.useState(currentEmail);
  const [isSavingEmail, setIsSavingEmail] = React.useState(false);

  // Password state
  const [currentPass, setCurrentPass] = React.useState("");
  const [newPass, setNewPass] = React.useState("");
  const [confirmPass, setConfirmPass] = React.useState("");
  const [isSavingPass, setIsSavingPass] = React.useState(false);

  // Delete account state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [confirmUsername, setConfirmUsername] = React.useState("");
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || email === currentEmail) return;

    setIsSavingEmail(true);
    try {
      const res = await changeEmail(email);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Email address updated!");
      }
    } catch {
      toast.error("Failed to update email");
    } finally {
      setIsSavingEmail(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPass.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }

    setIsSavingPass(true);
    try {
      const res = await changePassword(currentPass, newPass);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Password changed successfully!");
        setCurrentPass("");
        setNewPass("");
        setConfirmPass("");
      }
    } catch {
      toast.error("Failed to update password");
    } finally {
      setIsSavingPass(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmUsername.toLowerCase().trim() !== username.toLowerCase().trim()) {
      toast.error("Typed username does not match. Deletion aborted.");
      return;
    }

    setIsDeleting(true);
    try {
      const res = await deleteAccount(confirmUsername);
      if (res.error) {
        toast.error(res.error);
        setIsDeleting(false);
      } else {
        toast.success("Account deleted. Redirecting...");
        await signOut({ callbackUrl: "/" });
      }
    } catch {
      toast.error("Failed to delete account");
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Change Email */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#141414] border border-white/10 shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-white/5 pb-4">
          <Mail className="w-5 h-5 text-sky-400" />
          <h2 className="text-xl font-bold text-white tracking-tight">
            Account Email
          </h2>
        </div>

        <form onSubmit={handleUpdateEmail} className="space-y-4 max-w-md">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Button
            type="submit"
            variant="secondary"
            size="sm"
            isLoading={isSavingEmail}
            disabled={email === currentEmail}
          >
            <Save className="w-3.5 h-3.5 mr-1" />
            <span>Update Email</span>
          </Button>
        </form>
      </div>

      {/* Change Password */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#141414] border border-white/10 shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-white/5 pb-4">
          <KeyRound className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-bold text-white tracking-tight">
            Change Password
          </h2>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
          <Input
            label="Current Password"
            type="password"
            placeholder="••••••••"
            value={currentPass}
            onChange={(e) => setCurrentPass(e.target.value)}
            required
          />

          <Input
            label="New Password (min 8 characters)"
            type="password"
            placeholder="••••••••"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            required
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="••••••••"
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
            required
          />

          <Button
            type="submit"
            variant="secondary"
            size="sm"
            isLoading={isSavingPass}
          >
            <Lock className="w-3.5 h-3.5 mr-1" />
            <span>Update Password</span>
          </Button>
        </form>
      </div>

      {/* Danger Zone: Delete Account */}
      <div className="p-6 sm:p-8 rounded-3xl bg-red-950/20 border border-red-500/20 shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-red-500/10 pb-4">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <h2 className="text-xl font-bold text-red-300 tracking-tight">
            Danger Zone
          </h2>
        </div>

        <div>
          <p className="text-sm font-semibold text-white">Delete My Account</p>
          <p className="text-xs text-neutral-400 mt-0.5 max-w-lg leading-relaxed">
            Permanently delete your user account, bio link profile, links, socials,
            and avatar. This action cannot be reversed.
          </p>
        </div>

        <Button
          type="button"
          variant="danger"
          size="sm"
          onClick={() => setIsDeleteModalOpen(true)}
        >
          <Trash2 className="w-3.5 h-3.5 mr-1" />
          <span>Delete Account</span>
        </Button>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Account Deletion"
        description={`This will permanently delete your account and all associated profile links.`}
      >
        <form onSubmit={handleDeleteAccount} className="space-y-4 pt-2">
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
            To confirm deletion, please type your username{" "}
            <strong className="text-white font-mono">@{username}</strong> below:
          </div>

          <Input
            placeholder={username}
            value={confirmUsername}
            onChange={(e) => setConfirmUsername(e.target.value)}
            required
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              isLoading={isDeleting}
              disabled={confirmUsername.trim() !== username}
            >
              Permanently Delete
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
