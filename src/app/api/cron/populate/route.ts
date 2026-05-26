import { populateService } from "@/lib/services/generator/populate.service";
import { ok, err } from "@/lib/api-response";
import { AppError } from "@/lib/errors";
import { today } from "@/lib/date";

/**
 * @openapi
 * /api/cron/populate:
 *   get:
 *     tags: [Cron]
 *     summary: Scheduled question generation (cron)
 *     description: |-
 *       Cron endpoint for daily auto-population of questions.
 *       Generates questions for all categories for today's date.
 *       Requires CRON_SECRET environment variable to be configured.
 *     operationId: cronPopulate
 *     responses:
 *       200:
 *         description: Generation result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PopulateResult'
 *       500:
 *         description: CRON_SECRET not configured on server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
export async function GET() {
  try {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      return err(new AppError("CRON_SECRET not configured", 500));
    }

    const date = today();
    const result = await populateService.populateForDate(date);

    return ok({
      success: true,
      date,
      totalGenerated: result.totalGenerated,
      details: result.categoryResults.map((r) => ({
        category: r.categoryName,
        questions: r.questionsGenerated,
        errors: r.errors.length > 0 ? r.errors : undefined,
      })),
      errors: result.errors.length > 0 ? result.errors : undefined,
    });
  } catch (error) {
    return err(error);
  }
}
