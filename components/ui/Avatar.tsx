import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  glow?: boolean;
}

export function Avatar({
  src,
  name = "User",
  size = "md",
  className,
  glow = false,
}: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);

  const getInitials = (str: string) => {
    const parts = str.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return str.slice(0, 2).toUpperCase() || "U";
  };

  const dimensions = {
    sm: { size: 32, px: "w-8 h-8", text: "text-xs" },
    md: { size: 48, px: "w-12 h-12", text: "text-sm" },
    lg: { size: 64, px: "w-16 h-16", text: "text-lg" },
    xl: { size: 112, px: "w-28 h-28", text: "text-2xl" },
  };

  const current = dimensions[size];

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 select-none",
        current.px,
        glow && "ring-2 ring-white/20 shadow-[0_0_25px_rgba(255,255,255,0.12)]",
        className
      )}
    >
      {src && !imageError ? (
        <Image
          src={src}
          alt={name}
          width={current.size}
          height={current.size}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
          priority={size === "xl"}
          unoptimized={Boolean(src?.startsWith("data:"))}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center text-white font-semibold tracking-wider border border-white/10">
          <span className={current.text}>{getInitials(name)}</span>
        </div>
      )}
    </div>
  );
}
