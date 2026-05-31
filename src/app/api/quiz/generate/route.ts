import { llmService } from "@/lib/services/generator/llm.service";
import { ok, err } from "@/lib/api-response";
import { AppError } from "@/lib/errors";
import { today } from "@/lib/date";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    let { articles, category, date } = body;

    if (!articles || !Array.isArray(articles) || articles.length === 0) {
      return err(new AppError("At least one article is required", 400));
    }

    if (!category || typeof category !== "string") {
      return err(new AppError("Category is required", 400));
    }

    articles = articles.map((a: Record<string, unknown>) => ({
      title: String(a.title ?? "").slice(0, 300),
      description: String(a.description ?? "").slice(0, 500),
      source: String(a.source ?? "").slice(0, 100),
      content: a.content ? String(a.content).slice(0, 800) : undefined,
      url: a.url ? String(a.url) : undefined,
      categorySlug: a.categorySlug ? String(a.categorySlug) : undefined,
    }));

    const quizDate = typeof date === "string" ? date : today();
    const questions = await llmService.generateQuestionsBatched(category, quizDate, articles, 5);

    if (!questions || questions.length === 0) {
      return err(new AppError("Failed to generate questions — LLM returned empty result", 502));
    }

    return ok({ questions });
  } catch (error) {
    console.error("[generate]", error);
    return err(error instanceof AppError ? error : new AppError("Failed to generate quiz. Please try again.", 502));
  }
}
