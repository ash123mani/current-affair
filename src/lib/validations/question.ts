import { z } from "zod";

export const createQuestionSchema = z.object({
  categorySlug: z.string().min(1, "Category is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  text: z.string().min(1, "Question text is required"),
  options: z
    .array(z.string().min(1))
    .length(4, "Exactly 4 options required"),
  correctIndex: z.number().int().min(0).max(3),
  explanation: z.string().optional(),
  source: z.string().optional(),
});

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
