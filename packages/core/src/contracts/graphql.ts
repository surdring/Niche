import { z } from "zod";

import { TaskStatusSchema } from "./task";
import { TemplateRefSchema } from "./template";
import { AppErrorSchema } from "./error";

const NullableStringSchema = z.preprocess(
  (v: unknown) => (v === null ? undefined : v),
  z.string().min(1).optional()
);

export const GraphqlTemplateSchema = z
  .object({
    id: z.string().min(1),
    version: z.string().min(1),
    name: z.string().min(1),
    description: NullableStringSchema
  })
  .passthrough();

export type GraphqlTemplate = z.infer<typeof GraphqlTemplateSchema>;

export const GraphqlTemplateRefSchema = z
  .object({
    templateId: NullableStringSchema,
    templateVersion: NullableStringSchema,
    templateDefinitionHash: NullableStringSchema
  })
  .passthrough()
  .transform((val) => {
    return TemplateRefSchema.parse(val);
  });

export type GraphqlTemplateRef = z.infer<typeof GraphqlTemplateRefSchema>;

export const GraphqlTaskSchema = z
  .object({
    id: z.string().min(1),
    projectId: z.string().min(1),
    sessionId: z.string().min(1),
    templateRef: GraphqlTemplateRefSchema,
    status: TaskStatusSchema,
    createdAt: z.string().min(1),
    updatedAt: z.string().min(1)
  })
  .passthrough();

export type GraphqlTask = z.infer<typeof GraphqlTaskSchema>;

export const GraphqlSessionSchema = z
  .object({
    id: z.string().min(1),
    taskId: z.string().min(1),
    templateRef: GraphqlTemplateRefSchema,
    createdAt: z.string().min(1)
  })
  .passthrough();

export type GraphqlSession = z.infer<typeof GraphqlSessionSchema>;

export const GraphqlCreateTaskPayloadSchema = z
  .object({
    taskId: z.string().min(1),
    task: GraphqlTaskSchema,
    session: GraphqlSessionSchema
  })
  .passthrough();

export type GraphqlCreateTaskPayload = z.infer<typeof GraphqlCreateTaskPayloadSchema>;

export const GraphqlErrorSchema = z
  .object({
    message: z.string().min(1),
    path: z.array(z.union([z.string(), z.number()])).optional(),
    extensions: z
      .object({
        appError: AppErrorSchema.optional()
      })
      .passthrough()
      .optional()
  })
  .passthrough();

export type GraphqlError = z.infer<typeof GraphqlErrorSchema>;

export const GraphqlTemplatesResponseSchema = z
  .object({
    data: z
      .object({
        templates: z.array(GraphqlTemplateSchema)
      })
      .passthrough(),
    errors: z.array(GraphqlErrorSchema).optional()
  })
  .passthrough();

export type GraphqlTemplatesResponse = z.infer<typeof GraphqlTemplatesResponseSchema>;

export const GraphqlCreateTaskResponseSchema = z
  .object({
    data: z
      .object({
        createTask: GraphqlCreateTaskPayloadSchema
      })
      .passthrough(),
    errors: z.array(GraphqlErrorSchema).optional()
  })
  .passthrough();

export type GraphqlCreateTaskResponse = z.infer<typeof GraphqlCreateTaskResponseSchema>;

export const GraphqlCancelTaskResponseSchema = z
  .object({
    data: z
      .object({
        cancelTask: GraphqlTaskSchema
      })
      .passthrough(),
    errors: z.array(GraphqlErrorSchema).optional()
  })
  .passthrough();

export type GraphqlCancelTaskResponse = z.infer<typeof GraphqlCancelTaskResponseSchema>;
