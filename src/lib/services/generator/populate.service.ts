import { CATEGORIES } from "@/constants/categories";
import { categoryRepository } from "@/lib/repositories/category.repository";
import { questionRepository } from "@/lib/repositories/question.repository";
import { newsService } from "./news.service";
import { llmService } from "./llm.service";
import { today } from "@/lib/date";
import type { NewsArticle } from "./news.service";
import type { GeneratedQuestion } from "./llm.service";

export interface PopulateResult {
  totalGenerated: number;
  categoryResults: {
    categorySlug: string;
    categoryName: string;
    articlesFound: number;
    questionsGenerated: number;
    errors: string[];
  }[];
  errors: string[];
}

export class PopulateService {
  async populateForDate(
    date?: string,
    specificCategory?: string
  ): Promise<PopulateResult> {
    const targetDate = date ?? today();
    const result: PopulateResult = {
      totalGenerated: 0,
      categoryResults: [],
      errors: [],
    };

    const categoriesToProcess = specificCategory
      ? CATEGORIES.filter((c) => c.slug === specificCategory)
      : CATEGORIES;

    for (const cat of categoriesToProcess) {
      const categoryResult = await this.processCategory(cat.slug, cat.name, targetDate);
      result.categoryResults.push(categoryResult);
      result.totalGenerated += categoryResult.questionsGenerated;
      result.errors.push(...categoryResult.errors);
    }

    return result;
  }

  async populateSingleCategory(
    categorySlug: string,
    date?: string
  ): Promise<PopulateResult> {
    const cat = CATEGORIES.find((c) => c.slug === categorySlug);
    if (!cat) {
      return {
        totalGenerated: 0,
        categoryResults: [],
        errors: [`Category "${categorySlug}" not found`],
      };
    }
    return this.populateForDate(date, categorySlug);
  }

  private async processCategory(
    slug: string,
    name: string,
    date: string
  ): Promise<PopulateResult["categoryResults"][number]> {
    const errors: string[] = [];
    let questionsGenerated = 0;

    try {
      const dbCategory = await categoryRepository.findBySlug(slug);
      if (!dbCategory) {
        return {
          categorySlug: slug,
          categoryName: name,
          articlesFound: 0,
          questionsGenerated: 0,
          errors: [`Category "${slug}" not found in database`],
        };
      }

      const existingCount = await questionRepository.countByCategoryAndDate(
        dbCategory.id,
        date
      );
      if (existingCount > 0) {
        return {
          categorySlug: slug,
          categoryName: name,
          articlesFound: 0,
          questionsGenerated: 0,
          errors: [],
        };
      }

      let articles: NewsArticle[];

      try {
        const categorizedNews = await newsService.fetchTopHeadlines();
        const categoryNews = categorizedNews.find((c) => c.categorySlug === slug);
        articles = categoryNews?.articles ?? [];
      } catch (error) {
        errors.push(`News fetch failed: ${error instanceof Error ? error.message : "Unknown error"}`);
        return {
          categorySlug: slug,
          categoryName: name,
          articlesFound: 0,
          questionsGenerated: 0,
          errors,
        };
      }

      if (articles.length === 0) {
        return {
          categorySlug: slug,
          categoryName: name,
          articlesFound: 0,
          questionsGenerated: 0,
          errors: ["No articles found for this category"],
        };
      }

      let questions: GeneratedQuestion[];

      try {
        questions = await llmService.generateQuestions(name, date, articles, 3);
      } catch (error) {
        errors.push(`Question generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
        return {
          categorySlug: slug,
          categoryName: name,
          articlesFound: articles.length,
          questionsGenerated: 0,
          errors,
        };
      }

      for (const q of questions) {
        try {
          await questionRepository.create({
            categoryId: dbCategory.id,
            date,
            text: q.text,
            options: JSON.stringify(q.options),
            correctIndex: q.correctIndex,
            explanation: q.explanation,
            source: "Auto-generated",
          });
          questionsGenerated++;
        } catch (createError) {
          errors.push(
            `Failed to save question "${q.text.slice(0, 50)}...": ${
              createError instanceof Error ? createError.message : "Unknown error"
            }`
          );
        }
      }
    } catch (error) {
      errors.push(
        `Unexpected error for ${name}: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }

    return {
      categorySlug: slug,
      categoryName: name,
      articlesFound: 0,
      questionsGenerated,
      errors,
    };
  }
}

export const populateService = new PopulateService();
