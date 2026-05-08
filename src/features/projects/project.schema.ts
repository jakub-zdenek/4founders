import { z } from "zod";

export const projectCreateSchema = z.object({
  name: z.string().min(3).max(120),
  valueProposition: z.string().min(8).max(200),
  categoryId: z.string().cuid(),
  targetUser: z.string().min(5).max(200),
  productStage: z.string().min(2).max(60),
  githubRepoUrl: z.string().url(),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  contactInfo: z.string().max(300).optional(),
  privateTestCredentials: z.string().max(1000).optional(),
  problemStatement: z.string().min(20).max(2000),
  differentiationStatement: z.string().min(20).max(2000),
  preferredFeedbackFocus: z.string().min(10).max(600),
  visibilityMode: z.enum(["PUBLIC", "LIMITED", "PROTECTED", "EXPERT_ONLY"]),
  architectureSummary: z.string().max(2000).optional(),
  launchGoals: z.string().max(1000).optional(),
  knownWeaknesses: z.string().max(1000).optional(),
  privateReviewerNotes: z.string().max(1000).optional(),
  waitlistLink: z.string().url().optional().or(z.literal("")),
});

export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;
