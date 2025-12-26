import { z } from "zod";

import {
  TemplateRefSchema,
  type TemplateRef,
  StreamPartSchema,
  decodeVercelAiDataStreamLine,
  type StreamPart,
  type VercelAiDataStreamDecodedLine
} from "@niche/core/contracts";

import { createContractViolationError, readRequestIdFromResponse } from "../errors";
import { parseAppErrorResponse, toObservabilityHeaders, type RequestContextHeaders } from "./http";

export type StreamMessage = { role: "user" | "assistant" | "system"; content: string };

export type StreamRequestBody = {
  taskId?: string;
  sessionId?: string;
  messages: readonly StreamMessage[];
  templateRef: TemplateRef;
  options?: { tokenDelayMs?: number; forceError?: boolean };
};

const StreamMessageSchema = z
  .object({
    role: z.enum(["user", "assistant", "system"]),
    content: z.string().min(1)
  })
  .strict();

const StreamRequestOptionsSchema = z
  .object({
    tokenDelayMs: z.number().int().nonnegative().optional(),
    forceError: z.boolean().optional()
  })
  .strict();

const StreamRequestBodySchema = z
  .object({
    taskId: z.string().min(1).optional(),
    sessionId: z.string().min(1).optional(),
    messages: z.array(StreamMessageSchema).min(1),
    templateRef: TemplateRefSchema,
    options: StreamRequestOptionsSchema.optional()
  })
  .strict();

export type StreamTokenHandler = (text: string) => void;
export type StreamPartHandler = (part: StreamPart) => void;
export type StreamMetaHandler = (meta: VercelAiDataStreamDecodedLine) => void;

export type RunStreamOptions = {
  signal?: AbortSignal;
  onToken?: StreamTokenHandler;
  onPart?: StreamPartHandler;
  onMeta?: StreamMetaHandler;
};

const iterateLines = async (stream: ReadableStream<Uint8Array>, onLine: (line: string) => void): Promise<void> => {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  let done = false;
  while (!done) {
    const result = await reader.read();
    done = result.done;

    if (result.value !== undefined) {
      buffer += decoder.decode(result.value, { stream: true });
    }

    let idx = buffer.indexOf("\n");
    while (idx >= 0) {
      const line = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 1);
      onLine(line);
      idx = buffer.indexOf("\n");
    }
  }

  const rest = buffer.trimEnd();
  if (rest.length > 0) {
    onLine(rest);
  }
};

export const runStream = async (ctx: RequestContextHeaders, body: StreamRequestBody, options?: RunStreamOptions): Promise<void> => {
  let parsedBody: z.infer<typeof StreamRequestBodySchema>;
  try {
    parsedBody = StreamRequestBodySchema.parse(body);
  } catch (error) {
    throw createContractViolationError("Stream request body does not match contract", ctx.requestId, error);
  }

  const init: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...toObservabilityHeaders(ctx)
    },
    body: JSON.stringify(parsedBody)
  };

  if (options?.signal !== undefined) {
    init.signal = options.signal;
  }

  const res = await fetch("/api/stream", init);

  const requestId = readRequestIdFromResponse(res);

  if (!res.ok) {
    const appError = await parseAppErrorResponse(res);
    if (appError !== undefined) {
      throw appError;
    }
    throw createContractViolationError(`HTTP ${res.status} from /api/stream`, requestId);
  }

  if (res.body === null) {
    throw createContractViolationError("Missing response body for stream", requestId);
  }

  await iterateLines(res.body, (rawLine) => {
    const trimmed = rawLine.trim();
    if (trimmed.length === 0) {
      return;
    }

    let decoded: VercelAiDataStreamDecodedLine;
    try {
      decoded = decodeVercelAiDataStreamLine(trimmed);
    } catch (error) {
      throw createContractViolationError("Invalid data stream line", requestId, error);
    }

    options?.onMeta?.(decoded);

    if (decoded.kind === "text") {
      options?.onToken?.(decoded.text);
      return;
    }

    if (decoded.kind === "error") {
      const parsedPart = StreamPartSchema.safeParse({ type: "error", errorText: decoded.errorText });
      if (!parsedPart.success) {
        throw createContractViolationError("Stream error part does not match contract", requestId, parsedPart.error);
      }
      options?.onPart?.(parsedPart.data);
      return;
    }

    if (decoded.kind === "data") {
      for (const item of decoded.data) {
        const parsedPart = StreamPartSchema.safeParse(item);
        if (!parsedPart.success) {
          throw createContractViolationError("Stream part does not match contract", requestId, parsedPart.error);
        }
        options?.onPart?.(parsedPart.data);
      }
    }
  });
};
