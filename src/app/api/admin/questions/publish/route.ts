import { requireAdmin } from "@/lib/require-admin";
import { questionRepository, QUESTION_STATUS } from "@/lib/repositories/question.repository";
import { ok, err } from "@/lib/api-response";
import { AppError } from "@/lib/errors";
import { NextRequest } from "next/server";

/**
 * @openapi
 * /api/admin/questions/publish:
 *   post:
 *     tags: [Admin]
 *     summary: Publish or unpublish a question
 *     description: Change question status between `published` and `draft`. Requires admin role.
 *     operationId: adminPublishQuestion
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id, action]
 *             properties:
 *               id:
 *                 type: string
 *                 description: Question ID
 *               action:
 *                 type: string
 *                 enum: [publish, draft]
 *                 description: Target status
 *     responses:
 *       200:
 *         description: Updated question
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminQuestion'
 *       400:
 *         description: Missing id or action
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
 *       403:
 *         description: Forbidden — admin role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *   delete:
 *     tags: [Admin]
 *     summary: Delete a question
 *     description: Permanently delete a question. Requires admin role.
 *     operationId: adminDeleteQuestion
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id]
 *             properties:
 *               id:
 *                 type: string
 *                 description: Question ID
 *     responses:
 *       200:
 *         description: Deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Missing id
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

    const { id, action } = await request.json();

    if (!id || !action) {
      return err(new AppError("id and action are required", 400));
    }

    if (action === "publish") {
      const updated = await questionRepository.updateStatus(id, QUESTION_STATUS.PUBLISHED);
      return ok(updated);
    }

    if (action === "draft") {
      const updated = await questionRepository.updateStatus(id, QUESTION_STATUS.DRAFT);
      return ok(updated);
    }

    return err(new AppError(`Unknown action: ${action}`, 400));
  } catch (error) {
    return err(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();

    const { id } = await request.json();

    if (!id) {
      return err(new AppError("id is required", 400));
    }

    await questionRepository.deleteById(id);
    return ok({ success: true });
  } catch (error) {
    return err(error);
  }
}
