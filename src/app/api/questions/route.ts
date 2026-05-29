import { auth } from "@/lib/auth";
import { questionService } from "@/lib/services/question.service";
import { ok, err } from "@/lib/api-response";
import { AppError } from "@/lib/errors";
import { today } from "@/lib/date";
import { NextRequest } from "next/server";

/**
 * @openapi
 * /api/questions:
 *   get:
 *     tags: [Questions]
 *     summary: Get published questions for a category
 *     description: Returns published questions for a category and optional date. Defaults to today. Requires authentication.
 *     operationId: getQuestions
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: Category slug (e.g. politics, technology)
 *         example: politics
 *       - in: query
 *         name: date
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: Date in YYYY-MM-DD format (defaults to today)
 *         example: "2026-05-26"
 *     responses:
 *       200:
 *         description: Array of questions (options is a JSON string, parse client-side)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Question'
 *       400:
 *         description: Missing category parameter
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
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return err(new AppError("Unauthorized", 401));
    }

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
