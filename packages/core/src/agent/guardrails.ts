import { createAppError, type AppError } from "../contracts/error";
import type { RequestContext } from "../contracts/context";

export type GuardrailsStage = "input" | "tool_call" | "output";

export type GuardrailsDecision =
  | {
      action: "allow";
    }
  | {
      action: "block";
      reason: string;
    };

export type GuardrailsHookInput = {
  stage: GuardrailsStage;
  content: string;
};

export type GuardrailsHook<TContext extends RequestContext> = (
  ctx: TContext,
  input: GuardrailsHookInput
) => Promise<GuardrailsDecision>;

export const createGuardrailBlockedError = (requestId: string, reason: string): AppError => {
  return createAppError({
    code: "GUARDRAIL_BLOCKED",
    message: "Guardrail blocked the request",
    retryable: false,
    requestId,
    details: {
      reason
    }
  });
};
