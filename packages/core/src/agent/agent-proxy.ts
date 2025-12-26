import { z } from "zod";

import { SecurityEventSchema, StepEventSchema, type SecurityEvent, type StepEvent } from "../contracts/events";
import { createAppError, type AppError } from "../contracts/error";
import type { RequestContext } from "../contracts/context";
import type { Citation } from "../contracts/citation";

import type { GuardrailsHook } from "./guardrails";
import { createGuardrailBlockedError } from "./guardrails";
import type { EvidenceProvider } from "./evidence";
import { verifyCitations } from "./evidence";
import type { LanguageModel } from "./language-model";
import { generateObjectWithRetries } from "./structured-output";
import type { RuntimeConfig } from "./runtime-config";

export type AgentProxyEventSink = (event: StepEvent) => void;

export type AgentProxySecurityEventSink = (event: SecurityEvent) => void;

export type AgentProxyInput = {
  userInput: string;
};

export type AgentProxyOutput<T> = {
  text: string;
  object?: T;
  citations?: readonly Citation[];
};

export type RunAgentProxyOptions<TContext extends RequestContext> = {
  guardrails?: GuardrailsHook<TContext>;
  evidenceProvider?: EvidenceProvider<TContext>;
  eventSink?: AgentProxyEventSink;
  securityEventSink?: AgentProxySecurityEventSink;
};

const emit = (sink: AgentProxyEventSink | undefined, event: StepEvent): void => {
  if (sink === undefined) {
    return;
  }
  sink(event);
};

const emitSecurity = (sink: AgentProxySecurityEventSink | undefined, event: SecurityEvent): void => {
  if (sink === undefined) {
    return;
  }
  sink(event);
};

const nowIso = (): string => new Date().toISOString();

const createStepError = (requestId: string, message: string): AppError => {
  return createAppError({
    code: "UPSTREAM_UNAVAILABLE",
    message,
    retryable: true,
    requestId
  });
};

const createContractViolationError = (requestId: string, message: string, details?: Record<string, unknown>): AppError => {
  return createAppError({
    code: "CONTRACT_VIOLATION",
    message,
    retryable: false,
    requestId,
    ...(details !== undefined ? { details } : {})
  });
};

const getCitationsFromStructuredOutput = (value: unknown): unknown => {
  if (typeof value !== "object" || value === null) {
    return undefined;
  }

  const obj = value as Record<string, unknown>;
  return obj["citations"];
};

export type AgentProxyResult<T> =
  | { ok: true; value: AgentProxyOutput<T> }
  | { ok: false; error: AppError };

export const runAgentProxy = async <TContext extends RequestContext, TStructured>(
  ctx: TContext,
  config: RuntimeConfig,
  model: LanguageModel<TContext>,
  input: AgentProxyInput,
  options?: RunAgentProxyOptions<TContext>
): Promise<AgentProxyResult<TStructured>> => {
  const taskId = "t_runtime";
  const stepId = "s_1";
  const stepName = "AgentProxy";

  emit(
    options?.eventSink,
    StepEventSchema.parse({
      type: "step_started",
      taskId,
      stepId,
      stepName,
      timestamp: nowIso(),
      requestId: ctx.requestId,
      payload: {}
    })
  );

  const fullPrompt = `${config.prompt}\n\nUser: ${input.userInput}`;

  if (options?.guardrails !== undefined) {
    const decision = await options.guardrails(ctx, { stage: "input", content: fullPrompt });
    if (decision.action === "block") {
      emitSecurity(
        options?.securityEventSink,
        SecurityEventSchema.parse({
          type: "guardrail_blocked",
          timestamp: nowIso(),
          requestId: ctx.requestId,
          tenantId: ctx.tenantId,
          ...(ctx.projectId !== undefined ? { projectId: ctx.projectId } : {}),
          taskId,
          stepId,
          stepName,
          payload: {
            stage: "input",
            reason: decision.reason,
            contentLength: fullPrompt.length
          }
        })
      );

      const error = createGuardrailBlockedError(ctx.requestId, decision.reason);
      emit(
        options?.eventSink,
        StepEventSchema.parse({
          type: "step_failed",
          taskId,
          stepId,
          stepName,
          timestamp: nowIso(),
          requestId: ctx.requestId,
          payload: { error }
        })
      );
      return { ok: false, error };
    }
  }

  try {
    if (config.outputSchema !== undefined) {
      const schemaParsed = config.outputSchema as z.ZodType<TStructured>;

      const out = await generateObjectWithRetries(model, ctx, {
        prompt: fullPrompt,
        systemPrompt: config.systemPrompt,
        schema: schemaParsed
      }, {
        maxRetries: config.structuredOutput.maxRetries
      });

      if (!out.ok) {
        emit(
          options?.eventSink,
          StepEventSchema.parse({
            type: "step_failed",
            taskId,
            stepId,
            stepName,
            timestamp: nowIso(),
            requestId: ctx.requestId,
            payload: { error: out.error }
          })
        );
        return { ok: false, error: out.error };
      }

      const rawCitations = getCitationsFromStructuredOutput(out.value);

      if (config.citationPolicy.mode === "required" && rawCitations === undefined) {
        const error = createContractViolationError(ctx.requestId, "Citations are required", {
          mode: "required"
        });
        emit(
          options?.eventSink,
          StepEventSchema.parse({
            type: "step_failed",
            taskId,
            stepId,
            stepName,
            timestamp: nowIso(),
            requestId: ctx.requestId,
            payload: { error }
          })
        );
        return { ok: false, error };
      }

      let verifiedCitations: readonly Citation[] | undefined;

      if (rawCitations !== undefined) {
        if (options?.evidenceProvider === undefined) {
          const error = createContractViolationError(
            ctx.requestId,
            "Evidence provider is required to verify citations",
            { mode: config.citationPolicy.mode }
          );
          emit(
            options?.eventSink,
            StepEventSchema.parse({
              type: "step_failed",
              taskId,
              stepId,
              stepName,
              timestamp: nowIso(),
              requestId: ctx.requestId,
              payload: { error }
            })
          );
          return { ok: false, error };
        }

        const verified = await verifyCitations(ctx, rawCitations, options.evidenceProvider);
        if (!verified.ok) {
          emit(
            options?.eventSink,
            StepEventSchema.parse({
              type: "step_failed",
              taskId,
              stepId,
              stepName,
              timestamp: nowIso(),
              requestId: ctx.requestId,
              payload: { error: verified.error }
            })
          );
          return { ok: false, error: verified.error };
        }

        if (config.citationPolicy.mode === "required" && verified.citations.length === 0) {
          const error = createContractViolationError(ctx.requestId, "Citations are required", {
            mode: "required",
            reason: "Empty citations"
          });
          emit(
            options?.eventSink,
            StepEventSchema.parse({
              type: "step_failed",
              taskId,
              stepId,
              stepName,
              timestamp: nowIso(),
              requestId: ctx.requestId,
              payload: { error }
            })
          );
          return { ok: false, error };
        }

        verifiedCitations = verified.citations;
      }

      const payload: AgentProxyOutput<TStructured> = {
        text: JSON.stringify(out.value),
        object: out.value,
        ...(verifiedCitations !== undefined ? { citations: verifiedCitations } : {})
      };

      if (options?.guardrails !== undefined) {
        const decision = await options.guardrails(ctx, { stage: "output", content: payload.text });
        if (decision.action === "block") {
          emitSecurity(
            options?.securityEventSink,
            SecurityEventSchema.parse({
              type: "guardrail_blocked",
              timestamp: nowIso(),
              requestId: ctx.requestId,
              tenantId: ctx.tenantId,
              ...(ctx.projectId !== undefined ? { projectId: ctx.projectId } : {}),
              taskId,
              stepId,
              stepName,
              payload: {
                stage: "output",
                reason: decision.reason,
                contentLength: payload.text.length
              }
            })
          );

          const error = createGuardrailBlockedError(ctx.requestId, decision.reason);
          emit(
            options?.eventSink,
            StepEventSchema.parse({
              type: "step_failed",
              taskId,
              stepId,
              stepName,
              timestamp: nowIso(),
              requestId: ctx.requestId,
              payload: { error }
            })
          );
          return { ok: false, error };
        }
      }

      emit(
        options?.eventSink,
        StepEventSchema.parse({
          type: "step_completed",
          taskId,
          stepId,
          stepName,
          timestamp: nowIso(),
          requestId: ctx.requestId,
          payload: { outputSummary: payload.text.slice(0, 256) }
        })
      );

      return { ok: true, value: payload };
    }

    if (config.citationPolicy.mode === "required") {
      const error = createContractViolationError(
        ctx.requestId,
        "Citations are required but unstructured output does not support citation extraction",
        { mode: "required" }
      );
      emit(
        options?.eventSink,
        StepEventSchema.parse({
          type: "step_failed",
          taskId,
          stepId,
          stepName,
          timestamp: nowIso(),
          requestId: ctx.requestId,
          payload: { error }
        })
      );
      return { ok: false, error };
    }

    const text = await model.generateText(ctx, { prompt: fullPrompt, systemPrompt: config.systemPrompt });

    if (options?.guardrails !== undefined) {
      const decision = await options.guardrails(ctx, { stage: "output", content: text.text });
      if (decision.action === "block") {
        emitSecurity(
          options?.securityEventSink,
          SecurityEventSchema.parse({
            type: "guardrail_blocked",
            timestamp: nowIso(),
            requestId: ctx.requestId,
            tenantId: ctx.tenantId,
            ...(ctx.projectId !== undefined ? { projectId: ctx.projectId } : {}),
            taskId,
            stepId,
            stepName,
            payload: {
              stage: "output",
              reason: decision.reason,
              contentLength: text.text.length
            }
          })
        );

        const error = createGuardrailBlockedError(ctx.requestId, decision.reason);
        emit(
          options?.eventSink,
          StepEventSchema.parse({
            type: "step_failed",
            taskId,
            stepId,
            stepName,
            timestamp: nowIso(),
            requestId: ctx.requestId,
            payload: { error }
          })
        );
        return { ok: false, error };
      }
    }

    const payload: AgentProxyOutput<TStructured> = {
      text: text.text
    };

    emit(
      options?.eventSink,
      StepEventSchema.parse({
        type: "step_completed",
        taskId,
        stepId,
        stepName,
        timestamp: nowIso(),
        requestId: ctx.requestId,
        payload: { outputSummary: payload.text.slice(0, 256) }
      })
    );

    return { ok: true, value: payload };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const appError = createStepError(ctx.requestId, message);

    emit(
      options?.eventSink,
      StepEventSchema.parse({
        type: "step_failed",
        taskId,
        stepId,
        stepName,
        timestamp: nowIso(),
        requestId: ctx.requestId,
        payload: { error: appError }
      })
    );

    return { ok: false, error: appError };
  }
};
