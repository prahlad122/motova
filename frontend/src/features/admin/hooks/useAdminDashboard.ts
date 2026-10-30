
"use client";

import { useCallback, useEffect, useState } from "react";
import { getAuthSession } from "@/features/auth/auth.utils";
import { getAdminDashboardStats } from "../admin.api";
import type { AdminDashboardStats } from "../admin.types";

export function useAdminDashboard() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const session = getAuthSession("ADMIN");

      if (!session?.token) {
        throw new Error("Your session was not found. Please log in again.");
      }

      const data = await getAdminDashboardStats(session.token);
      setStats(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load dashboard statistics.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  return {
    stats,
    isLoading,
    error,
    loadDashboard,
  };
}
