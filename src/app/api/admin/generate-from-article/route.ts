import { requireAdmin } from "@/lib/require-admin";
import { llmService } from "@/lib/services/generator/llm.service";
import { ok, err } from "@/lib/api-response";
import { ValidationError } from "@/lib/errors";
import { z } from "zod";
import { NextRequest } from "next/server";
import { today } from "@/lib/date";

const schema = z.object({
  categorySlug: z.string().min(1),
  categoryName: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional().default(""),
  source: z.string().optional().default(""),
  date: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return err(new ValidationError("Invalid article data"));
    }

    const { categoryName, categorySlug, title, description, source, date } = parsed.data;
    const name = categoryName ?? categorySlug;

    const question = await llmService.generateSingleQuestion(name, date ?? today(), {
      title,
      description,
      source,
    });

    return ok({ success: true, question });
  } catch (error) {
    return err(error);
  }
}
