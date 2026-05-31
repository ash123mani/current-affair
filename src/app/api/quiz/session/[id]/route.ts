import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/api-response";
import { AppError } from "@/lib/errors";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return err(new AppError("Unauthorized", 401));
    }

    const { id } = await params;
    const existing = await prisma.quizSession.findUnique({ where: { id } });

    if (!existing) {
      return err(new AppError("Session not found", 404));
    }
    if (existing.userId !== session.user.id) {
      return err(new AppError("Forbidden", 403));
    }

    const body = await request.json().catch(() => ({}));
    const { currentIndex, selectedAnswers, questions, timeRemaining } = body;

    const updated = await prisma.quizSession.update({
      where: { id },
      data: {
        ...(currentIndex !== undefined ? { currentIndex } : {}),
        ...(selectedAnswers !== undefined ? { selectedAnswers: JSON.stringify(selectedAnswers) } : {}),
        ...(questions !== undefined ? { questions: JSON.stringify(questions) } : {}),
        ...(timeRemaining !== undefined ? { timeRemaining } : {}),
        status: "paused",
      },
    });

    return ok({ id: updated.id });
  } catch (error) {
    return err(error);
  }
}

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
    const quizSession = await prisma.quizSession.findUnique({ where: { id } });

    if (!quizSession) {
      return err(new AppError("Session not found", 404));
    }

    if (quizSession.userId !== session.user.id) {
      return err(new AppError("Forbidden", 403));
    }

    return ok({
      id: quizSession.id,
      quizType: quizSession.quizType,
      categorySlug: quizSession.categorySlug,
      date: quizSession.date,
      currentIndex: quizSession.currentIndex,
      selectedAnswers: JSON.parse(quizSession.selectedAnswers) as Record<string, number>,
      questions: JSON.parse(quizSession.questions) as unknown[],
      timeRemaining: quizSession.timeRemaining,
      createdAt: quizSession.createdAt,
      updatedAt: quizSession.updatedAt,
    });
  } catch (error) {
    return err(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return err(new AppError("Unauthorized", 401));
    }

    const { id } = await params;
    const quizSession = await prisma.quizSession.findUnique({ where: { id } });

    if (!quizSession) {
      return err(new AppError("Session not found", 404));
    }

    if (quizSession.userId !== session.user.id) {
      return err(new AppError("Forbidden", 403));
    }

    await prisma.quizSession.delete({ where: { id } });

    return ok({ deleted: true });
  } catch (error) {
    return err(error);
  }
}
