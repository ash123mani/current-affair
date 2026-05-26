import { auth } from "@/lib/auth";
import { quizService } from "@/lib/services/quiz.service";
import { submitQuizSchema } from "@/lib/validations/quiz";
import { ok, err } from "@/lib/api-response";
import { AppError, ValidationError } from "@/lib/errors";

/**
 * @openapi
 * /api/quiz/attempt:
 *   post:
 *     tags: [Quiz]
 *     summary: Submit a quiz attempt
 *     description: Submit answers for a quiz and get the result with per-question correctness. Requires authentication.
 *     operationId: submitAttempt
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubmitAttemptInput'
 *     responses:
 *       201:
 *         description: Quiz result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuizResult'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return err(new AppError("Unauthorized", 401));
    }

    const body = await request.json();
    const parsed = submitQuizSchema.safeParse(body);

    if (!parsed.success) {
      return err(new ValidationError(parsed.error.issues[0].message));
    }

    const { category, date, answers, retake } = parsed.data;

    const attempt = await quizService.submitAttempt(
      session.user.id,
      category,
      date,
      answers,
      retake
    );

    return ok(attempt, 201);
  } catch (error) {
    return err(error);
  }
}
