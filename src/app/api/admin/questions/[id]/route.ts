import { requireAdmin } from "@/lib/require-admin";
import { questionRepository } from "@/lib/repositories/question.repository";
import { createQuestionSchema } from "@/lib/validations/question";
import { ok, err } from "@/lib/api-response";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { NextRequest } from "next/server";

/**
 * @openapi
 * /api/admin/questions/{id}:
 *   put:
 *     tags: [Admin]
 *     summary: Update a question (admin)
 *     operationId: adminUpdateQuestion
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateQuestionInput'
 *     responses:
 *       200:
 *         description: Updated question
 *       404:
 *         description: Question not found
 *   delete:
 *     tags: [Admin]
 *     summary: Delete a question (admin)
 *     operationId: adminDeleteQuestion
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Deleted successfully
 *       404:
 *         description: Question not found
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const existing = await questionRepository.findById(id);
    if (!existing) {
      return err(new NotFoundError("Question"));
    }

    const body = await request.json();
    const parsed = createQuestionSchema.partial().safeParse(body);
    if (!parsed.success) {
      return err(new ValidationError(parsed.error.issues[0].message));
    }

    const updateData: Record<string, unknown> = {};
    if (parsed.data.text !== undefined) updateData.text = parsed.data.text;
    if (parsed.data.options !== undefined) updateData.options = JSON.stringify(parsed.data.options);
    if (parsed.data.correctIndex !== undefined) updateData.correctIndex = parsed.data.correctIndex;
    if (parsed.data.explanation !== undefined) updateData.explanation = parsed.data.explanation;
    if (parsed.data.source !== undefined) updateData.source = parsed.data.source;
    if (parsed.data.date !== undefined) updateData.date = parsed.data.date;

    const updated = await questionRepository.update(id, updateData);
    return ok(updated);
  } catch (error) {
    return err(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const existing = await questionRepository.findById(id);
    if (!existing) {
      return err(new NotFoundError("Question"));
    }

    await questionRepository.deleteById(id);
    return ok({ success: true });
  } catch (error) {
    return err(error);
  }
}
