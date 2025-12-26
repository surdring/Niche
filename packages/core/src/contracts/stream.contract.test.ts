import { describe, expect, it } from "vitest";

import {
  AppErrorSchema,
  StepEventSchema,
  decodeVercelAiDataStreamLinesFromText,
  encodeVercelAiDataStreamErrorLine,
  encodeVercelAiDataStreamFinishMessageLine,
  encodeVercelAiDataStreamFinishStepLine,
  encodeVercelAiDataStreamPartsLine,
  encodeVercelAiDataStreamStartStepLine,
  encodeVercelAiDataStreamTextLine,
  parseVercelAiDataStreamDataItems,
  toAppError
} from "./index";

describe("contract/stream", () => {
  const makeTimestamp = (): string => new Date("2025-01-01T00:00:00.000Z").toISOString();

  it("decodes a successful data stream with stage/step-event/citations parts", () => {
    const timestamp = makeTimestamp();

    const stepEvent = StepEventSchema.parse({
      type: "step_started",
      taskId: "t_stream_1",
      stepId: "s_stream_1",
      stepName: "Plan",
      timestamp,
      requestId: "req_stream_contract_ok_1",
      payload: {}
    });

    const partsLine = encodeVercelAiDataStreamPartsLine([
      {
        type: "data-stage",
        data: {
          stage: "planning",
          stepId: "s_stream_1"
        }
      },
      {
        type: "data-step-event",
        data: stepEvent
      },
      {
        type: "data-citations",
        data: [
          {
            citationId: "c_stream_1",
            sourceType: "document",
            projectId: "proj_stream_1",
            locator: { page: 1 },
            status: "verifiable"
          }
        ]
      },
      {
        type: "data-cache-metadata",
        data: {
          cached: false
        }
      }
    ]);

    const payload =
      encodeVercelAiDataStreamStartStepLine({ messageId: "m_stream_1" }) +
      encodeVercelAiDataStreamTextLine("hello") +
      partsLine +
      encodeVercelAiDataStreamFinishStepLine({
        finishReason: "stop",
        usage: { promptTokens: 1, completionTokens: 1 },
        isContinued: false
      }) +
      encodeVercelAiDataStreamFinishMessageLine({
        finishReason: "stop",
        usage: { promptTokens: 1, completionTokens: 1 }
      });

    const lines = decodeVercelAiDataStreamLinesFromText(payload);

    expect(lines.some((l) => l.kind === "start-step")).toBe(true);
    expect(lines.some((l) => l.kind === "finish-step")).toBe(true);
    expect(lines.some((l) => l.kind === "finish-message")).toBe(true);
    expect(lines.some((l) => l.kind === "text" && l.text.length > 0)).toBe(true);

    const allDataItems = lines.flatMap((l) => (l.kind === "data" ? l.data : []));
    const items = parseVercelAiDataStreamDataItems(allDataItems);

    expect(items.some((i) => i.kind === "part" && i.part.type === "data-stage")).toBe(true);
    expect(items.some((i) => i.kind === "part" && i.part.type === "data-step-event")).toBe(true);
    expect(items.some((i) => i.kind === "part" && i.part.type === "data-citations")).toBe(true);
  });

  it("decodes an error block and validates it with AppErrorSchema", () => {
    const payload =
      encodeVercelAiDataStreamTextLine("hello") +
      encodeVercelAiDataStreamPartsLine([
        {
          type: "data-app-error",
          data: {
            code: "UPSTREAM_TIMEOUT",
            message: "Upstream request timed out (requestId=req_stream_contract_err_1)",
            retryable: true,
            requestId: "req_stream_contract_err_1"
          }
        }
      ]) +
      encodeVercelAiDataStreamErrorLine("Upstream request timed out");

    const lines = decodeVercelAiDataStreamLinesFromText(payload);

    const allDataItems = lines.flatMap((l) => (l.kind === "data" ? l.data : []));
    const items = parseVercelAiDataStreamDataItems(allDataItems);

    const appErrorPart = items
      .filter((i) => i.kind === "part")
      .map((i) => (i.kind === "part" ? i.part : undefined))
      .find((p) => p?.type === "data-app-error");

    expect(appErrorPart?.type).toBe("data-app-error");

    if (appErrorPart?.type !== "data-app-error") {
      throw new Error("Missing data-app-error part");
    }

    const parsed = AppErrorSchema.parse(appErrorPart.data);
    expect(parsed.requestId).toBe("req_stream_contract_err_1");

    expect(lines.some((l) => l.kind === "error" && l.errorText.length > 0)).toBe(true);
  });

  it("decodes an empty payload into no lines", () => {
    const lines = decodeVercelAiDataStreamLinesFromText("");
    expect(lines.length).toBe(0);
  });

  it("supports very long text lines", () => {
    const longText = "a".repeat(50_000);

    const payload = encodeVercelAiDataStreamTextLine(longText);
    const lines = decodeVercelAiDataStreamLinesFromText(payload);

    const textLines = lines.filter((l) => l.kind === "text");
    expect(textLines.length).toBe(1);
    const first = textLines[0];
    if (first?.kind !== "text") {
      throw new Error("Invariant violated: expected a text line");
    }
    expect(first.text.length).toBe(longText.length);
    expect(first.text).toBe(longText);
  });

  it("maps AbortError to AppError(code=CANCELLED)", () => {
    const abortError = new Error("Aborted");
    abortError.name = "AbortError";

    const out = toAppError("req_stream_contract_cancel_1", abortError);
    const parsed = AppErrorSchema.parse(out);
    expect(parsed.code).toBe("CANCELLED");
    expect(parsed.requestId).toBe("req_stream_contract_cancel_1");
  });
});
