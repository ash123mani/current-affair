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
  source: string | null;
  articleUrl: string | null;
  date: string;
  category: {
    name: string;
    slug: string;
  };
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
        source: string | null;
        articleUrl: string | null;
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

