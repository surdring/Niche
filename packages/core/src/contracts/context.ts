import { z } from "zod";

export const RequestContextSchema = z
  .object({
    requestId: z.string().min(1),
    tenantId: z.string().min(1),
    projectId: z.string().min(1).optional()
  })
  .passthrough();

export type RequestContext = z.infer<typeof RequestContextSchema>;
