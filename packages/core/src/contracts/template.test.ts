import { describe, expect, it } from "vitest";

import {
  DefaultTemplateDefinition,
  TemplateDefinitionSchema,
  TemplateRefSchema,
  createTemplateRefFromDefinition,
  resolveTemplateSelection
} from "./index";

const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const randomBadValue = (): unknown => {
  const kind = randomInt(0, 7);
  switch (kind) {
    case 0:
      return null;
    case 1:
      return undefined;
    case 2:
      return randomInt(-100, 100);
    case 3:
      return Math.random() > 0.5;
    case 4:
      return "";
    case 5:
      return [];
    case 6:
      return {};
    default:
      return { nested: { value: randomInt(0, 10) } };
  }
};

describe("template contracts", () => {
  it("rejects invalid templateDefinition and returns details.issues with field paths", () => {
    const requestId = "req_template_invalid_1";

    for (let i = 0; i < 50; i += 1) {
      const input: unknown = {
        systemPrompt: randomBadValue(),
        prompt: randomBadValue(),
        tools: randomBadValue(),
        workflowPolicy: randomBadValue(),
        citationPolicy: randomBadValue(),
        guardrailsPolicy: randomBadValue(),
        outputSchema: randomBadValue()
      };

      const resolved = resolveTemplateSelection(requestId, { templateDefinition: input });
      expect(resolved.ok).toBe(false);

      if (resolved.ok) {
        continue;
      }

      expect(resolved.error.code).toBe("VALIDATION_ERROR");
      const details = resolved.error.details as { issues?: unknown } | undefined;
      expect(details?.issues).toBeDefined();

      const issues = details?.issues as unknown;
      expect(Array.isArray(issues)).toBe(true);

      const first = Array.isArray(issues) ? (issues[0] as { path?: unknown }) : undefined;
      expect(typeof first?.path).toBe("string");
    }
  });

  it("parses a valid TemplateDefinition and generates a non-empty TemplateRef hash", () => {
    const requestId = "req_template_ok_1";
    const definition = TemplateDefinitionSchema.parse(DefaultTemplateDefinition);

    const out = createTemplateRefFromDefinition(requestId, definition);
    expect(out.ok).toBe(true);

    if (!out.ok) {
      return;
    }

    const parsedRef = TemplateRefSchema.parse(out.value.templateRef);
    expect(typeof parsedRef.templateDefinitionHash).toBe("string");
    expect(parsedRef.templateDefinitionHash?.length).toBeGreaterThan(0);
  });

  it("falls back to default template when neither templateId nor templateDefinition is provided", () => {
    const requestId = "req_template_default_1";
    const out = resolveTemplateSelection(requestId, undefined);
    expect(out.ok).toBe(true);

    if (!out.ok) {
      return;
    }

    expect(out.value.templateRef.templateId).toBeDefined();
    expect(out.value.templateRef.templateVersion).toBeDefined();
    expect(out.value.templateRef.templateId?.length).toBeGreaterThan(0);
    expect(out.value.templateRef.templateVersion?.length).toBeGreaterThan(0);
  });
});
