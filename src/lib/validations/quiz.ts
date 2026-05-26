import { z } from "zod";

export const submitAnswerSchema = z.object({
  questionId: z.string(),
  selectedIndex: z.number().int().min(0),
});

export const submitQuizSchema = z.object({
  category: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  answers: z.array(submitAnswerSchema).min(1, "At least one answer required"),
  retake: z.boolean().optional().default(false),
});

export type SubmitQuizInput = z.infer<typeof submitQuizSchema>;
