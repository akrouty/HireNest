"use client";

import { useEffect, useState } from "react";
import { getSafeUser, type AuthUser } from "@/lib/auth-store";
import * as authService from "@/services/auth.service";

type AuthAction = "signin" | "signup";

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser>({
    username: "sana",
    fullName: "Sana Layouni",
    email: "sana@hirenest.com",
    role: "candidate",
    initials: "SL",
  });

  useEffect(() => {
    setUser(getSafeUser());
  }, []);

  async function runAuthAction(
    action: AuthAction,
    payload: {
      username: string;
      password: string;
      fullName?: string;
      role?: string;
    },
  ) {
    setError(null);
    setLoading(true);

    try {
      if (action === "signin") {
        await authService.signIn(payload);
      } else {
        await authService.signUp(payload);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Authentication failed";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    error,
    user,
    signIn: runAuthAction.bind(null, "signin"),
    signUp: runAuthAction.bind(null, "signup"),
  };
}
