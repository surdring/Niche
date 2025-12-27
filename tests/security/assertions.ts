import { expect } from "vitest";
import { z } from "zod";

import { SecurityEventSchema, type AppError, type SecurityEvent } from "@niche/core";

export const assertAppErrorBasics = (error: AppError, expected: { code: string; requestId: string; retryable: boolean }): void => {
  expect(error.code).toBe(expected.code);
  expect(error.retryable).toBe(expected.retryable);
  expect(error.requestId).toBe(expected.requestId);
  expect(error.message.includes(`requestId=${expected.requestId}`)).toBe(true);
};

export const assertGuardrailBlocked = (error: AppError, expected: { requestId: string }): void => {
  assertAppErrorBasics(error, { code: "GUARDRAIL_BLOCKED", requestId: expected.requestId, retryable: false });
};

export const assertContractViolation = (error: AppError, expected: { requestId: string }): void => {
  assertAppErrorBasics(error, { code: "CONTRACT_VIOLATION", requestId: expected.requestId, retryable: false });
};

export const assertSecurityEventGuardrailBlocked = (
  event: SecurityEvent,
  expected: { requestId: string; stage: "input" | "tool_call" | "output"; reason: string }
): void => {
  const parsed = SecurityEventSchema.parse(event);
  expect(parsed.type).toBe("guardrail_blocked");
  expect(parsed.requestId).toBe(expected.requestId);
  expect(parsed.payload.stage).toBe(expected.stage);
  expect(parsed.payload.reason).toBe(expected.reason);
  expect(parsed.payload.contentLength).toBeGreaterThanOrEqual(0);
};

export const DetailsReasonSchema = z.object({ reason: z.string().min(1) }).passthrough();
