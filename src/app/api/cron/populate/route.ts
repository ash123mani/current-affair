import { populateService } from "@/lib/services/generator/populate.service";
import { ok, err } from "@/lib/api-response";
import { AppError } from "@/lib/errors";
import { today } from "@/lib/date";
import { NextRequest } from "next/server";

function verifyCronSecret(request: NextRequest) {
  const envSecret = process.env.CRON_SECRET;
  if (!envSecret) {
    return false;
  }

  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (token === envSecret) {
    return true;
  }

  const bodySecret = request.headers.get("x-cron-secret");
  if (bodySecret === envSecret) {
    return true;
  }

  return false;
}

async function handlePopulate(date: string) {
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
}

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
export async function GET(request: NextRequest) {
  try {
    if (!verifyCronSecret(request)) {
      return err(new AppError("Unauthorized", 401));
    }

    return await handlePopulate(today());
  } catch (error) {
    return err(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!verifyCronSecret(request)) {
      return err(new AppError("Unauthorized", 401));
    }

    const body = await request.json().catch(() => ({}));
    const date = (body as { date?: string }).date ?? today();

    return await handlePopulate(date);
  } catch (error) {
    return err(error);
  }
}
