import { z } from "zod";

export const populateRequestSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  category: z.string().min(1).optional(),
});

export type PopulateRequest = z.infer<typeof populateRequestSchema>;
