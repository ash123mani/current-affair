import { ConflictError, NotFoundError } from "../errors";
import { categoryRepository } from "../repositories/category.repository";
import { questionRepository } from "../repositories/question.repository";
import { quizRepository } from "../repositories/quiz.repository";

type CategoryRepo = Pick<typeof categoryRepository, "findBySlug">;
type QuestionRepo = Pick<typeof questionRepository, "findFullByCategoryAndDate">;
type QuizRepo = Pick<typeof quizRepository, "findAttempt" | "createAttempt" | "deleteAttempt" | "findById">;

export class QuizService {
  constructor(
    private categoryRepo: CategoryRepo,
    private questionRepo: QuestionRepo,
    private quizRepo: QuizRepo,
  ) {}

  async submitAttempt(
    userId: string,
    categorySlug: string,
    date: string,
    answers: { questionId: string; selectedIndex: number }[],
    retake: boolean = false
  ) {
    const category = await this.categoryRepo.findBySlug(categorySlug);
    if (!category) throw new NotFoundError("Category");

    const existing = await this.quizRepo.findAttempt(userId, category.id, date);
    if (existing) {
      if (!retake) throw new ConflictError("Already attempted this quiz");
      await this.quizRepo.deleteAttempt(existing.id);
    }

    const questions = await this.questionRepo.findFullByCategoryAndDate(
      category.id,
      date
    );

    let score = 0;
    const answerData = answers.map((a) => {
      const question = questions.find((q) => q.id === a.questionId);
      const isCorrect = question
        ? question.correctIndex === a.selectedIndex
        : false;
      if (isCorrect) score++;
      return { questionId: a.questionId, selectedIndex: a.selectedIndex, isCorrect };
    });

    return this.quizRepo.createAttempt({
      userId,
      categoryId: category.id,
      date,
      score,
      total: questions.length,
      answers: answerData,
    });
  }

  async getAttemptDetails(attemptId: string) {
    const attempt = await this.quizRepo.findById(attemptId);
    if (!attempt) throw new NotFoundError("Attempt");
    return attempt;
  }
}

export const quizService = new QuizService(categoryRepository, questionRepository, quizRepository);
