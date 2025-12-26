import type { RequestContext } from "../contracts/context";
import { toAppError } from "../contracts/error";

import type {
  GenerateObjectInput,
  GenerateObjectResult,
  GenerateTextInput,
  GenerateTextResult,
  LanguageModel,
  StreamTextPart,
  StreamTextResult
} from "../agent/language-model";

import type { Logger } from "../logger/logger";
import { createNoopLogger } from "../logger/logger";

import type { ProviderAdapter, ProviderTextCallInput, TokenUsage } from "./provider";
import type { ProviderMetricsSink } from "./metrics";
import { createNoopProviderMetricsSink } from "./metrics";
import type { ProviderRoute, ProviderRoutingConfig, ProviderRoutingHint } from "./router";
import { decideProviderRoute, ProviderRoutingConfigSchema } from "./router";

export type RoutedLanguageModelOptions<TContext extends RequestContext> = {
  routing: unknown;
  providers: readonly ProviderAdapter<TContext>[];
  logger?: Logger;
  metrics?: ProviderMetricsSink;
  hintResolver?: (ctx: TContext, input: GenerateTextInput) => ProviderRoutingHint | undefined;
  taskIdResolver?: (ctx: TContext) => string | undefined;
};

const nowMs = (): number => Date.now();

const nowIso = (): string => new Date().toISOString();

const getTaskIdFromContext = <TContext extends RequestContext>(ctx: TContext): string | undefined => {
  const raw = (ctx as unknown as Record<string, unknown>)["taskId"];
  if (typeof raw !== "string") {
    return undefined;
  }
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export const createRoutedLanguageModel = <TContext extends RequestContext>(
  options: RoutedLanguageModelOptions<TContext>
): LanguageModel<TContext> => {
  const routing: ProviderRoutingConfig = ProviderRoutingConfigSchema.parse(options.routing);

  const providerById = new Map<string, ProviderAdapter<TContext>>();
  for (const p of options.providers) {
    if (providerById.has(p.id)) {
      throw new Error(`Duplicate provider id: ${p.id}`);
    }
    providerById.set(p.id, p);
  }

  const logger = options.logger ?? createNoopLogger();
  const metrics = options.metrics ?? createNoopProviderMetricsSink();

  const resolveTaskId = options.taskIdResolver ?? getTaskIdFromContext;

  const resolveHint = options.hintResolver;

  const ensureProvider = (providerId: string): ProviderAdapter<TContext> => {
    const found = providerById.get(providerId);
    if (found === undefined) {
      throw new Error(`Unknown providerId: ${providerId}`);
    }
    return found;
  };

  const logDecision = (ctx: TContext, decision: ReturnType<typeof decideProviderRoute>): void => {
    const taskId = resolveTaskId(ctx);

    logger.info("Provider route decided", {
      requestId: ctx.requestId,
      ...(taskId !== undefined ? { taskId } : {}),
      providerId: decision.selected.providerId,
      modelId: decision.selected.modelId,
      reason: decision.reason,
      metadata: decision.metadata
    });
  };

  type GenerateTextOutcome = {
    result: GenerateTextResult;
    route: ProviderRoute;
    attempt: number;
    usage?: TokenUsage;
  };

  const generateTextWithFallbackDetails = async (ctx: TContext, input: GenerateTextInput): Promise<GenerateTextOutcome> => {
    const hint = resolveHint?.(ctx, input);

    const decision = decideProviderRoute(routing, {
      prompt: input.prompt,
      ...(input.systemPrompt !== undefined ? { systemPrompt: input.systemPrompt } : {}),
      ...(hint !== undefined ? { hint } : {})
    });

    logDecision(ctx, decision);

    const taskId = resolveTaskId(ctx);

    const maxRetries = Math.max(0, routing.retryPolicy?.maxRetries ?? 0);

    let attempt = 0;
    let lastError: unknown = undefined;

    for (const route of decision.candidates) {
      for (let retry = 0; retry <= maxRetries; retry += 1) {
        attempt += 1;

        const adapter = ensureProvider(route.providerId);
        const startedAt = nowMs();
        const startedAtIso = nowIso();

        logger.debug("Provider call started", {
          requestId: ctx.requestId,
          ...(taskId !== undefined ? { taskId } : {}),
          providerId: route.providerId,
          modelId: route.modelId,
          attempt,
          retry
        });

        try {
          const providerInput: ProviderTextCallInput = {
            modelId: route.modelId,
            prompt: input.prompt,
            ...(input.systemPrompt !== undefined ? { systemPrompt: input.systemPrompt } : {})
          };

          const res = await adapter.generateText(ctx, providerInput);
          const durationMs = Math.max(0, nowMs() - startedAt);

          metrics.record({
            kind: "generate_text",
            requestId: ctx.requestId,
            ...(taskId !== undefined ? { taskId } : {}),
            providerId: route.providerId,
            modelId: route.modelId,
            attempt,
            startedAtIso,
            durationMs,
            success: true,
            ...(res.usage !== undefined ? { usage: res.usage } : {})
          });

          logger.info("Provider call succeeded", {
            requestId: ctx.requestId,
            ...(taskId !== undefined ? { taskId } : {}),
            providerId: route.providerId,
            modelId: route.modelId,
            attempt,
            durationMs
          });

          return {
            result: { text: res.text },
            route,
            attempt,
            ...(res.usage !== undefined ? { usage: res.usage } : {})
          };
        } catch (error) {
          const appError = toAppError(ctx.requestId, error, {
            code: "UPSTREAM_UNAVAILABLE",
            message: "Provider call failed",
            retryable: true
          });

          lastError = appError;

          const durationMs = Math.max(0, nowMs() - startedAt);

          metrics.record({
            kind: "generate_text",
            requestId: ctx.requestId,
            ...(taskId !== undefined ? { taskId } : {}),
            providerId: route.providerId,
            modelId: route.modelId,
            attempt,
            startedAtIso,
            durationMs,
            success: false,
            errorMessage: appError.message
          });

          logger.warn("Provider call failed", {
            requestId: ctx.requestId,
            ...(taskId !== undefined ? { taskId } : {}),
            providerId: route.providerId,
            modelId: route.modelId,
            attempt,
            durationMs,
            errorMessage: appError.message
          });

          const shouldRetry = appError.retryable && retry < maxRetries;
          if (shouldRetry) {
            logger.info("Provider call retrying", {
              requestId: ctx.requestId,
              ...(taskId !== undefined ? { taskId } : {}),
              providerId: route.providerId,
              modelId: route.modelId,
              attempt,
              retry
            });
            continue;
          }

          break;
        }
      }
    }

    throw toAppError(ctx.requestId, lastError, {
      code: "UPSTREAM_UNAVAILABLE",
      message: "All providers failed",
      retryable: true
    });
  };

  const generateTextWithFallback = async (ctx: TContext, input: GenerateTextInput): Promise<GenerateTextResult> => {
    const out = await generateTextWithFallbackDetails(ctx, input);
    return out.result;
  };

  const streamTextWithFallback = (ctx: TContext, input: GenerateTextInput): StreamTextResult => {
    const hint = resolveHint?.(ctx, input);

    const decision = decideProviderRoute(routing, {
      prompt: input.prompt,
      ...(input.systemPrompt !== undefined ? { systemPrompt: input.systemPrompt } : {}),
      ...(hint !== undefined ? { hint } : {})
    });

    logDecision(ctx, decision);

    const taskId = resolveTaskId(ctx);

    const createStreamOrUndefined = (route: ProviderRoute): StreamTextResult | undefined => {
      const adapter = ensureProvider(route.providerId);
      if (adapter.streamText === undefined) {
        return undefined;
      }

      const providerInput: ProviderTextCallInput = {
        modelId: route.modelId,
        prompt: input.prompt,
        ...(input.systemPrompt !== undefined ? { systemPrompt: input.systemPrompt } : {})
      };

      return adapter.streamText(ctx, providerInput);
    };

    const firstRoute = decision.candidates[0];
    if (firstRoute === undefined) {
      return (async function* empty(): AsyncIterable<StreamTextPart> {
        yield { type: "done" };
      })();
    }

    let chosen: ProviderRoute = firstRoute;
    let stream: StreamTextResult | undefined;

    for (const route of decision.candidates) {
      try {
        stream = createStreamOrUndefined(route);
        if (stream !== undefined) {
          chosen = route;
          break;
        }
      } catch {
        continue;
      }
    }

    if (stream === undefined) {
      return (async function* fallbackStream(): AsyncIterable<StreamTextPart> {
        const startedAt = nowMs();
        const startedAtIso = nowIso();
        const wrapperAttempt = 1;

        try {
          const out = await generateTextWithFallbackDetails(ctx, input);
          const res = out.result;
          const ttftMs = Math.max(0, nowMs() - startedAt);
          yield { type: "text", text: res.text };
          yield { type: "done" };

          const durationMs = Math.max(ttftMs, nowMs() - startedAt);

          metrics.record({
            kind: "stream_text",
            requestId: ctx.requestId,
            ...(taskId !== undefined ? { taskId } : {}),
            providerId: out.route.providerId,
            modelId: out.route.modelId,
            attempt: out.attempt,
            startedAtIso,
            durationMs,
            ttftMs,
            success: true,
            ...(out.usage !== undefined ? { usage: out.usage } : {})
          });
        } catch (error) {
          const durationMs = Math.max(0, nowMs() - startedAt);
          const message = error instanceof Error ? error.message : String(error);

          metrics.record({
            kind: "stream_text",
            requestId: ctx.requestId,
            ...(taskId !== undefined ? { taskId } : {}),
            providerId: "routed",
            modelId: "fallback",
            attempt: wrapperAttempt,
            startedAtIso,
            durationMs,
            success: false,
            errorMessage: message
          });

          throw error;
        }
      })();
    }

    return (async function* wrapped(): AsyncIterable<StreamTextPart> {
      const startedAt = nowMs();
      const startedAtIso = nowIso();
      const attempt = 1;

      let finalRoute: ProviderRoute = chosen;
      let finalAttempt = attempt;
      let finalUsage: TokenUsage | undefined;
      let ttftOverrideMs: number | undefined;

      let firstTokenAt: number | undefined;
      let success = false;
      let lastErrorMessage: string | undefined;

      try {
        logger.debug("Provider stream started", {
          requestId: ctx.requestId,
          ...(taskId !== undefined ? { taskId } : {}),
          providerId: chosen.providerId,
          modelId: chosen.modelId
        });

        for await (const part of stream) {
          if (firstTokenAt === undefined && part.type === "text") {
            firstTokenAt = nowMs();
          }

          yield part;
        }

        success = true;
      } catch (error) {
        lastErrorMessage = error instanceof Error ? error.message : String(error);

        if (firstTokenAt === undefined) {
          logger.warn("Provider stream failed before first token, falling back to generateText", {
            requestId: ctx.requestId,
            ...(taskId !== undefined ? { taskId } : {}),
            providerId: chosen.providerId,
            modelId: chosen.modelId,
            errorMessage: lastErrorMessage
          });

          const out = await generateTextWithFallbackDetails(ctx, input);
          finalRoute = out.route;
          finalAttempt = out.attempt;
          finalUsage = out.usage;
          ttftOverrideMs = Math.max(0, nowMs() - startedAt);

          yield { type: "text", text: out.result.text };
          yield { type: "done" };

          success = true;
          lastErrorMessage = undefined;
          return;
        }

        throw error;
      } finally {
        const endedAt = nowMs();
        const durationMs = Math.max(0, endedAt - startedAt);
        const ttftMs =
          ttftOverrideMs !== undefined
            ? ttftOverrideMs
            : firstTokenAt !== undefined
              ? Math.max(0, firstTokenAt - startedAt)
              : undefined;

        metrics.record({
          kind: "stream_text",
          requestId: ctx.requestId,
          ...(taskId !== undefined ? { taskId } : {}),
          providerId: finalRoute.providerId,
          modelId: finalRoute.modelId,
          attempt: finalAttempt,
          startedAtIso,
          durationMs,
          ...(ttftMs !== undefined ? { ttftMs } : {}),
          success,
          ...(finalUsage !== undefined ? { usage: finalUsage } : {}),
          ...(lastErrorMessage !== undefined ? { errorMessage: lastErrorMessage } : {})
        });

        logger.info("Provider stream finished", {
          requestId: ctx.requestId,
          ...(taskId !== undefined ? { taskId } : {}),
          providerId: finalRoute.providerId,
          modelId: finalRoute.modelId,
          durationMs,
          ...(ttftMs !== undefined ? { ttftMs } : {}),
          success
        });
      }
    })();
  };

  return {
    async generateText(ctx: TContext, input: GenerateTextInput): Promise<GenerateTextResult> {
      return generateTextWithFallback(ctx, input);
    },

    async generateObject<T>(ctx: TContext, input: GenerateObjectInput<T>): Promise<GenerateObjectResult<T>> {
      const text = await generateTextWithFallback(ctx, { prompt: input.prompt, ...(input.systemPrompt !== undefined ? { systemPrompt: input.systemPrompt } : {}) });

      let obj: unknown = null;
      try {
        obj = JSON.parse(text.text) as unknown;
      } catch {
        obj = null;
      }

      return {
        object: obj as unknown as T,
        rawText: text.text
      };
    },

    streamText(ctx: TContext, input: GenerateTextInput): StreamTextResult {
      return streamTextWithFallback(ctx, input);
    }
  };
};
