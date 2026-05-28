"use client";

import { useReducer, useEffect } from "react";
import { api } from "@/lib/api/client";
import type { AttemptDetailResponse } from "@/types/api";

type State = {
  attempt: AttemptDetailResponse | null;
  loading: boolean;
  error: string | null;
};

type Action =
  | { type: "LOADING" }
  | { type: "SUCCESS"; data: AttemptDetailResponse }
  | { type: "ERROR"; error: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "LOADING":
      return { ...state, loading: true, error: null };
    case "SUCCESS":
      return { attempt: action.data, loading: false, error: null };
    case "ERROR":
      return { ...state, loading: false, error: action.error };
  }
}

export function useAttemptDetail(id: string) {
  const [state, dispatch] = useReducer(reducer, {
    attempt: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    dispatch({ type: "LOADING" });
    api.quiz
      .attemptDetails(id)
      .then((data) => dispatch({ type: "SUCCESS", data }))
      .catch((err) =>
        dispatch({
          type: "ERROR",
          error: err instanceof Error ? err.message : "Failed to load attempt",
        })
      );
  }, [id]);

  return state;
}
