"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [genericError, setGenericError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setGenericError(null);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (!result || result.error) {
        setGenericError("Invalid email or password");
        toast.error("Invalid email or password");
        setIsLoading(false);
        return;
      }

      toast.success("Signed in successfully!");
      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      console.error("Sign in error:", err);
      setGenericError("An error occurred during sign in. Please try again.");
      toast.error("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 rounded-3xl bg-[#141414] border border-white/10 shadow-2xl">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Welcome back
        </h1>
        <p className="text-sm text-neutral-400 mt-1.5">
          Sign in to manage your profile, links, and analytics
        </p>
      </div>

      {genericError && (
        <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
          {genericError}
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

        {/* Password */}
        <div>
          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
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

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full font-semibold"
            isLoading={isLoading}
          >
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </form>

      {/* Demo Credentials Helper Pill */}
      <div className="mt-6 p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-xs text-neutral-400">
        <p className="font-semibold text-neutral-300 mb-1">Demo Accounts:</p>
        <p>
          <span className="text-sky-400">Admin:</span> admin@mylinks.com /{" "}
          <span className="font-mono text-neutral-300">AdminPassword123!</span>
        </p>
        <p className="mt-0.5">
          <span className="text-emerald-400">User:</span> ahmed@mylinks.com /{" "}
          <span className="font-mono text-neutral-300">Password123!</span>
        </p>
      </div>

      <div className="mt-6 text-center text-sm text-neutral-400">
        <span>Don&apos;t have an account yet? </span>
        <Link
          href="/register"
          className="text-white hover:text-sky-300 font-semibold underline underline-offset-4 transition-colors"
        >
          Claim your username
        </Link>
      </div>
    </div>
  );
}
