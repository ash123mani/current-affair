import { requireAdmin } from "@/lib/require-admin";
import { questionRepository } from "@/lib/repositories/question.repository";
import { categoryRepository } from "@/lib/repositories/category.repository";
import { createQuestionSchema } from "@/lib/validations/question";
import { ok, err } from "@/lib/api-response";
import { AppError, NotFoundError, ValidationError } from "@/lib/errors";
import type { Prisma } from "@/generated/prisma/client";
import { NextRequest } from "next/server";

/**
 * @openapi
 * /api/admin/questions:
 *   get:
 *     tags: [Admin]
 *     summary: List questions (admin)
 *     description: Returns all questions with optional category filter. Includes questions of all statuses. Requires admin role.
 *     operationId: adminListQuestions
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter by category slug
 *     responses:
 *       200:
 *         description: List of all questions with category info
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
 *   post:
 *     tags: [Admin]
 *     summary: Create a question (admin)
 *     description: Manually create a new quiz question. Requires admin role.
 *     operationId: adminCreateQuestion
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateQuestionInput'
 *     responses:
 *       201:
 *         description: Created question
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminQuestion'
 *       400:
 *         description: Validation error
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
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const date = searchParams.get("date");

    const where: Prisma.QuestionWhereInput = {};
    if (category) {
      const cat = await categoryRepository.findBySlug(category);
      if (cat) where.categoryId = cat.id;
    }
    if (date) {
      where.date = date;
    }

    const questions = await questionRepository.findWithCategory(where);
    return ok(questions);
  } catch (error) {
    return err(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const parsed = createQuestionSchema.safeParse(body);

    if (!parsed.success) {
      return err(new ValidationError(parsed.error.issues[0].message));
    }

    const { categorySlug, date, text, options, correctIndex, explanation, source } =
      parsed.data;

    const category = await categoryRepository.findBySlug(categorySlug);
    if (!category) {
      return err(new NotFoundError("Category"));
    }

    const question = await questionRepository.create({
      categoryId: category.id,
      date,
      text,
      options: JSON.stringify(options),
      correctIndex,
      explanation,
      source,
    });

    return ok(question, 201);
  } catch (error) {
    return err(error);
  }
}
