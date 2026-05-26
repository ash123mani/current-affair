import { categoryRepository } from "@/lib/repositories/category.repository";
import { ok } from "@/lib/api-response";

/**
 * @openapi
 * /api/categories:
 *   get:
 *     tags: [Categories]
 *     summary: List all categories
 *     description: Returns all available quiz categories with icons and colors.
 *     operationId: listCategories
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 */
export async function GET() {
  const categories = await categoryRepository.findAll();
  return ok(categories);
}
