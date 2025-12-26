import { z } from "zod";

import { TemplateRefSchema } from "./template";

export const SessionIdSchema = z.string().min(1).max(128);

export type SessionId = z.infer<typeof SessionIdSchema>;

export const SessionSchema = z
  .object({
    id: SessionIdSchema,
    tenantId: z.string().min(1),
    projectId: z.string().min(1),
    taskId: z.string().min(1),
    templateRef: TemplateRefSchema,
    createdAt: z.string().min(1),
    state: z.record(z.string(), z.unknown()).optional(),
    messages: z.array(z.unknown()).optional()
  })
  .passthrough();

export type Session = z.infer<typeof SessionSchema>;
