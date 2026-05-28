"use client";

import { useReducer, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { fetchArticles, generateQuiz, saveAndStartQuiz } from "@/lib/actions/quiz-builder";
import { quizBuilderReducer, INITIAL_STATE } from "@/lib/state/quiz-builder.reducer";

export function useQuizBuilder() {
  const router = useRouter();
  const [state, dispatch] = useReducer(quizBuilderReducer, INITIAL_STATE);
  const cancelRefs = useRef<Record<string, (() => void) | null>>({});

  const handleGenerateQuiz = useCallback(
    (slug: string) => {
      const tab = state.tabs[slug];
      if (!tab || tab.selectedIndices.length === 0) return;

      const selected = tab.selectedIndices.map((idx) => ({
        title: tab.articles[idx].title,
        description: tab.articles[idx].description,
        content: tab.articles[idx].content,
        source: tab.articles[idx].source,
        url: tab.articles[idx].url,
      }));

      const cancel = generateQuiz(state.date, selected, slug, dispatch);
      cancelRefs.current[slug] = cancel;
    },
    [state.date, state.tabs]
  );

  const cancelGeneration = useCallback((slug: string) => {
    cancelRefs.current[slug]?.();
    cancelRefs.current[slug] = null;
    dispatch({ type: "GENERATE_CANCEL", slug });
  }, []);

  const handleSaveAndStart = useCallback(
    async (slug: string) => {
      const tab = state.tabs[slug];
      if (!tab || tab.saving) return;
      await saveAndStartQuiz(state.date, slug, tab.questions, dispatch, (s, d) => {
        router.push(`/quiz/generated?category=${s}&date=${d}`);
      });
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
      cancelGeneration,
      saveAndStartQuiz: handleSaveAndStart,
      resetQuestions: (slug: string) => dispatch({ type: "RESET_QUESTIONS", slug }),
      dismissError: () => dispatch({ type: "DISMISS_ERROR" }),
      goBackToDate: () => dispatch({ type: "GO_BACK_TO_DATE" }),
    }),
    [state.date, handleGenerateQuiz, cancelGeneration, handleSaveAndStart]
  );

  return { state, actions };
}
