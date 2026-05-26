import { API_ROUTES } from "@/constants";
import type {
  ApiError,
  QuestionResponse,
  AdminQuestionResponse,
  AttemptResponse,
  DashboardStats,
  QuizResult,
  SignupInput,
  CreateQuestionInput,
  PopulateResult,
} from "@/types/api";
import type { CategoryModel } from "@/types/models";

type RequestOptions = {
  method?: string;
  body?: unknown;
  params?: Record<string, string>;
};

class ApiClientError extends Error {
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
    attempt: (category: string, date: string, answers: { questionId: string; selectedIndex: number }[]) =>
      request<QuizResult>(API_ROUTES.QUIZ_ATTEMPT, {
        method: "POST",
        body: { category, date, answers },
      }),

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
  },

  auth: {
    signup: (input: SignupInput) =>
      request<{ success: boolean }>(API_ROUTES.SIGNUP, {
        method: "POST",
        body: input,
      }),
  },

  admin: {
    questions: {
      list: (category?: string) =>
        request<AdminQuestionResponse[]>(API_ROUTES.ADMIN_QUESTIONS, {
          params: category ? { category } : {},
        }),

      create: (input: CreateQuestionInput) =>
        request<AdminQuestionResponse>(API_ROUTES.ADMIN_QUESTIONS, {
          method: "POST",
          body: input,
        }),

      update: (id: string, input: Partial<CreateQuestionInput>) =>
        request<AdminQuestionResponse>(`${API_ROUTES.ADMIN_QUESTIONS}/${id}`, {
          method: "PUT",
          body: input,
        }),

      publish: (id: string) =>
        request<AdminQuestionResponse>(`${API_ROUTES.ADMIN_QUESTIONS}/publish`, {
          method: "POST",
          body: { id, action: "publish" },
        }),

      delete: (id: string) =>
        request<void>(`${API_ROUTES.ADMIN_QUESTIONS}/${id}`, {
          method: "DELETE",
        }),
    },

    categories: {
      list: () => request<CategoryModel[]>(API_ROUTES.ADMIN_CATEGORIES),

      create: (input: { name: string; slug: string; icon?: string; color?: string }) =>
        request<CategoryModel>(API_ROUTES.ADMIN_CATEGORIES, {
          method: "POST",
          body: input,
        }),

      update: (id: string, input: { name?: string; slug?: string; icon?: string; color?: string }) =>
        request<CategoryModel>(`${API_ROUTES.ADMIN_CATEGORIES}/${id}`, {
          method: "PUT",
          body: input,
        }),

      delete: (id: string) =>
        request<void>(`${API_ROUTES.ADMIN_CATEGORIES}/${id}`, {
          method: "DELETE",
        }),
    },

    populate: (date?: string, category?: string) =>
      request<PopulateResult>(API_ROUTES.ADMIN_POPULATE, {
        method: "POST",
        body: { ...(date ? { date } : {}), ...(category ? { category } : {}) },
      }),

    draftQuestions: {
      list: () =>
        request<AdminQuestionResponse[]>(`${API_ROUTES.ADMIN_QUESTIONS}/drafts`),
    },
  },
};
