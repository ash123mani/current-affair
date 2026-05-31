export const API_ROUTES = {
  HOME: "/api/home",
  CATEGORIES: "/api/categories",
  QUESTIONS: "/api/questions",
  QUIZ_ATTEMPT: "/api/quiz/attempt",
  QUIZ_HISTORY: "/api/quiz/history",
  QUIZ_STATS: "/api/quiz/stats",
  SIGNUP: "/api/auth/signup",
  NEWS_ARTICLES: "/api/news/articles",
  QUIZ_GENERATE: "/api/quiz/generate",
  QUIZ_GENERATE_STREAM: "/api/quiz/generate-stream",
  QUIZ_SAVE_QUESTIONS: "/api/quiz/save-questions",
  QUIZ_SESSION: "/api/quiz/session",
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
} as const;

export const ACCURACY_THRESHOLD = 60;
export const MIN_PASSWORD_LENGTH = 6;
export const QUESTIONS_PER_QUIZ = 5;
export const MAX_RECENT_ATTEMPTS = 5;
export const QUESTIONS_PER_CATEGORY = 3;
