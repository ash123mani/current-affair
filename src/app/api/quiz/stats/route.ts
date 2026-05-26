import { auth } from "@/lib/auth";
import { statsService } from "@/lib/services/stats.service";
import { ok, err } from "@/lib/api-response";
import { AppError } from "@/lib/errors";

/**
 * @openapi
 * /api/quiz/stats:
 *   get:
 *     tags: [Quiz]
 *     summary: Get dashboard statistics
 *     description: Returns overall quiz stats and per-category breakdown for the authenticated user.
 *     operationId: getDashboardStats
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardStats'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return err(new AppError("Unauthorized", 401));
    }

    const stats = await statsService.getDashboardStats(session.user.id);
    return ok(stats);
  } catch (error) {
    return err(error);
  }
}
