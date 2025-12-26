import { z } from "zod";

import { TemplateRefSchema } from "./template";

export const TaskIdSchema = z.string().min(1).max(128);

export type TaskId = z.infer<typeof TaskIdSchema>;

export const TaskStatusSchema = z.enum(["created", "running", "cancelled", "completed", "failed"]);

export type TaskStatus = z.infer<typeof TaskStatusSchema>;

export const TaskSchema = z
  .object({
    id: TaskIdSchema,
    tenantId: z.string().min(1),
    projectId: z.string().min(1),
    sessionId: z.string().min(1),
    templateRef: TemplateRefSchema,
    status: TaskStatusSchema,
    createdAt: z.string().min(1),
    updatedAt: z.string().min(1)
  })
  .passthrough();

export type Task = z.infer<typeof TaskSchema>;
