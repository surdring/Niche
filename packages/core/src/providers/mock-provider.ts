import type { RequestContext } from "../contracts/context";

import type { StreamTextPart, StreamTextResult } from "../agent/language-model";

import type { ProviderAdapter, ProviderTextCallInput, ProviderTextCallResult, TokenUsage } from "./provider";

export type MockProviderScriptStep =
  | {
      kind: "text";
      text: string;
      usage?: TokenUsage;
    }
  | {
      kind: "error";
      message: string;
    }
  | {
      kind: "stream";
      parts: readonly StreamTextPart[];
      throwBeforeFirstToken?: boolean;
      throwAfterParts?: number;
      errorMessage?: string;
    };

export class MockProviderAdapter<TContext extends RequestContext> implements ProviderAdapter<TContext> {
  public readonly id: string;

  private readonly steps: MockProviderScriptStep[];

  public readonly calls: ProviderTextCallInput[] = [];

  public readonly streamCalls: ProviderTextCallInput[] = [];

  public constructor(id: string, steps: readonly MockProviderScriptStep[]) {
    this.id = id;
    this.steps = [...steps];
  }

  public async generateText(_ctx: TContext, input: ProviderTextCallInput): Promise<ProviderTextCallResult> {
    this.calls.push(input);

    const next = this.steps.shift();
    if (next === undefined) {
      return { text: "" };
    }

    if (next.kind === "error") {
      throw new Error(next.message);
    }

    if (next.kind === "stream") {
      throw new Error("MockProviderAdapter step kind mismatch: expected text step");
    }

    return {
      text: next.text,
      ...(next.usage !== undefined ? { usage: next.usage } : {})
    };
  }

  public streamText(_ctx: TContext, input: ProviderTextCallInput): StreamTextResult {
    this.streamCalls.push(input);

    const next = this.steps.shift();
    if (next === undefined) {
      return (async function* empty(): AsyncIterable<StreamTextPart> {
        yield { type: "done" };
      })();
    }

    if (next.kind === "error") {
      return (async function* fail(): AsyncIterable<StreamTextPart> {
        yield* [] as StreamTextPart[];
        throw new Error(next.message);
      })();
    }

    if (next.kind === "text") {
      return (async function* asStream(): AsyncIterable<StreamTextPart> {
        yield { type: "text", text: next.text };
        yield { type: "done" };
      })();
    }

    const errorMessage = next.errorMessage ?? "MockProviderAdapter stream error";
    const throwAfterParts = next.throwAfterParts;
    const parts = [...next.parts];

    return (async function* scripted(): AsyncIterable<StreamTextPart> {
      if (next.throwBeforeFirstToken === true) {
        throw new Error(errorMessage);
      }

      let i = 0;
      for (const part of parts) {
        yield part;
        i += 1;
        if (throwAfterParts !== undefined && i >= throwAfterParts) {
          throw new Error(errorMessage);
        }
      }

      const last = parts[parts.length - 1];
      if (last === undefined || last.type !== "done") {
        yield { type: "done" };
      }
    })();
  }
}
