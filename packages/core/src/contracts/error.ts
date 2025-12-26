import { z } from "zod";

export const AppErrorCodeSchema = z.string().min(1);

export type AppErrorCode = z.infer<typeof AppErrorCodeSchema>;

export const AppErrorDetailsSchema = z.record(z.string(), z.unknown());

export const AppErrorSchema = z
  .object({
    code: AppErrorCodeSchema,
    message: z.string().min(1),
    details: AppErrorDetailsSchema.optional(),
    retryable: z.boolean(),
    requestId: z.string().min(1)
  })
  .passthrough();

export type AppError = z.infer<typeof AppErrorSchema>;

export const KnownAppErrorCodeSchema = z.enum([
  "VALIDATION_ERROR",
  "AUTH_ERROR",
  "RATE_LIMITED",
  "UPSTREAM_TIMEOUT",
  "UPSTREAM_UNAVAILABLE",
  "CONTRACT_VIOLATION",
  "GUARDRAIL_BLOCKED",
  "CANCELLED"
]);

export type KnownAppErrorCode = z.infer<typeof KnownAppErrorCodeSchema>;

const appendRequestIdToMessage = (message: string, requestId: string): string => {
  if (message.includes("requestId=")) {
    return message;
  }
  return `${message} (requestId=${requestId})`;
};

const getDefaultMessageForCode = (code: AppErrorCode): string => {
  const known = KnownAppErrorCodeSchema.safeParse(code);
  if (!known.success) {
    return "Unknown error";
  }

  switch (known.data) {
    case "VALIDATION_ERROR":
      return "Validation failed";
    case "AUTH_ERROR":
      return "Authorization failed";
    case "RATE_LIMITED":
      return "Rate limited, please retry later";
    case "UPSTREAM_TIMEOUT":
      return "Upstream request timed out, please retry later";
    case "UPSTREAM_UNAVAILABLE":
      return "Upstream is unavailable, please retry later";
    case "CONTRACT_VIOLATION":
      return "Contract violation";
    case "GUARDRAIL_BLOCKED":
      return "Guardrail blocked the request";
    case "CANCELLED":
      return "Request cancelled";
    default:
      return "Unknown error";
  }
};

export const createAppError = (input: {
  code: AppErrorCode;
  message?: string;
  retryable: boolean;
  requestId: string;
  details?: Record<string, unknown>;
}): AppError => {
  const requestId = z.string().min(1).parse(input.requestId);
  const rawMessage = typeof input.message === "string" && input.message.trim().length > 0 ? input.message : getDefaultMessageForCode(input.code);
  const message = appendRequestIdToMessage(z.string().min(1).parse(rawMessage), requestId);

  return AppErrorSchema.parse({
    code: AppErrorCodeSchema.parse(input.code),
    message,
    retryable: z.boolean().parse(input.retryable),
    requestId,
    ...(input.details !== undefined ? { details: AppErrorDetailsSchema.parse(input.details) } : {})
  });
};

export const tryParseAppError = (value: unknown): AppError | undefined => {
  const parsed = AppErrorSchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
};

export const toAppError = (
  requestId: string,
  error: unknown,
  fallback?: { code: KnownAppErrorCode; message: string; retryable: boolean; details?: Record<string, unknown> }
): AppError => {
  const parsed = AppErrorSchema.safeParse(error);
  if (parsed.success) {
    const msg = appendRequestIdToMessage(parsed.data.message, parsed.data.requestId);
    if (msg === parsed.data.message) {
      return parsed.data;
    }
    return AppErrorSchema.parse({ ...parsed.data, message: msg });
  }

  const rid = z.string().min(1).parse(requestId);

  if (error instanceof z.ZodError) {
    return createAppError({
      code: "VALIDATION_ERROR",
      message: "Validation failed",
      retryable: false,
      requestId: rid,
      details: {
        issues: error.issues
      }
    });
  }

  const name =
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    typeof (error as { name?: unknown }).name === "string"
      ? ((error as { name: string }).name as string)
      : undefined;

  if (name === "AbortError") {
    return createAppError({
      code: "CANCELLED",
      message: "Request cancelled",
      retryable: true,
      requestId: rid
    });
  }

  const message = error instanceof Error ? error.message : typeof error === "string" ? error : String(error);

  return createAppError({
    code: fallback?.code ?? "UPSTREAM_UNAVAILABLE",
    message: fallback?.message ?? (message.length > 0 ? message : "Upstream error"),
    retryable: fallback?.retryable ?? false,
    requestId: rid,
    ...(fallback?.details !== undefined ? { details: fallback.details } : {})
  });
};
