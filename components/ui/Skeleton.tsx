import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-white/[0.06] border border-white/[0.04]",
        className
      )}
      {...props}
    />
  );
}
