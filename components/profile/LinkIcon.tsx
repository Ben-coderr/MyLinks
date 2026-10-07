import * as React from "react";
import {
  Rocket,
  FileText,
  Mic,
  Coffee,
  Sparkles,
  Palette,
  Calendar,
  Globe,
  Code,
  BookOpen,
  Briefcase,
  Layers,
  Terminal,
  Cpu,
  Bookmark,
  Link2,
} from "lucide-react";

interface LinkIconProps {
  name?: string | null;
  className?: string;
}

export function LinkIcon({ name, className = "w-4 h-4" }: LinkIconProps) {
  if (!name) return <Link2 className={className} />;

  const key = name.toLowerCase().trim();

  switch (key) {
    case "rocket":
      return <Rocket className={className} />;
    case "file-text":
    case "blog":
    case "article":
      return <FileText className={className} />;
    case "mic":
    case "podcast":
    case "talk":
      return <Mic className={className} />;
    case "coffee":
    case "donate":
      return <Coffee className={className} />;
    case "sparkles":
    case "featured":
    case "portfolio":
      return <Sparkles className={className} />;
    case "palette":
    case "design":
      return <Palette className={className} />;
    case "calendar":
    case "meet":
    case "call":
      return <Calendar className={className} />;
    case "code":
    case "github":
    case "dev":
      return <Code className={className} />;
    case "book":
    case "docs":
      return <BookOpen className={className} />;
    case "briefcase":
    case "work":
      return <Briefcase className={className} />;
    case "layers":
      return <Layers className={className} />;
    case "terminal":
      return <Terminal className={className} />;
    case "cpu":
      return <Cpu className={className} />;
    case "bookmark":
      return <Bookmark className={className} />;
    default:
      return <Link2 className={className} />;
  }
}
