import { z } from "zod";

import { AppErrorSchema, type AppError } from "@niche/core/contracts";

import { createContractViolationError, readRequestIdFromResponse } from "../errors";

export const GraphqlErrorSchema = z
  .object({
    message: z.string().min(1),
    extensions: z
      .object({
        appError: AppErrorSchema.optional()
      })
      .passthrough()
      .optional()
  })
  .passthrough();

export const GraphqlErrorsSchema = z.array(GraphqlErrorSchema).min(1);

export type RequestContextHeaders = {
  requestId?: string;
  tenantId: string;
  projectId?: string;
  taskId?: string;
  sessionId?: string;
};

export const RequestContextHeadersSchema = z
  .object({
    requestId: z.string().min(1).optional(),
    tenantId: z.string().min(1),
    projectId: z.string().min(1).optional(),
    taskId: z.string().min(1).optional(),
    sessionId: z.string().min(1).optional()
  })
  .strict();

export const toObservabilityHeaders = (ctx: RequestContextHeaders): Record<string, string> => {
  const parsed = RequestContextHeadersSchema.parse(ctx);
  const headers: Record<string, string> = {
    "x-tenant-id": parsed.tenantId
  };

  if (parsed.requestId !== undefined) {
    headers["x-request-id"] = parsed.requestId;
  }
  if (parsed.projectId !== undefined) {
    headers["x-project-id"] = parsed.projectId;
  }
  if (parsed.taskId !== undefined) {
    headers["x-task-id"] = parsed.taskId;
  }
  if (parsed.sessionId !== undefined) {
    headers["x-session-id"] = parsed.sessionId;
  }

  return headers;
};

export const parseJsonOrThrow = async (res: Response): Promise<unknown> => {
  const text = await res.text();
  if (text.trim().length === 0) {
    return undefined;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw createContractViolationError("Response body is not valid JSON", readRequestIdFromResponse(res), text);
  }
};

export const parseAppErrorResponse = async (res: Response): Promise<AppError | undefined> => {
  const requestId = readRequestIdFromResponse(res);

  const json = await parseJsonOrThrow(res);
  const parsed = AppErrorSchema.safeParse(json);
  if (parsed.success) {
    return parsed.data;
  }

  if (typeof json === "object" && json !== null) {
    const obj = json as Record<string, unknown>;
    const errors = obj["errors"];
    if (errors !== undefined) {
      const parsedErrors = GraphqlErrorsSchema.safeParse(errors);
      if (!parsedErrors.success) {
        throw createContractViolationError("GraphQL errors do not match contract", requestId, parsedErrors.error);
      }

      const message = parsedErrors.data
        .map((e) => e.message)
        .filter((m) => m.length > 0)
        .join("; ");

      const structured = parsedErrors.data
        .map((e) => e.extensions?.appError)
        .find((e) => e !== undefined);

      if (structured !== undefined) {
        return AppErrorSchema.parse({
          ...structured,
          requestId: structured.requestId ?? requestId ?? "unknown"
        });
      }

      return AppErrorSchema.parse({
        code: "UPSTREAM_UNAVAILABLE",
        message: message.length > 0 ? message : "GraphQL returned errors",
        retryable: true,
        requestId: requestId ?? "unknown",
        details: {
          graphqlErrors: parsedErrors.data
        }
      });
    }
  }

  return undefined;
};
