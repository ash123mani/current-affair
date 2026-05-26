import { requireAdmin } from "@/lib/require-admin";
import { questionRepository, QUESTION_STATUS } from "@/lib/repositories/question.repository";
import { categoryRepository } from "@/lib/repositories/category.repository";
import { ok, err } from "@/lib/api-response";
import { ValidationError, AppError } from "@/lib/errors";
import { z } from "zod";
import { NextRequest } from "next/server";
import { today } from "@/lib/date";

const schema = z.object({
  categorySlug: z.string().min(1),
  date: z.string().optional(),
  text: z.string().min(1),
  options: z.array(z.string()).length(4),
  correctIndex: z.number().int().min(0).max(3),
  explanation: z.string().optional().default(""),
  source: z.string().optional().default("Admin: News Feed"),
});

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return err(new ValidationError("Invalid question data"));
    }

    const dbCategory = await categoryRepository.findBySlug(parsed.data.categorySlug);
    if (!dbCategory) {
      return err(new AppError("Category not found", 404));
    }

    await questionRepository.create({
      categoryId: dbCategory.id,
      date: parsed.data.date ?? today(),
      text: parsed.data.text,
      options: JSON.stringify(parsed.data.options),
      correctIndex: parsed.data.correctIndex,
      explanation: parsed.data.explanation || undefined,
      source: parsed.data.source,
      status: QUESTION_STATUS.DRAFT,
    });

    return ok({ success: true });
  } catch (error) {
    return err(error);
  }
}
