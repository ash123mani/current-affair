import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/api-response";
import { AppError } from "@/lib/errors";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return err(new AppError("Unauthorized", 401));
    }

    const body = await request.json().catch(() => ({}));
    const { quizType, categoryId, categorySlug, date, currentIndex, selectedAnswers, questions, timeRemaining } = body;

    if (!quizType) {
      return err(new AppError("quizType is required", 400));
    }

    const paused = await prisma.quizSession.create({
      data: {
        userId: session.user.id,
        quizType,
        categoryId: categoryId || null,
        categorySlug: categorySlug || null,
        date: date || null,
        currentIndex: currentIndex ?? 0,
        selectedAnswers: JSON.stringify(selectedAnswers ?? {}),
        questions: JSON.stringify(questions ?? []),
        timeRemaining: timeRemaining ?? null,
        status: "paused",
      },
    });

    return ok({ id: paused.id }, 201);
  } catch (error) {
    return err(error);
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return err(new AppError("Unauthorized", 401));
    }

    const sessions = await prisma.quizSession.findMany({
      where: { userId: session.user.id, status: "paused" },
      orderBy: { updatedAt: "desc" },
    });

    const parsed = sessions.map((s) => ({
      id: s.id,
      quizType: s.quizType,
      categorySlug: s.categorySlug,
      date: s.date,
      currentIndex: s.currentIndex,
      questionsCount: (JSON.parse(s.questions) as unknown[]).length,
      selectedCount: Object.keys(JSON.parse(s.selectedAnswers) as Record<string, number>).length,
      timeRemaining: s.timeRemaining,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));

    return ok({ sessions: parsed });
  } catch (error) {
    return err(error);
  }
}
