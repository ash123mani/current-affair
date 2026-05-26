import { categoryRepository } from "../repositories/category.repository";
import { questionRepository } from "../repositories/question.repository";

type CategoryRepo = Pick<typeof categoryRepository, "findAll">;
type QuestionRepo = Pick<typeof questionRepository, "groupCountByCategory">;

export class CategoryService {
  constructor(
    private categoryRepo: CategoryRepo,
    private questionRepo: QuestionRepo,
  ) {}

  async getCategoriesWithCounts(date: string) {
    const categories = await this.categoryRepo.findAll();
    const questionCounts = await this.questionRepo.groupCountByCategory(date);
    const countMap = new Map(questionCounts.map((q) => [q.categoryId, q._count]));

    return categories.map((cat) => ({
      ...cat,
      questionCount: countMap.get(cat.id) ?? 0,
    }));
  }
}

export const categoryService = new CategoryService(categoryRepository, questionRepository);
