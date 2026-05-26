export interface CategoryModel {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
  createdAt: string;
}

export interface QuestionModel {
  id: string;
  categoryId: string;
  date: string;
  text: string;
  options: string;
  correctIndex: number;
  explanation: string | null;
  source: string | null;
  createdAt: string;
}

export interface QuizAttemptModel {
  id: string;
  userId: string;
  categoryId: string;
  date: string;
  score: number;
  total: number;
  completedAt: string;
}

export interface AnswerModel {
  id: string;
  attemptId: string;
  questionId: string;
  selectedIndex: number;
  isCorrect: boolean;
}
