import { questionService } from "@/lib/services/question.service";
import { ok, err } from "@/lib/api-response";
import { AppError } from "@/lib/errors";
import { today } from "@/lib/date";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const date = searchParams.get("date") ?? today();

    if (!category) {
      return err(new AppError("category query param is required", 400));
    }

    const questions = await questionService.getQuestions(category, date);
    return ok(questions);
  } catch (error) {
    return err(error);
  }
}
