import { requireAdmin } from "@/lib/require-admin";
import { populateService } from "@/lib/services/generator/populate.service";
import { ok, err } from "@/lib/api-response";
import { AppError, ValidationError } from "@/lib/errors";
import { populateRequestSchema } from "@/lib/validations/populate";
import { today } from "@/lib/date";
import { NextRequest } from "next/server";

/**
 * @openapi
 * /api/admin/populate:
 *   post:
 *     tags: [Admin - Populate]
 *     summary: Trigger question generation (admin)
 *     description: |-
 *       Manually trigger auto-population of questions from news articles.
 *       Generates questions for all categories (or a single category if specified).
 *       Questions are created with `draft` status.
 *       Requires admin role.
 *     operationId: adminPopulate
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Target date (defaults to today)
 *                 example: "2026-05-26"
 *               category:
 *                 type: string
 *                 description: Category slug for single category (defaults to all)
 *                 example: politics
 *     responses:
 *       200:
 *         description: Generation result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PopulateResult'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Forbidden — admin role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json().catch(() => ({}));
    const parsed = populateRequestSchema.safeParse(body);
    if (!parsed.success) {
      return err(new ValidationError("Invalid request body"));
    }

    const targetDate = parsed.data.date ?? today();
    const categorySlug = parsed.data.category;

    const result = categorySlug
      ? await populateService.populateSingleCategory(categorySlug, targetDate)
      : await populateService.populateForDate(targetDate);

    return ok({
      success: true,
      date: targetDate,
      category: categorySlug ?? "all",
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
