import { describe, expect, it } from "vitest";

import {
  AppErrorSchema,
  CitationSchema,
  RequestContextSchema,
  StepEventSchema,
  createAppError,
  createToolArgsSummary,
  decodeSseEventsFromText,
  encodeSseDoneLine,
  encodeSsePart,
  parseStreamEvents
} from "./index";

describe("contracts", () => {
  it("rejects invalid AppError", () => {
    expect(() => {
      AppErrorSchema.parse({
        code: "VALIDATION_ERROR",
        message: "",
        retryable: false,
        requestId: "req_1"
      });
    }).toThrow();
  });

  it("createAppError generates a default message when message is empty", () => {
    const err = createAppError({
      code: "UPSTREAM_TIMEOUT",
      message: "",
      retryable: true,
      requestId: "req_default_msg_1"
    });

    const parsed = AppErrorSchema.parse(err);
    expect(parsed.code).toBe("UPSTREAM_TIMEOUT");
    expect(parsed.retryable).toBe(true);
    expect(parsed.requestId).toBe("req_default_msg_1");
    expect(parsed.message).toContain("requestId=req_default_msg_1");
  });

  it("enforces RequestContext.tenantId and allows optional projectId", () => {
    expect(() => {
      RequestContextSchema.parse({
        requestId: "req_1",
        tenantId: ""
      });
    }).toThrow();

    const ok = RequestContextSchema.parse({
      requestId: "req_1",
      tenantId: "tenant_1"
    });
    expect(ok.tenantId).toBe("tenant_1");
  });

  it("enforces degradedReason when Citation.status is degraded", () => {
    expect(() => {
      CitationSchema.parse({
        citationId: "c_1",
        sourceType: "document",
        projectId: "p_1",
        locator: { page: 1 },
        status: "degraded"
      });
    }).toThrow();

    const ok = CitationSchema.parse({
      citationId: "c_2",
      sourceType: "document",
      projectId: "p_1",
      locator: { page: 1 },
      status: "verifiable"
    });
    expect(ok.status).toBe("verifiable");
  });

  it("parses StepEvent discriminated union", () => {
    const timestamp = new Date().toISOString();

    const started = StepEventSchema.parse({
      type: "step_started",
      taskId: "t_1",
      stepId: "s_1",
      stepName: "Plan",
      timestamp,
      requestId: "req_1",
      payload: {}
    });

    expect(started.type).toBe("step_started");

    const failed = StepEventSchema.parse({
      type: "step_failed",
      taskId: "t_1",
      stepId: "s_1",
      stepName: "Plan",
      timestamp,
      requestId: "req_1",
      payload: {
        error: {
          code: "UPSTREAM_TIMEOUT",
          message: "Upstream timeout",
          retryable: true,
          requestId: "req_1"
        }
      }
    });

    expect(failed.type).toBe("step_failed");

    const toolCalled = StepEventSchema.parse({
      type: "tool_called",
      taskId: "t_1",
      stepId: "s_1",
      stepName: "Plan",
      timestamp,
      requestId: "req_1",
      payload: {
        toolName: "search",
        argsSummary: "{\"q\":\"hello\"}"
      }
    });

    expect(toolCalled.type).toBe("tool_called");

    const toolResult = StepEventSchema.parse({
      type: "tool_result",
      taskId: "t_1",
      stepId: "s_1",
      stepName: "Plan",
      timestamp,
      requestId: "req_1",
      payload: {
        toolName: "search",
        resultSummary: "ok"
      }
    });

    expect(toolResult.type).toBe("tool_result");

    const progress = StepEventSchema.parse({
      type: "step_progress",
      taskId: "t_1",
      stepId: "s_1",
      stepName: "Plan",
      timestamp,
      requestId: "req_1",
      payload: {
        message: "working",
        progress: 0.5
      }
    });

    expect(progress.type).toBe("step_progress");

    const completed = StepEventSchema.parse({
      type: "step_completed",
      taskId: "t_1",
      stepId: "s_1",
      stepName: "Plan",
      timestamp,
      requestId: "req_1",
      payload: {
        outputSummary: "done"
      }
    });

    expect(completed.type).toBe("step_completed");

    expect(() => {
      AppErrorSchema.parse(failed.payload.error);
    }).not.toThrow();
  });

  it("redacts secrets in tool args summary", () => {
    const summary = createToolArgsSummary({
      query: "hello",
      apiKey: "sk-should-not-leak",
      nested: {
        token: "secret",
        ok: true
      }
    });

    expect(summary).toContain("[REDACTED]");
    expect(summary).not.toContain("sk-should-not-leak");
    expect(summary).not.toContain("secret");
  });

  it("encodes/decodes SSE parts and DONE marker", () => {
    const stageLine = encodeSsePart({
      type: "data-stage",
      data: {
        stage: "planning"
      }
    });

    const doneLine = encodeSseDoneLine();

    const decoded = decodeSseEventsFromText(`${stageLine}${doneLine}`);
    const parsed = parseStreamEvents(decoded);

    expect(parsed[0]?.kind).toBe("part");
    expect(parsed[1]?.kind).toBe("done");
  });
});
