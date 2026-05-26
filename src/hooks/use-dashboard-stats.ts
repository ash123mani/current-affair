import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api/client";
import type { DashboardStats } from "@/types/api";

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.quiz.stats();
      setStats(data);
    } catch {
      // redirect handled at page level
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { stats, loading, refetch: fetch };
}
