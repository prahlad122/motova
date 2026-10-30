"use client";

import { useCallback, useEffect, useState } from "react";
import { getAuthSession } from "@/features/auth/auth.utils";
import { getVendorDashboard } from "../vendor.api";
import type { VendorDashboardData } from "../vendor.types";

type DashboardErrorCode =
  | "VENDOR_PROFILE_NOT_FOUND"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "UNKNOWN";

interface DashboardError {
  code: DashboardErrorCode;
  message: string;
}

export function useVendorDashboard() {
  const [dashboard, setDashboard] = useState<VendorDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<DashboardError | null>(null);
  const [rangeDays, setRangeDays] = useState(30);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const session = getAuthSession("VENDOR");

      if (!session?.token) {
        setError({
          code: "UNAUTHORIZED",
          message: "Your session was not found. Please log in again.",
        });
        return;
      }

      const data = await getVendorDashboard(session.token, rangeDays);

      setDashboard(data);
    } catch (err) {
      const apiError = err as Error & { code?: string };

      if (apiError.code === "VENDOR_PROFILE_NOT_FOUND") {
        setError({
          code: "VENDOR_PROFILE_NOT_FOUND",
          message: "Please complete your vendor profile.",
        });
      } else {
        setError({
          code: "UNKNOWN",
          message: err instanceof Error ? err.message : "Something went wrong.",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [rangeDays]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  return {
    dashboard,
    loading,
    error,
    rangeDays,
    setRangeDays,
    loadDashboard,
  };
}
