"use client";

import { useEffect, useCallback } from "react";
import { api } from "@/lib/api/client";
import { useAsync } from "@/hooks/use-async";
import type { CategoryModel } from "@/types/models";

export function useCategories() {
  const { data: categories, loading, error, run } = useAsync<CategoryModel[]>();

  const fetch = useCallback(() => {
    run(() => api.categories.list());
  }, [run]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { categories: categories ?? [], loading, error, refetch: fetch };
}
