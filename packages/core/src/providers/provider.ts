import { z } from "zod";

import type { RequestContext } from "../contracts/context";

import type { StreamTextResult } from "../agent/language-model";

export type JsonPrimitive = null | boolean | number | string;

export type JsonValue =
  | JsonPrimitive
  | { readonly [k: string]: JsonValue }
  | readonly JsonValue[];

export const JsonPrimitiveSchema = z.union([z.null(), z.boolean(), z.number(), z.string()]);

export const JsonValueSchema: z.ZodType<JsonValue> = z.lazy(() => {
  return z.union([
    JsonPrimitiveSchema,
    z.array(JsonValueSchema),
    z.record(JsonValueSchema)
  ]);
});

export type TokenUsage = {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
};

export const TokenUsageSchema = z
  .object({
    inputTokens: z.number().int().nonnegative().optional(),
    outputTokens: z.number().int().nonnegative().optional(),
    totalTokens: z.number().int().nonnegative().optional()
  })
  .strict();

export type ProviderTextCallInput = {
  modelId: string;
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  metadata?: JsonValue;
};

export const ProviderTextCallInputSchema = z
  .object({
    modelId: z.string().min(1, "modelId is required"),
    prompt: z.string().min(1, "prompt is required"),
    systemPrompt: z.string().min(1).optional(),
    temperature: z.number().optional(),
    maxTokens: z.number().int().positive().optional(),
    metadata: JsonValueSchema.optional()
  })
  .strict();

export type ProviderTextCallResult = {
  text: string;
  usage?: TokenUsage;
  raw?: JsonValue;
};

export interface ProviderAdapter<TContext extends RequestContext> {
  id: string;

  generateText(ctx: TContext, input: ProviderTextCallInput): Promise<ProviderTextCallResult>;

  streamText?(ctx: TContext, input: ProviderTextCallInput): StreamTextResult;
}
