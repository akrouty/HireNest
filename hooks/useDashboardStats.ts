"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  fetchDashboardStats,
  getCachedDashboardStats,
  type DashboardStats,
} from "@/services/dashboard.service";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";

export function useDashboardStats() {
  const { isOffline } = useOfflineStatus();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (mode: "initial" | "refresh" = "initial") => {
      if (mode === "initial") setLoading(true);
      else setRefreshing(true);
      setError(null);

      if (isOffline) {
        const cached = getCachedDashboardStats();
        setStats(cached);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      try {
        const live = await fetchDashboardStats();
        setStats(live);
      } catch (err) {
        const cached = getCachedDashboardStats();
        const message =
          err instanceof Error ? err.message : "Unable to load dashboard stats";
        setStats(cached);
        setError(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [isOffline],
  );

  useEffect(() => {
    void load("initial");
  }, [load]);

  return useMemo(
    () => ({
      stats,
      loading,
      refreshing,
      error,
      isOfflineData: stats?.source === "offline-cache" || isOffline,
      refresh: () => load("refresh"),
    }),
    [error, isOffline, load, loading, refreshing, stats],
  );
}
