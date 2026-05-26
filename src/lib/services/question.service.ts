import { NotFoundError } from "../errors";
import { categoryRepository } from "../repositories/category.repository";
import { questionRepository } from "../repositories/question.repository";
import { parseOptions } from "../parse-options";

type CategoryRepo = Pick<typeof categoryRepository, "findBySlug">;
type QuestionRepo = Pick<typeof questionRepository, "findByCategoryAndDate" | "findFullByCategoryAndDate">;

export class QuestionService {
  constructor(
    private categoryRepo: CategoryRepo,
    private questionRepo: QuestionRepo,
  ) {}

  async getQuestions(categorySlug: string, date: string) {
    const category = await this.categoryRepo.findBySlug(categorySlug);
    if (!category) throw new NotFoundError("Category");

    const questions = await this.questionRepo.findByCategoryAndDate(
      category.id,
      date
    );

    return questions.map((q) => ({
      ...q,
      options: parseOptions(q.options),
    }));
  }

  async getQuestionsWithAnswers(categorySlug: string, date: string) {
    const category = await this.categoryRepo.findBySlug(categorySlug);
    if (!category) throw new NotFoundError("Category");

    const questions = await this.questionRepo.findFullByCategoryAndDate(
      category.id,
      date
    );

    return questions.map((q) => ({
      ...q,
      options: parseOptions(q.options),
    }));
  }
}

export const questionService = new QuestionService(categoryRepository, questionRepository);
