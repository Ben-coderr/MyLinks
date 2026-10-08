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
import {
  Plus,
  GripVertical,
  ExternalLink,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  MousePointerClick,
  Link2,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { LinkIcon } from "@/components/profile/LinkIcon";
import {
  createLink,
  updateLink,
  deleteLink,
  reorderLinks,
} from "@/actions/dashboard";
import { linkSchema, type LinkInput } from "@/lib/validations/profile";
import { cn } from "@/lib/utils";

export interface DashboardLinkItem {
  id: string;
  title: string;
  subtitle?: string | null;
  url: string;
  icon?: string | null;
  featured: boolean;
  clicks: number;
  isVisible: boolean;
  order: number;
}

const AVAILABLE_ICONS = [
  { id: "rocket", label: "Rocket" },
  { id: "file-text", label: "Blog / Article" },
  { id: "mic", label: "Podcast / Talk" },
  { id: "coffee", label: "Support / Coffee" },
  { id: "sparkles", label: "Sparkles" },
  { id: "palette", label: "Design / Art" },
  { id: "calendar", label: "Booking / Meet" },
  { id: "code", label: "Source / Code" },
  { id: "book", label: "Docs / Guide" },
  { id: "briefcase", label: "Portfolio / Work" },
  { id: "layers", label: "Platform" },
  { id: "terminal", label: "Terminal" },
  { id: "cpu", label: "Hardware / AI" },
  { id: "bookmark", label: "Bookmark" },
];

interface SortableLinkItemProps {
  link: DashboardLinkItem;
  onEdit: (link: DashboardLinkItem) => void;
  onDelete: (id: string) => void;
  onToggleVisible: (id: string, current: boolean) => void;
  onToggleFeatured: (id: string, current: boolean) => void;
}

function SortableLinkItem({
  link,
  onEdit,
  onDelete,
  onToggleVisible,
  onToggleFeatured,
}: SortableLinkItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "p-4 rounded-2xl bg-[#141414] border transition-all flex items-center justify-between gap-3 select-none",
        isDragging && "opacity-60 scale-[1.01] shadow-2xl z-20 border-sky-400/50",
        link.featured
          ? "border-sky-400/30 bg-[#181818]"
          : "border-white/10 hover:border-white/20",
        !link.isVisible && "opacity-50 bg-[#111111]"
      )}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Drag Handle */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Reorder link"
          className="cursor-grab active:cursor-grabbing text-neutral-500 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors shrink-0"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        {/* Icon preview */}
        <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-neutral-300 shrink-0">
          <LinkIcon name={link.icon} className="w-4 h-4" />
        </div>

        {/* Title, Subtitle, & URL */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-white text-sm truncate">
              {link.title}
            </p>
            {link.featured && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-sky-500/15 border border-sky-400/25 px-2 py-0.2 text-[10px] font-semibold text-sky-400">
                <Sparkles className="w-2.5 h-2.5" />
                Featured
              </span>
            )}
          </div>
          {link.subtitle && (
            <p className="text-xs text-neutral-400 truncate mt-0.5">
              {link.subtitle}
            </p>
          )}
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-neutral-500 hover:text-sky-400 font-mono truncate block mt-0.5"
          >
            {link.url}
          </a>
        </div>
      </div>

      {/* Right controls: clicks, visibility, featured, edit, delete */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Click counter */}
        <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/[0.04] border border-white/5 text-xs text-neutral-400">
          <MousePointerClick className="w-3 h-3 text-sky-400" />
          <span>{link.clicks}</span>
        </div>

        {/* Toggle featured */}
        <button
          type="button"
          onClick={() => onToggleFeatured(link.id, link.featured)}
          aria-label={link.featured ? "Unmark featured" : "Mark as featured"}
          title={link.featured ? "Featured (Click to unfeature)" : "Mark featured"}
          className={cn(
            "p-2 rounded-xl border transition-colors",
            link.featured
              ? "bg-sky-500/20 text-sky-300 border-sky-400/40"
              : "bg-transparent text-neutral-500 border-transparent hover:bg-white/5 hover:text-white"
          )}
        >
          <Sparkles className="w-4 h-4" />
        </button>

        {/* Toggle visibility */}
        <button
          type="button"
          onClick={() => onToggleVisible(link.id, link.isVisible)}
          aria-label={link.isVisible ? "Hide link" : "Show link"}
          title={link.isVisible ? "Visible on profile" : "Hidden from profile"}
          className={cn(
            "p-2 rounded-xl border transition-colors",
            link.isVisible
              ? "bg-transparent text-neutral-400 border-transparent hover:bg-white/5 hover:text-white"
              : "bg-neutral-800 text-neutral-500 border-white/10"
          )}
        >
          {link.isVisible ? (
            <Eye className="w-4 h-4" />
          ) : (
            <EyeOff className="w-4 h-4 text-neutral-500" />
          )}
        </button>

        {/* Edit Button */}
        <button
          type="button"
          onClick={() => onEdit(link)}
          aria-label="Edit link"
          className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <Edit2 className="w-4 h-4" />
        </button>

        {/* Delete Button */}
        <button
          type="button"
          onClick={() => onDelete(link.id)}
          aria-label="Delete link"
          className="p-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

interface LinksEditorProps {
  initialLinks: DashboardLinkItem[];
  onLinksChanged: (links: DashboardLinkItem[]) => void;
  showLinks?: boolean;
}

export function LinksEditor({
  initialLinks,
  onLinksChanged,
  showLinks,
}: LinksEditorProps) {
  const [links, setLinks] = React.useState<DashboardLinkItem[]>(initialLinks);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [editingLink, setEditingLink] = React.useState<DashboardLinkItem | null>(
    null
  );
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form states for add / edit
  const [formData, setFormData] = React.useState<LinkInput>({
    title: "",
    subtitle: "",
    url: "",
    icon: "sparkles",
    featured: false,
    isVisible: true,
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

    const oldIndex = links.findIndex((item) => item.id === active.id);
    const newIndex = links.findIndex((item) => item.id === over.id);

    const reordered = arrayMove(links, oldIndex, newIndex).map(
      (item, idx) => ({ ...item, order: idx })
    );

    // Optimistic UI update
    setLinks(reordered);
    onLinksChanged(reordered);

    try {
      const res = await reorderLinks(reordered.map((l) => l.id));
      if (res.error) {
        toast.error(res.error);
        setLinks(links); // revert on error
        onLinksChanged(links);
      }
    } catch {
      toast.error("Failed to save reordered links");
      setLinks(links);
      onLinksChanged(links);
    }
  };

  const handleOpenAdd = () => {
    setEditingLink(null);
    setFormData({
      title: "",
      subtitle: "",
      url: "",
      icon: "rocket",
      featured: false,
      isVisible: true,
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (link: DashboardLinkItem) => {
    setEditingLink(link);
    setFormData({
      title: link.title,
      subtitle: link.subtitle || "",
      url: link.url,
      icon: link.icon || "rocket",
      featured: link.featured,
      isVisible: link.isVisible,
    });
    setIsAddOpen(true);
  };

  const handleSaveLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = linkSchema.safeParse(formData);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Invalid link details");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingLink) {
        // Edit existing link
        const res = await updateLink(editingLink.id, formData);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success("Link updated successfully!");
          const updated = links.map((l) =>
            l.id === editingLink.id
              ? {
                  ...l,
                  ...formData,
                  subtitle: formData.subtitle || null,
                  icon: formData.icon || null,
                }
              : l
          );
          setLinks(updated);
          onLinksChanged(updated);
          setIsAddOpen(false);
        }
      } else {
        // Create new link
        const res = await createLink(formData);
        if (res.error) {
          toast.error(res.error);
        } else if (res.link) {
          toast.success("Link added successfully!");
          const updated = [...links, res.link as DashboardLinkItem];
          setLinks(updated);
          onLinksChanged(updated);
          setIsAddOpen(false);
        }
      }
    } catch {
      toast.error("Failed to save link");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleVisible = async (id: string, current: boolean) => {
    const nextVal = !current;
    const updated = links.map((l) =>
      l.id === id ? { ...l, isVisible: nextVal } : l
    );
    setLinks(updated);
    onLinksChanged(updated);

    try {
      const res = await updateLink(id, { isVisible: nextVal });
      if (res.error) {
        toast.error(res.error);
        setLinks(links);
        onLinksChanged(links);
      } else {
        toast.success(nextVal ? "Link is now visible" : "Link hidden");
      }
    } catch {
      toast.error("Failed to update visibility");
      setLinks(links);
      onLinksChanged(links);
    }
  };

  const handleToggleFeatured = async (id: string, current: boolean) => {
    const nextVal = !current;
    const updated = links.map((l) =>
      l.id === id ? { ...l, featured: nextVal } : l
    );
    setLinks(updated);
    onLinksChanged(updated);

    try {
      const res = await updateLink(id, { featured: nextVal });
      if (res.error) {
        toast.error(res.error);
        setLinks(links);
        onLinksChanged(links);
      } else {
        toast.success(nextVal ? "Marked as featured!" : "Unmarked featured");
      }
    } catch {
      toast.error("Failed to update featured state");
      setLinks(links);
      onLinksChanged(links);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setIsSubmitting(true);
    try {
      const res = await deleteLink(deletingId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Link deleted successfully");
        const updated = links.filter((l) => l.id !== deletingId);
        setLinks(updated);
        onLinksChanged(updated);
        setDeletingId(null);
      }
    } catch {
      toast.error("Failed to delete link");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-[#141414] border border-white/10 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Links & Cards
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Drag and drop to reorder. Toggle visibility or mark items as featured.
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={handleOpenAdd}
        >
          <Plus className="w-4 h-4 mr-1" />
          <span>Add New Link</span>
        </Button>
      </div>

      {/* Social Card Only Notice Banner */}
      {showLinks === false && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-amber-300 text-xs">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-200">
              Page View Mode: Social Card Only
            </p>
            <p className="text-amber-300/80 leading-relaxed">
              Your public page is currently configured to show ONLY your picture, full name, description bio, and social media links.
              The link cards below are safely saved, but hidden from visitors on your public page view. You can switch back to Standard Layout anytime in the <strong>Profile</strong> tab.
            </p>
          </div>
        </div>
      )}

      {/* Sortable Links List */}
      {links.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl bg-white/[0.02] border border-dashed border-white/10">
          <Link2 className="w-8 h-8 text-neutral-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-white">No links yet</p>
          <p className="text-xs text-neutral-400 mt-1 mb-4">
            Add your first link to showcase your work or content
          </p>
          <Button variant="secondary" size="sm" onClick={handleOpenAdd}>
            <Plus className="w-4 h-4 mr-1" />
            Add First Link
          </Button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={links.map((l) => l.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {links.map((link) => (
                <SortableLinkItem
                  key={link.id}
                  link={link}
                  onEdit={handleOpenEdit}
                  onDelete={(id) => setDeletingId(id)}
                  onToggleVisible={handleToggleVisible}
                  onToggleFeatured={handleToggleFeatured}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title={editingLink ? "Edit Link Card" : "Add New Link Card"}
        description="Configure link destination, title, and optional badge styling"
      >
        <form onSubmit={handleSaveLink} className="space-y-4 pt-2">
          <div>
            <Input
              label="Title"
              placeholder="e.g. My Latest Project"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Input
              label="Subtitle or Description (Optional)"
              placeholder="e.g. High-performance caching engine"
              value={formData.subtitle || ""}
              onChange={(e) =>
                setFormData({ ...formData, subtitle: e.target.value })
              }
            />
          </div>

          <div>
            <Input
              label="Destination URL"
              type="text"
              placeholder="https://..."
              value={formData.url}
              onChange={(e) =>
                setFormData({ ...formData, url: e.target.value })
              }
              required
            />
          </div>

          {/* Icon Selector (Real library icons) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-neutral-300">
              Select Icon
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 max-h-36 overflow-y-auto p-1 bg-[#0E0E0E] rounded-xl border border-white/5">
              {AVAILABLE_ICONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon: item.id })}
                  className={cn(
                    "p-2.5 rounded-xl border flex flex-col items-center gap-1 text-xs transition-all cursor-pointer",
                    formData.icon === item.id
                      ? "bg-sky-500/20 text-sky-300 border-sky-400/40"
                      : "bg-[#141414] text-neutral-400 border-white/5 hover:text-white hover:border-white/20"
                  )}
                  title={item.label}
                >
                  <LinkIcon name={item.id} className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Featured checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="featured-toggle"
              checked={formData.featured}
              onChange={(e) =>
                setFormData({ ...formData, featured: e.target.checked })
              }
              className="w-4 h-4 rounded border-white/20 bg-[#1A1A1A] text-sky-500 focus:ring-sky-400"
            />
            <label
              htmlFor="featured-toggle"
              className="text-xs text-neutral-300 font-medium cursor-pointer"
            >
              Highlight as Featured Link (Glow effect & featured badge)
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {editingLink ? "Update Link" : "Create Link"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Link Card?"
        description="Are you sure you want to delete this link card? This action cannot be undone."
        confirmLabel="Delete Link"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}
