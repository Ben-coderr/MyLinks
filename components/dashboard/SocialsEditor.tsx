"use client";

import * as React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, GripVertical, Trash2, Edit2, Share2 } from "lucide-react";
import { toast } from "sonner";
import { SocialPlatform } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SocialIcon, PLATFORM_NAMES } from "@/components/profile/SocialIcon";
import {
  createSocial,
  updateSocial,
  deleteSocial,
  reorderSocials,
} from "@/actions/dashboard";
import { socialSchema, type SocialInput } from "@/lib/validations/profile";
import { cn } from "@/lib/utils";

export interface DashboardSocialItem {
  id: string;
  platform: SocialPlatform;
  url: string;
  order: number;
}

const PLATFORM_OPTIONS: { id: SocialPlatform; label: string; placeholder: string; helper?: string }[] = [
  { id: SocialPlatform.instagram, label: "Instagram", placeholder: "username or https://instagram.com/..." },
  { id: SocialPlatform.github, label: "GitHub", placeholder: "username or https://github.com/..." },
  { id: SocialPlatform.linkedin, label: "LinkedIn", placeholder: "in/username or full URL" },
  { id: SocialPlatform.x, label: "X (Twitter)", placeholder: "username or https://x.com/..." },
  { id: SocialPlatform.whatsapp, label: "WhatsApp", placeholder: "+1234567890", helper: "Enter phone number with country code. Converts to https://wa.me/<number>" },
  { id: SocialPlatform.youtube, label: "YouTube", placeholder: "@channel or full URL" },
  { id: SocialPlatform.telegram, label: "Telegram", placeholder: "username or https://t.me/..." },
  { id: SocialPlatform.email, label: "Email", placeholder: "you@example.com", helper: "Converts to mailto: link" },
];

interface SortableSocialItemProps {
  social: DashboardSocialItem;
  onEdit: (item: DashboardSocialItem) => void;
  onDelete: (id: string) => void;
}

function SortableSocialItem({
  social,
  onEdit,
  onDelete,
}: SortableSocialItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: social.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "p-3.5 rounded-2xl bg-[#141414] border border-white/10 hover:border-white/20 transition-all flex items-center justify-between gap-3 select-none",
        isDragging && "opacity-60 scale-[1.01] shadow-2xl z-20 border-sky-400/50"
      )}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Reorder social platform"
          className="cursor-grab active:cursor-grabbing text-neutral-500 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors shrink-0"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-neutral-300 shrink-0">
          <SocialIcon platform={social.platform} className="w-4 h-4" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-semibold text-white text-sm">
            {PLATFORM_NAMES[social.platform] || social.platform}
          </p>
          <a
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-neutral-400 hover:text-sky-400 font-mono truncate block mt-0.5"
          >
            {social.url}
          </a>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => onEdit(social)}
          aria-label="Edit social"
          className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(social.id)}
          aria-label="Delete social"
          className="p-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

interface SocialsEditorProps {
  initialSocials: DashboardSocialItem[];
  onSocialsChanged: (socials: DashboardSocialItem[]) => void;
}

export function SocialsEditor({
  initialSocials,
  onSocialsChanged,
}: SocialsEditorProps) {
  const [socials, setSocials] = React.useState<DashboardSocialItem[]>(
    initialSocials
  );
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingSocial, setEditingSocial] = React.useState<DashboardSocialItem | null>(
    null
  );
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [formData, setFormData] = React.useState<SocialInput>({
    platform: SocialPlatform.instagram,
    url: "",
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = socials.findIndex((s) => s.id === active.id);
    const newIndex = socials.findIndex((s) => s.id === over.id);

    const reordered = arrayMove(socials, oldIndex, newIndex).map((s, idx) => ({
      ...s,
      order: idx,
    }));

    setSocials(reordered);
    onSocialsChanged(reordered);

    try {
      const res = await reorderSocials(reordered.map((s) => s.id));
      if (res.error) {
        toast.error(res.error);
        setSocials(socials);
        onSocialsChanged(socials);
      }
    } catch {
      toast.error("Failed to reorder socials");
      setSocials(socials);
      onSocialsChanged(socials);
    }
  };

  const handleOpenAdd = () => {
    setEditingSocial(null);
    setFormData({
      platform: SocialPlatform.github,
      url: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: DashboardSocialItem) => {
    setEditingSocial(item);
    setFormData({
      platform: item.platform,
      url: item.url,
    });
    setIsModalOpen(true);
  };

  const handleSaveSocial = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = socialSchema.safeParse(formData);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Invalid social information");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingSocial) {
        const res = await updateSocial(editingSocial.id, formData);
        if (res.error) {
          toast.error(res.error);
        } else if (res.social) {
          toast.success("Social link updated!");
          const updated = socials.map((s) =>
            s.id === editingSocial.id ? (res.social as DashboardSocialItem) : s
          );
          setSocials(updated);
          onSocialsChanged(updated);
          setIsModalOpen(false);
        }
      } else {
        const res = await createSocial(formData);
        if (res.error) {
          toast.error(res.error);
        } else if (res.social) {
          toast.success("Social link added!");
          const updated = [...socials, res.social as DashboardSocialItem];
          setSocials(updated);
          onSocialsChanged(updated);
          setIsModalOpen(false);
        }
      }
    } catch {
      toast.error("Failed to save social link");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setIsSubmitting(true);
    try {
      const res = await deleteSocial(deletingId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Social link removed");
        const updated = socials.filter((s) => s.id !== deletingId);
        setSocials(updated);
        onSocialsChanged(updated);
        setDeletingId(null);
      }
    } catch {
      toast.error("Failed to remove social link");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPlatformMeta =
    PLATFORM_OPTIONS.find((p) => p.id === formData.platform) ||
    PLATFORM_OPTIONS[0];

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-[#141414] border border-white/10 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Social Platforms
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Display direct icon links to your social networks and messaging apps
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={handleOpenAdd}
        >
          <Plus className="w-4 h-4 mr-1" />
          <span>Add Social</span>
        </Button>
      </div>

      {socials.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl bg-white/[0.02] border border-dashed border-white/10">
          <Share2 className="w-8 h-8 text-neutral-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-white">No socials added</p>
          <p className="text-xs text-neutral-400 mt-1 mb-4">
            Connect your GitHub, X, LinkedIn, or WhatsApp
          </p>
          <Button variant="secondary" size="sm" onClick={handleOpenAdd}>
            <Plus className="w-4 h-4 mr-1" />
            Add First Social
          </Button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={socials.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {socials.map((item) => (
                <SortableSocialItem
                  key={item.id}
                  social={item}
                  onEdit={handleOpenEdit}
                  onDelete={(id) => setDeletingId(id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSocial ? "Edit Social Platform" : "Add Social Platform"}
        description="Select platform and provide your profile handle or URL"
      >
        <form onSubmit={handleSaveSocial} className="space-y-4 pt-2">
          {/* Platform Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-neutral-300">
              Platform
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PLATFORM_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, platform: opt.id })}
                  className={cn(
                    "p-2.5 rounded-xl border flex items-center gap-2 text-xs transition-all cursor-pointer",
                    formData.platform === opt.id
                      ? "bg-sky-500/20 text-sky-300 border-sky-400/40"
                      : "bg-[#141414] text-neutral-400 border-white/5 hover:text-white hover:border-white/20"
                  )}
                >
                  <SocialIcon platform={opt.id} className="w-4 h-4" />
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* URL / Handle Input */}
          <div>
            <Input
              label={
                formData.platform === SocialPlatform.whatsapp
                  ? "Phone Number"
                  : "Handle or URL"
              }
              placeholder={selectedPlatformMeta.placeholder}
              value={formData.url}
              onChange={(e) =>
                setFormData({ ...formData, url: e.target.value })
              }
              helperText={selectedPlatformMeta.helper}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {editingSocial ? "Update" : "Add Platform"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleConfirmDelete}
        title="Remove Social Link?"
        description="Are you sure you want to remove this social link from your profile?"
        confirmLabel="Remove"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}
