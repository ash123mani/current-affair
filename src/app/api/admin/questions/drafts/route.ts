import { requireAdmin } from "@/lib/require-admin";
import { questionRepository } from "@/lib/repositories/question.repository";
import { ok, err } from "@/lib/api-response";
import { NextRequest } from "next/server";

/**
 * @openapi
 * /api/admin/questions/drafts:
 *   get:
 *     tags: [Admin]
 *     summary: List draft questions
 *     description: Returns all questions with `draft` status, newest first. Optionally filtered by date. Requires admin role.
 *     operationId: adminListDrafts
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: List of draft questions with category info
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AdminQuestion'
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
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    const drafts = await questionRepository.findDraftQuestions(date ?? undefined);
    return ok(drafts);
  } catch (error) {
    return err(error);
  }
}
