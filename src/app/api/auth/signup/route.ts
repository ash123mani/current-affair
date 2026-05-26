import { userRepository } from "@/lib/repositories/user.repository";
import { signupSchema } from "@/lib/validations/auth";
import { ConflictError, ValidationError } from "@/lib/errors";
import { ok, err } from "@/lib/api-response";
import bcrypt from "bcryptjs";

/**
 * @openapi
 * /api/auth/signup:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     description: Creates a new user account with name, email, and password. Password is hashed with bcrypt (12 rounds).
 *     operationId: signup
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupInput'
 *     responses:
 *       201:
 *         description: Account created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       409:
 *         description: Email already registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return err(new ValidationError(parsed.error.issues[0].message));
    }

    const { name, email, password } = parsed.data;

    const existing = await userRepository.findByEmail(email);
    if (existing) {
      return err(new ConflictError("Email already registered"));
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await userRepository.create({ name, email, passwordHash });

    return ok({ success: true }, 201);
  } catch (error) {
    return err(error);
  }
}
