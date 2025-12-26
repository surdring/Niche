import { describe, expect, it } from "vitest";

import { buildRuntimeConfig } from "./runtime-config";

describe("runtime config", () => {
  it("builds runtime config from templateDefinition and maps retry policy", () => {
    const requestId = "req_runtime_1";

    const templateDefinition = {
      schemaVersion: "v1",
      systemPrompt: "You are Study Copilot.",
      prompt: "Help the user.",
      tools: [],
      workflowPolicy: { maxSteps: 1, retry: { maxRetries: 2 } },
      citationPolicy: { mode: "optional" },
      guardrailsPolicy: { enforceHonorCode: true }
    };

    const out = buildRuntimeConfig(requestId, { templateDefinition });
    expect(out.ok).toBe(true);
    if (!out.ok) {
      return;
    }

    expect(out.value.systemPrompt).toBe(templateDefinition.systemPrompt);
    expect(out.value.structuredOutput.maxRetries).toBe(2);
    expect(out.value.templateRef.templateDefinitionHash).toBeDefined();
  });
});
