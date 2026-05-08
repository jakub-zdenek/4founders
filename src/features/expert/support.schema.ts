import { z } from "zod";

export const expertSupportSchema = z.object({
  projectId: z.string().cuid(),
  requestNote: z.string().min(20),
  founderDisclosure: z.string().max(2000).optional(),
});

export type ExpertSupportInput = z.infer<typeof expertSupportSchema>;
