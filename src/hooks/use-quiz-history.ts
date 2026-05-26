import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/lib/api/client";
import type { AttemptResponse } from "@/types/api";

export function useQuizHistory(category?: string) {
  const [attempts, setAttempts] = useState<AttemptResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const categoryRef = useRef(category);

  const fetch = useCallback(async (p: number, cat?: string) => {
    setLoading(true);
    try {
      const data = await api.quiz.history(p, cat);
      setAttempts(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    categoryRef.current = category;
  }, [category]);

  useEffect(() => {
    fetch(page, category);
  }, [page, category, fetch]);

  return { attempts, total, page, totalPages, loading, setPage };
}
