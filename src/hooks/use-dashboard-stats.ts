"use client";

import { useEffect, useCallback } from "react";
import { api } from "@/lib/api/client";
import { useAsync } from "@/hooks/use-async";
import type { DashboardStats } from "@/types/api";

export function useDashboardStats() {
  const { data: stats, loading, run } = useAsync<DashboardStats>();

  const fetch = useCallback(() => {
    run(() => api.quiz.stats());
  }, [run]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { stats, loading, refetch: fetch };
}
