import { categoryRepository } from "@/lib/repositories/category.repository";
import { questionRepository } from "@/lib/repositories/question.repository";
import { ok, err } from "@/lib/api-response";
import { today } from "@/lib/date";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") ?? today();

    const categories = await categoryRepository.findAll();
    const questionCounts = await questionRepository.groupCountByCategory(date);
    const countMap = new Map(
      questionCounts.map((q) => [q.categoryId, q._count] as const)
    );

    const data = categories.map((cat) => ({
      ...cat,
      questionCount: countMap.get(cat.id) ?? 0,
    }));

    return ok({ date, categories: data });
  } catch (error) {
    return err(error);
  }
}
