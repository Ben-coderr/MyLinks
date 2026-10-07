import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[480px] flex flex-col items-center space-y-4">
        {/* Avatar skeleton */}
        <Skeleton className="w-28 h-28 rounded-full" />
        {/* Name and title skeleton */}
        <Skeleton className="w-48 h-6 rounded-lg mt-2" />
        <Skeleton className="w-64 h-4 rounded-lg" />
        {/* Socials skeleton */}
        <div className="flex gap-3 my-4">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="w-10 h-10 rounded-full" />
        </div>
        {/* Links skeleton */}
        <div className="w-full space-y-3 mt-4">
          <Skeleton className="w-full h-16 rounded-2xl" />
          <Skeleton className="w-full h-16 rounded-2xl" />
          <Skeleton className="w-full h-16 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
