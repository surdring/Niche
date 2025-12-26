import { describe, expect, it } from "vitest";

import type { RequestContext } from "../contracts/context";
import { AppErrorSchema, createAppError } from "../contracts/error";

import type { Logger } from "../logger/logger";

import { createRoutedLanguageModel } from "./routed-language-model";
import { MockProviderAdapter } from "./mock-provider";
import type { ProviderAdapter } from "./provider";
import type { ProviderCallMetric, ProviderMetricsSink } from "./metrics";
import { decideProviderRoute } from "./router";
import { ProviderRoutingConfigSchema } from "./router";

const createSpyLogger = (): { logger: Logger; records: { level: string; message: string; fields?: Record<string, unknown> }[] } => {
  const records: { level: string; message: string; fields?: Record<string, unknown> }[] = [];

  const mk = (level: string) => {
    return (message: string, fields?: Record<string, unknown>) => {
      if (fields === undefined) {
        records.push({ level, message });
        return;
      }

      records.push({ level, message, fields });
    };
  };

  return {
    logger: {
      debug: mk("debug"),
      info: mk("info"),
      warn: mk("warn"),
      error: mk("error")
    },
    records
  };
};

const collectStreamText = async (stream: AsyncIterable<{ type: "text" | "done"; text?: string }>): Promise<string> => {
  let out = "";
  for await (const part of stream) {
    if (part.type === "text") {
      out += part.text ?? "";
    }
  }
  return out;
};

const createSpyMetrics = (): { sink: ProviderMetricsSink; records: ProviderCallMetric[] } => {
  const records: ProviderCallMetric[] = [];
  return {
    sink: {
      record: (metric) => {
        records.push(metric);
      }
    },
    records
  };
};

describe("provider routing", () => {
  it("decideProviderRoute is deterministic for heuristic routing across different prompt lengths", () => {
    const config = {
      primary: { providerId: "p_primary", modelId: "m_primary" },
      fallbacks: [{ providerId: "p_fallback", modelId: "m_fallback" }],
      heuristic: {
        thresholdChars: 10,
        low: { providerId: "p_low", modelId: "m_low" },
        high: { providerId: "p_high", modelId: "m_high" }
      }
    };

    const short = { prompt: "short" };
    const long = { prompt: "this_is_a_long_prompt" };

    const s1 = decideProviderRoute(config, short);
    const s2 = decideProviderRoute(config, short);
    expect(s1).toEqual(s2);
    expect(s1.selected).toEqual({ providerId: "p_low", modelId: "m_low" });

    const l1 = decideProviderRoute(config, long);
    const l2 = decideProviderRoute(config, long);
    const l3 = decideProviderRoute(config, long);
    expect(l1).toEqual(l2);
    expect(l2).toEqual(l3);
    expect(l1.selected).toEqual({ providerId: "p_high", modelId: "m_high" });
  });

  it("decideProviderRoute is deterministic for hint-based routing", () => {
    const config = {
      primary: { providerId: "p_primary", modelId: "m_primary" },
      fallbacks: [],
      heuristic: {
        thresholdChars: 10,
        low: { providerId: "p_low", modelId: "m_low" },
        high: { providerId: "p_high", modelId: "m_high" }
      }
    };

    const input = { prompt: "x", hint: { complexity: "high" as const } };
    const d1 = decideProviderRoute(config, input);
    const d2 = decideProviderRoute(config, input);
    expect(d1).toEqual(d2);
    expect(d1.selected).toEqual({ providerId: "p_high", modelId: "m_high" });
  });

  it("switching routing config changes provider/model without changing business code", async () => {
    const ctx: RequestContext = { requestId: "req_1", tenantId: "t1", projectId: "p1" };

    const p1 = new MockProviderAdapter<RequestContext>("p1", [{ kind: "text", text: "from_p1" }]);
    const p2 = new MockProviderAdapter<RequestContext>("p2", [{ kind: "text", text: "from_p2" }]);

    const m1 = createRoutedLanguageModel<RequestContext>({
      routing: {
        primary: { providerId: "p1", modelId: "m_a" },
        fallbacks: []
      },
      providers: [p1, p2]
    });

    const r1 = await m1.generateText(ctx, { prompt: "hi" });
    expect(r1.text).toBe("from_p1");
    expect(p1.calls.length).toBe(1);
    expect(p1.calls[0]?.modelId).toBe("m_a");

    const m2 = createRoutedLanguageModel<RequestContext>({
      routing: {
        primary: { providerId: "p2", modelId: "m_b" },
        fallbacks: []
      },
      providers: [p1, p2]
    });

    const r2 = await m2.generateText(ctx, { prompt: "hi" });
    expect(r2.text).toBe("from_p2");
    expect(p2.calls.length).toBe(1);
    expect(p2.calls[0]?.modelId).toBe("m_b");
  });

  it("primary provider error triggers fallback provider", async () => {
    const ctx: RequestContext = { requestId: "req_2", tenantId: "t1", projectId: "p1" };

    const primary = new MockProviderAdapter<RequestContext>("primary", [{ kind: "error", message: "boom" }]);
    const fallback = new MockProviderAdapter<RequestContext>("fallback", [{ kind: "text", text: "ok" }]);

    const model = createRoutedLanguageModel<RequestContext>({
      routing: {
        primary: { providerId: "primary", modelId: "m1" },
        fallbacks: [{ providerId: "fallback", modelId: "m2" }]
      },
      providers: [primary, fallback]
    });

    const out = await model.generateText(ctx, { prompt: "hi" });
    expect(out.text).toBe("ok");

    expect(primary.calls.length).toBe(1);
    expect(fallback.calls.length).toBe(1);
  });

  it("retryPolicy.maxRetries retries primary provider before falling back", async () => {
    const ctx: RequestContext = { requestId: "req_retry_1", tenantId: "t1", projectId: "p1" };

    const primary = new MockProviderAdapter<RequestContext>("primary", [
      { kind: "error", message: "transient" },
      { kind: "text", text: "ok" }
    ]);

    const fallback = new MockProviderAdapter<RequestContext>("fallback", [{ kind: "text", text: "fallback" }]);

    const model = createRoutedLanguageModel<RequestContext>({
      routing: {
        primary: { providerId: "primary", modelId: "m1" },
        fallbacks: [{ providerId: "fallback", modelId: "m2" }],
        retryPolicy: { maxRetries: 1 }
      },
      providers: [primary, fallback]
    });

    const out = await model.generateText(ctx, { prompt: "hi" });
    expect(out.text).toBe("ok");
    expect(primary.calls.length).toBe(2);
    expect(fallback.calls.length).toBe(0);
  });

  it("retryPolicy.maxRetries exhausts retries then falls back to next provider", async () => {
    const ctx: RequestContext = { requestId: "req_retry_2", tenantId: "t1", projectId: "p1" };

    const primary = new MockProviderAdapter<RequestContext>("primary", [
      { kind: "error", message: "transient_1" },
      { kind: "error", message: "transient_2" }
    ]);

    const fallback = new MockProviderAdapter<RequestContext>("fallback", [{ kind: "text", text: "ok" }]);

    const model = createRoutedLanguageModel<RequestContext>({
      routing: {
        primary: { providerId: "primary", modelId: "m1" },
        fallbacks: [{ providerId: "fallback", modelId: "m2" }],
        retryPolicy: { maxRetries: 1 }
      },
      providers: [primary, fallback]
    });

    const out = await model.generateText(ctx, { prompt: "hi" });
    expect(out.text).toBe("ok");
    expect(primary.calls.length).toBe(2);
    expect(fallback.calls.length).toBe(1);
  });

  it("does not retry non-retryable AppError and immediately falls back", async () => {
    const ctx: RequestContext = { requestId: "req_retry_3", tenantId: "t1", projectId: "p1" };

    let primaryCalls = 0;
    let fallbackCalls = 0;

    const primary: ProviderAdapter<RequestContext> = {
      id: "primary",
      async generateText() {
        primaryCalls += 1;
        throw createAppError({
          code: "VALIDATION_ERROR",
          message: "Non-retryable",
          retryable: false,
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
        retryPolicy: { maxRetries: 3 }
      },
      providers: [primary, fallback]
    });

    const out = await model.generateText(ctx, { prompt: "hi" });
    expect(out.text).toBe("ok");
    expect(primaryCalls).toBe(1);
    expect(fallbackCalls).toBe(1);
  });

  it("throws UPSTREAM_UNAVAILABLE when all providers fail", async () => {
    const ctx: RequestContext = { requestId: "req_all_fail_1", tenantId: "t1", projectId: "p1" };

    const primary: ProviderAdapter<RequestContext> = {
      id: "primary",
      async generateText() {
        throw new Error("primary_failed");
      }
    };

    const fallback: ProviderAdapter<RequestContext> = {
      id: "fallback",
      async generateText() {
        throw createAppError({
          code: "UPSTREAM_UNAVAILABLE",
          message: "fallback_failed",
          retryable: true,
          requestId: ctx.requestId
        });
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
    expect(parsed.data.retryable).toBe(true);
    expect(parsed.data.requestId).toBe(ctx.requestId);
  });

  it("routing decision log contains requestId/providerId/modelId (and taskId when provided)", async () => {
    type TestContext = RequestContext & { taskId: string };
    const ctx: TestContext = { requestId: "req_3", tenantId: "t1", projectId: "p1", taskId: "task_1" };

    const provider = new MockProviderAdapter<TestContext>("p1", [{ kind: "text", text: "ok" }]);
    const { logger, records } = createSpyLogger();

    const model = createRoutedLanguageModel<TestContext>({
      routing: {
        primary: { providerId: "p1", modelId: "m1" },
        fallbacks: []
      },
      providers: [provider],
      logger
    });

    await model.generateText(ctx, { prompt: "hi" });

    const decision = records.find((r) => r.message === "Provider route decided");
    expect(decision).toBeTruthy();

    const fields = decision?.fields;
    expect(fields?.requestId).toBe("req_3");
    expect(fields?.providerId).toBe("p1");
    expect(fields?.modelId).toBe("m1");
    expect(fields?.taskId).toBe("task_1");

    // metadata should exist and be deterministic
    expect(typeof fields?.metadata).toBe("object");

    // ensure deterministic: same call results in same decision fields
    await model.generateText(ctx, { prompt: "hi" });
    const decisions = records.filter((r) => r.message === "Provider route decided");
    expect(decisions.length).toBe(2);
    expect(decisions[0]?.fields).toEqual(decisions[1]?.fields);
  });

  it("streamText: primary stream failure before first token falls back to generateText with provider fallback", async () => {
    const ctx: RequestContext = { requestId: "req_stream_1", tenantId: "t1", projectId: "p1" };
    const { sink, records } = createSpyMetrics();

    const primary = new MockProviderAdapter<RequestContext>("primary", [
      { kind: "stream", parts: [], throwBeforeFirstToken: true, errorMessage: "stream_fail" },
      { kind: "error", message: "gen_fail" }
    ]);

    const fallback = new MockProviderAdapter<RequestContext>("fallback", [
      { kind: "text", text: "ok", usage: { inputTokens: 1, outputTokens: 2, totalTokens: 3 } }
    ]);

    const model = createRoutedLanguageModel<RequestContext>({
      routing: {
        primary: { providerId: "primary", modelId: "m1" },
        fallbacks: [{ providerId: "fallback", modelId: "m2" }]
      },
      providers: [primary, fallback],
      metrics: sink
    });

    const stream = model.streamText?.(ctx, { prompt: "hi" });
    expect(stream).toBeTruthy();
    const text = await collectStreamText(stream!);
    expect(text).toBe("ok");

    expect(primary.streamCalls.length).toBe(1);
    expect(primary.calls.length).toBe(1);
    expect(fallback.calls.length).toBe(1);

    const streamMetrics = records.filter((m) => m.kind === "stream_text" && m.success);
    expect(streamMetrics.length).toBe(1);
    expect(streamMetrics[0]?.usage).toEqual({ inputTokens: 1, outputTokens: 2, totalTokens: 3 });
  });

  it("streamText: when streamText is not supported, it downgrades to generateText fallback", async () => {
    const ctx: RequestContext = { requestId: "req_stream_2", tenantId: "t1", projectId: "p1" };

    let primaryCalls = 0;
    let fallbackCalls = 0;

    const primary: ProviderAdapter<RequestContext> = {
      id: "primary",
      async generateText() {
        primaryCalls += 1;
        throw new Error("primary_failed");
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
        fallbacks: [{ providerId: "fallback", modelId: "m2" }]
      },
      providers: [primary, fallback]
    });

    const stream = model.streamText?.(ctx, { prompt: "hi" });
    expect(stream).toBeTruthy();
    const text = await collectStreamText(stream!);
    expect(text).toBe("ok");
    expect(primaryCalls).toBe(1);
    expect(fallbackCalls).toBe(1);
  });

  it("generateText records token usage into metrics", async () => {
    const ctx: RequestContext = { requestId: "req_usage_1", tenantId: "t1", projectId: "p1" };
    const { sink, records } = createSpyMetrics();

    const provider = new MockProviderAdapter<RequestContext>("p1", [
      { kind: "text", text: "ok", usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 } }
    ]);

    const model = createRoutedLanguageModel<RequestContext>({
      routing: { primary: { providerId: "p1", modelId: "m1" }, fallbacks: [] },
      providers: [provider],
      metrics: sink
    });

    const out = await model.generateText(ctx, { prompt: "hi" });
    expect(out.text).toBe("ok");

    const metrics = records.filter((m) => m.kind === "generate_text" && m.success);
    expect(metrics.length).toBe(1);
    expect(metrics[0]?.usage).toEqual({ inputTokens: 10, outputTokens: 20, totalTokens: 30 });
  });

  it("fallbackPolicy supports skipProviderIds and maxAttempts", () => {
    const config = {
      primary: { providerId: "p1", modelId: "m1" },
      fallbacks: [
        { providerId: "p2", modelId: "m2" },
        { providerId: "p3", modelId: "m3" }
      ],
      fallbackPolicy: {
        skipProviderIds: ["p2"],
        maxAttempts: 1
      }
    };

    const decision = decideProviderRoute(config, { prompt: "hi" });
    expect(decision.candidates.length).toBe(1);
    expect(decision.candidates[0]).toEqual({ providerId: "p1", modelId: "m1" });
  });

  it("fallbackPolicy.maxAttempts=0 is rejected by schema", () => {
    const parsed = ProviderRoutingConfigSchema.safeParse({
      primary: { providerId: "p1", modelId: "m1" },
      fallbacks: [{ providerId: "p2", modelId: "m2" }],
      fallbackPolicy: {
        maxAttempts: 0
      }
    });
    expect(parsed.success).toBe(false);
  });

  it("skipProviderIds can remove all candidates", () => {
    const config = {
      primary: { providerId: "p1", modelId: "m1" },
      fallbacks: [{ providerId: "p2", modelId: "m2" }],
      fallbackPolicy: {
        skipProviderIds: ["p1", "p2"]
      }
    };

    const decision = decideProviderRoute(config, { prompt: "hi" });
    expect(decision.candidates.length).toBe(0);
  });
});
