"use client";

import { WifiOff } from "lucide-react";

import { useOfflineStatus } from "@/hooks/useOfflineStatus";

export function OfflineBanner() {
  const { isOffline, reason } = useOfflineStatus();

  if (!isOffline) return null;

  return (
    <div className="sticky top-0 z-[100] border-b border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center gap-3 text-sm font-medium">
        <WifiOff className="h-4 w-4 shrink-0" />
        <span>
          {reason === "browser"
            ? "You are offline. Cached dashboard stats are available only."
            : "Live service is unavailable. Cached dashboard stats are available only."}
        </span>
      </div>
    </div>
  );
}
