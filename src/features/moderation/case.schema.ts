import { z } from "zod";

export const moderationCaseSchema = z.object({
  projectId: z.string().cuid().optional(),
  reviewId: z.string().cuid().optional(),
  reason: z.string().min(10),
});

export type ModerationCaseInput = z.infer<typeof moderationCaseSchema>;
