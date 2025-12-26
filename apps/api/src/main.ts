import { randomUUID } from "node:crypto";
import { PassThrough } from "node:stream";

import Fastify, { type FastifyInstance, type FastifyServerOptions } from "fastify";
import { z } from "zod";

import {
  AppErrorSchema,
  EvidenceSchema,
  type RequestContext,
  type Citation,
  createRagflowCitationRepo,
  createInMemoryRagflowEvidenceStore,
  createLruTtlCache,
  computeResponseCacheKey,
  getEvidenceByCitationId,
  retrieveWithRagflow,
  type RagflowClient,
  type RagflowEvidenceStore,
  type LruTtlCache,
  StepEventSchema,
  TemplateRefSchema,
  createToolArgsSummary,
  encodeSseDoneLine,
  encodeSsePart,
  encodeVercelAiDataStreamErrorLine,
  encodeVercelAiDataStreamFinishMessageLine,
  encodeVercelAiDataStreamFinishStepLine,
  encodeVercelAiDataStreamPartsLine,
  encodeVercelAiDataStreamStartStepLine,
  encodeVercelAiDataStreamTextLine,
  loadAppEnv
} from "@niche/core";

import { createMockRagflowClient } from "./ragflow-mock";

import { createInMemoryStore, registerGraphQL, type NicheStore } from "./graphql";

type NicheRequestContext = RequestContext & {
  taskId?: string;
  sessionId?: string;
};

declare module "fastify" {
  interface FastifyRequest {
    nicheContext: NicheRequestContext;
  }
}

const ObservabilityHeadersSchema = z
  .object({
    tenantId: z.string().min(1).optional(),
    projectId: z.string().min(1).optional(),
    taskId: z.string().min(1).optional(),
    sessionId: z.string().min(1).optional()
  })
  .strict();

const AuthErrorDetailsSchema = z
  .object({
    missing: z.string().min(1)
  })
  .strict();

type AuthErrorDetails = z.infer<typeof AuthErrorDetailsSchema>;

const createAuthError = (requestId: string, message: string, details?: AuthErrorDetails) => {
  return AppErrorSchema.parse({
    code: "AUTH_ERROR",
    message: `${message} (requestId=${requestId})`,
    retryable: false,
    requestId,
    ...(details !== undefined ? { details: AuthErrorDetailsSchema.parse(details) } : {})
  });
};

const isHealthPath = (path: string): boolean => {
  return path === "/health" || path === "/api/health";
};

const requiresProjectId = (path: string): boolean => {
  return path === "/api/stream" || path === "/api/evidence" || path === "/api/upload" || path === "/api/retrieve";
};

const toSingleHeaderValue = (value: string | string[] | undefined): string | undefined => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  if (Array.isArray(value)) {
    const first = value[0];
    if (typeof first !== "string") {
      return undefined;
    }

    const trimmed = first.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  return undefined;
};

const HealthResponseSchema = z.object({
  ok: z.literal(true)
});

type HealthResponse = z.infer<typeof HealthResponseSchema>;

type StreamProviderInput = {
  ctx: NicheRequestContext;
  prompt: string;
  signal: AbortSignal;
  options: {
    tokenDelayMs: number;
    forceError: boolean;
  };
};

type StreamProvider = (input: StreamProviderInput) => AsyncIterable<string>;

const defaultStreamProvider: StreamProvider = async function* (input) {
  const chunks = ["Hello", " ", "world"];

  for (let idx = 0; idx < chunks.length; idx += 1) {
    if (input.signal.aborted) {
      return;
    }

    if (input.options.tokenDelayMs > 0) {
      await new Promise<void>((resolve) => {
        const timeout = setTimeout(() => {
          resolve();
        }, input.options.tokenDelayMs);

        input.signal.addEventListener(
          "abort",
          () => {
            clearTimeout(timeout);
            resolve();
          },
          { once: true }
        );
      });
    }

    if (input.signal.aborted) {
      return;
    }

    if (input.options.forceError && idx === 1) {
      throw new Error("Mock provider error");
    }

    yield chunks[idx] ?? "";
  }
};

type BuildServerOptions = {
  logger?: FastifyServerOptions["logger"];
  streamProvider?: StreamProvider;
  streamProviderId?: string;
  streamModelId?: string;
  responseCacheEnabled?: boolean;
  responseCache?: LruTtlCache<ResponseCacheEntry>;
  store?: NicheStore;
  ragflowClient?: RagflowClient;
  ragflowEvidenceStore?: RagflowEvidenceStore;
};

type ResponseCacheEntry = {
  text: string;
  citations?: readonly Citation[];
  cachedAt: string;
};

const createValidationError = (requestId: string, message: string) => {
  return AppErrorSchema.parse({
    code: "VALIDATION_ERROR",
    message: `${message} (requestId=${requestId})`,
    retryable: false,
    requestId
  });
};

const createStreamError = (requestId: string, message: string) => {
  return AppErrorSchema.parse({
    code: "UPSTREAM_UNAVAILABLE",
    message: `${message} (requestId=${requestId})`,
    retryable: true,
    requestId
  });
};

const createCancelledError = (requestId: string) => {
  return AppErrorSchema.parse({
    code: "CANCELLED",
    message: `Request cancelled (requestId=${requestId})`,
    retryable: true,
    requestId
  });
};

const toDurationMs = (startNs: bigint, endNs: bigint): number => {
  const diff = endNs - startNs;
  return Number(diff) / 1_000_000;
};

const nowIso = (): string => new Date().toISOString();

const StreamMessageSchema = z
  .object({
    role: z.enum(["user", "assistant", "system"]),
    content: z.string().min(1)
  })
  .passthrough();

type StreamMessage = z.infer<typeof StreamMessageSchema>;

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
  .strict()
  .superRefine((val, ctx) => {
    if (val.taskId === undefined && val.sessionId === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Either taskId or sessionId is required",
        path: ["taskId"]
      });
    }
  });

type StreamRequestBody = z.infer<typeof StreamRequestBodySchema>;

const getLastUserMessage = (messages: readonly StreamMessage[]): string => {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const msg = messages[i];
    if (msg?.role === "user") {
      return msg.content;
    }
  }
  return messages[messages.length - 1]?.content ?? "";
};

export const buildServer = (options?: BuildServerOptions): FastifyInstance => {
  const store = options?.store ?? createInMemoryStore();
  const ragflowEvidenceStore = options?.ragflowEvidenceStore ?? createInMemoryRagflowEvidenceStore();
  const ragflowClient = options?.ragflowClient ?? createMockRagflowClient();
  const responseCacheEnabled = options?.responseCacheEnabled ?? false;
  const responseCache = responseCacheEnabled
    ? (options?.responseCache ?? createLruTtlCache<ResponseCacheEntry>({ maxEntries: 128, ttlMs: 60_000 }))
    : undefined;
  const citationRepo = createRagflowCitationRepo(ragflowEvidenceStore);

  const app = Fastify({
    logger: options?.logger ?? true,
    requestIdHeader: "x-request-id",
    requestIdLogLabel: "requestId",
    genReqId: (req) => {
      const header = toSingleHeaderValue(req.headers["x-request-id"]);
      if (typeof header === "string" && header.length > 0) {
        return header;
      }

      return `req_${randomUUID()}`;
    }
  });

  app.decorateRequest("nicheContext", null as unknown as NicheRequestContext);

  app.addHook("onRequest", async (request, reply) => {
    const path = request.url.split("?")[0] ?? request.url;

    const headers = ObservabilityHeadersSchema.parse({
      tenantId: toSingleHeaderValue(request.headers["x-tenant-id"]),
      projectId: toSingleHeaderValue(request.headers["x-project-id"]),
      taskId: toSingleHeaderValue(request.headers["x-task-id"]),
      sessionId: toSingleHeaderValue(request.headers["x-session-id"])
    });

    if (!isHealthPath(path) && headers.tenantId === undefined) {
      const payload = createAuthError(request.id, "Missing tenantId", { missing: "tenantId" });
      reply.code(401).send(payload);
      return;
    }

    if (requiresProjectId(path) && headers.projectId === undefined) {
      const payload = createAuthError(request.id, "Missing projectId", { missing: "projectId" });
      reply.code(401).send(payload);
      return;
    }

    const ctx: NicheRequestContext = {
      requestId: request.id,
      tenantId: headers.tenantId ?? "unknown",
      ...(headers.projectId !== undefined ? { projectId: headers.projectId } : {}),
      ...(headers.taskId !== undefined ? { taskId: headers.taskId } : {}),
      ...(headers.sessionId !== undefined ? { sessionId: headers.sessionId } : {})
    };

    request.nicheContext = ctx;

    request.log.info({ ...ctx, event: "request_received" }, "Request received");
  });

  app.addHook("onSend", async (request, reply, payload) => {
    reply.header("x-request-id", request.id);
    return payload;
  });

  app.get("/api/health", async () => {
    const payload: HealthResponse = { ok: true };
    return HealthResponseSchema.parse(payload);
  });

  app.get("/health", async () => {
    const payload: HealthResponse = { ok: true };
    return HealthResponseSchema.parse(payload);
  });

  app.get("/api/_debug/trace", async (request, reply) => {
    const timestamp = new Date().toISOString();

    const stepEvent = StepEventSchema.parse({
      type: "step_started",
      taskId: request.nicheContext.taskId ?? "t_debug",
      stepId: "s_debug",
      stepName: "DebugTrace",
      timestamp,
      requestId: request.nicheContext.requestId,
      payload: {}
    });

    request.log.info(
      { ...request.nicheContext, event: "step_event_emitted", stepEvent },
      "Step event emitted"
    );

    const body =
      encodeSsePart({
        type: "data-stage",
        data: {
          stage: "debug"
        }
      }) +
      encodeSsePart({
        type: "data-step-event",
        data: stepEvent
      }) +
      encodeSseDoneLine();

    reply.header("content-type", "text/event-stream; charset=utf-8");
    return body;
  });

  app.post("/api/stream", async (request, reply) => {
    const startNs = process.hrtime.bigint();
    const ctx = request.nicheContext;
    const provider = options?.streamProvider ?? defaultStreamProvider;

    let body: StreamRequestBody;
    try {
      body = StreamRequestBodySchema.parse(request.body);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const appError = createValidationError(ctx.requestId, message);
      reply.code(400);
      reply.header("x-request-id", ctx.requestId);
      reply.header("X-Vercel-AI-Data-Stream", "v1");
      reply.header("Content-Type", "text/plain; charset=utf-8");
      return (
        encodeVercelAiDataStreamPartsLine([{ type: "data-app-error", data: appError }]) +
        encodeVercelAiDataStreamErrorLine(appError.message)
      );
    }

    const abortController = new AbortController();

    const taskId = body.taskId ?? ctx.taskId ?? `t_${randomUUID()}`;
    const stepId = `s_${randomUUID()}`;
    const stepName = "Answer";

    const storeAbortSignal = body.taskId
      ? store.getAbortSignal({ tenantId: ctx.tenantId, taskId: body.taskId })
      : undefined;

    const onStoreCancelled = () => {
      if (!abortController.signal.aborted) {
        abortController.abort();
      }
    };

    if (storeAbortSignal !== undefined) {
      storeAbortSignal.addEventListener("abort", onStoreCancelled, { once: true });
    }

    const onClientDisconnected = () => {
      if (!abortController.signal.aborted) {
        abortController.abort();
      }
    };

    request.raw.on("close", onClientDisconnected);
    request.raw.on("aborted", onClientDisconnected);
    reply.raw.on("close", onClientDisconnected);
    request.raw.socket?.on("close", onClientDisconnected);
    reply.raw.socket?.on("close", onClientDisconnected);

    const stream = new PassThrough();

    reply.header("x-request-id", ctx.requestId);
    reply.header("X-Vercel-AI-Data-Stream", "v1");
    reply.header("Content-Type", "text/plain; charset=utf-8");
    reply.header("Cache-Control", "no-cache, no-transform");

    const safeWrite = (chunk: string): void => {
      if (abortController.signal.aborted) {
        return;
      }

      try {
        stream.write(chunk);
      } catch {
        return;
      }
    };

    const streamMessageId = `msg_${randomUUID()}`;
    safeWrite(encodeVercelAiDataStreamStartStepLine({ messageId: streamMessageId }));
    safeWrite(
      encodeVercelAiDataStreamPartsLine([
        {
          type: "data-stage",
          data: {
            stage: "answer"
          }
        }
      ])
    );

    const emitStepEvent = (event: unknown): void => {
      if (abortController.signal.aborted) {
        return;
      }

      const parsed = StepEventSchema.parse(event);
      safeWrite(encodeVercelAiDataStreamPartsLine([{ type: "data-step-event", data: parsed }]));
    };

    emitStepEvent({
      type: "step_started",
      taskId,
      stepId,
      stepName,
      timestamp: nowIso(),
      requestId: ctx.requestId,
      payload: {}
    });

    emitStepEvent({
      type: "tool_called",
      taskId,
      stepId,
      stepName,
      timestamp: nowIso(),
      requestId: ctx.requestId,
      payload: {
        toolName: "mock_tool",
        argsSummary: createToolArgsSummary({
          query: "hello",
          apiKey: "sk-should-not-leak",
          nested: {
            token: "secret",
            ok: true
          }
        })
      }
    });

    const prompt = getLastUserMessage(body.messages);

    const providerOptions = {
      tokenDelayMs: body.options?.tokenDelayMs ?? 0,
      forceError: body.options?.forceError ?? false
    };

    let wroteFirstToken = false;
    let completionTokens = 0;
    let fullText = "";

    void (async () => {
      try {
        if (ctx.projectId === undefined) {
          throw new Error("Invariant violated: projectId is required for /api/stream");
        }

        const responseCacheProviderId = options?.streamProviderId ?? "api_stream_provider";
        const responseCacheModelId = options?.streamModelId;

        const responseCacheInstance =
          responseCache !== undefined && typeof responseCacheModelId === "string" && responseCacheModelId.length > 0
            ? responseCache
            : undefined;
        const responseCacheUsable = responseCacheInstance !== undefined;

        if (responseCache !== undefined && !responseCacheUsable) {
          request.log.warn(
            { ...ctx, event: "response_cache_disabled_missing_model_id", taskId },
            "Response cache disabled because streamModelId is missing"
          );
        }

        let cacheKey: string | undefined;
        if (responseCacheUsable) {
          cacheKey = computeResponseCacheKey({
            tenantId: ctx.tenantId,
            projectId: ctx.projectId,
            templateRef: body.templateRef,
            messages: body.messages,
            retrieval: { providerId: "ragflow", query: prompt },
            modelInfo: {
              providerId: responseCacheProviderId,
              modelId: responseCacheModelId
            }
          });

          const cached = responseCacheInstance.get(cacheKey);
          if (cached !== undefined) {
            request.log.info(
              { ...ctx, event: "response_cache_hit", cacheKey, cachedAt: cached.cachedAt, taskId },
              "Response cache hit"
            );

            safeWrite(
              encodeVercelAiDataStreamPartsLine([
                {
                  type: "data-cache-metadata",
                  data: { cached: true, cacheKey, cachedAt: cached.cachedAt }
                }
              ])
            );

            if (!wroteFirstToken) {
              wroteFirstToken = true;
              const ttftMs = toDurationMs(startNs, process.hrtime.bigint());
              request.log.info({ ...ctx, event: "stream_ttft", ttftMs }, "TTFT recorded");
            }

            completionTokens += cached.text.length > 0 ? 1 : 0;
            fullText = cached.text;

            emitStepEvent({
              type: "tool_result",
              taskId,
              stepId,
              stepName,
              timestamp: nowIso(),
              requestId: ctx.requestId,
              payload: {
                toolName: "mock_tool",
                resultSummary: "cached"
              }
            });

            safeWrite(encodeVercelAiDataStreamTextLine(cached.text));

            if (cached.citations !== undefined) {
              safeWrite(
                encodeVercelAiDataStreamPartsLine([
                  {
                    type: "data-citations",
                    data: [...cached.citations]
                  }
                ])
              );
            }

            const usage = { promptTokens: 0, completionTokens };

            emitStepEvent({
              type: "step_completed",
              taskId,
              stepId,
              stepName,
              timestamp: nowIso(),
              requestId: ctx.requestId,
              payload: {
                outputSummary: fullText.slice(0, 256)
              }
            });

            safeWrite(
              encodeVercelAiDataStreamFinishStepLine({
                finishReason: "stop",
                usage,
                isContinued: false
              })
            );
            safeWrite(encodeVercelAiDataStreamFinishMessageLine({ finishReason: "stop", usage }));
            return;
          }

          request.log.info({ ...ctx, event: "response_cache_miss", cacheKey, taskId }, "Response cache miss");

          safeWrite(
            encodeVercelAiDataStreamPartsLine([
              {
                type: "data-cache-metadata",
                data: { cached: false, cacheKey }
              }
            ])
          );
        }

        for await (const chunk of provider({ ctx, prompt, signal: abortController.signal, options: providerOptions })) {
          if (abortController.signal.aborted) {
            throw createCancelledError(ctx.requestId);
          }

          const text = typeof chunk === "string" ? chunk : "";
          if (text.length === 0) {
            continue;
          }

          if (!wroteFirstToken) {
            wroteFirstToken = true;
            const ttftMs = toDurationMs(startNs, process.hrtime.bigint());
            request.log.info({ ...ctx, event: "stream_ttft", ttftMs }, "TTFT recorded");
          }

          completionTokens += 1;
          fullText += text;

          emitStepEvent({
            type: "step_progress",
            taskId,
            stepId,
            stepName,
            timestamp: nowIso(),
            requestId: ctx.requestId,
            payload: {
              message: "streaming",
              progress: Math.min(0.99, completionTokens / 100)
            }
          });

          if (completionTokens === 1) {
            emitStepEvent({
              type: "tool_result",
              taskId,
              stepId,
              stepName,
              timestamp: nowIso(),
              requestId: ctx.requestId,
              payload: {
                toolName: "mock_tool",
                resultSummary: "ok"
              }
            });
          }

          safeWrite(encodeVercelAiDataStreamTextLine(text));
        }

        if (abortController.signal.aborted) {
          throw createCancelledError(ctx.requestId);
        }

        const usage = { promptTokens: 0, completionTokens };

        emitStepEvent({
          type: "step_completed",
          taskId,
          stepId,
          stepName,
          timestamp: nowIso(),
          requestId: ctx.requestId,
          payload: {
            outputSummary: fullText.slice(0, 256)
          }
        });

        const retrieved = await retrieveWithRagflow(
          ctx,
          { query: prompt },
          { client: ragflowClient },
          { evidenceStore: ragflowEvidenceStore, signal: abortController.signal }
        );

        if (retrieved.ok) {
          safeWrite(
            encodeVercelAiDataStreamPartsLine([
              {
                type: "data-citations",
                data: [...retrieved.value.citations]
              }
            ])
          );
        } else {
          request.log.warn({ ...ctx, event: "ragflow_retrieve_failed", error: retrieved.error }, "RAGFlow retrieve failed");
        }

        if (!abortController.signal.aborted && responseCacheUsable && cacheKey !== undefined && fullText.length > 0) {
          const cachedAt = nowIso();
          responseCacheInstance.set(cacheKey, {
            text: fullText,
            cachedAt,
            ...(retrieved.ok ? { citations: [...retrieved.value.citations] } : {})
          });
          request.log.info(
            { ...ctx, event: "response_cache_store", cacheKey, cachedAt, taskId },
            "Response cached"
          );
        }

        safeWrite(
          encodeVercelAiDataStreamFinishStepLine({
            finishReason: "stop",
            usage,
            isContinued: false
          })
        );
        safeWrite(encodeVercelAiDataStreamFinishMessageLine({ finishReason: "stop", usage }));
      } catch (error) {
        const parsed = AppErrorSchema.safeParse(error);
        const appError = parsed.success
          ? parsed.data
          : error instanceof Error
            ? createStreamError(ctx.requestId, error.message)
            : createStreamError(ctx.requestId, String(error));

        if (!abortController.signal.aborted) {
          emitStepEvent({
            type: "step_failed",
            taskId,
            stepId,
            stepName,
            timestamp: nowIso(),
            requestId: ctx.requestId,
            payload: { error: appError }
          });
        }

        const usage = { promptTokens: 0, completionTokens };

        safeWrite(encodeVercelAiDataStreamPartsLine([{ type: "data-app-error", data: appError }]));
        safeWrite(encodeVercelAiDataStreamErrorLine(appError.message));
        safeWrite(
          encodeVercelAiDataStreamFinishStepLine({
            finishReason: "error",
            usage,
            isContinued: false
          })
        );
        safeWrite(encodeVercelAiDataStreamFinishMessageLine({ finishReason: "error", usage }));
      } finally {
        const durationMs = toDurationMs(startNs, process.hrtime.bigint());
        request.log.info({ ...ctx, event: "stream_completed", durationMs }, "Stream completed");

        try {
          stream.end();
        } catch {
          // ignore
        }

        request.raw.off("close", onClientDisconnected);
        request.raw.off("aborted", onClientDisconnected);
        reply.raw.off("close", onClientDisconnected);
        request.raw.socket?.off("close", onClientDisconnected);
        reply.raw.socket?.off("close", onClientDisconnected);

        if (storeAbortSignal !== undefined) {
          storeAbortSignal.removeEventListener("abort", onStoreCancelled);
        }
      }
    })();

    return reply.send(stream);
  });

  app.post("/api/retrieve", async (request, reply) => {
    const ctx = request.nicheContext;

    const result = await retrieveWithRagflow(
      ctx,
      request.body,
      { client: ragflowClient },
      { evidenceStore: ragflowEvidenceStore }
    );
    if (result.ok) {
      return result.value;
    }

    const statusCode = (() => {
      switch (result.error.code) {
        case "AUTH_ERROR":
          return 401;
        case "VALIDATION_ERROR":
          return 400;
        case "UPSTREAM_TIMEOUT":
          return 504;
        case "UPSTREAM_UNAVAILABLE":
          return 503;
        case "CONTRACT_VIOLATION":
          return 502;
        default:
          return 500;
      }
    })();

    reply.code(statusCode).send(result.error);
  });

  const EvidenceQuerySchema = z
    .object({
      citationId: z.string().min(1)
    })
    .strict();

  app.get("/api/evidence", async (request, reply) => {
    let query: z.infer<typeof EvidenceQuerySchema>;
    try {
      query = EvidenceQuerySchema.parse(request.query);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const appError = createValidationError(request.nicheContext.requestId, message);
      return reply.code(400).send(appError);
    }
    const projectId = request.nicheContext.projectId;
    if (projectId === undefined) {
      throw new Error("Invariant violated: projectId is required for /api/evidence");
    }

    const result = await getEvidenceByCitationId(request.nicheContext, query.citationId, { repo: citationRepo });
    if (result.ok) {
      return EvidenceSchema.parse(result.evidence);
    }

    const statusCode = (() => {
      switch (result.error.code) {
        case "AUTH_ERROR":
          return 401;
        case "VALIDATION_ERROR":
          return 400;
        case "UPSTREAM_TIMEOUT":
          return 504;
        case "UPSTREAM_UNAVAILABLE":
          return 503;
        case "CONTRACT_VIOLATION":
          return 502;
        default:
          return 500;
      }
    })();

    request.log.warn({ ...request.nicheContext, event: "evidence_failed", error: result.error }, "Evidence lookup failed");
    return reply.code(statusCode).send(result.error);
  });

  const UploadResponseSchema = z.object({ ok: z.literal(true) }).strict();
  type UploadResponse = z.infer<typeof UploadResponseSchema>;

  app.post("/api/upload", async () => {
    const payload: UploadResponse = { ok: true };
    return UploadResponseSchema.parse(payload);
  });

  registerGraphQL(app, { store });

  return app;
};

const main = async () => {
  const env = loadAppEnv();
  const app = buildServer();

  try {
    await app.listen({ port: env.API_PORT, host: "0.0.0.0" });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    app.log.error(`Failed to start API server: ${message}`);
    process.exit(1);
  }
};

if (require.main === module) {
  void main();
}
