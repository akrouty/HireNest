"use client";

import { useEffect, useState } from "react";
import { Toaster } from "sonner";

import { OfflineBanner } from "@/components/offline/OfflineBanner";
import { AuthProvider } from "@/hooks/useAuth";
import { OfflineProvider } from "@/hooks/useOfflineStatus";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <OfflineProvider>
      <AuthProvider>
        {isMounted && <OfflineBanner />}
        {children}
        <Toaster richColors position="top-right" closeButton />
      </AuthProvider>
    </OfflineProvider>
  );
}
