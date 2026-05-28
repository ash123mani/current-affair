import { API_ROUTES } from "@/constants";
import type {
  ApiError,
  QuestionResponse,
  AttemptDetailResponse,
  AttemptResponse,
  DashboardStats,
  QuizResult,
  SignupInput,
  HomeData,
} from "@/types/api";
import type { CategoryModel } from "@/types/models";

type RequestOptions = {
  method?: string;
  body?: unknown;
  params?: Record<string, string>;
};

export class ApiClientError extends Error {
  constructor(
    public status: number,
    public code: string | undefined,
    message: string
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, params } = options;

  let finalUrl = url;
  if (params) {
    const searchParams = new URLSearchParams(params);
    finalUrl = `${url}?${searchParams.toString()}`;
  }

  const res = await fetch(finalUrl, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err: ApiError = await res.json().catch(() => ({ error: "Request failed" }));
    throw new ApiClientError(res.status, err.code, err.error);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  home: {
    data: (date?: string) =>
      request<HomeData>(API_ROUTES.HOME, {
        params: date ? { date } : {},
      }),
  },

  news: {
    articles: (date: string) =>
      request<{ categories: Record<string, { title: string; description: string; content?: string; source: string; url: string; publishedAt: string; imageUrl?: string }[]>; note?: string }>(
        API_ROUTES.NEWS_ARTICLES,
        { params: { date } }
      ),
  },

  categories: {
    list: () => request<CategoryModel[]>(API_ROUTES.CATEGORIES),
  },

  questions: {
    list: (category: string, date?: string) =>
      request<QuestionResponse[]>(API_ROUTES.QUESTIONS, {
        params: { category, ...(date ? { date } : {}) },
      }),
  },

  quiz: {
    attempt: (category: string, date: string, answers: { questionId: string; selectedIndex: number }[], retake?: boolean) =>
      request<QuizResult>(API_ROUTES.QUIZ_ATTEMPT, {
        method: "POST",
        body: { category, date, answers, retake },
      }),

    attemptDetails: (id: string) =>
      request<AttemptDetailResponse>(`${API_ROUTES.QUIZ_ATTEMPT}/${id}`),

    history: (page: number = 1, category?: string) =>
      request<{
        data: AttemptResponse[];
        total: number;
        page: number;
        totalPages: number;
      }>(API_ROUTES.QUIZ_HISTORY, {
        params: {
          page: String(page),
          ...(category ? { category } : {}),
        },
      }),

    stats: () => request<DashboardStats>(API_ROUTES.QUIZ_STATS),

    generate: (articles: { title: string; description: string; content?: string; source: string; url: string }[], category: string, date?: string) =>
      request<{ questions: { text: string; options: string[]; correctIndex: number; explanation: string }[] }>(
        API_ROUTES.QUIZ_GENERATE,
        { method: "POST", body: { articles, category, date } }
      ),

    saveQuestions: (category: string, date: string, questions: { text: string; options: string[]; correctIndex: number; explanation?: string; articleTitle?: string; articleUrl?: string }[]) =>
      request<{ questions: { id: string; text: string }[]; count: number; date: string; category: string }>(
        `${API_ROUTES.QUIZ_SAVE_QUESTIONS}`,
        { method: "POST", body: { category, date, questions } }
      ),

    generateStream: (
      articles: { title: string; description: string; content?: string; source: string; url: string }[],
      category: string,
      date?: string,
      onBatch?: (batch: { questions: import("@/lib/services/generator/llm.service").GeneratedQuestion[]; totalQuestions: number }) => void,
      onDone?: (questions: import("@/lib/services/generator/llm.service").GeneratedQuestion[]) => void,
      onError?: (error: string) => void
    ) => {
      const controller = new AbortController();

      fetch(API_ROUTES.QUIZ_GENERATE_STREAM, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articles, category, date }),
        signal: controller.signal,
      })
        .then(async (res) => {
          const reader = res.body?.getReader();
          if (!reader) return;
          const decoder = new TextDecoder();
          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === "batch" && data.questions) {
                  onBatch?.({ questions: data.questions, totalQuestions: data.totalQuestions });
                } else if (data.type === "done" && data.questions) {
                  onDone?.(data.questions);
                } else if (data.type === "error") {
                  onError?.(data.error);
                }
              } catch { /* skip malformed */ }
            }
          }
        })
        .catch((e) => onError?.(e.message));

      return () => controller.abort();
    },
  },

  auth: {
    signup: (input: SignupInput) =>
      request<{ success: boolean }>(API_ROUTES.SIGNUP, {
        method: "POST",
        body: input,
      }),
  },
};
