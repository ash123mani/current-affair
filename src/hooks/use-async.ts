"use client";

import { useReducer, useCallback } from "react";

type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

type AsyncAction<T> =
  | { type: "loading" }
  | { type: "success"; data: T }
  | { type: "error"; error: string }
  | { type: "reset" };

function asyncReducer<T>(state: AsyncState<T>, action: AsyncAction<T>): AsyncState<T> {
  switch (action.type) {
    case "loading":
      return { ...state, loading: true, error: null };
    case "success":
      return { data: action.data, loading: false, error: null };
    case "error":
      return { ...state, loading: false, error: action.error };
    case "reset":
      return { data: null, loading: false, error: null };
  }
}

export function useAsync<T>() {
  const [state, dispatch] = useReducer(asyncReducer<T>, {
    data: null,
    loading: false,
    error: null,
  });

  const run = useCallback(async (fn: () => Promise<T>) => {
    dispatch({ type: "loading" });
    try {
      const data = await fn();
      dispatch({ type: "success", data });
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      dispatch({ type: "error", error: msg });
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "reset" });
  }, []);

  return { ...state, run, reset };
}
