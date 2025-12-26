import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  CitationSchema,
  EvidenceSchema,
  SecurityEventSchema,
  type Evidence,
  type RequestContext,
  type SecurityEvent,
  type StepEvent
} from "../contracts/index";

import { buildRuntimeConfig } from "./runtime-config";
import { MockLanguageModel } from "./language-model";
import { runAgentProxy } from "./agent-proxy";
import type { EvidenceProvider } from "./evidence";

describe("agent proxy", () => {
  it("guardrails can block and emits observable step_failed event", async () => {
    const requestId = "req_guard_1";
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

    const events: StepEvent[] = [];
    const securityEvents: SecurityEvent[] = [];

    const model = new MockLanguageModel([{ kind: "text", text: "ok" }]);

    const out = await runAgentProxy(ctx, runtime.value, model, { userInput: "blocked" }, {
      guardrails: async (_c, input) => {
        if (input.stage === "input" && input.content.includes("blocked")) {
          return { action: "block", reason: "blocked_by_test" };
        }
        return { action: "allow" };
      },
      eventSink: (e) => {
        events.push(e);
      },
      securityEventSink: (e) => {
        securityEvents.push(e);
      }
    });

    expect(out.ok).toBe(false);
    if (out.ok) {
      return;
    }

    expect(out.error.code).toBe("GUARDRAIL_BLOCKED");

    const failed = events.find((e) => e.type === "step_failed");
    expect(failed?.requestId).toBe(requestId);

    const errorDetails = (failed?.type === "step_failed" ? failed.payload.error.details : undefined) as unknown;
    const DetailsSchema = z.object({ reason: z.string() }).passthrough();
    const parsed = DetailsSchema.parse(errorDetails);
    expect(parsed.reason).toBe("blocked_by_test");

    const security = securityEvents.find((e) => e.type === "guardrail_blocked");
    expect(security).toBeTruthy();
    if (security === undefined) {
      return;
    }

    const secParsed = SecurityEventSchema.parse(security);
    expect(secParsed.requestId).toBe(requestId);
    expect(secParsed.payload.stage).toBe("input");
    expect(secParsed.payload.reason).toBe("blocked_by_test");
    expect(secParsed.payload.contentLength).toBeGreaterThan(0);
  });

  it("verifies citations via evidence provider and rejects unverifiable citations", async () => {
    const requestId = "req_cite_1";
    const ctx: RequestContext = { requestId, tenantId: "tenant_1", projectId: "p_1" };

    const outputSchema = z
      .object({
        answer: z.string(),
        citations: z.array(CitationSchema)
      })
      .strict();

    const runtime = buildRuntimeConfig(requestId, {
      templateDefinition: {
        schemaVersion: "v1",
        systemPrompt: "sys",
        prompt: "prompt",
        tools: [],
        outputSchema,
        workflowPolicy: { maxSteps: 1, retry: { maxRetries: 0 } },
        citationPolicy: { mode: "required" },
        guardrailsPolicy: { enforceHonorCode: true }
      }
    });

    expect(runtime.ok).toBe(true);
    if (!runtime.ok) {
      return;
    }

    const goodCitation = {
      citationId: "c_1",
      sourceType: "document",
      projectId: "p_1",
      locator: { page: 1 },
      status: "verifiable"
    };

    const evidenceProvider: EvidenceProvider<RequestContext> = {
      async getEvidence(_c, citationId): Promise<Evidence | undefined> {
        if (citationId !== "c_1") {
          return undefined;
        }
        return EvidenceSchema.parse({
          citationId: "c_1",
          sourceType: "document",
          projectId: "p_1",
          locator: { page: 1 },
          status: "verifiable"
        });
      }
    };

    const modelOk = new MockLanguageModel([
      {
        kind: "object",
        object: {
          answer: "ok",
          citations: [goodCitation]
        }
      }
    ]);

    const ok = await runAgentProxy(ctx, runtime.value, modelOk, { userInput: "hi" }, { evidenceProvider });
    expect(ok.ok).toBe(true);
    if (!ok.ok) {
      return;
    }

    expect(ok.value.citations?.[0]?.citationId).toBe("c_1");

    const modelBad = new MockLanguageModel([
      {
        kind: "object",
        object: {
          answer: "bad",
          citations: [{ ...goodCitation, citationId: "c_missing" }]
        }
      }
    ]);

    const bad = await runAgentProxy(ctx, runtime.value, modelBad, { userInput: "hi" }, { evidenceProvider });
    expect(bad.ok).toBe(false);
    if (bad.ok) {
      return;
    }

    expect(bad.error.code).toBe("CONTRACT_VIOLATION");
  });

  it("rejects citations when citation.projectId mismatches ctx.projectId", async () => {
    const requestId = "req_cite_mismatch_1";
    const ctx: RequestContext = { requestId, tenantId: "tenant_1", projectId: "p_1" };

    const outputSchema = z
      .object({
        answer: z.string(),
        citations: z.array(CitationSchema)
      })
      .strict();

    const runtime = buildRuntimeConfig(requestId, {
      templateDefinition: {
        schemaVersion: "v1",
        systemPrompt: "sys",
        prompt: "prompt",
        tools: [],
        outputSchema,
        workflowPolicy: { maxSteps: 1, retry: { maxRetries: 0 } },
        citationPolicy: { mode: "required" },
        guardrailsPolicy: { enforceHonorCode: true }
      }
    });

    expect(runtime.ok).toBe(true);
    if (!runtime.ok) {
      return;
    }

    const evidenceProvider: EvidenceProvider<RequestContext> = {
      async getEvidence() {
        return undefined;
      }
    };

    const modelBad = new MockLanguageModel([
      {
        kind: "object",
        object: {
          answer: "bad",
          citations: [
            {
              citationId: "c_1",
              sourceType: "document",
              projectId: "p_2",
              locator: { page: 1 },
              status: "verifiable"
            }
          ]
        }
      }
    ]);

    const out = await runAgentProxy(ctx, runtime.value, modelBad, { userInput: "hi" }, { evidenceProvider });
    expect(out.ok).toBe(false);
    if (out.ok) {
      return;
    }

    expect(out.error.code).toBe("CONTRACT_VIOLATION");
    expect(out.error.requestId).toBe(requestId);

    const details = out.error.details as unknown;
    const DetailsSchema = z
      .object({
        citationId: z.string().min(1),
        expectedProjectId: z.string().min(1),
        actualProjectId: z.string().min(1)
      })
      .passthrough();

    const parsed = DetailsSchema.parse(details);
    expect(parsed.expectedProjectId).toBe("p_1");
    expect(parsed.actualProjectId).toBe("p_2");
  });

  it("rejects invalid citations that do not match CitationSchema", async () => {
    const requestId = "req_cite_invalid_1";
    const ctx: RequestContext = { requestId, tenantId: "tenant_1", projectId: "p_1" };

    const outputSchema = z
      .object({
        answer: z.string(),
        citations: z.array(z.unknown())
      })
      .strict();

    const runtime = buildRuntimeConfig(requestId, {
      templateDefinition: {
        schemaVersion: "v1",
        systemPrompt: "sys",
        prompt: "prompt",
        tools: [],
        outputSchema,
        workflowPolicy: { maxSteps: 1, retry: { maxRetries: 0 } },
        citationPolicy: { mode: "required" },
        guardrailsPolicy: { enforceHonorCode: true }
      }
    });

    expect(runtime.ok).toBe(true);
    if (!runtime.ok) {
      return;
    }

    const evidenceProvider: EvidenceProvider<RequestContext> = {
      async getEvidence() {
        return undefined;
      }
    };

    const modelBad = new MockLanguageModel([
      {
        kind: "object",
        object: {
          answer: "bad",
          citations: [
            {
              citationId: "c_1",
              sourceType: "document",
              projectId: "p_1",
              locator: { offsetStart: 10, offsetEnd: 1 },
              status: "verifiable"
            }
          ]
        }
      }
    ]);

    const out = await runAgentProxy(ctx, runtime.value, modelBad, { userInput: "hi" }, { evidenceProvider });
    expect(out.ok).toBe(false);
    if (out.ok) {
      return;
    }

    expect(out.error.code).toBe("CONTRACT_VIOLATION");
    expect(out.error.requestId).toBe(requestId);

    const details = out.error.details as unknown;
    const DetailsSchema = z
      .object({
        reason: z.string().min(1),
        issues: z.array(z.object({ message: z.string() }).passthrough())
      })
      .passthrough();

    const parsed = DetailsSchema.parse(details);
    expect(parsed.reason).toBe("CitationSchema validation failed");
    expect(parsed.issues.length).toBeGreaterThan(0);
  });
});
