export const API_ROUTES = {
  HOME: "/api/home",
  CATEGORIES: "/api/categories",
  QUESTIONS: "/api/questions",
  QUIZ_ATTEMPT: "/api/quiz/attempt",
  QUIZ_HISTORY: "/api/quiz/history",
  QUIZ_STATS: "/api/quiz/stats",
  SIGNUP: "/api/auth/signup",
  ADMIN_QUESTIONS: "/api/admin/questions",
  ADMIN_CATEGORIES: "/api/admin/categories",
  ADMIN_NEWS_FEED: "/api/admin/news-feed",
  ADMIN_GENERATE_FROM_ARTICLE: "/api/admin/generate-from-article",
  ADMIN_SAVE_DRAFT: "/api/admin/save-draft",
  ADMIN_POPULATE: "/api/admin/populate",
  ADMIN_PUBLISH: "/api/admin/questions/publish",
  NEWS_SOURCES: "/api/news/sources",
  NEWS_ARTICLES: "/api/news/articles",
  QUIZ_GENERATE: "/api/quiz/generate",
  CRON_POPULATE: "/api/cron/populate",
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
