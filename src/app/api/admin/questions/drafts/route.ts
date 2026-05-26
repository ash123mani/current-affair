import { requireAdmin } from "@/lib/require-admin";
import { questionRepository } from "@/lib/repositories/question.repository";
import { ok, err } from "@/lib/api-response";

/**
 * @openapi
 * /api/admin/questions/drafts:
 *   get:
 *     tags: [Admin]
 *     summary: List draft questions
 *     description: Returns all questions with `draft` status, newest first. Requires admin role.
 *     operationId: adminListDrafts
 *     security:
 *       - cookieAuth: []
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
export async function GET() {
  try {
    await requireAdmin();

    const drafts = await questionRepository.findDraftQuestions();
    return ok(drafts);
  } catch (error) {
    return err(error);
  }
}
