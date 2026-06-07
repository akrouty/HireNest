"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Chrome,
  Eye,
  EyeOff,
  Linkedin,
  Lock,
  Mail,
  User,
} from "lucide-react";

import { AuthCard } from "@/components/auth/AuthCard";
import { AuthInput } from "@/components/auth/AuthInput";
import { SocialLoginButton } from "@/components/auth/SocialLoginButton";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function SignUpPage() {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError("Full name is required.");
      return;
    }

    if (!email.trim()) {
      setError("Work email is required.");
      return;
    }

    if (!password) {
      setError("Password is required.");
      return;
    }

    if (!acceptedTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setLoading(true);
    try {
      await signUp({
        email: email.trim(),
        password,
        role: "candidate",
        fullName: fullName.trim(),
      });
      window.location.assign("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Account creation failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      topRight={
        <span className="text-slate-600">
          Already have an account?{" "}
          <Link href="/signin" className="font-semibold text-sky-700 hover:text-sky-800">
            Sign In
          </Link>
        </span>
      }
      footer={
        <div className="flex justify-center gap-7 text-xs text-slate-500">
          <Link href="#" className="hover:text-slate-800">
            Help Center
          </Link>
          <Link href="#" className="hover:text-slate-800">
            Contact Sales
          </Link>
          <Link href="#" className="hover:text-slate-800">
            Security
          </Link>
        </div>
      }
    >
      <AuthCard
        title="Join HireNest AI"
        description="Precision recruitment at enterprise scale."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <SocialLoginButton icon={Linkedin} label="LinkedIn" />
          <SocialLoginButton
            icon={Chrome}
            label="Google"
            iconClassName="text-red-500"
          />
        </div>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-[10px] font-bold tracking-[0.2em] text-slate-400">
            OR EMAIL
          </span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <AuthInput
            id="fullName"
            label="Full Name"
            type="text"
            placeholder="Jane Doe"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            autoComplete="name"
            leftElement={<User className="h-4 w-4" />}
          />

          <AuthInput
            id="email"
            label="Work Email"
            type="email"
            placeholder="jane@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            leftElement={<Mail className="h-4 w-4" />}
          />

          <div className="relative">
            <AuthInput
              id="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="********"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              className="pr-12"
              leftElement={<Lock className="h-4 w-4" />}
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

          <p className="text-xs text-slate-500">
            At least 8 characters with one special symbol.
          </p>

          <label className="flex cursor-pointer items-start gap-3 text-xs leading-5 text-slate-600">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(event) => setAcceptedTerms(event.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            <span>
              I agree to the{" "}
              <Link href="#" className="font-medium text-sky-700 hover:text-sky-800">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="font-medium text-sky-700 hover:text-sky-800">
                Privacy Policy
              </Link>
              .
            </span>
          </label>

          {error && (
            <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="h-11 w-full rounded-xl bg-[#020817] text-xs font-semibold text-white shadow-lg shadow-slate-900/20 hover:bg-[#07111f]"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
