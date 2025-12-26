import { describe, expect, it } from "vitest";
import { z } from "zod";

import { AppErrorSchema, StepEventSchema, createToolArgsSummary } from "./index";

describe("contract/events", () => {
  const makeTimestamp = (): string => new Date("2025-01-01T00:00:00.000Z").toISOString();

  const makeCommon = (): {
    taskId: string;
    stepId: string;
    stepName: string;
    timestamp: string;
    requestId: string;
  } => {
    return {
      taskId: "t_events_contract_1",
      stepId: "s_events_contract_1",
      stepName: "Plan",
      timestamp: makeTimestamp(),
      requestId: "req_events_contract_1"
    };
  };

  it("parses all 6 StepEvent types and validates required fields", () => {
    const common = makeCommon();

    StepEventSchema.parse({ type: "step_started", ...common, payload: {} });
    StepEventSchema.parse({ type: "step_progress", ...common, payload: { message: "working", progress: 0.5 } });
    StepEventSchema.parse({
      type: "tool_called",
      ...common,
      payload: { toolName: "search", argsSummary: "{\"q\":\"hello\"}" }
    });
    StepEventSchema.parse({ type: "tool_result", ...common, payload: { toolName: "search", resultSummary: "ok" } });
    StepEventSchema.parse({ type: "step_completed", ...common, payload: { outputSummary: "done" } });

    const failed = StepEventSchema.parse({
      type: "step_failed",
      ...common,
      payload: {
        error: {
          code: "UPSTREAM_TIMEOUT",
          message: "Upstream request timed out (requestId=req_events_contract_1)",
          retryable: true,
          requestId: "req_events_contract_1"
        }
      }
    });

    expect(failed.type).toBe("step_failed");
    expect(() => {
      AppErrorSchema.parse(failed.payload.error);
    }).not.toThrow();
  });

  it("rejects tool_called events with empty argsSummary", () => {
    const common = makeCommon();

    expect(() => {
      StepEventSchema.parse({
        type: "tool_called",
        ...common,
        payload: { toolName: "search", argsSummary: "" }
      });
    }).toThrow();
  });

  it("redacts sensitive fields in tool args summary (token/secret/password/apiKey/authorization/cookie)", () => {
    const argsSummary = createToolArgsSummary({
      query: "hello",
      token: "tok_secret",
      secret: "secret_value",
      password: "pw_value",
      apiKey: "sk-should-not-leak",
      api_key: "sk-should-not-leak-2",
      "api-key": "sk-should-not-leak-3",
      authorization: "Bearer should-not-leak",
      cookie: "sid=should-not-leak",
      nested: {
        Authorization: "Bearer nested",
        Cookie: "nested_cookie",
        secretToken: "nested_secret_token",
        ok: true
      }
    });

    const SummarySchema = z
      .object({
        token: z.string().min(1),
        secret: z.string().min(1),
        password: z.string().min(1),
        apiKey: z.string().min(1),
        api_key: z.string().min(1),
        "api-key": z.string().min(1),
        authorization: z.string().min(1),
        cookie: z.string().min(1),
        nested: z
          .object({
            Authorization: z.string().min(1),
            Cookie: z.string().min(1),
            secretToken: z.string().min(1),
            ok: z.boolean()
          })
          .passthrough()
      })
      .passthrough();

    const parsed = SummarySchema.parse(JSON.parse(argsSummary) as unknown);

    expect(parsed.token).toBe("[REDACTED]");
    expect(parsed.secret).toBe("[REDACTED]");
    expect(parsed.password).toBe("[REDACTED]");
    expect(parsed.apiKey).toBe("[REDACTED]");
    expect(parsed.api_key).toBe("[REDACTED]");
    expect(parsed["api-key"]).toBe("[REDACTED]");
    expect(parsed.authorization).toBe("[REDACTED]");
    expect(parsed.cookie).toBe("[REDACTED]");

    expect(parsed.nested.Authorization).toBe("[REDACTED]");
    expect(parsed.nested.Cookie).toBe("[REDACTED]");
    expect(parsed.nested.secretToken).toBe("[REDACTED]");
    expect(parsed.nested.ok).toBe(true);

    expect(argsSummary).not.toContain("tok_secret");
    expect(argsSummary).not.toContain("secret_value");
    expect(argsSummary).not.toContain("pw_value");
    expect(argsSummary).not.toContain("sk-should-not-leak");
    expect(argsSummary).not.toContain("Bearer should-not-leak");
    expect(argsSummary).not.toContain("sid=should-not-leak");
    expect(argsSummary).not.toContain("nested_cookie");
    expect(argsSummary).not.toContain("nested_secret_token");
  });

  it("handles deeply nested objects without leaking secrets", () => {
    let root: Record<string, unknown> = {};
    let cursor: Record<string, unknown> = root;

    for (let i = 0; i < 20; i += 1) {
      const next: Record<string, unknown> = {};
      cursor[`level${i}`] = next;
      cursor = next;
    }
    cursor.password = "pw_deep";

    const argsSummary = createToolArgsSummary(root);
    expect(argsSummary).toContain("[REDACTED]");
    expect(argsSummary).not.toContain("pw_deep");
  });
});
