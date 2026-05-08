import { z } from "zod";

export const createVersionSchema = z.object({
  projectId: z.string().cuid(),
  changelog: z.string().min(5).max(2000),
  launchGoals: z.string().max(1000).optional(),
  knownWeaknesses: z.string().max(1000).optional(),
  privateReviewerNotes: z.string().max(1000).optional(),
  waitlistLink: z.string().url().optional().or(z.literal("")),
});

export type CreateVersionInput = z.infer<typeof createVersionSchema>;
