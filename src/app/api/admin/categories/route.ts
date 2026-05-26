import { requireAdmin } from "@/lib/require-admin";
import { categoryRepository } from "@/lib/repositories/category.repository";
import { ok, created, err } from "@/lib/api-response";
import { AppError, ConflictError, ValidationError } from "@/lib/errors";
import { NextRequest } from "next/server";

/**
 * @openapi
 * /api/admin/categories:
 *   get:
 *     tags: [Admin]
 *     summary: List all categories (admin)
 *     operationId: adminListCategories
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *   post:
 *     tags: [Admin]
 *     summary: Create a category (admin)
 *     operationId: adminCreateCategory
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               icon:
 *                 type: string
 *               color:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created category
 *       400:
 *         description: Validation error
 */
export async function GET() {
  try {
    await requireAdmin();
    const categories = await categoryRepository.findAll();
    return ok(categories);
  } catch (error) {
    return err(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const { name, slug, icon, color } = await request.json();

    if (!name || !slug) {
      return err(new ValidationError("Name and slug are required"));
    }

    const existing = await categoryRepository.findBySlug(slug);
    if (existing) {
      return err(new ConflictError("Category with this slug already exists"));
    }

    const category = await categoryRepository.create({
      name,
      slug,
      icon: icon ?? "📁",
      color: color ?? "#666",
    });

    return created(category);
  } catch (error) {
    return err(error);
  }
}
