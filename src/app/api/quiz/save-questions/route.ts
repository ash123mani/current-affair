import { auth } from "@/lib/auth";
import { categoryRepository } from "@/lib/repositories/category.repository";
import { questionRepository } from "@/lib/repositories/question.repository";
import type { CreateQuestionData } from "@/lib/repositories/question.repository";
import { ok, err } from "@/lib/api-response";
import { AppError } from "@/lib/errors";
import { NextRequest } from "next/server";

const NEWS_CATEGORIES = [
  { slug: "general", name: "General" },
  { slug: "business", name: "Business" },
  { slug: "technology", name: "Technology" },
  { slug: "entertainment", name: "Entertainment" },
  { slug: "sports", name: "Sports" },
  { slug: "science", name: "Science" },
  { slug: "health", name: "Health" },
];

async function ensureCategory(slug: string): Promise<{ id: string }> {
  const existing = await categoryRepository.findBySlug(slug);
  if (existing) return existing;
  const meta = NEWS_CATEGORIES.find((c) => c.slug === slug);
  return categoryRepository.create({
    slug,
    name: meta?.name ?? slug.charAt(0).toUpperCase() + slug.slice(1),
    icon: slug,
    color: "#D97B4F",
  });
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return err(new AppError("Unauthorized", 401));
    }

    const body = await request.json().catch(() => ({}));
    const { category: categorySlug, date, questions } = body;

    if (!categorySlug || typeof categorySlug !== "string") {
      return err(new AppError("category is required", 400));
    }
    if (!date || typeof date !== "string") {
      return err(new AppError("date is required", 400));
    }
    if (!Array.isArray(questions) || questions.length === 0) {
      return err(new AppError("questions array is required", 400));
    }

    const category = await ensureCategory(categorySlug);

    const saved: { id: string; text: string; options: string; correctIndex: number; explanation: string | null; source: string | null }[] = [];

    for (const q of questions) {
      const data: CreateQuestionData = {
        categoryId: category.id,
        date,
        text: String(q.text ?? ""),
        options: JSON.stringify(q.options ?? []),
        correctIndex: Number(q.correctIndex) ?? 0,
        explanation: q.explanation ? String(q.explanation) : undefined,
        source: q.articleTitle ? String(q.articleTitle) : undefined,
        status: "published",
      };
      if (!data.text) continue;
      try {
        const created = await questionRepository.create(data);
        saved.push(created);
      } catch {
        // skip duplicates (unique constraint on categoryId + date + text)
      }
    }

    return ok({ questions: saved, count: saved.length, date, category: categorySlug }, 201);
  } catch (error) {
    return err(error);
  }
}
