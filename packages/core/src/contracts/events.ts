import { z } from "zod";

import { AppErrorSchema } from "./error";

export const StepEventTypeSchema = z.enum([
  "step_started",
  "step_progress",
  "tool_called",
  "tool_result",
  "step_completed",
  "step_failed"
]);

export type StepEventType = z.infer<typeof StepEventTypeSchema>;

export const StepEventTimestampSchema = z.string().datetime();

export type StepEventTimestamp = z.infer<typeof StepEventTimestampSchema>;

export const StepStartedPayloadSchema = z.object({}).passthrough();

export type StepStartedPayload = z.infer<typeof StepStartedPayloadSchema>;

export const StepProgressPayloadSchema = z
  .object({
    message: z.string().min(1).optional(),
    progress: z.number().min(0).max(1).optional()
  })
  .passthrough();

export type StepProgressPayload = z.infer<typeof StepProgressPayloadSchema>;

export const ToolCalledPayloadSchema = z
  .object({
    toolName: z.string().min(1),
    argsSummary: z.string().min(1)
  })
  .passthrough();

export type ToolCalledPayload = z.infer<typeof ToolCalledPayloadSchema>;

export const ToolResultPayloadSchema = z
  .object({
    toolName: z.string().min(1),
    resultSummary: z.string().min(1).optional()
  })
  .passthrough();

export type ToolResultPayload = z.infer<typeof ToolResultPayloadSchema>;

export const StepCompletedPayloadSchema = z
  .object({
    outputSummary: z.string().min(1).optional()
  })
  .passthrough();

export type StepCompletedPayload = z.infer<typeof StepCompletedPayloadSchema>;

export const StepFailedPayloadSchema = z
  .object({
    error: AppErrorSchema
  })
  .passthrough();

export type StepFailedPayload = z.infer<typeof StepFailedPayloadSchema>;

const StepEventCommonSchema = {
  schemaVersion: z.string().min(1).optional(),
  taskId: z.string().min(1),
  stepId: z.string().min(1),
  stepName: z.string().min(1),
  timestamp: StepEventTimestampSchema,
  requestId: z.string().min(1)
};

export const StepEventSchema = z.discriminatedUnion("type", [
  z
    .object({
      type: z.literal("step_started"),
      ...StepEventCommonSchema,
      payload: StepStartedPayloadSchema
    })
    .passthrough(),
  z
    .object({
      type: z.literal("step_progress"),
      ...StepEventCommonSchema,
      payload: StepProgressPayloadSchema
    })
    .passthrough(),
  z
    .object({
      type: z.literal("tool_called"),
      ...StepEventCommonSchema,
      payload: ToolCalledPayloadSchema
    })
    .passthrough(),
  z
    .object({
      type: z.literal("tool_result"),
      ...StepEventCommonSchema,
      payload: ToolResultPayloadSchema
    })
    .passthrough(),
  z
    .object({
      type: z.literal("step_completed"),
      ...StepEventCommonSchema,
      payload: StepCompletedPayloadSchema
    })
    .passthrough(),
  z
    .object({
      type: z.literal("step_failed"),
      ...StepEventCommonSchema,
      payload: StepFailedPayloadSchema
    })
    .passthrough()
]);

export type StepEvent = z.infer<typeof StepEventSchema>;

export const SecurityEventTypeSchema = z.enum(["guardrail_blocked"]);

export type SecurityEventType = z.infer<typeof SecurityEventTypeSchema>;

export const SecurityEventSchema = z.discriminatedUnion("type", [
  z
    .object({
      type: z.literal("guardrail_blocked"),
      schemaVersion: z.string().min(1).optional(),
      timestamp: StepEventTimestampSchema,
      requestId: z.string().min(1),
      tenantId: z.string().min(1).optional(),
      projectId: z.string().min(1).optional(),
      taskId: z.string().min(1).optional(),
      stepId: z.string().min(1).optional(),
      stepName: z.string().min(1).optional(),
      payload: z
        .object({
          stage: z.enum(["input", "tool_call", "output"]),
          reason: z.string().min(1),
          contentLength: z.number().int().nonnegative()
        })
        .passthrough()
    })
    .passthrough()
]);

export type SecurityEvent = z.infer<typeof SecurityEventSchema>;

export type RedactSecretsOptions = {
  keyPatterns?: readonly RegExp[];
};

const defaultKeyPatterns: readonly RegExp[] = [
  /token/i,
  /secret/i,
  /password/i,
  /api[_-]?key/i,
  /authorization/i,
  /cookie/i
];

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
};

export const redactSecrets = (value: unknown, options?: RedactSecretsOptions): unknown => {
  const patterns = options?.keyPatterns ?? defaultKeyPatterns;

  if (Array.isArray(value)) {
    return value.map((item) => redactSecrets(item, options));
  }

  if (isPlainObject(value)) {
    const result: Record<string, unknown> = {};

    for (const [key, rawVal] of Object.entries(value)) {
      const shouldRedact = patterns.some((p) => p.test(key));
      result[key] = shouldRedact ? "[REDACTED]" : redactSecrets(rawVal, options);
    }

    return result;
  }

  return value;
};

export type CreateArgsSummaryOptions = {
  maxLen?: number;
  redact?: RedactSecretsOptions;
};

export const createToolArgsSummary = (args: unknown, options?: CreateArgsSummaryOptions): string => {
  const redacted = redactSecrets(args, options?.redact);
  const maxLen = options?.maxLen ?? 1024;

  let json: string;
  try {
    json = JSON.stringify(redacted);
  } catch {
    json = "\"[Unserializable]\"";
  }

  if (json.length <= maxLen) {
    return json;
  }

  return `${json.slice(0, maxLen)}...`;
};
