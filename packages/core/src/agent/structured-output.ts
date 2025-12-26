import { z } from "zod";

import { AppErrorSchema, type AppError } from "../contracts/error";
import type { RequestContext } from "../contracts/context";

import type { GenerateObjectResult, LanguageModel, StreamObjectPart, StreamObjectResult } from "./language-model";

export type StructuredOutputOptions = {
  maxRetries: number;
};

export type StructuredOutputResult<T> =
  | { ok: true; value: T; attempts: number }
  | { ok: false; error: AppError; attempts: number };

const collectStreamObject = async (stream: StreamObjectResult): Promise<unknown> => {
  let last: unknown = null;
  for await (const part of stream) {
    const typed = part as StreamObjectPart;
    if (typed.type === "object") {
      last = typed.object;
    }
  }
  return last;
};

const createStructuredOutputError = (requestId: string, attempts: number, issues: readonly z.ZodIssue[]): AppError => {
  return AppErrorSchema.parse({
    code: "CONTRACT_VIOLATION",
    message: "Model output does not match schema",
    retryable: false,
    requestId,
    details: {
      attempts,
      issues: issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
        code: i.code
      }))
    }
  });
};

export const generateObjectWithRetries = async <TContext extends RequestContext, T>(
  model: LanguageModel<TContext>,
  ctx: TContext,
  input: {
    prompt: string;
    systemPrompt?: string;
    schema: z.ZodType<T>;
  },
  options: StructuredOutputOptions
): Promise<StructuredOutputResult<T>> => {
  const maxRetries = Math.max(0, Math.floor(options.maxRetries));
  let attempt = 0;

  let lastIssues: readonly z.ZodIssue[] = [];

  while (attempt <= maxRetries) {
    const requestInput = {
      prompt: input.prompt,
      schema: input.schema,
      ...(input.systemPrompt !== undefined ? { systemPrompt: input.systemPrompt } : {})
    };

    const res: GenerateObjectResult<T> = await model.generateObject<T>(ctx, requestInput);

    const parsed = input.schema.safeParse(res.object);
    if (parsed.success) {
      return { ok: true, value: parsed.data, attempts: attempt + 1 };
    }

    lastIssues = parsed.error.issues;

    attempt += 1;

    if (attempt > maxRetries) {
      break;
    }
  }

  return {
    ok: false,
    error: createStructuredOutputError(ctx.requestId, attempt, lastIssues),
    attempts: attempt
  };
};

export const streamObjectWithRetries = async <TContext extends RequestContext, T>(
  model: LanguageModel<TContext>,
  ctx: TContext,
  input: {
    prompt: string;
    systemPrompt?: string;
    schema: z.ZodType<T>;
  },
  options: StructuredOutputOptions
): Promise<StructuredOutputResult<T>> => {
  if (model.streamObject === undefined) {
    return generateObjectWithRetries(model, ctx, input, options);
  }

  const maxRetries = Math.max(0, Math.floor(options.maxRetries));
  let attempt = 0;
  let lastIssues: readonly z.ZodIssue[] = [];

  while (attempt <= maxRetries) {
    const requestInput = {
      prompt: input.prompt,
      schema: input.schema,
      ...(input.systemPrompt !== undefined ? { systemPrompt: input.systemPrompt } : {})
    };

    const stream = model.streamObject<T>(ctx, requestInput);
    const obj = await collectStreamObject(stream);

    const parsed = input.schema.safeParse(obj);
    if (parsed.success) {
      return { ok: true, value: parsed.data, attempts: attempt + 1 };
    }

    lastIssues = parsed.error.issues;
    attempt += 1;

    if (attempt > maxRetries) {
      break;
    }
  }

  return {
    ok: false,
    error: createStructuredOutputError(ctx.requestId, attempt, lastIssues),
    attempts: attempt
  };
};
