"use client";

import * as React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8 text-red-400" />
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
        Something went wrong
      </h2>

      <p className="text-neutral-400 text-sm mt-2 max-w-md">
        An unexpected error occurred while loading this page. Please try again.
      </p>

      <div className="mt-6 flex items-center gap-3">
        <Button variant="primary" onClick={() => reset()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    </div>
  );
}
