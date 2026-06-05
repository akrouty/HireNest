"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Chrome, Eye, EyeOff, Linkedin } from "lucide-react";

import { AuthCard } from "@/components/auth/AuthCard";
import { AuthInput } from "@/components/auth/AuthInput";
import { SocialLoginButton } from "@/components/auth/SocialLoginButton";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { signIn } from "@/services/auth.service";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Work email is required.");
      return;
    }

    if (!password) {
      setError("Password is required.");
      return;
    }

    setLoading(true);
    try {
      await signIn({ username: email.trim(), password, rememberMe });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Welcome back to HireNest"
        description="Continue your recruitment journey."
      >
        <div className="grid gap-3">
          <SocialLoginButton icon={Linkedin} label="Continue with LinkedIn" />
          <SocialLoginButton icon={Chrome} label="Continue with Google" />
        </div>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs font-bold tracking-[0.2em] text-slate-400">
            OR EMAIL
          </span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <AuthInput
            id="email"
            label="Work Email"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
          />

          <div className="relative">
            <AuthInput
              id="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              className="pr-12"
              rightElement={
                <Link
                  href="#"
                  className="text-xs font-semibold text-sky-700 hover:text-sky-800"
                >
                  Forgot password?
                </Link>
              }
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute bottom-3 right-3 text-slate-400 transition hover:text-slate-700"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            Keep me signed in
          </label>

          {error && (
            <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="h-11 w-full rounded-xl bg-[#020817] font-semibold text-white hover:bg-[#07111f]"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-sky-700 hover:text-sky-800">
            Sign Up
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}
