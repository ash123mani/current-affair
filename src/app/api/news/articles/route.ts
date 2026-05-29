import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { indianNewsService } from "@/lib/services/generator/indian-news.service";
import { ok, err } from "@/lib/api-response";
import { AppError } from "@/lib/errors";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return err(new AppError("Unauthorized", 401));
  }
  try {
    const date = request.nextUrl.searchParams.get("date");
    if (!date) {
      return ok({ categories: {} });
    }

    const hasArticles = await indianNewsService.hasArticlesForDate(date);

    if (!hasArticles) {
      const inserted = await indianNewsService.fetchArticlesForDate(date);
      if (inserted === 0) {
        return ok({ categories: {}, note: "No articles found for this date. Try a recent date." });
      }
    }

    const articles = await indianNewsService.getArticlesForDate(date);
    const categories: Record<string, unknown[]> = {};
    for (const article of articles) {
      const cat = article.category || "general";
      (categories[cat] ??= []).push(article);
    }

    return ok({ categories });
  } catch (error) {
    return err(error);
  }
}
