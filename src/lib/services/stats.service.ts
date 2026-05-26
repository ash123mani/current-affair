import { categoryRepository } from "../repositories/category.repository";
import { quizRepository } from "../repositories/quiz.repository";
import { PAGINATION, MAX_RECENT_ATTEMPTS } from "@/constants";
import { calculateStreak } from "../date";

type CategoryRepo = Pick<typeof categoryRepository, "findBySlug">;
type QuizRepo = Pick<typeof quizRepository, "findHistory" | "countHistory" | "findAllByUser" | "groupByCategory">;

export class StatsService {
  constructor(
    private categoryRepo: CategoryRepo,
    private quizRepo: QuizRepo,
  ) {}

  async getHistory(
    userId: string,
    page: number = PAGINATION.DEFAULT_PAGE,
    categorySlug?: string
  ) {
    const limit = PAGINATION.DEFAULT_LIMIT;
    let categoryId: string | undefined;

    if (categorySlug) {
      const cat = await this.categoryRepo.findBySlug(categorySlug);
      if (cat) categoryId = cat.id;
    }

    const [attempts, total] = await Promise.all([
      this.quizRepo.findHistory(userId, {
        categoryId,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.quizRepo.countHistory(userId, categoryId),
    ]);

    return { data: attempts, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getDashboardStats(userId: string) {
    const [attempts, categoryGroupStats] = await Promise.all([
      this.quizRepo.findAllByUser(userId),
      this.quizRepo.groupByCategory(userId),
    ]);

    const categoryMap = new Map(
      attempts.map((a) => [a.categoryId, a.category])
    );

    const categoryStats = categoryGroupStats.map((stat) => {
      const cat = categoryMap.get(stat.categoryId);
      return {
        name: cat?.name ?? "Unknown",
        slug: cat?.slug ?? "",
        color: cat?.color ?? "#000",
        totalScore: stat._sum.score ?? 0,
        totalQuestions: stat._sum.total ?? 0,
        attempts: stat._count,
        accuracy: stat._sum.total
          ? Math.round(((stat._sum.score ?? 0) / (stat._sum.total ?? 1)) * 100)
          : 0,
      };
    });

    const totalScore = attempts.reduce((acc, a) => acc + a.score, 0);
    const totalQuestions = attempts.reduce((acc, a) => acc + a.total, 0);
    const uniqueDates = [...new Set(attempts.map((a) => a.date))];

    return {
      totalQuizzes: attempts.length,
      totalScore,
      totalQuestions,
      overallAccuracy: totalQuestions
        ? Math.round((totalScore / totalQuestions) * 100)
        : 0,
      streak: calculateStreak(uniqueDates),
      categoryStats,
      recentAttempts: attempts.slice(0, MAX_RECENT_ATTEMPTS),
    };
  }
}

export const statsService = new StatsService(categoryRepository, quizRepository);
