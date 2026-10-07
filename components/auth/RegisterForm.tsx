"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import {
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { registerUser } from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialUsername = searchParams.get("username") || "";

  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  // Username live availability state
  const [usernameStatus, setUsernameStatus] = React.useState<{
    state: "idle" | "checking" | "available" | "unavailable";
    message: string;
  }>({
    state: "idle",
    message: "",
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      username: initialUsername.toLowerCase().trim(),
    },
  });

  const watchedUsername = watch("username");

  // Debounced live username check
  React.useEffect(() => {
    if (!watchedUsername || watchedUsername.length < 3) {
      setUsernameStatus({ state: "idle", message: "" });
      return;
    }

    setUsernameStatus({ state: "checking", message: "Checking availability..." });

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/username/check?username=${encodeURIComponent(watchedUsername)}`
        );
        const data = await res.json();
        if (data.available) {
          setUsernameStatus({
            state: "available",
            message: "Username is available!",
          });
        } else {
          setUsernameStatus({
            state: "unavailable",
            message: data.message || "Username is not available",
          });
        }
      } catch {
        setUsernameStatus({
          state: "idle",
          message: "",
        });
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [watchedUsername]);

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const res = await registerUser(data);

      if (res.error) {
        setServerError(res.error);
        toast.error(res.error);
        setIsLoading(false);
        return;
      }

      toast.success("Account created successfully! Signing you in...");

      // Automatically sign in upon registration
      const signinRes = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (!signinRes || signinRes.error) {
        // Fallback to login page if immediate auto-sign in fails
        router.push("/login?registered=true");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Register form submission error:", err);
      setServerError("An error occurred during registration. Please try again.");
      toast.error("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 rounded-3xl bg-[#141414] border border-white/10 shadow-2xl">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Create your account
        </h1>
        <p className="text-sm text-neutral-400 mt-1.5">
          Claim your unique bio link and build your online presence
        </p>
      </div>

      {serverError && (
        <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div>
          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />
        </div>

        {/* Username with live feedback */}
        <div>
          <Input
            label="Username (your public link)"
            type="text"
            placeholder="e.g. alex"
            autoComplete="username"
            error={errors.username?.message}
            {...register("username")}
          />
          {/* Live availability indicator */}
          <div className="mt-1.5 min-h-[20px]">
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
        </div>

        {/* Password */}
        <div>
          <div className="relative">
            <Input
              label="Password (min 8 characters)"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="new-password"
              error={errors.password?.message}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-[34px] text-neutral-400 hover:text-white transition-colors p-1"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full font-semibold"
            isLoading={isLoading}
            disabled={usernameStatus.state === "unavailable"}
          >
            <span>Create Account</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </form>

      <div className="mt-6 text-center text-sm text-neutral-400">
        <span>Already have an account? </span>
        <Link
          href="/login"
          className="text-white hover:text-sky-300 font-semibold underline underline-offset-4 transition-colors"
        >
          Sign in here
        </Link>
      </div>
    </div>
  );
}
