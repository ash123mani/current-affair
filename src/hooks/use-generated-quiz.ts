"use client";

import { useReducer, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import { notifySuccess, notifyError } from "@/lib/notify";
import type { QuestionResponse, QuizResult } from "@/types/api";

interface QuestionData {
  id?: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation?: string | null;
}

interface StoredQuiz {
  questions: QuestionData[];
  category: string;
  date: string;
}

type State = {
  questions: QuestionData[];
  questionIds: Record<number, string>;
  selected: Record<number, number>;
  submitted: boolean;
  score: number;
  answerResults: boolean[];
  loading: boolean;
  submitting: boolean;
  error: string | null;
};

type Action =
  | { type: "QUESTIONS_LOADING" }
  | { type: "QUESTIONS_SUCCESS"; questions: QuestionData[] }
  | { type: "QUESTIONS_ERROR"; error: string }
  | { type: "SELECT_ANSWER"; idx: number; optionIdx: number }
  | { type: "SUBMIT_LOADING" }
  | { type: "SUBMIT_SUCCESS"; score: number; total: number; answerResults: boolean[] }
  | { type: "SUBMIT_ERROR"; error: string }
  | { type: "RETAKE" };

const INITIAL: State = {
  questions: [],
  questionIds: {},
  selected: {},
  submitted: false,
  score: 0,
  answerResults: [],
  loading: true,
  submitting: false,
  error: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "QUESTIONS_LOADING":
      return { ...state, loading: true, error: null };

    case "QUESTIONS_SUCCESS": {
      const ids: Record<number, string> = {};
      action.questions.forEach((q, i) => {
        if (q.id) ids[i] = q.id;
      });
      return { ...state, questions: action.questions, questionIds: ids, loading: false };
    }

    case "QUESTIONS_ERROR":
      return { ...state, loading: false, error: action.error };

    case "SELECT_ANSWER":
      return { ...state, selected: { ...state.selected, [action.idx]: action.optionIdx } };

    case "SUBMIT_LOADING":
      return { ...state, submitting: true, error: null };

    case "SUBMIT_SUCCESS":
      return {
        ...state, submitting: false, submitted: true,
        score: action.score, answerResults: action.answerResults,
      };

    case "SUBMIT_ERROR":
      return { ...state, submitting: false, error: action.error };

    case "RETAKE":
      return { ...state, selected: {}, submitted: false, score: 0, answerResults: [], error: null };

    default:
      return state;
  }
}

function loadFromSession(): StoredQuiz | null {
  try {
    const stored = sessionStorage.getItem("generatedQuiz");
    if (!stored) return null;
    const quiz: StoredQuiz = JSON.parse(stored);
    if (!quiz.questions?.length) return null;
    return quiz;
  } catch {
    return null;
  }
}

export function useGeneratedQuiz(category: string | null, date: string | null) {
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, INITIAL);

  // Track if user has started answering to avoid swapping questions mid-quiz
  const hasSelected = useMemo(() => Object.keys(state.selected).length > 0, [state.selected]);

  useEffect(() => {
    const stored = loadFromSession();

    if (stored) {
      dispatch({ type: "QUESTIONS_SUCCESS", questions: stored.questions });
      return;
    }

    // No session data — try API
    if (category && date) {
      api.questions.list(category, date)
        .then((data) => {
          if (data?.length > 0) {
            dispatch({ type: "QUESTIONS_SUCCESS", questions: data });
          } else {
            dispatch({ type: "QUESTIONS_ERROR", error: "No questions found" });
          }
        })
        .catch((e) => {
          dispatch({ type: "QUESTIONS_ERROR", error: e instanceof Error ? e.message : "Failed to load" });
        });
    } else {
      dispatch({ type: "QUESTIONS_ERROR", error: "Missing category or date" });
    }
  }, []);

  // Background: try API to get real question IDs (only if user hasn't started answering)
  useEffect(() => {
    if (!category || !date) return;
    if (state.questions.length === 0) return;
    if (hasSelected) return;
    if (state.questionIds && Object.keys(state.questionIds).length > 0) return;

    api.questions.list(category, date)
      .then((data) => {
        if (data?.length === state.questions.length) {
          dispatch({ type: "QUESTIONS_SUCCESS", questions: data });
        }
      })
      .catch(() => {});
  }, [category, date, state.questions.length, hasSelected]);

  const allAnswered = state.questions.every((_, i) => state.selected[i] !== undefined);

  const handleSubmit = useCallback(async () => {
    const useApi = category && date && Object.keys(state.questionIds).length > 0;

    if (useApi) {
      dispatch({ type: "SUBMIT_LOADING" });
      try {
        const answers = Object.entries(state.selected).map(([idx, selectedIndex]) => ({
          questionId: state.questionIds[Number(idx)],
          selectedIndex,
        }));
        const result: QuizResult = await api.quiz.attempt(category!, date!, answers);
        dispatch({
          type: "SUBMIT_SUCCESS",
          score: result.answers.filter((a) => a.isCorrect).length,
          total: result.total,
          answerResults: result.answers.map((a) => a.isCorrect),
        });
        notifySuccess("Quiz completed!", `${result.answers.filter((a) => a.isCorrect).length}/${result.total} correct`);
        sessionStorage.removeItem("generatedQuiz");
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to submit";
        dispatch({ type: "SUBMIT_ERROR", error: msg });
        notifyError("Submission failed", msg);
      }
    } else {
      let correct = 0;
      const results: boolean[] = [];
      state.questions.forEach((qq, i) => {
        const isCorrect = state.selected[i] === qq.correctIndex;
        if (isCorrect) correct++;
        results.push(isCorrect);
      });
      dispatch({ type: "SUBMIT_SUCCESS", score: correct, total: state.questions.length, answerResults: results });
      sessionStorage.removeItem("generatedQuiz");
      notifySuccess("Quiz completed!", `${correct}/${state.questions.length} correct`);
    }
  }, [category, date, state.questionIds, state.selected, state.questions]);

  const actions = useMemo(
    () => ({
      selectAnswer: (idx: number, optionIdx: number) => dispatch({ type: "SELECT_ANSWER", idx, optionIdx }),
      submit: handleSubmit,
      retake: () => dispatch({ type: "RETAKE" }),
    }),
    [handleSubmit]
  );

  return { state, actions, allAnswered };
}
