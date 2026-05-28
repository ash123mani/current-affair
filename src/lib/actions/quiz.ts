import type { Dispatch } from "react";
import { api, ApiClientError } from "@/lib/api/client";
import { notifySuccess, notifyError } from "@/lib/notify";
import type { QuestionResponse, QuizResult } from "@/types/api";

export type QuizAction =
  | { type: "QUESTIONS_LOADING" }
  | { type: "QUESTIONS_SUCCESS"; questions: QuestionResponse[] }
  | { type: "QUESTIONS_ERROR"; error: string }
  | { type: "QUESTIONS_RESET" }
  | { type: "UNAUTHORIZED" }
  | { type: "SUBMIT_LOADING" }
  | { type: "SUBMIT_SUCCESS"; result: QuizResult }
  | { type: "SUBMIT_ERROR"; error: string };

export async function loadQuestions(
  category: string,
  date: string | undefined,
  dispatch: Dispatch<QuizAction>,
  fallback?: () => QuestionResponse[] | null
) {
  dispatch({ type: "QUESTIONS_LOADING" });
  try {
    const data = await api.questions.list(category, date);
    if (data && data.length > 0) {
      dispatch({ type: "QUESTIONS_SUCCESS", questions: data });
      return;
    }
    throw new Error("No questions");
  } catch (err) {
    if (err instanceof ApiClientError && err.status === 401) {
      dispatch({ type: "UNAUTHORIZED" });
      return;
    }
    const stored = fallback?.();
    if (stored && stored.length > 0) {
      dispatch({ type: "QUESTIONS_SUCCESS", questions: stored });
      return;
    }
    dispatch({ type: "QUESTIONS_ERROR", error: "No questions available" });
  }
}

export async function submitQuiz(
  category: string,
  date: string,
  answers: { questionId: string; selectedIndex: number }[],
  dispatch: Dispatch<QuizAction>,
  retake?: boolean
) {
  dispatch({ type: "SUBMIT_LOADING" });
  try {
    const result = await api.quiz.attempt(category, date, answers, retake);
    dispatch({ type: "SUBMIT_SUCCESS", result });
    notifySuccess("Quiz submitted!", `${result.score}/${result.total} correct`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to submit quiz";
    dispatch({ type: "SUBMIT_ERROR", error: msg });
    notifyError("Submission failed", msg);
  }
}
