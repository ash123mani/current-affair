import { auth } from "@/lib/auth";
import { llmService } from "@/lib/services/generator/llm.service";
import { ok, err } from "@/lib/api-response";
import { AppError } from "@/lib/errors";
import { today } from "@/lib/date";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return err(new AppError("Unauthorized", 401));
    }

    const body = await request.json().catch(() => ({}));
    const { articles, category, date } = body;

    if (!articles || !Array.isArray(articles) || articles.length === 0) {
      return err(new AppError("At least one article is required", 400));
    }

    if (!category || typeof category !== "string") {
      return err(new AppError("Category is required", 400));
    }

    const quizDate = typeof date === "string" ? date : today();
    const questions = await llmService.generateQuestions(category, quizDate, articles, articles.length);

    return ok({ questions });
  } catch (error) {
    return err(error);
  }
}
