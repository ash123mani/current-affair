export interface GeneratedQuestionData {
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface NewsFeedArticle {
  title: string;
  description: string;
  source: string;
  url: string;
  publishedAt: string;
}

export interface NewsFeedCategory {
  categorySlug: string;
  categoryName: string;
  articles: NewsFeedArticle[];
}

export interface GenerateFromArticleResponse {
  success: boolean;
  question: GeneratedQuestionData;
}

export interface SaveDraftResponse {
  success: boolean;
}

export interface ApiError {
  error: string;
  code?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface QuestionResponse {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string | null;
  date: string;
  category: {
    name: string;
    slug: string;
  };
}

export interface AdminQuestionResponse extends QuestionResponse {
  status: string;
  explanation: string | null;
  source: string | null;
  correctIndex: number;
  createdAt: string;
}

export interface AttemptResponse {
  id: string;
  date: string;
  score: number;
  total: number;
  completedAt: string;
  category: {
    name: string;
    slug: string;
  };
}

export interface CategoryStat {
  name: string;
  slug: string;
  color: string;
  totalScore: number;
  totalQuestions: number;
  attempts: number;
  accuracy: number;
}

export interface DashboardStats {
  totalQuizzes: number;
  totalScore: number;
  totalQuestions: number;
  overallAccuracy: number;
  streak: number;
  categoryStats: CategoryStat[];
  recentAttempts: AttemptResponse[];
}

export interface QuizResult {
  score: number;
  total: number;
  answers: {
    questionId: string;
    selectedIndex: number;
    isCorrect: boolean;
  }[];
}

export interface AttemptDetailResponse {
  id: string;
  date: string;
  score: number;
  total: number;
  completedAt: string;
  category: { name: string; slug: string };
  answers: {
    questionId: string;
    selectedIndex: number;
    isCorrect: boolean;
    question: {
      id: string;
      text: string;
      options: string[];
      correctIndex: number;
      explanation: string | null;
    };
  }[];
}

export interface SubmitAnswer {
  questionId: string;
  selectedIndex: number;
}

export interface SignupInput {
  name: string;
  email: string;
  password: string;
}

export interface CreateQuestionInput {
  categorySlug: string;
  date: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  source?: string;
}

export interface HomeCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
  questionCount: number;
}

export interface HomeData {
  date: string;
  categories: HomeCategory[];
}

export interface NewsSource {
  id: string;
  name: string;
  description: string;
  category: string;
  url: string;
}

export interface GenerateQuizResponse {
  questions: GeneratedQuestionData[];
}

export interface PopulateResult {
  success: boolean;
  date: string;
  category: string;
  totalGenerated: number;
  details: {
    category: string;
    questions: number;
    errors?: string[];
  }[];
  errors?: string[];
}
