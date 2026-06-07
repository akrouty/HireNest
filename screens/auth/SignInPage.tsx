"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Eye, EyeOff, Linkedin } from "lucide-react";

import { AuthCard } from "@/components/auth/AuthCard";
import { AuthInput } from "@/components/auth/AuthInput";
import { SocialLoginButton } from "@/components/auth/SocialLoginButton";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (options: {
            callback: (response: { credential?: string }) => void;
            client_id: string;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              logo_alignment?: "left" | "center";
              shape?: "rectangular" | "pill" | "circle" | "square";
              size?: "large" | "medium" | "small";
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              theme?: "outline" | "filled_blue" | "filled_black";
              type?: "standard" | "icon";
              width?: number;
            },
          ) => void;
        };
      };
    };
  }
}

export default function SignInPage() {
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const handleGoogleCredential = useCallback(
    async (response: { credential?: string }) => {
      setError(null);
      if (!response.credential) {
        setError("Google did not return a sign-in token.");
        return;
      }

      setLoading(true);
      try {
        await signInWithGoogle({
          credential: response.credential,
          rememberMe,
        });
        window.location.assign("/dashboard");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Google sign in failed.");
      } finally {
        setLoading(false);
      }
    },
    [rememberMe, signInWithGoogle],
  );

  useEffect(() => {
    if (!googleClientId || googleClientId === "your_google_client_id") return;
    const clientId = googleClientId;

    function renderGoogleButton() {
      if (!window.google?.accounts?.id || !googleButtonRef.current) return;
      googleButtonRef.current.innerHTML = "";
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredential,
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        logo_alignment: "left",
        shape: "rectangular",
        size: "large",
        text: "continue_with",
        theme: "outline",
        type: "standard",
        width: googleButtonRef.current.offsetWidth || 360,
      });
    }

    const existing = document.getElementById("google-identity-services");
    if (existing) {
      renderGoogleButton();
      return;
    }

    const script = document.createElement("script");
    script.id = "google-identity-services";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = renderGoogleButton;
    script.onerror = () => {
      setError("Google sign in script failed to load.");
    };
    document.head.appendChild(script);
  }, [googleClientId, handleGoogleCredential]);

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
      await signIn({ email: email.trim(), password, rememberMe });
      window.location.assign("/dashboard");
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
          <SocialLoginButton
            icon={Linkedin}
            label="Continue with LinkedIn"
            disabled
          />
          {googleClientId && googleClientId !== "your_google_client_id" ? (
            <div className="min-h-10 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div ref={googleButtonRef} className="flex min-h-10 w-full items-center" />
            </div>
          ) : (
            <p className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
              Google login needs NEXT_PUBLIC_GOOGLE_CLIENT_ID in Frontend/.env.local.
            </p>
          )}
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
