import { describe, expect, it } from "vitest";
import { z } from "zod";

import { MockLanguageModel, buildRuntimeConfig, runAgentProxy, type GuardrailsHook, type RequestContext, type SecurityEvent } from "@niche/core";

import { assertAppErrorBasics, assertSecurityEventGuardrailBlocked, DetailsReasonSchema } from "./assertions";
import { injectionCases } from "./injection-cases";
import { toolCallSecurityCases } from "./tool-call-cases";

describe("security/guardrails", () => {
  it("injection/jailbreak cases trigger GUARDRAIL_BLOCKED with retryable=false and requestId", async () => {
    const templateRequestId = "req_sec_guard_template";

    const runtime = buildRuntimeConfig(templateRequestId, {
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

    const guardrails: GuardrailsHook<RequestContext> = async (_ctx, input) => {
      const matched = injectionCases.find((c) => input.stage === "input" && input.content.includes(c.userInput));
      if (matched !== undefined) {
        return { action: "block", reason: `security_case:${matched.id}` };
      }
      return { action: "allow" };
    };

    for (const c of injectionCases) {
      const requestId = `req_sec_guard_${c.id}`;
      const ctx: RequestContext = { requestId, tenantId: "tenant_1", projectId: "p_1" };

      const model = new MockLanguageModel([{ kind: "text", text: "ok" }]);

      const securityEvents: SecurityEvent[] = [];

      const out = await runAgentProxy(ctx, runtime.value, model, { userInput: c.userInput }, {
        guardrails,
        securityEventSink: (e) => {
          securityEvents.push(e);
        }
      });

      expect(out.ok).toBe(false);
      if (out.ok) {
        continue;
      }

      assertAppErrorBasics(out.error, { code: "GUARDRAIL_BLOCKED", requestId, retryable: false });

      const details = out.error.details as unknown;
      const parsed = DetailsReasonSchema.parse(details);
      expect(parsed.reason).toBe(`security_case:${c.id}`);

      expect(securityEvents.length).toBeGreaterThan(0);
      const blocked = securityEvents.find((e) => e.type === "guardrail_blocked");
      expect(blocked).toBeTruthy();
      if (blocked !== undefined) {
        assertSecurityEventGuardrailBlocked(blocked, {
          requestId,
          stage: "input",
          reason: `security_case:${c.id}`
        });
      }
    }
  });

  it("tool_call stage can be blocked by guardrails (GUARDRAIL_BLOCKED + security event)", async () => {
    const templateRequestId = "req_sec_guard_tool_call_template";

    const runtime = buildRuntimeConfig(templateRequestId, {
      templateDefinition: {
        schemaVersion: "v1",
        systemPrompt: "sys",
        prompt: "prompt",
        tools: [
          {
            name: "delete_all_data",
            argsSchema: z.unknown()
          },
          {
            name: "send_to_webhook",
            argsSchema: z.unknown()
          }
        ],
        workflowPolicy: { maxSteps: 1, retry: { maxRetries: 0 } },
        citationPolicy: { mode: "optional" },
        guardrailsPolicy: { enforceHonorCode: true }
      }
    });

    expect(runtime.ok).toBe(true);
    if (!runtime.ok) {
      return;
    }

    const guardrails: GuardrailsHook<RequestContext> = async (_ctx, input) => {
      if (input.stage !== "tool_call") {
        return { action: "allow" };
      }

      const matched = toolCallSecurityCases.find((c) => input.content.includes(c.toolName));
      if (matched !== undefined) {
        return { action: "block", reason: `security_case:${matched.id}` };
      }

      return { action: "allow" };
    };

    for (const c of toolCallSecurityCases) {
      const requestId = `req_sec_guard_tool_call_${c.id}`;
      const ctx: RequestContext = { requestId, tenantId: "tenant_1", projectId: "p_1" };

      const model = new MockLanguageModel([{ kind: "text", text: "ok" }]);
      const securityEvents: SecurityEvent[] = [];

      const out = await runAgentProxy(ctx, runtime.value, model, { userInput: "hi" }, {
        guardrails,
        toolCalls: [{ toolName: c.toolName, args: c.args }],
        toolExecutor: async () => {
          return { ok: true };
        },
        securityEventSink: (e) => {
          securityEvents.push(e);
        }
      });

      expect(out.ok).toBe(false);
      if (out.ok) {
        continue;
      }

      assertAppErrorBasics(out.error, { code: "GUARDRAIL_BLOCKED", requestId, retryable: false });

      const details = out.error.details as unknown;
      const parsed = DetailsReasonSchema.parse(details);
      expect(parsed.reason).toBe(`security_case:${c.id}`);

      const blocked = securityEvents.find((e) => e.type === "guardrail_blocked");
      expect(blocked).toBeTruthy();
      if (blocked !== undefined) {
        assertSecurityEventGuardrailBlocked(blocked, {
          requestId,
          stage: "tool_call",
          reason: `security_case:${c.id}`
        });
      }
    }
  });
});
