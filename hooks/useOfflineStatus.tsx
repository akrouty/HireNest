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

import { apiHealth } from "@/services/api";

type OfflineContextValue = {
  isOffline: boolean;
  reason: "browser" | "backend" | null;
  checkConnection: () => Promise<boolean>;
  blockIfOffline: (actionName?: string) => boolean;
};

const OfflineContext = createContext<OfflineContextValue | null>(null);

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [isOffline, setIsOffline] = useState(false);
  const [reason, setReason] = useState<OfflineContextValue["reason"]>(null);
  const [isMounted, setIsMounted] = useState(false);

  const setOfflineState = useCallback(
    (nextOffline: boolean, nextReason: OfflineContextValue["reason"]) => {
      setIsOffline((current) => {
        if (!current && nextOffline) {
          toast.error("Connection to server lost", {
            description: "You are offline or the backend is unavailable.",
          });
        }
        if (current && !nextOffline) {
          toast.success("Connection restored", {
            description: "Live backend features are available again.",
          });
        }
        return nextOffline;
      });
      setReason(nextReason);
    },
    [],
  );

  const checkConnection = useCallback(async () => {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setOfflineState(true, "browser");
      return false;
    }

    try {
      await apiHealth();
      setOfflineState(false, null);
      return true;
    } catch {
      setOfflineState(true, "backend");
      return false;
    }
  }, [setOfflineState]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    void checkConnection();
    const timer = window.setInterval(() => void checkConnection(), 30000);

    function onBrowserOffline() {
      setOfflineState(true, "browser");
    }

    function onBrowserOnline() {
      void checkConnection();
    }

    function onApiOffline() {
      setOfflineState(true, "backend");
    }

    function onApiOnline() {
      if (typeof navigator === "undefined" || navigator.onLine) {
        setOfflineState(false, null);
      }
    }

    window.addEventListener("offline", onBrowserOffline);
    window.addEventListener("online", onBrowserOnline);
    window.addEventListener("api:offline", onApiOffline);
    window.addEventListener("api:online", onApiOnline);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("offline", onBrowserOffline);
      window.removeEventListener("online", onBrowserOnline);
      window.removeEventListener("api:offline", onApiOffline);
      window.removeEventListener("api:online", onApiOnline);
    };
  }, [isMounted, checkConnection, setOfflineState]);

  const value = useMemo<OfflineContextValue>(
    () => ({
      isOffline,
      reason,
      checkConnection,
      blockIfOffline(actionName = "This action") {
        if (!isOffline) return false;
        toast.warning("Action unavailable offline", {
          description: `${actionName} requires a live backend connection.`,
        });
        return true;
      },
    }),
    [checkConnection, isOffline, reason],
  );

  return (
    <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>
  );
}

export function useOfflineStatus() {
  const ctx = useContext(OfflineContext);
  if (!ctx) {
    throw new Error("useOfflineStatus must be used within OfflineProvider");
  }
  return ctx;
}
