import { z } from "zod";

export const ProjectIdSchema = z.string().min(1).max(128);

export type ProjectId = z.infer<typeof ProjectIdSchema>;

export const ProjectSchema = z
  .object({
    id: ProjectIdSchema,
    tenantId: z.string().min(1),
    name: z.string().min(1),
    createdAt: z.string().min(1)
  })
  .passthrough();

export type Project = z.infer<typeof ProjectSchema>;
