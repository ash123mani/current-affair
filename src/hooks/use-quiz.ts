"use client";

import { useReducer, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { loadQuestions, submitQuiz } from "@/lib/actions/quiz";
import type { QuizAction } from "@/lib/actions/quiz";
import type { QuestionResponse } from "@/types/api";

type State = {
  questions: QuestionResponse[];
  loading: boolean;
  submitting: boolean;
  error: string | null;
  unauthorized: boolean;
  result: {
    score: number;
    total: number;
    answers: { questionId: string; selectedIndex: number; isCorrect: boolean }[];
  } | null;
};

const INITIAL: State = {
  questions: [],
  loading: true,
  submitting: false,
  error: null,
  unauthorized: false,
  result: null,
};

function reducer(state: State, action: QuizAction): State {
  switch (action.type) {
    case "QUESTIONS_LOADING":
      return { ...state, loading: true, error: null };

    case "QUESTIONS_SUCCESS":
      return { ...state, questions: action.questions, loading: false };

    case "QUESTIONS_ERROR":
      return { ...state, loading: false, error: action.error };

    case "QUESTIONS_RESET":
      return { ...INITIAL, loading: false };

    case "UNAUTHORIZED":
      return { ...state, loading: false, unauthorized: true };

    case "SUBMIT_LOADING":
      return { ...state, submitting: true, error: null };

    case "SUBMIT_SUCCESS":
      return {
        ...state,
        submitting: false,
        result: { score: action.result.score, total: action.result.total, answers: action.result.answers },
      };

    case "SUBMIT_ERROR":
      return { ...state, submitting: false, error: action.error };

    default:
      return state;
  }
}

export function useQuiz(category: string, date?: string) {
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, INITIAL);

  useEffect(() => {
    if (category) {
      loadQuestions(category, date, dispatch);
    }
  }, [category, date]);

  useEffect(() => {
    if (state.unauthorized) {
      router.push(`/auth/login?callbackUrl=/quiz/${category}`);
    }
  }, [state.unauthorized, category, router]);

  const submit = useCallback(
    (date: string, answers: { questionId: string; selectedIndex: number }[], retake?: boolean) => {
      submitQuiz(category, date, answers, dispatch, retake);
    },
    [category]
  );

  const retake = useCallback(() => {
    dispatch({ type: "QUESTIONS_RESET" });
    loadQuestions(category, date, dispatch);
  }, [category, date]);

  const actions = useMemo(
    () => ({ submit, retake }),
    [submit, retake]
  );

  return { ...state, actions };
}
