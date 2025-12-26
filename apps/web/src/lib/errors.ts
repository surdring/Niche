import { z } from "zod";

import { AppErrorSchema, type AppError } from "@niche/core/contracts";

export type ApiError =
  | { kind: "app_error"; error: AppError }
  | { kind: "http_error"; status: number; message: string; requestId?: string }
  | { kind: "contract_violation"; message: string; requestId?: string; cause?: unknown };

export const toSingleHeaderValue = (value: unknown): string | undefined => {
  if (typeof value === "string" && value.length > 0) {
    return value;
  }
  if (Array.isArray(value)) {
    const first = value[0];
    if (typeof first === "string" && first.length > 0) {
      return first;
    }
  }
  return undefined;
};

export const createContractViolationError = (message: string, requestId?: string, cause?: unknown): AppError => {
  const details: Record<string, unknown> | undefined =
    cause === undefined
      ? undefined
      : cause instanceof z.ZodError
        ? { issues: cause.issues }
        : cause instanceof Error
          ? { causeMessage: cause.message }
          : { cause };

  return AppErrorSchema.parse({
    code: "CONTRACT_VIOLATION",
    message,
    retryable: false,
    requestId: requestId ?? "unknown",
    ...(details !== undefined ? { details } : {})
  });
};

export const tryParseAppError = (value: unknown): AppError | undefined => {
  const parsed = AppErrorSchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
};

export const readRequestIdFromResponse = (res: Response): string | undefined => {
  const raw = res.headers.get("x-request-id");
  return typeof raw === "string" && raw.length > 0 ? raw : undefined;
};
