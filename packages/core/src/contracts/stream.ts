import { z } from "zod";

import { CitationSchema } from "./citation";
import { AppErrorSchema } from "./error";
import { StepEventSchema } from "./events";

export const SSE_DONE_MARKER = "[DONE]";

export const StreamStageSchema = z
  .object({
    stage: z.string().min(1),
    stepId: z.string().min(1).optional()
  })
  .passthrough();

export type StreamStage = z.infer<typeof StreamStageSchema>;

export const StreamStagePartSchema = z
  .object({
    type: z.literal("data-stage"),
    data: StreamStageSchema
  })
  .passthrough();

export type StreamStagePart = z.infer<typeof StreamStagePartSchema>;

export const StreamStepEventPartSchema = z
  .object({
    type: z.literal("data-step-event"),
    data: StepEventSchema
  })
  .passthrough();

export type StreamStepEventPart = z.infer<typeof StreamStepEventPartSchema>;

export const StreamAppErrorPartSchema = z
  .object({
    type: z.literal("data-app-error"),
    data: AppErrorSchema
  })
  .passthrough();

export type StreamAppErrorPart = z.infer<typeof StreamAppErrorPartSchema>;

export const StreamCitationsPartSchema = z
  .object({
    type: z.literal("data-citations"),
    data: z.array(CitationSchema)
  })
  .passthrough();

export type StreamCitationsPart = z.infer<typeof StreamCitationsPartSchema>;

 export const StreamCacheMetadataSchema = z
   .object({
     cached: z.boolean(),
     cacheKey: z.string().min(1).optional(),
     cachedAt: z.string().datetime().optional()
   })
   .passthrough();

 export type StreamCacheMetadata = z.infer<typeof StreamCacheMetadataSchema>;

 export const StreamCacheMetadataPartSchema = z
   .object({
     type: z.literal("data-cache-metadata"),
     data: StreamCacheMetadataSchema
   })
   .passthrough();

 export type StreamCacheMetadataPart = z.infer<typeof StreamCacheMetadataPartSchema>;

export const StreamErrorTextPartSchema = z
  .object({
    type: z.literal("error"),
    errorText: z.string().min(1)
  })
  .passthrough();

export type StreamErrorTextPart = z.infer<typeof StreamErrorTextPartSchema>;

export const StreamPartSchema = z.union([
  StreamErrorTextPartSchema,
  StreamAppErrorPartSchema,
  StreamCitationsPartSchema,
  StreamCacheMetadataPartSchema,
  StreamStagePartSchema,
  StreamStepEventPartSchema
]);

export type StreamPart = z.infer<typeof StreamPartSchema>;

export type SseDecodedEvent =
  | { kind: "data"; raw: string; value: unknown }
  | { kind: "done"; raw: string };

export const encodeSseDataLine = (data: unknown): string => {
  return `data: ${JSON.stringify(data)}\n\n`;
};

export const encodeSseDoneLine = (): string => {
  return `data: ${SSE_DONE_MARKER}\n\n`;
};

export const encodeSsePart = (part: StreamPart): string => {
  const parsed = StreamPartSchema.parse(part);
  return encodeSseDataLine(parsed);
};

const decodeSingleSseData = (dataRaw: string): SseDecodedEvent => {
  const trimmed = dataRaw.trim();
  if (trimmed === SSE_DONE_MARKER) {
    return { kind: "done", raw: dataRaw };
  }

  try {
    const value: unknown = JSON.parse(trimmed);
    return { kind: "data", raw: dataRaw, value };
  } catch {
    throw new Error("Invalid SSE JSON data");
  }
};

export const decodeSseEventsFromText = (text: string): SseDecodedEvent[] => {
  const events: SseDecodedEvent[] = [];

  const chunks = text.split("\n\n");
  for (const chunk of chunks) {
    const trimmed = chunk.trim();
    if (trimmed.length === 0) {
      continue;
    }

    const lines = trimmed.split("\n");
    for (const line of lines) {
      const lineTrimmed = line.trim();
      if (!lineTrimmed.startsWith("data:")) {
        continue;
      }

      const dataRaw = lineTrimmed.slice("data:".length).trim();
      events.push(decodeSingleSseData(dataRaw));
    }
  }

  return events;
};

export const VercelAiFinishReasonSchema = z.enum([
  "stop",
  "length",
  "content-filter",
  "tool-calls",
  "error",
  "other",
  "unknown"
]);

export type VercelAiFinishReason = z.infer<typeof VercelAiFinishReasonSchema>;

export const VercelAiUsageSchema = z
  .object({
    promptTokens: z.number().int().nonnegative(),
    completionTokens: z.number().int().nonnegative()
  })
  .strict();

export type VercelAiUsage = z.infer<typeof VercelAiUsageSchema>;

export const VercelAiStartStepSchema = z
  .object({
    messageId: z.string().min(1)
  })
  .strict();

export type VercelAiStartStep = z.infer<typeof VercelAiStartStepSchema>;

export const VercelAiFinishStepSchema = z
  .object({
    finishReason: VercelAiFinishReasonSchema,
    usage: VercelAiUsageSchema,
    isContinued: z.boolean()
  })
  .strict();

export type VercelAiFinishStep = z.infer<typeof VercelAiFinishStepSchema>;

export const VercelAiFinishMessageSchema = z
  .object({
    finishReason: VercelAiFinishReasonSchema,
    usage: VercelAiUsageSchema
  })
  .strict();

export type VercelAiFinishMessage = z.infer<typeof VercelAiFinishMessageSchema>;

export const encodeVercelAiDataStreamTextLine = (text: string): string => {
  return `0:${JSON.stringify(z.string().parse(text))}\n`;
};

export const encodeVercelAiDataStreamDataLine = (data: readonly unknown[]): string => {
  const parsed = z.array(z.unknown()).parse(data);
  return `2:${JSON.stringify(parsed)}\n`;
};

export const encodeVercelAiDataStreamErrorLine = (errorText: string): string => {
  return `3:${JSON.stringify(z.string().min(1).parse(errorText))}\n`;
};

export const encodeVercelAiDataStreamStartStepLine = (value: VercelAiStartStep): string => {
  const parsed = VercelAiStartStepSchema.parse(value);
  return `f:${JSON.stringify(parsed)}\n`;
};

export const encodeVercelAiDataStreamFinishStepLine = (value: VercelAiFinishStep): string => {
  const parsed = VercelAiFinishStepSchema.parse(value);
  return `e:${JSON.stringify(parsed)}\n`;
};

export const encodeVercelAiDataStreamFinishMessageLine = (value: VercelAiFinishMessage): string => {
  const parsed = VercelAiFinishMessageSchema.parse(value);
  return `d:${JSON.stringify(parsed)}\n`;
};

export const encodeVercelAiDataStreamPartsLine = (parts: readonly StreamPart[]): string => {
  const parsed = parts.map((p) => StreamPartSchema.parse(p));
  return encodeVercelAiDataStreamDataLine(parsed);
};

export type VercelAiDataStreamDecodedLine =
  | { kind: "text"; raw: string; text: string }
  | { kind: "data"; raw: string; data: unknown[] }
  | { kind: "error"; raw: string; errorText: string }
  | { kind: "start-step"; raw: string; value: VercelAiStartStep }
  | { kind: "finish-step"; raw: string; value: VercelAiFinishStep }
  | { kind: "finish-message"; raw: string; value: VercelAiFinishMessage }
  | { kind: "unknown"; raw: string; code: string; value: unknown };

export const decodeVercelAiDataStreamLine = (rawLine: string): VercelAiDataStreamDecodedLine => {
  const trimmed = rawLine.trim();
  const idx = trimmed.indexOf(":");
  if (idx <= 0) {
    throw new Error("Invalid data stream line");
  }

  const code = trimmed.slice(0, idx);
  const payloadRaw = trimmed.slice(idx + 1);

  let json: unknown;
  try {
    json = JSON.parse(payloadRaw);
  } catch {
    throw new Error("Invalid data stream JSON");
  }

  if (code === "0") {
    const text = z.string().parse(json);
    return { kind: "text", raw: rawLine, text };
  }

  if (code === "2") {
    const data = z.array(z.unknown()).parse(json);
    return { kind: "data", raw: rawLine, data };
  }

  if (code === "3") {
    const errorText = z.string().parse(json);
    return { kind: "error", raw: rawLine, errorText };
  }

  if (code === "f") {
    const value = VercelAiStartStepSchema.parse(json);
    return { kind: "start-step", raw: rawLine, value };
  }

  if (code === "e") {
    const value = VercelAiFinishStepSchema.parse(json);
    return { kind: "finish-step", raw: rawLine, value };
  }

  if (code === "d") {
    const value = VercelAiFinishMessageSchema.parse(json);
    return { kind: "finish-message", raw: rawLine, value };
  }

  return { kind: "unknown", raw: rawLine, code, value: json };
};

export const decodeVercelAiDataStreamLinesFromText = (text: string): VercelAiDataStreamDecodedLine[] => {
  const lines = text.split("\n");
  const out: VercelAiDataStreamDecodedLine[] = [];

  for (const line of lines) {
    if (line.trim().length === 0) {
      continue;
    }
    out.push(decodeVercelAiDataStreamLine(line));
  }

  return out;
};

export type ParsedVercelAiDataStreamDataItem =
  | { kind: "part"; part: StreamPart }
  | { kind: "unknown"; value: unknown };

export const parseVercelAiDataStreamDataItems = (
  data: readonly unknown[]
): ParsedVercelAiDataStreamDataItem[] => {
  const out: ParsedVercelAiDataStreamDataItem[] = [];

  for (const item of data) {
    const parsed = StreamPartSchema.safeParse(item);
    if (!parsed.success) {
      out.push({ kind: "unknown", value: item });
      continue;
    }
    out.push({ kind: "part", part: parsed.data });
  }

  return out;
};

export type ParsedStreamEvent =
  | { kind: "part"; part: StreamPart }
  | { kind: "done" }
  | { kind: "unknown"; value: unknown };

export const parseStreamEvents = (decoded: readonly SseDecodedEvent[]): ParsedStreamEvent[] => {
  const out: ParsedStreamEvent[] = [];

  for (const item of decoded) {
    if (item.kind === "done") {
      out.push({ kind: "done" });
      continue;
    }

    const parsed = StreamPartSchema.safeParse(item.value);
    if (!parsed.success) {
      out.push({ kind: "unknown", value: item.value });
      continue;
    }

    out.push({ kind: "part", part: parsed.data });
  }

  return out;
};
