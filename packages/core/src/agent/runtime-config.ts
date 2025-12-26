import type { z } from "zod";

import type { AppError } from "../contracts/error";
import { resolveTemplateSelection } from "../contracts/template";
import type {
  CitationPolicy,
  GuardrailsPolicy,
  TemplateDefinition,
  TemplateRef,
  TemplateTool,
  WorkflowPolicy
} from "../contracts/template";

export type StructuredOutputPolicy = {
  maxRetries: number;
};

export type RuntimeConfig = {
  templateRef: TemplateRef;
  systemPrompt: string;
  prompt: string;
  tools: readonly TemplateTool[];
  outputSchema?: z.ZodTypeAny;
  workflowPolicy: WorkflowPolicy;
  citationPolicy: CitationPolicy;
  guardrailsPolicy: GuardrailsPolicy;
  structuredOutput: StructuredOutputPolicy;
};

export type RuntimeConfigResult =
  | { ok: true; value: RuntimeConfig; templateDefinition: TemplateDefinition }
  | { ok: false; error: AppError };

export const buildRuntimeConfig = (
  requestId: string,
  input: unknown,
  options?: Parameters<typeof resolveTemplateSelection>[2]
): RuntimeConfigResult => {
  const resolved = resolveTemplateSelection(requestId, input, options);
  if (!resolved.ok) {
    return resolved;
  }

  const def = resolved.value.templateDefinition;

  const retries = def.workflowPolicy.retry?.maxRetries ?? 0;

  return {
    ok: true,
    value: {
      templateRef: resolved.value.templateRef,
      systemPrompt: def.systemPrompt,
      prompt: def.prompt,
      tools: def.tools,
      ...(def.outputSchema !== undefined ? { outputSchema: def.outputSchema } : {}),
      workflowPolicy: def.workflowPolicy,
      citationPolicy: def.citationPolicy,
      guardrailsPolicy: def.guardrailsPolicy,
      structuredOutput: {
        maxRetries: retries
      }
    },
    templateDefinition: def
  };
};
