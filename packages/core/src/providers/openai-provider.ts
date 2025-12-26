import { z } from "zod";

import type { RequestContext } from "../contracts/context";
import { createAppError, tryParseAppError } from "../contracts/error";

import type { ProviderAdapter, ProviderTextCallInput, ProviderTextCallResult, TokenUsage } from "./provider";
import { ProviderTextCallInputSchema } from "./provider";

export const OpenAIProviderConfigSchema = z
  .object({
    apiKey: z.string().min(1, "apiKey is required"),
    baseUrl: z.string().url("baseUrl must be a valid URL").default("https://api.openai.com/v1"),
    organization: z.string().min(1).optional(),
    project: z.string().min(1).optional(),
    timeoutMs: z.number().int().positive("timeoutMs must be positive").default(60_000)
  })
  .strict();

export type OpenAIProviderConfig = z.infer<typeof OpenAIProviderConfigSchema>;

const OpenAIChatCompletionResponseSchema = z
  .object({
    choices: z
      .array(
        z
          .object({
            message: z
              .object({
                content: z.string().nullable().optional()
              })
              .passthrough()
          })
          .passthrough()
      )
      .min(1, "choices must be non-empty"),
    usage: z
      .object({
        prompt_tokens: z.number().int().nonnegative().optional(),
        completion_tokens: z.number().int().nonnegative().optional(),
        total_tokens: z.number().int().nonnegative().optional()
      })
      .optional()
  })
  .passthrough();

type OpenAIUsage = NonNullable<z.infer<typeof OpenAIChatCompletionResponseSchema>["usage"]>;

const mapUsage = (usage: OpenAIUsage): TokenUsage => {
  const inputTokens = usage.prompt_tokens;
  const outputTokens = usage.completion_tokens;
  const totalTokens = usage.total_tokens;

  return {
    ...(inputTokens !== undefined ? { inputTokens } : {}),
    ...(outputTokens !== undefined ? { outputTokens } : {}),
    ...(totalTokens !== undefined ? { totalTokens } : {})
  };
};

export type CreateOpenAIProviderAdapterOptions = {
  id: string;
  config: unknown;
  fetchFn?: typeof fetch;
};

export const createOpenAIProviderAdapter = <TContext extends RequestContext>(
  options: CreateOpenAIProviderAdapterOptions
): ProviderAdapter<TContext> => {
  const cfg = OpenAIProviderConfigSchema.parse(options.config);
  const fetchFn = options.fetchFn ?? fetch;

  const callOpenAI = async (ctx: TContext, input: ProviderTextCallInput): Promise<ProviderTextCallResult> => {
    const validated = ProviderTextCallInputSchema.parse(input);

    const url = `${cfg.baseUrl.replace(/\/$/, "")}/chat/completions`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), cfg.timeoutMs);

    try {
      const messages: Array<{ role: "system" | "user"; content: string }> = [];
      if (validated.systemPrompt !== undefined) {
        messages.push({ role: "system", content: validated.systemPrompt });
      }
      messages.push({ role: "user", content: validated.prompt });

      const body: Record<string, unknown> = {
        model: validated.modelId,
        messages
      };

      if (validated.temperature !== undefined) {
        body["temperature"] = validated.temperature;
      }
      if (validated.maxTokens !== undefined) {
        body["max_tokens"] = validated.maxTokens;
      }

      const headers: Record<string, string> = {
        Authorization: `Bearer ${cfg.apiKey}`,
        "Content-Type": "application/json"
      };

      if (cfg.organization !== undefined) {
        headers["OpenAI-Organization"] = cfg.organization;
      }

      if (cfg.project !== undefined) {
        headers["OpenAI-Project"] = cfg.project;
      }

      const res = await fetchFn(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal: controller.signal
      });

      const rawText = await res.text();
      let rawJson: unknown = {};
      if (rawText.length > 0) {
        try {
          rawJson = JSON.parse(rawText) as unknown;
        } catch {
          if (!res.ok) {
            throw createAppError({
              code: "UPSTREAM_UNAVAILABLE",
              message: `OpenAI request failed: ${res.status} ${res.statusText}`,
              retryable: res.status >= 500,
              requestId: ctx.requestId,
              details: {
                status: res.status,
                statusText: res.statusText
              }
            });
          }
          throw createAppError({
            code: "CONTRACT_VIOLATION",
            message: "OpenAI response is not valid JSON",
            retryable: false,
            requestId: ctx.requestId,
            details: {
              status: res.status,
              statusText: res.statusText
            }
          });
        }
      }

      if (!res.ok) {
        const errorMsg =
          typeof rawJson === "object" &&
          rawJson !== null &&
          "error" in rawJson &&
          typeof (rawJson as { error?: unknown }).error === "object" &&
          (rawJson as { error?: { message?: unknown } }).error !== null &&
          typeof (rawJson as { error?: { message?: unknown } }).error?.message === "string"
            ? (rawJson as { error: { message: string } }).error.message
            : `OpenAI request failed: ${res.status} ${res.statusText}`;

        const code = (() => {
          if (res.status === 401 || res.status === 403) {
            return "AUTH_ERROR";
          }
          if (res.status === 429) {
            return "RATE_LIMITED";
          }
          if (res.status === 408 || res.status === 504) {
            return "UPSTREAM_TIMEOUT";
          }
          if (res.status >= 400 && res.status < 500) {
            return "VALIDATION_ERROR";
          }
          return "UPSTREAM_UNAVAILABLE";
        })();

        const retryable = (() => {
          if (code === "AUTH_ERROR") {
            return false;
          }
          if (code === "VALIDATION_ERROR") {
            return false;
          }
          return true;
        })();

        throw createAppError({
          code,
          message: errorMsg,
          retryable,
          requestId: ctx.requestId,
          details: {
            status: res.status,
            statusText: res.statusText
          }
        });
      }

      const parsed = OpenAIChatCompletionResponseSchema.parse(rawJson);
      const content = parsed.choices[0]?.message.content;

      const usage = parsed.usage !== undefined ? mapUsage(parsed.usage) : undefined;

      return {
        text: typeof content === "string" ? content : "",
        ...(usage !== undefined ? { usage } : {})
      };
    } finally {
      clearTimeout(timeout);
    }
  };

  return {
    id: options.id,

    async generateText(ctx: TContext, input: ProviderTextCallInput): Promise<ProviderTextCallResult> {
      try {
        return await callOpenAI(ctx, input);
      } catch (error) {
        const maybeAppError = tryParseAppError(error);
        if (maybeAppError !== undefined) {
          throw maybeAppError;
        }

        const name =
          typeof error === "object" &&
          error !== null &&
          "name" in error &&
          typeof (error as { name?: unknown }).name === "string"
            ? ((error as { name: string }).name as string)
            : undefined;

        if (name === "AbortError") {
          throw createAppError({
            code: "UPSTREAM_TIMEOUT",
            message: "OpenAI request timed out",
            retryable: true,
            requestId: ctx.requestId
          });
        }

        const message = error instanceof Error ? error.message : String(error);
        throw createAppError({
          code: "UPSTREAM_UNAVAILABLE",
          message,
          retryable: true,
          requestId: ctx.requestId
        });
      }
    }
  };
};
