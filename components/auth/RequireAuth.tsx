"use client";

import { useEffect } from "react";

import { useAuth } from "@/hooks/useAuth";

type RequireAuthProps = {
  children: React.ReactNode;
  roles?: string[];
};

function getPathname() {
  return typeof window === "undefined" ? "/dashboard" : window.location.pathname;
}

function replaceLocation(path: string) {
  if (typeof window !== "undefined") {
    window.location.replace(path);
  }
}

export function RequireAuth({ children, roles }: RequireAuthProps) {
  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      replaceLocation(`/signin?next=${encodeURIComponent(getPathname())}`);
      return;
    }
    if (roles?.length && user?.role && !roles.includes(user.role)) {
      replaceLocation("/dashboard");
    }
  }, [isAuthenticated, loading, roles, user?.role]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm font-semibold text-slate-600">
        Checking session...
      </div>
    );
  }

  if (!isAuthenticated) return null;
  if (roles?.length && user?.role && !roles.includes(user.role)) return null;

  return <>{children}</>;
}
