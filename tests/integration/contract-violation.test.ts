import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  CitationSchema,
  MockLanguageModel,
  buildRuntimeConfig,
  runAgentProxy,
  type Evidence,
  type EvidenceProvider,
  type RequestContext
} from "@niche/core";

describe("integration/contract-violation", () => {
  it("unmappable/unverifiable citation returns CONTRACT_VIOLATION", async () => {
    const requestId = "req_it_contract_1";
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
      async getEvidence(): Promise<Evidence | undefined> {
        return undefined;
      }
    };

    const model = new MockLanguageModel([
      {
        kind: "object",
        object: {
          answer: "ok",
          citations: [
            {
              citationId: "c_missing",
              sourceType: "document",
              projectId: "p_1",
              locator: { page: 1 },
              status: "verifiable"
            }
          ]
        }
      }
    ]);

    const out = await runAgentProxy(ctx, runtime.value, model, { userInput: "hi" }, { evidenceProvider });

    expect(out.ok).toBe(false);
    if (out.ok) {
      return;
    }

    expect(out.error.code).toBe("CONTRACT_VIOLATION");
    expect(out.error.retryable).toBe(false);
    expect(out.error.requestId).toBe(requestId);

    const details = out.error.details as unknown;
    const DetailsSchema = z.object({ citationId: z.string().min(1) }).passthrough();
    const parsed = DetailsSchema.parse(details);
    expect(parsed.citationId).toBe("c_missing");
  });
});
