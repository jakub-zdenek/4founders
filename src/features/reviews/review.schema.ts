import { z } from "zod";

const dimensions = [
  "PROBLEM_CLARITY",
  "VALUE_PROPOSITION_CLARITY",
  "PRODUCT_USABILITY",
  "TECHNICAL_QUALITY",
  "DOCUMENTATION_QUALITY",
  "DIFFERENTIATION",
  "ADOPTION_READINESS",
  "LAUNCH_READINESS",
  "IMPROVEMENT_RESPONSIVENESS",
  "TRUST_AND_SAFETY_HYGIENE",
] as const;

export const createReviewSchema = z.object({
  projectId: z.string().cuid(),
  projectVersionId: z.string().cuid().optional(),
  confidenceLevel: z.enum(["LOW", "MEDIUM", "HIGH"]),
  whatWorks: z.string().min(20),
  whatIsWeak: z.string().min(20),
  whatIsUnclear: z.string().min(20),
  highestPriorityImprovement: z.string().min(20),
  scores: z
    .array(
      z.object({
        dimension: z.enum(dimensions),
        score: z.number().int().min(1).max(10),
        rationale: z.string().min(10),
      }),
    )
    .length(10),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
