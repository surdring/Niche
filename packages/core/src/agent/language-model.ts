import { z } from "zod";

import type { RequestContext } from "../contracts/context";

export type GenerateTextInput = {
  prompt: string;
  systemPrompt?: string;
};

export type GenerateTextResult = {
  text: string;
};

export type StreamTextPart =
  | {
      type: "text";
      text: string;
    }
  | {
      type: "done";
    };

export type StreamTextResult = AsyncIterable<StreamTextPart>;

export type GenerateObjectInput<T> = {
  prompt: string;
  schema: z.ZodType<T>;
  systemPrompt?: string;
};

export type GenerateObjectResult<T> = {
  object: T;
  rawText?: string;
};

export type StreamObjectPart =
  | {
      type: "object";
      object: unknown;
    }
  | {
      type: "done";
    };

export type StreamObjectResult = AsyncIterable<StreamObjectPart>;

export interface LanguageModel<TContext extends RequestContext> {
  generateText(ctx: TContext, input: GenerateTextInput): Promise<GenerateTextResult>;
  streamText?(ctx: TContext, input: GenerateTextInput): StreamTextResult;

  generateObject<T>(ctx: TContext, input: GenerateObjectInput<T>): Promise<GenerateObjectResult<T>>;
  streamObject?<T>(ctx: TContext, input: GenerateObjectInput<T>): StreamObjectResult;
}

export type MockLanguageModelScriptStep =
  | {
      kind: "text";
      text: string;
    }
  | {
      kind: "object";
      object: unknown;
      rawText?: string;
    };

export class MockLanguageModel implements LanguageModel<RequestContext> {
  private readonly steps: MockLanguageModelScriptStep[];

  public constructor(steps: readonly MockLanguageModelScriptStep[]) {
    this.steps = [...steps];
  }

  public async generateText(_ctx: RequestContext, _input: GenerateTextInput): Promise<GenerateTextResult> {
    const next = this.steps.shift();
    if (next === undefined) {
      return { text: "" };
    }

    if (next.kind === "text") {
      return { text: next.text };
    }

    const text = typeof next.rawText === "string" ? next.rawText : JSON.stringify(next.object);
    return { text };
  }

  public async generateObject<T>(_ctx: RequestContext, _input: GenerateObjectInput<T>): Promise<GenerateObjectResult<T>> {
    const next = this.steps.shift();
    if (next === undefined) {
      return { object: null as unknown as T };
    }

    if (next.kind === "object") {
      return {
        object: next.object as unknown as T,
        ...(next.rawText !== undefined ? { rawText: next.rawText } : {})
      };
    }

    return { object: { text: next.text } as unknown as T };
  }
}
