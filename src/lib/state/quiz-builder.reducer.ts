import type { Action, Phase, TabState } from "@/lib/actions/quiz-builder";
import { buildTabState } from "@/lib/actions/quiz-builder";

export interface State {
  date: Date;
  phase: Phase;
  error: string | null;
  groupedData: Record<string, { title: string; description: string; content?: string; source: string; url: string; publishedAt: string; imageUrl?: string }[]>;
  activeTab: string | null;
  cancelTab: string | null;
  tabs: Record<string, TabState>;
}

export const INITIAL_STATE: State = {
  date: new Date(),
  phase: "date",
  error: null,
  groupedData: {},
  activeTab: null,
  cancelTab: null,
  tabs: {},
};

export function quizBuilderReducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_DATE":
      return { ...state, date: action.date };

    case "FETCH_START":
      return { ...state, phase: "fetching", error: null, groupedData: {}, tabs: {}, activeTab: null };

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
        activeTab: slugs[0],
        tabs,
      };
    }

    case "FETCH_NO_ARTICLES":
      return { ...state, phase: "no-articles", error: action.note ?? null };

    case "FETCH_ERROR":
      return { ...state, phase: "date", error: action.error };

    case "SET_ACTIVE_TAB":
      return { ...state, activeTab: action.slug };

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

    case "GENERATE_START": {
      const tab = state.tabs[action.slug];
      if (!tab) return state;
      return {
        ...state,
        phase: "generating",
        cancelTab: action.slug,
        error: null,
        tabs: { ...state.tabs, [action.slug]: { ...tab, questions: [], totalGenerated: 0, saved: false } },
      };
    }

    case "GENERATE_BATCH": {
      const tab = state.tabs[action.slug];
      if (!tab) return state;
      return {
        ...state,
        tabs: {
          ...state.tabs,
          [action.slug]: { ...tab, questions: [...tab.questions, ...action.batch], totalGenerated: action.total },
        },
      };
    }

    case "GENERATE_COMPLETE": {
      const tab = state.tabs[action.slug];
      if (!tab) return state;
      return {
        ...state,
        phase: "reviewing",
        cancelTab: null,
        tabs: { ...state.tabs, [action.slug]: { ...tab, questions: action.questions, totalGenerated: action.questions.length } },
      };
    }

    case "GENERATE_ERROR": {
      const tab = state.tabs[action.slug];
      if (!tab) return state;
      return {
        ...state,
        phase: "tabs",
        cancelTab: null,
        error: action.error,
        tabs: { ...state.tabs, [action.slug]: { ...tab, totalGenerated: 0 } },
      };
    }

    case "GENERATE_CANCEL": {
      const tab = state.tabs[action.slug];
      if (!tab) return state;
      return {
        ...state,
        phase: tab.questions.length > 0 ? "reviewing" : "tabs",
        cancelTab: null,
      };
    }

    case "SAVE_START": {
      const tab = state.tabs[action.slug];
      if (!tab) return state;
      return { ...state, tabs: { ...state.tabs, [action.slug]: { ...tab, saving: true } } };
    }

    case "SAVE_COMPLETE": {
      const tab = state.tabs[action.slug];
      if (!tab) return state;
      return { ...state, tabs: { ...state.tabs, [action.slug]: { ...tab, saving: false, saved: true } } };
    }

    case "SAVE_ERROR": {
      const tab = state.tabs[action.slug];
      if (!tab) return state;
      return { ...state, error: action.error, tabs: { ...state.tabs, [action.slug]: { ...tab, saving: false } } };
    }

    case "RESET_QUESTIONS": {
      const tab = state.tabs[action.slug];
      if (!tab) return state;
      return {
        ...state,
        phase: "tabs",
        tabs: { ...state.tabs, [action.slug]: { ...tab, questions: [], totalGenerated: 0, saved: false } },
      };
    }

    case "DISMISS_ERROR":
      return { ...state, error: null };

    case "GO_BACK_TO_DATE":
      return { ...INITIAL_STATE, date: state.date };

    default:
      return state;
  }
}
