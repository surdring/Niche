import { z } from "zod";

import type { JsonValue } from "./provider";

export const ProviderRouteSchema = z
  .object({
    providerId: z.string().min(1, "providerId is required"),
    modelId: z.string().min(1, "modelId is required")
  })
  .strict();

export type ProviderRoute = z.infer<typeof ProviderRouteSchema>;

export const ProviderRoutingHintSchema = z
  .object({
    complexity: z.enum(["low", "high"]).optional(),
    budget: z.enum(["low", "high"]).optional()
  })
  .strict();

export type ProviderRoutingHint = z.infer<typeof ProviderRoutingHintSchema>;

export const ProviderRoutingHeuristicSchema = z
  .object({
    thresholdChars: z.number().int().positive("thresholdChars must be positive").default(800),
    low: ProviderRouteSchema,
    high: ProviderRouteSchema
  })
  .strict();

export type ProviderRoutingHeuristic = z.infer<typeof ProviderRoutingHeuristicSchema>;

export const ProviderFallbackPolicySchema = z
  .object({
    maxAttempts: z.number().int().positive("maxAttempts must be positive").optional(),
    skipProviderIds: z.array(z.string().min(1, "skipProviderIds item must be non-empty")).default([])
  })
  .strict();

export type ProviderFallbackPolicy = z.infer<typeof ProviderFallbackPolicySchema>;

export const ProviderRetryPolicySchema = z
  .object({
    maxRetries: z.number().int().nonnegative("maxRetries must be non-negative").default(0)
  })
  .strict();

export type ProviderRetryPolicy = z.infer<typeof ProviderRetryPolicySchema>;

export const ProviderRoutingConfigSchema = z
  .object({
    primary: ProviderRouteSchema,
    fallbacks: z.array(ProviderRouteSchema).default([]),
    heuristic: ProviderRoutingHeuristicSchema.optional(),
    fallbackPolicy: ProviderFallbackPolicySchema.optional(),
    retryPolicy: ProviderRetryPolicySchema.optional()
  })
  .strict();

export type ProviderRoutingConfig = z.infer<typeof ProviderRoutingConfigSchema>;

export type RouteDecision = {
  selected: ProviderRoute;
  candidates: readonly ProviderRoute[];
  reason: string;
  metadata: Record<string, unknown>;
};

const uniqRoutes = (routes: readonly ProviderRoute[]): ProviderRoute[] => {
  const seen = new Set<string>();
  const out: ProviderRoute[] = [];

  for (const r of routes) {
    const key = `${r.providerId}::${r.modelId}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    out.push(r);
  }

  return out;
};

export const parseRoutingHint = (value: unknown): ProviderRoutingHint | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  const parsed = ProviderRoutingHintSchema.safeParse(value);
  if (!parsed.success) {
    return undefined;
  }

  return parsed.data;
};

export const parseRoutingHintFromMetadata = (metadata: JsonValue | undefined): ProviderRoutingHint | undefined => {
  if (metadata === undefined) {
    return undefined;
  }

  if (typeof metadata !== "object" || metadata === null || Array.isArray(metadata)) {
    return undefined;
  }

  const obj = metadata as Record<string, unknown>;
  return parseRoutingHint(obj["routing"]);
};

export const decideProviderRoute = (
  config: ProviderRoutingConfig,
  input: {
    prompt: string;
    systemPrompt?: string;
    hint?: ProviderRoutingHint;
  }
): RouteDecision => {
  const hint = input.hint;
  const heuristic = config.heuristic;

  const promptChars = input.prompt.length;
  const systemPromptChars = input.systemPrompt?.length ?? 0;
  const totalChars = promptChars + systemPromptChars;

  let selected: ProviderRoute = config.primary;
  let reason = "primary";

  const metadata: Record<string, unknown> = {
    promptChars,
    systemPromptChars,
    totalChars
  };

  if (hint?.complexity !== undefined && heuristic !== undefined) {
    selected = hint.complexity === "high" ? heuristic.high : heuristic.low;
    reason = `hint.complexity=${hint.complexity}`;
    metadata["hintComplexity"] = hint.complexity;
  } else if (hint?.budget !== undefined && heuristic !== undefined) {
    selected = hint.budget === "low" ? heuristic.low : heuristic.high;
    reason = `hint.budget=${hint.budget}`;
    metadata["hintBudget"] = hint.budget;
  } else if (heuristic !== undefined) {
    const complexity = totalChars > heuristic.thresholdChars ? "high" : "low";
    selected = complexity === "high" ? heuristic.high : heuristic.low;
    reason = `heuristic.complexity=${complexity}`;
    metadata["heuristicThresholdChars"] = heuristic.thresholdChars;
    metadata["computedComplexity"] = complexity;
  }

  const rawCandidates = uniqRoutes([selected, ...config.fallbacks, config.primary]);

  const policy = config.fallbackPolicy;
  let candidates = rawCandidates;

  if (policy?.skipProviderIds !== undefined && policy.skipProviderIds.length > 0) {
    const skipped = new Set(policy.skipProviderIds);
    candidates = candidates.filter((c) => !skipped.has(c.providerId));
    metadata["skipProviderIds"] = [...policy.skipProviderIds];
  }

  if (policy?.maxAttempts !== undefined) {
    candidates = candidates.slice(0, policy.maxAttempts);
    metadata["maxAttempts"] = policy.maxAttempts;
  }

  if (candidates[0] !== undefined) {
    const s = selected;
    const selectedKey = `${s.providerId}::${s.modelId}`;
    const included = candidates.some((c) => `${c.providerId}::${c.modelId}` === selectedKey);
    if (!included) {
      selected = candidates[0];
      reason = "policy.overrideSelected";
      metadata["selectedOverridden"] = true;
    }
  }

  return {
    selected,
    candidates,
    reason,
    metadata
  };
};
