import { describe, expect, it } from "vitest";

import { AppErrorSchema, createAppError, createRoutedLanguageModel, type ProviderAdapter, type RequestContext } from "@niche/core";

describe("integration/retry-and-fallback", () => {
  it("provider timeout/unavailable triggers fallback", async () => {
    const ctx: RequestContext = { requestId: "req_it_retry_1", tenantId: "t1", projectId: "p1" };

    let primaryCalls = 0;
    let fallbackCalls = 0;

    const primary: ProviderAdapter<RequestContext> = {
      id: "primary",
      async generateText() {
        primaryCalls += 1;
        throw createAppError({
          code: "UPSTREAM_TIMEOUT",
          message: "Upstream timed out",
          retryable: true,
          requestId: ctx.requestId
        });
      }
    };

    const fallback: ProviderAdapter<RequestContext> = {
      id: "fallback",
      async generateText() {
        fallbackCalls += 1;
        return { text: "ok" };
      }
    };

    const model = createRoutedLanguageModel<RequestContext>({
      routing: {
        primary: { providerId: "primary", modelId: "m1" },
        fallbacks: [{ providerId: "fallback", modelId: "m2" }],
        retryPolicy: { maxRetries: 0 }
      },
      providers: [primary, fallback]
    });

    const out = await model.generateText(ctx, { prompt: "hi" });
    expect(out.text).toBe("ok");
    expect(primaryCalls).toBe(1);
    expect(fallbackCalls).toBe(1);
  });

  it("all providers failing returns unified AppError with requestId", async () => {
    const ctx: RequestContext = { requestId: "req_it_retry_2", tenantId: "t1", projectId: "p1" };

    const failing: ProviderAdapter<RequestContext> = {
      id: "primary",
      async generateText() {
        throw new Error("boom");
      }
    };

    const failingFallback: ProviderAdapter<RequestContext> = {
      id: "fallback",
      async generateText() {
        throw new Error("boom2");
      }
    };

    const model = createRoutedLanguageModel<RequestContext>({
      routing: {
        primary: { providerId: "primary", modelId: "m1" },
        fallbacks: [{ providerId: "fallback", modelId: "m2" }],
        retryPolicy: { maxRetries: 0 }
      },
      providers: [failing, failingFallback]
    });

    let caught: unknown = undefined;
    try {
      await model.generateText(ctx, { prompt: "hi" });
    } catch (err) {
      caught = err;
    }

    const parsed = AppErrorSchema.safeParse(caught);
    expect(parsed.success).toBe(true);
    if (!parsed.success) {
      return;
    }

    expect(parsed.data.code).toBe("UPSTREAM_UNAVAILABLE");
    expect(parsed.data.requestId).toBe(ctx.requestId);
    expect(parsed.data.retryable).toBe(true);
  });
});
