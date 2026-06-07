"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";

import { getUserFromToken, type AuthUser } from "@/lib/auth-store";
import * as authService from "@/services/auth.service";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  refreshUser: () => Promise<AuthUser | null>;
  signIn: (payload: authService.LoginPayload) => Promise<void>;
  signInWithGoogle: (payload: authService.GoogleLoginPayload) => Promise<void>;
  signUp: (payload: authService.SignupPayload) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function currentPathname() {
  return typeof window === "undefined" ? "/" : window.location.pathname;
}

function redirectTo(path: string, replace = false) {
  if (typeof window === "undefined") return;
  if (replace) {
    window.location.replace(path);
  } else {
    window.location.assign(path);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const refreshUser = useCallback(async () => {
    const tokenUser = getUserFromToken();
    if (!tokenUser) {
      setUser(null);
      setLoading(false);
      return null;
    }

    setUser(tokenUser);
    try {
      const backendUser = await authService.getCurrentUser();
      setUser(backendUser);
      return backendUser;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to verify session";
      setError(message);
      return tokenUser;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    void refreshUser();
  }, [isMounted, refreshUser]);

  useEffect(() => {
    if (!isMounted) return;

    function onExpired() {
      setUser(null);
      toast.error("Session expired", {
        description: "Please sign in again to continue.",
      });
      const pathname = currentPathname();
      if (!pathname.startsWith("/signin") && !pathname.startsWith("/signup")) {
        redirectTo("/signin", true);
      }
    }

    window.addEventListener("auth:expired", onExpired);
    return () => window.removeEventListener("auth:expired", onExpired);
  }, [isMounted]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      error,
      isAuthenticated: Boolean(user),
      refreshUser,
      async signIn(payload) {
        setError(null);
        setLoading(true);
        try {
          const nextUser = await authService.signIn(payload);
          setUser(nextUser);
          toast.success("Signed in", { description: "Welcome back." });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Sign in failed";
          setError(message);
          toast.error("Sign in failed", { description: message });
          throw err;
        } finally {
          setLoading(false);
        }
      },
      async signInWithGoogle(payload) {
        setError(null);
        setLoading(true);
        try {
          const nextUser = await authService.signInWithGoogle(payload);
          setUser(nextUser);
          toast.success("Signed in with Google", {
            description: "Welcome to HireNest.",
          });
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Google sign in failed";
          setError(message);
          toast.error("Google sign in failed", { description: message });
          throw err;
        } finally {
          setLoading(false);
        }
      },
      async signUp(payload) {
        setError(null);
        setLoading(true);
        try {
          const nextUser = await authService.signUp(payload);
          setUser(nextUser);
          toast.success("Account created", {
            description: "Your candidate workspace is ready.",
          });
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Account creation failed";
          setError(message);
          toast.error("Account creation failed", { description: message });
          throw err;
        } finally {
          setLoading(false);
        }
      },
      async logout() {
        await authService.logout();
        setUser(null);
        toast.success("Signed out");
        redirectTo("/signin");
      },
    }),
    [error, loading, refreshUser, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
