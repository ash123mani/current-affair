"use client";

import { useReducer, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { fetchArticles } from "@/lib/actions/quiz-builder";
import { quizBuilderReducer, INITIAL_STATE } from "@/lib/state/quiz-builder.reducer";

export function useQuizBuilder() {
  const router = useRouter();
  const [state, dispatch] = useReducer(quizBuilderReducer, INITIAL_STATE);

  const handleGenerateQuiz = useCallback(
    (slug: string) => {
      const tab = state.tabs[slug];
      if (!tab || tab.selectedIndices.length === 0) return;

      const articles = tab.selectedIndices.map((idx) => ({
        title: tab.articles[idx].title,
        description: tab.articles[idx].description,
        content: tab.articles[idx].content,
        source: tab.articles[idx].source,
        url: tab.articles[idx].url,
      }));

      const dateStr = format(state.date, "yyyy-MM-dd");

      const pending = { articles, category: slug, date: dateStr };
      try {
        sessionStorage.setItem("pendingQuizArticles", JSON.stringify(pending));
      } catch { /* storage full */ }

      router.push(`/quiz/generated?category=${encodeURIComponent(slug)}&date=${dateStr}`);
    },
    [state.date, state.tabs, router]
  );

  const actions = useMemo(
    () => ({
      setDate: (date: Date) => dispatch({ type: "SET_DATE", date }),
      fetchArticles: () => fetchArticles(state.date, dispatch),
      setActiveTab: (slug: string) => dispatch({ type: "SET_ACTIVE_TAB", slug }),
      toggleArticle: (slug: string, idx: number) => dispatch({ type: "TOGGLE_ARTICLE", slug, idx }),
      selectAll: (slug: string) => dispatch({ type: "SELECT_ALL", slug }),
      clearAll: (slug: string) => dispatch({ type: "CLEAR_ALL", slug }),
      generateQuiz: handleGenerateQuiz,
      dismissError: () => dispatch({ type: "DISMISS_ERROR" }),
      goBackToDate: () => dispatch({ type: "GO_BACK_TO_DATE" }),
    }),
    [state.date, handleGenerateQuiz]
  );

  return { state, actions };
}
