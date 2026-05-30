import type { Action, Phase, TabState } from "@/lib/actions/quiz-builder";
import { buildTabState } from "@/lib/actions/quiz-builder";

export interface State {
  date: Date;
  phase: Phase;
  error: string | null;
  groupedData: Record<string, { title: string; description: string; content?: string; source: string; url: string; publishedAt: string; imageUrl?: string }[]>;
  tabs: Record<string, TabState>;
}

export const INITIAL_STATE: State = {
  date: new Date(),
  phase: "date",
  error: null,
  groupedData: {},
  tabs: {},
};

export function quizBuilderReducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_DATE":
      return { ...state, date: action.date };

    case "FETCH_START":
      return { ...state, phase: "fetching", error: null, groupedData: {}, tabs: {} };

    case "FETCH_SUCCESS": {
      const slugs = Object.keys(action.categories);
      const tabs: Record<string, TabState> = {};
      for (const slug of slugs) {
        tabs[slug] = buildTabState(action.categories[slug]);
      }
      return {
        ...state,
        phase: "tabs",
        groupedData: action.categories,
        tabs,
      };
    }

    case "FETCH_NO_ARTICLES":
      return { ...state, phase: "no-articles", error: action.note ?? null };

    case "FETCH_ERROR":
      return { ...state, phase: "date", error: action.error };

    case "TOGGLE_ARTICLE": {
      const tab = state.tabs[action.slug];
      if (!tab) return state;
      const idx = action.idx;
      const next = tab.selectedIndices.includes(idx)
        ? tab.selectedIndices.filter((i) => i !== idx)
        : [...tab.selectedIndices, idx];
      return { ...state, tabs: { ...state.tabs, [action.slug]: { ...tab, selectedIndices: next } } };
    }

    case "SELECT_ALL": {
      const tab = state.tabs[action.slug];
      if (!tab) return state;
      return {
        ...state,
        tabs: { ...state.tabs, [action.slug]: { ...tab, selectedIndices: tab.articles.map((_, i) => i) } },
      };
    }

    case "CLEAR_ALL": {
      const tab = state.tabs[action.slug];
      if (!tab) return state;
      return { ...state, tabs: { ...state.tabs, [action.slug]: { ...tab, selectedIndices: [] } } };
    }

    case "DISMISS_ERROR":
      return { ...state, error: null };

    case "GO_BACK_TO_DATE":
      return { ...INITIAL_STATE, date: state.date };

    default:
      return state;
  }
}
