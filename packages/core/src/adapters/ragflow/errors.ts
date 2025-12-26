import { z } from "zod";

import { AppErrorSchema, type AppError, type KnownAppErrorCode } from "../../contracts/error";

export const createRagflowError = (
  code: KnownAppErrorCode,
  requestId: string,
  message: string,
  options?: { retryable: boolean; details?: Record<string, unknown> }
): AppError => {
  return AppErrorSchema.parse({
    code,
    message: `${message} (requestId=${requestId})`,
    retryable: options?.retryable ?? false,
    requestId,
    ...(options?.details !== undefined ? { details: z.record(z.string(), z.unknown()).parse(options.details) } : {})
  });
};

export const createRagflowAuthError = (
  requestId: string,
  message: string,
  details?: Record<string, unknown>
): AppError => {
  return createRagflowError("AUTH_ERROR", requestId, message, { retryable: false, ...(details ? { details } : {}) });
};

export const createRagflowUpstreamTimeoutError = (
  requestId: string,
  message: string,
  details?: Record<string, unknown>
): AppError => {
  return createRagflowError("UPSTREAM_TIMEOUT", requestId, message, {
    retryable: true,
    ...(details ? { details } : {})
  });
};

export const createRagflowUpstreamUnavailableError = (
  requestId: string,
  message: string,
  details?: Record<string, unknown>
): AppError => {
  return createRagflowError("UPSTREAM_UNAVAILABLE", requestId, message, {
    retryable: true,
    ...(details ? { details } : {})
  });
};

export const createRagflowContractViolationError = (
  requestId: string,
  message: string,
  details?: Record<string, unknown>
): AppError => {
  return createRagflowError("CONTRACT_VIOLATION", requestId, message, {
    retryable: false,
    ...(details ? { details } : {})
  });
};
