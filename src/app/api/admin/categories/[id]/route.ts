import { requireAdmin } from "@/lib/require-admin";
import { categoryRepository } from "@/lib/repositories/category.repository";
import { ok, err } from "@/lib/api-response";
import { NotFoundError, ValidationError, ConflictError } from "@/lib/errors";
import { NextRequest } from "next/server";

/**
 * @openapi
 * /api/admin/categories/{id}:
 *   put:
 *     tags: [Admin]
 *     summary: Update a category (admin)
 *     operationId: adminUpdateCategory
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Updated category
 *       404:
 *         description: Category not found
 *   delete:
 *     tags: [Admin]
 *     summary: Delete a category (admin)
 *     operationId: adminDeleteCategory
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Deleted successfully
 *       404:
 *         description: Category not found
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    const existing = await categoryRepository.findById(id);
    if (!existing) {
      return err(new NotFoundError("Category"));
    }

    if (body.slug && body.slug !== existing.slug) {
      const slugExists = await categoryRepository.findBySlug(body.slug);
      if (slugExists) {
        return err(new ConflictError("Category with this slug already exists"));
      }
    }

    const updated = await categoryRepository.update(id, body);
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

    const existing = await categoryRepository.findById(id);
    if (!existing) {
      return err(new NotFoundError("Category"));
    }

    await categoryRepository.deleteById(id);
    return ok({ success: true });
  } catch (error) {
    return err(error);
  }
}
