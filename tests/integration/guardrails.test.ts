import { describe, expect, it } from "vitest";

import { MockLanguageModel, buildRuntimeConfig, runAgentProxy, type RequestContext } from "@niche/core";

describe("integration/guardrails", () => {
  it("guardrails block returns GUARDRAIL_BLOCKED and retryable=false", async () => {
    const requestId = "req_it_guard_1";
    const ctx: RequestContext = { requestId, tenantId: "tenant_1", projectId: "p_1" };

    const runtime = buildRuntimeConfig(requestId, {
      templateDefinition: {
        schemaVersion: "v1",
        systemPrompt: "sys",
        prompt: "prompt",
        tools: [],
        workflowPolicy: { maxSteps: 1, retry: { maxRetries: 0 } },
        citationPolicy: { mode: "optional" },
        guardrailsPolicy: { enforceHonorCode: true }
      }
    });

    expect(runtime.ok).toBe(true);
    if (!runtime.ok) {
      return;
    }

    const model = new MockLanguageModel([{ kind: "text", text: "ok" }]);

    const out = await runAgentProxy(ctx, runtime.value, model, { userInput: "blocked" }, {
      guardrails: async (_c, input) => {
        if (input.stage === "input") {
          return { action: "block", reason: "blocked_by_integration_test" };
        }
        return { action: "allow" };
      }
    });

    expect(out.ok).toBe(false);
    if (out.ok) {
      return;
    }

    expect(out.error.code).toBe("GUARDRAIL_BLOCKED");
    expect(out.error.retryable).toBe(false);
    expect(out.error.requestId).toBe(requestId);
  });

  it("large content (>10KB) passes through and completes within a reasonable time", async () => {
    const requestId = "req_it_guard_2";
    const ctx: RequestContext = { requestId, tenantId: "tenant_1", projectId: "p_1" };

    const runtime = buildRuntimeConfig(requestId, {
      templateDefinition: {
        schemaVersion: "v1",
        systemPrompt: "sys",
        prompt: "prompt",
        tools: [],
        workflowPolicy: { maxSteps: 1, retry: { maxRetries: 0 } },
        citationPolicy: { mode: "optional" },
        guardrailsPolicy: { enforceHonorCode: true }
      }
    });

    expect(runtime.ok).toBe(true);
    if (!runtime.ok) {
      return;
    }

    const big = "x".repeat(12 * 1024);
    const model = new MockLanguageModel([{ kind: "text", text: "ok" }]);

    const startedAt = Date.now();
    const out = await runAgentProxy(ctx, runtime.value, model, { userInput: big }, {
      guardrails: async () => {
        return { action: "allow" };
      }
    });
    const durationMs = Date.now() - startedAt;

    expect(durationMs).toBeGreaterThanOrEqual(0);
    expect(durationMs).toBeLessThan(5_000);
    expect(out.ok).toBe(true);
  });
});
