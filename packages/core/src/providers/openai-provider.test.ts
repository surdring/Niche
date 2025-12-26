import { describe, expect, it, vi } from "vitest";

import type { RequestContext } from "../contracts/context";

import { createOpenAIProviderAdapter } from "./openai-provider";

describe("openai provider adapter", () => {
  it("parses text and usage from chat completions response", async () => {
    const ctx: RequestContext = { requestId: "req_openai_1", tenantId: "t1", projectId: "p1" };

    const fetchFn = vi.fn(async () => {
      return {
        ok: true,
        status: 200,
        statusText: "OK",
        text: async () => {
          return JSON.stringify({
            choices: [{ message: { content: "hello" } }],
            usage: { prompt_tokens: 1, completion_tokens: 2, total_tokens: 3 }
          });
        }
      } as unknown as Response;
    });

    const adapter = createOpenAIProviderAdapter<RequestContext>({
      id: "openai",
      config: { apiKey: "sk_test", baseUrl: "https://api.openai.com/v1", timeoutMs: 10_000 },
      fetchFn
    });

    const out = await adapter.generateText(ctx, { modelId: "gpt-4o-mini", prompt: "hi" });
    expect(out.text).toBe("hello");
    expect(out.usage).toEqual({ inputTokens: 1, outputTokens: 2, totalTokens: 3 });

    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it("throws english error message on non-2xx", async () => {
    const ctx: RequestContext = { requestId: "req_openai_2", tenantId: "t1", projectId: "p1" };

    const fetchFn = vi.fn(async () => {
      return {
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        text: async () => {
          return JSON.stringify({ error: { message: "Invalid API key" } });
        }
      } as unknown as Response;
    });

    const adapter = createOpenAIProviderAdapter<RequestContext>({
      id: "openai",
      config: { apiKey: "sk_bad", baseUrl: "https://api.openai.com/v1", timeoutMs: 10_000 },
      fetchFn
    });

    await expect(adapter.generateText(ctx, { modelId: "gpt-4o-mini", prompt: "hi" })).rejects.toThrow(
      "Invalid API key"
    );
  });

  const runLlamaIntegration = process.env["RUN_LLAMA_INTEGRATION_TESTS"] === "1";
  const itLlama = runLlamaIntegration ? it : it.skip;

  itLlama(
    "can call a llama.cpp OpenAI-compatible server when enabled via env",
    async () => {
      const ctx: RequestContext = { requestId: "req_llama_1", tenantId: "t1", projectId: "p1" };

      const baseUrl = process.env["LLAMA_BASE_URL"] ?? "http://172.16.100.211:8080/v1";
      const apiKey = process.env["LLAMA_API_KEY"] ?? "sk-local-gpt20b";
      const modelId = process.env["LLAMA_MODEL_ID"] ?? "gpt-oss-20b";

      const adapter = createOpenAIProviderAdapter<RequestContext>({
        id: "llama",
        config: {
          apiKey,
          baseUrl,
          timeoutMs: 120_000
        }
      });

      const out = await adapter.generateText(ctx, {
        modelId,
        prompt: "Reply with exactly: pong"
      });

      expect(out.text.length).toBeGreaterThan(0);
    },
    180_000
  );
});
