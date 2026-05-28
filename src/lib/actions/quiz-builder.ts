import type { Dispatch } from "react";
import { format } from "date-fns";
import { api } from "@/lib/api/client";
import { notifySuccess } from "@/lib/notify";
import type { GeneratedQuestion } from "@/lib/services/generator/llm.service";

interface StoredQuiz {
  questions: GeneratedQuestion[];
  category: string;
  date: string;
}

interface Article {
  title: string;
  description: string;
  content?: string;
  source: string;
  url: string;
  publishedAt: string;
  imageUrl?: string;
}

export interface TabState {
  articles: Article[];
  selectedIndices: number[];
  questions: GeneratedQuestion[];
  totalGenerated: number;
  saving: boolean;
  saved: boolean;
}

export type Phase = "date" | "fetching" | "no-articles" | "tabs" | "generating" | "reviewing";

export type Action =
  | { type: "SET_DATE"; date: Date }
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; categories: Record<string, Article[]> }
  | { type: "FETCH_NO_ARTICLES"; note?: string }
  | { type: "FETCH_ERROR"; error: string }
  | { type: "SET_ACTIVE_TAB"; slug: string }
  | { type: "TOGGLE_ARTICLE"; slug: string; idx: number }
  | { type: "SELECT_ALL"; slug: string }
  | { type: "CLEAR_ALL"; slug: string }
  | { type: "GENERATE_START"; slug: string }
  | { type: "GENERATE_BATCH"; slug: string; batch: GeneratedQuestion[]; total: number }
  | { type: "GENERATE_COMPLETE"; slug: string; questions: GeneratedQuestion[] }
  | { type: "GENERATE_ERROR"; slug: string; error: string }
  | { type: "GENERATE_CANCEL"; slug: string }
  | { type: "SAVE_START"; slug: string }
  | { type: "SAVE_COMPLETE"; slug: string }
  | { type: "SAVE_ERROR"; slug: string; error: string }
  | { type: "RESET_QUESTIONS"; slug: string }
  | { type: "DISMISS_ERROR" }
  | { type: "GO_BACK_TO_DATE" };

export function buildTabState(articles: Article[]): TabState {
  return {
    articles,
    selectedIndices: articles.map((_, i) => i),
    questions: [],
    totalGenerated: 0,
    saving: false,
    saved: false,
  };
}

export async function fetchArticles(date: Date, dispatch: Dispatch<Action>) {
  dispatch({ type: "FETCH_START" });
  try {
    const data = await api.news.articles(format(date, "yyyy-MM-dd"));
    const cats = data.categories;
    const slugs = Object.keys(cats);

    if (slugs.length === 0) {
      dispatch({ type: "FETCH_NO_ARTICLES", note: data.note });
      return;
    }
    dispatch({ type: "FETCH_SUCCESS", categories: cats });
    const total = slugs.reduce((sum, s) => sum + cats[s].length, 0);
    notifySuccess(`${total} articles across ${slugs.length} categories`);
  } catch (e) {
    dispatch({ type: "FETCH_ERROR", error: e instanceof Error ? e.message : "Failed to fetch articles" });
  }
}

export function generateQuiz(
  date: Date,
  articles: { title: string; description: string; content?: string; source: string; url: string }[],
  category: string,
  dispatch: Dispatch<Action>
): () => void {
  dispatch({ type: "GENERATE_START", slug: category });

  const cancel = api.quiz.generateStream(
    articles,
    category,
    format(date, "yyyy-MM-dd"),
    (batch) => {
      dispatch({ type: "GENERATE_BATCH", slug: category, batch: batch.questions, total: batch.totalQuestions });
    },
    (all) => {
      dispatch({ type: "GENERATE_COMPLETE", slug: category, questions: all });
    },
    (errMsg) => {
      dispatch({ type: "GENERATE_ERROR", slug: category, error: errMsg });
    }
  );

  return cancel;
}

export async function saveAndStartQuiz(
  date: Date,
  slug: string,
  questions: GeneratedQuestion[],
  dispatch: Dispatch<Action>,
  onSuccess: (slug: string, date: string) => void
) {
  dispatch({ type: "SAVE_START", slug });

  // Store in sessionStorage immediately so the generated page can load instantly
  const dateStr = format(date, "yyyy-MM-dd");
  const stored: StoredQuiz = { questions, category: slug, date: dateStr };
  try {
    sessionStorage.setItem("generatedQuiz", JSON.stringify(stored));
  } catch { /* storage full or unavailable */ }

  // Try to save to DB in background — don't block navigation on failure
  api.quiz.saveQuestions(slug, dateStr, questions).catch(() => {});

  dispatch({ type: "SAVE_COMPLETE", slug });
  onSuccess(slug, dateStr);
}
