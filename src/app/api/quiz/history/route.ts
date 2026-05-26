import { auth } from "@/lib/auth";
import { statsService } from "@/lib/services/stats.service";
import { ok, err } from "@/lib/api-response";
import { AppError } from "@/lib/errors";
import { NextRequest } from "next/server";

/**
 * @openapi
 * /api/quiz/history:
 *   get:
 *     tags: [Quiz]
 *     summary: Get quiz attempt history
 *     description: Returns paginated quiz attempt history for the authenticated user, ordered by most recent first.
 *     operationId: getQuizHistory
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number
 *         example: 1
 *       - in: query
 *         name: category
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter by category slug
 *         example: politics
 *     responses:
 *       200:
 *         description: Paginated quiz attempts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedAttempts'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return err(new AppError("Unauthorized", 401));
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") ?? undefined;
    const page = parseInt(searchParams.get("page") ?? "1");

    const result = await statsService.getHistory(session.user.id, page, category);
    return ok(result);
  } catch (error) {
    return err(error);
  }
}
