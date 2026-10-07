import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, helperText, id, ...props }, ref) => {
    const inputId = id || React.useId();

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-neutral-300"
          >
            {label}
          </label>
        )}
        <input
          type={type}
          id={inputId}
          ref={ref}
          className={cn(
            "w-full rounded-xl bg-[#141414] border px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 transition-colors duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]",
            error
              ? "border-red-500/60 focus-visible:ring-red-400"
              : "border-white/10 hover:border-white/20 focus-visible:border-transparent",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-neutral-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
