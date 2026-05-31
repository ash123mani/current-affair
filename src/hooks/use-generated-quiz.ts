"use client";

import { useReducer, useCallback, useEffect, useMemo, useRef } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api/client";
import { notifySuccess, notifyError } from "@/lib/notify";
import type { GeneratedQuestion } from "@/lib/services/generator/llm.service";
import type { QuizResult } from "@/types/api";

export interface QuestionData {
  id?: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation?: string | null;
  categorySlug?: string;
  source?: string | null;
  articleUrl?: string | null;
}

interface StoredQuiz {
  questions: QuestionData[];
  category: string;
  date: string;
}

interface PendingQuiz {
  articles: { title: string; description: string; content?: string; source: string; url: string; categorySlug?: string }[];
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
  streaming: boolean;
  submitting: boolean;
  error: string | null;
  restoredIndex: number | null;
};

type Action =
  | { type: "STREAM_START" }
  | { type: "STREAM_BATCH"; batch: QuestionData[]; total: number }
  | { type: "STREAM_DONE" }
  | { type: "STREAM_ERROR"; error: string }
  | { type: "QUESTIONS_SUCCESS"; questions: QuestionData[] }
  | { type: "QUESTIONS_ERROR"; error: string }
  | { type: "SELECT_ANSWER"; idx: number; optionIdx: number }
  | { type: "SUBMIT_LOADING" }
  | { type: "SUBMIT_SUCCESS"; score: number; total: number; answerResults: boolean[] }
  | { type: "SUBMIT_ERROR"; error: string }
  | { type: "RETAKE" }
  | { type: "RESTORE_SESSION"; questions: QuestionData[]; selected: Record<number, number>; currentIndex: number };

const INITIAL: State = {
  questions: [],
  questionIds: {},
  selected: {},
  submitted: false,
  score: 0,
  answerResults: [],
  loading: true,
  streaming: false,
  submitting: false,
  error: null,
  restoredIndex: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "STREAM_START":
      return { ...state, loading: true, error: null };

    case "STREAM_BATCH":
      return {
        ...state,
        loading: false,
        streaming: true,
        questions: [...state.questions, ...action.batch],
      };

    case "STREAM_DONE":
      return { ...state, streaming: false };

    case "STREAM_ERROR":
      return { ...state, loading: false, streaming: false, error: action.error };

    case "QUESTIONS_SUCCESS": {
      const ids: Record<number, string> = {};
      const mapped = action.questions.map((q, i) => {
        const qq = { ...q } as QuestionData & { category?: { slug: string } };
        if ((qq as { category?: { slug: string } }).category?.slug && !qq.categorySlug) {
          qq.categorySlug = (qq as { category?: { slug: string } }).category!.slug;
        }
        if (qq.id) ids[i] = qq.id;
        return qq;
      });
      return { ...state, questions: mapped, questionIds: ids, loading: false };
    }

    case "RESTORE_SESSION":
      return {
        ...state,
        questions: action.questions,
        selected: action.selected,
        restoredIndex: action.currentIndex,
        loading: false,
      };

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

function loadPending(): PendingQuiz | null {
  try {
    const stored = sessionStorage.getItem("pendingQuizArticles");
    if (!stored) return null;
    const pending: PendingQuiz = JSON.parse(stored);
    if (!pending.articles?.length) return null;
    return pending;
  } catch {
    return null;
  }
}

function loadStored(): StoredQuiz | null {
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

export function useGeneratedQuiz(category: string | null, date: string | null, sessionId?: string | null) {
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const { data: session } = useSession();
  const cancelRef = useRef<(() => void) | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    // If resuming from a paused session, restore state directly
    if (sessionId && session?.user) {
      api.quizSession.get(sessionId)
        .then((data) => {
          const questions = (data.questions ?? []) as QuestionData[];
          const selected = (data.selectedAnswers ?? {}) as Record<number, number>;
          dispatch({ type: "RESTORE_SESSION", questions, selected, currentIndex: data.currentIndex });
        })
        .catch(() => {
          dispatch({ type: "QUESTIONS_ERROR", error: "Failed to load paused session" });
        });
      return;
    }

    const stored = loadStored();
    if (stored) {
      dispatch({ type: "QUESTIONS_SUCCESS", questions: stored.questions });
      sessionStorage.removeItem("generatedQuiz");
      return;
    }

    const pending = loadPending();
    if (pending) {
      dispatch({ type: "STREAM_START" });

      cancelRef.current = api.quiz.generateStream(
        pending.articles,
        pending.category,
        pending.date,
        (batch) => {
          dispatch({ type: "STREAM_BATCH", batch: batch.questions as QuestionData[], total: batch.totalQuestions });
        },
        async (all) => {
          if (session?.user?.id) {
            try {
              const saved = await api.quiz.saveQuestions(pending.category, pending.date, all);
              if (saved.questions?.length > 0) {
                const textToId: Record<string, string> = {};
                for (const q of saved.questions) {
                  textToId[q.text] = q.id;
                }
                dispatch({
                  type: "QUESTIONS_SUCCESS",
                  questions: (all as QuestionData[]).map((q) => ({
                    ...q,
                    id: textToId[q.text] || undefined,
                    categorySlug: q.categorySlug || pending.category,
                  })),
                });
                dispatch({ type: "STREAM_DONE" });
                return;
              }
            } catch {
              // fall through
            }
            // Questions may already exist in DB (duplicates skipped).
            // Reload from DB across all article categories to get their IDs.
            try {
              const slugs = [...new Set(all.map((q: QuestionData) => q.categorySlug || pending.category))];
              const textToId: Record<string, string> = {};
              for (const slug of slugs) {
                const dbQ = await api.questions.list(slug, pending.date);
                for (const q of dbQ) {
                  if (q.id) textToId[q.text] = q.id;
                }
              }
              if (Object.keys(textToId).length > 0) {
                dispatch({
                  type: "QUESTIONS_SUCCESS",
                  questions: (all as QuestionData[]).map((q) => ({
                    ...q,
                    id: textToId[q.text] || undefined,
                    categorySlug: q.categorySlug || pending.category,
                  })),
                });
              }
            } catch {}
          }
          dispatch({ type: "STREAM_DONE" });
        },
        (errMsg) => {
          dispatch({ type: "STREAM_ERROR", error: errMsg });
        }
      );
      return;
    }

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

    return () => {
      try { sessionStorage.removeItem("pendingQuizArticles"); } catch {}
    };
  }, []);

  const allAnswered = state.questions.length > 0 && state.questions.every((_, i) => state.selected[i] !== undefined);

  const handleSubmit = useCallback(async () => {
    let ids = state.questionIds;
    let effectiveCategory = category;

    if (!effectiveCategory) {
      try {
        const stored = sessionStorage.getItem("pendingQuizArticles");
        if (stored) {
          const pending = JSON.parse(stored);
          if (pending.category) effectiveCategory = pending.category;
        }
      } catch {}
    }

    // Reload question IDs from DB if any questions are missing their ID
    if (effectiveCategory && date && state.questions.length > Object.keys(ids).length) {
      try {
        // Collect unique category slugs from questions
        const slugs = [...new Set(state.questions.map((q) => q.categorySlug || effectiveCategory))];
        const textToId: Record<string, string> = {};
        for (const slug of slugs) {
          const dbQ = await api.questions.list(slug, date);
          for (const q of dbQ) {
            if (q.id) textToId[q.text] = q.id;
          }
        }
        if (Object.keys(textToId).length > 0) {
          const newIds: Record<number, string> = {};
          state.questions.forEach((q, i) => {
            if (q.id) newIds[i] = q.id;
            else if (textToId[q.text]) newIds[i] = textToId[q.text];
          });
          ids = newIds;
        }
      } catch {}
    }

    if (effectiveCategory && date && Object.keys(ids).length > 0) {
      dispatch({ type: "SUBMIT_LOADING" });
      try {
        const answers = Object.entries(state.selected).map(([idx, selectedIndex]) => ({
          questionId: ids[Number(idx)],
          selectedIndex,
        }));
        const result: QuizResult = await api.quiz.attempt(effectiveCategory, date, answers);
        dispatch({
          type: "SUBMIT_SUCCESS",
          score: result.answers.filter((a) => a.isCorrect).length,
          total: result.total,
          answerResults: result.answers.map((a) => a.isCorrect),
        });
        notifySuccess("Quiz completed!", `${result.answers.filter((a) => a.isCorrect).length}/${result.total} correct`);
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
