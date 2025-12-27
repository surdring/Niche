import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  MockLanguageModel,
  buildRuntimeConfig,
  runAgentProxy,
  type Evidence,
  type EvidenceProvider,
  type RequestContext
} from "@niche/core";

import { citationForgeryCases } from "./citation-forgery-cases";
import { assertContractViolation } from "./assertions";

describe("security/citations", () => {
  it("forged citations trigger CONTRACT_VIOLATION with retryable=false and requestId", async () => {
    const templateRequestId = "req_sec_cite_template";

    const outputSchema = z
      .object({
        answer: z.string(),
        citations: z.array(z.unknown())
      })
      .strict();

    const runtime = buildRuntimeConfig(templateRequestId, {
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
      async getEvidence(_ctx, citationId): Promise<Evidence | undefined> {
        if (citationId === "c_1") {
          return {
            citationId: "c_1",
            sourceType: "document",
            projectId: "p_1",
            locator: { page: 1 },
            status: "verifiable"
          };
        }
        return undefined;
      }
    };

    for (const c of citationForgeryCases) {
      const requestId = `req_sec_cite_${c.id}`;
      const ctx: RequestContext = { requestId, tenantId: "tenant_1", projectId: "p_1" };

      const model = new MockLanguageModel([
        {
          kind: "object",
          object: c.structuredOutput
        }
      ]);

      const out = await runAgentProxy(ctx, runtime.value, model, { userInput: "hi" }, { evidenceProvider });

      expect(out.ok).toBe(false);
      if (out.ok) {
        continue;
      }

      assertContractViolation(out.error, { requestId });

      if (c.kind === "unmappable_citation_id") {
        const DetailsSchema = z.object({ citationId: z.string().min(1) }).passthrough();
        const parsed = DetailsSchema.parse(out.error.details as unknown);
        expect(parsed.citationId).toBe("c_missing");
      }

      if (c.kind === "long_citation_id" || c.kind === "special_char_citation_id") {
        const DetailsSchema = z.object({ citationId: z.string().min(1) }).passthrough();
        const parsed = DetailsSchema.parse(out.error.details as unknown);
        expect(parsed.citationId.length).toBeGreaterThan(0);
      }

      if (c.kind === "cross_project_citation_id") {
        const DetailsSchema = z
          .object({
            citationId: z.string().min(1),
            expectedProjectId: z.string().min(1),
            actualProjectId: z.string().min(1)
          })
          .passthrough();

        const parsed = DetailsSchema.parse(out.error.details as unknown);
        expect(parsed.expectedProjectId).toBe("p_1");
        expect(parsed.actualProjectId).toBe("p_2");
      }

      if (c.kind === "invalid_locator" || c.kind === "invalid_citation_id" || c.kind === "invalid_status") {
        const DetailsSchema = z
          .object({
            reason: z.string().min(1),
            issues: z.array(z.object({ message: z.string() }).passthrough())
          })
          .passthrough();

        const parsed = DetailsSchema.parse(out.error.details as unknown);
        expect(parsed.reason).toBe("CitationSchema validation failed");
        expect(parsed.issues.length).toBeGreaterThan(0);
      }
    }
  });
});
