import { auth } from "@/lib/auth";
import { quizService } from "@/lib/services/quiz.service";
import { ok, err } from "@/lib/api-response";
import { AppError } from "@/lib/errors";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return err(new AppError("Unauthorized", 401));
    }

    const { id } = await params;
    const attempt = await quizService.getAttemptDetails(id);

    if (attempt.userId !== session.user.id && session.user.role !== "admin") {
      return err(new AppError("Forbidden", 403));
    }

    const parsedAnswers = attempt.answers.map((a) => ({
      questionId: a.questionId,
      selectedIndex: a.selectedIndex,
      isCorrect: a.isCorrect,
        question: {
          id: a.question.id,
          text: a.question.text,
          options: JSON.parse(a.question.options) as string[],
          correctIndex: a.question.correctIndex,
          explanation: a.question.explanation,
          source: a.question.source,
          articleUrl: a.question.articleUrl,
        },
    }));

    return ok({
      id: attempt.id,
      date: attempt.date,
      score: attempt.score,
      total: attempt.total,
      completedAt: attempt.completedAt,
      category: attempt.category,
      answers: parsedAnswers,
    });
  } catch (error) {
    return err(error);
  }
}
