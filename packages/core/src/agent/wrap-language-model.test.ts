import { describe, expect, it } from "vitest";

import type { RequestContext } from "../contracts/context";

import type { LanguageModelMiddleware } from "./wrap-language-model";
import { wrapLanguageModel } from "./wrap-language-model";

import type { GenerateObjectInput, GenerateObjectResult, GenerateTextInput, GenerateTextResult, LanguageModel } from "./language-model";

const createBaseModel = (calls: string[]): LanguageModel<RequestContext> => {
  return {
    async generateText(_ctx: RequestContext, input: GenerateTextInput): Promise<GenerateTextResult> {
      calls.push("base");
      return { text: input.prompt };
    },
    async generateObject<T>(_ctx: RequestContext, _input: GenerateObjectInput<T>): Promise<GenerateObjectResult<T>> {
      calls.push("base");
      return { object: null as unknown as T };
    }
  };
};

describe("wrapLanguageModel", () => {
  it("preserves middleware order (onion model)", async () => {
    for (let i = 0; i < 50; i += 1) {
      const calls: string[] = [];
      const ctx: RequestContext = { requestId: `req_${i}`, tenantId: "tenant_1", projectId: "p_1" };

      const middlewareCount = 1 + Math.floor(Math.random() * 6);
      const middlewares: LanguageModelMiddleware<RequestContext>[] = [];

      for (let idx = 0; idx < middlewareCount; idx += 1) {
        const name = `mw_${idx}`;
        middlewares.push({
          name,
          async generateText(_c, input, next) {
            calls.push(`${name}:before`);
            const out = await next(_c, input);
            calls.push(`${name}:after`);
            return out;
          }
        });
      }

      const model = wrapLanguageModel(createBaseModel(calls), middlewares);
      await model.generateText(ctx, { prompt: "hello" });

      const expected: string[] = [];
      for (let idx = 0; idx < middlewareCount; idx += 1) {
        expected.push(`mw_${idx}:before`);
      }
      expected.push("base");
      for (let idx = middlewareCount - 1; idx >= 0; idx -= 1) {
        expected.push(`mw_${idx}:after`);
      }

      expect(calls).toEqual(expected);
    }
  });

  it("allows short-circuit without calling inner middleware/base", async () => {
    const calls: string[] = [];
    const ctx: RequestContext = { requestId: "req_short", tenantId: "tenant_1" };

    const middlewares: LanguageModelMiddleware<RequestContext>[] = [
      {
        name: "outer",
        async generateText(_c, input, next) {
          calls.push("outer:before");
          const out = await next(_c, input);
          calls.push("outer:after");
          return out;
        }
      },
      {
        name: "short",
        async generateText() {
          calls.push("short");
          return { text: "fixed" };
        }
      },
      {
        name: "inner",
        async generateText(_c, input, next) {
          calls.push("inner");
          return next(_c, input);
        }
      }
    ];

    const model = wrapLanguageModel(createBaseModel(calls), middlewares);
    const out = await model.generateText(ctx, { prompt: "hi" });

    expect(out.text).toBe("fixed");
    expect(calls).toEqual(["outer:before", "short", "outer:after"]);
  });
});
