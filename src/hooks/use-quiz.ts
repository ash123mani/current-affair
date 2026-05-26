"use client";

import { useState, useCallback } from "react";
import { api } from "@/lib/api/client";
import { notifySuccess, notifyError } from "@/lib/notify";
import type { QuestionResponse } from "@/types/api";

export function useQuiz(category: string) {
  const [questions, setQuestions] = useState<QuestionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    score: number;
    total: number;
    answers: { questionId: string; selectedIndex: number; isCorrect: boolean }[];
  } | null>(null);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.questions.list(category);
      setQuestions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load questions");
    } finally {
      setLoading(false);
    }
  }, [category]);

  const submit = useCallback(
    async (
      date: string,
      answers: { questionId: string; selectedIndex: number }[]
    ) => {
      setSubmitting(true);
      setError(null);
      try {
        const attemptResult = await api.quiz.attempt(category, date, answers);
        setResult({
          score: attemptResult.score,
          total: attemptResult.total,
          answers: attemptResult.answers,
        });
        notifySuccess("Quiz submitted!", `${attemptResult.score}/${attemptResult.total} correct`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to submit quiz";
        setError(msg);
        notifyError("Submission failed", msg);
      } finally {
        setSubmitting(false);
      }
    },
    [category]
  );

  return {
    questions,
    loading,
    submitting,
    error,
    result,
    fetchQuestions,
    submit,
  };
}
