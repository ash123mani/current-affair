import type { Dispatch } from "react";
import { format } from "date-fns";
import { api } from "@/lib/api/client";
import { notifySuccess } from "@/lib/notify";

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
}

export type Phase = "date" | "fetching" | "no-articles" | "tabs";

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
  | { type: "DISMISS_ERROR" }
  | { type: "GO_BACK_TO_DATE" };

export function buildTabState(articles: Article[]): TabState {
  return {
    articles,
    selectedIndices: articles.map((_, i) => i),
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
