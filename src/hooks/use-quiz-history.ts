"use client";

import { useEffect, useCallback } from "react";
import { api } from "@/lib/api/client";
import { useAsync } from "@/hooks/use-async";
import type { AttemptResponse, PaginatedResponse } from "@/types/api";

export function useQuizHistory(category?: string, page: number = 1) {
  const { data, loading, run } = useAsync<PaginatedResponse<AttemptResponse>>();

  const fetch = useCallback(
    (p: number, cat?: string) => {
      run(() => api.quiz.history(p, cat));
    },
    [run]
  );

  useEffect(() => {
    fetch(page, category);
  }, [page, category, fetch]);

  return {
    attempts: data?.data ?? [],
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 1,
    page,
    loading,
  };
}
