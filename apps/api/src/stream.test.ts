import { Writable } from "node:stream";
import * as http from "node:http";

import type { FastifyServerOptions } from "fastify";
import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  AppErrorSchema,
  CitationSchema,
  StepEventSchema,
  decodeVercelAiDataStreamLinesFromText,
  parseVercelAiDataStreamDataItems
} from "@niche/core";

import { buildServer } from "./main";

type StreamProvider = NonNullable<NonNullable<Parameters<typeof buildServer>[0]>["streamProvider"]>;

describe("/api/stream", () => {
  it("streams data and can be decoded", async () => {
    const app = buildServer({ logger: false });
    await app.ready();

    const requestId = "req_stream_ok_1";

    const response = await app.inject({
      method: "POST",
      url: "/api/stream",
      headers: {
        "content-type": "application/json",
        "x-request-id": requestId,
        "x-tenant-id": "tenant_test",
        "x-project-id": "proj_test"
      },
      payload: JSON.stringify({
        taskId: "t_1",
        messages: [{ role: "user", content: "hello" }],
        templateRef: { templateId: "tmpl_1", templateVersion: "v1" }
      })
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["x-vercel-ai-data-stream"]).toBe("v1");
    expect(String(response.headers["content-type"])).toContain("text/plain");

    const lines = decodeVercelAiDataStreamLinesFromText(response.payload);

    expect(lines.some((l) => l.kind === "start-step")).toBe(true);
    expect(lines.some((l) => l.kind === "text" && l.text.length > 0)).toBe(true);
    expect(lines.some((l) => l.kind === "finish-step")).toBe(true);
    expect(lines.some((l) => l.kind === "finish-message")).toBe(true);

    const dataLines = lines.filter((l) => l.kind === "data");
    expect(dataLines.length).toBeGreaterThan(0);

    const allDataItems = dataLines.flatMap((l) => (l.kind === "data" ? l.data : []));
    const parsedItems = parseVercelAiDataStreamDataItems(allDataItems);

    expect(parsedItems.some((i) => i.kind === "part" && i.part.type === "data-stage")).toBe(true);

    expect(parsedItems.some((i) => i.kind === "part" && i.part.type === "data-step-event")).toBe(true);

    const citationsParts = parsedItems
      .filter((i): i is Extract<typeof i, { kind: "part" }> => i.kind === "part")
      .filter((i) => i.part.type === "data-citations")
      .map((i) => i.part.data);
    expect(citationsParts.length).toBeGreaterThan(0);
    CitationSchema.array().min(1).parse(citationsParts[0]);

    await app.close();
  });

  it("stops emitting StepEvents after cancelTask and task enters cancelled state", async () => {
    let abortObserved = false;

    const provider: StreamProvider = async function* (input) {
      input.signal.addEventListener(
        "abort",
        () => {
          abortObserved = true;
        },
        { once: true }
      );

      const sleep = (ms: number): Promise<void> => {
        return new Promise<void>((resolve) => {
          const timeout = setTimeout(() => resolve(), ms);
          input.signal.addEventListener(
            "abort",
            () => {
              abortObserved = true;
              clearTimeout(timeout);
              resolve();
            },
            { once: true }
          );
        });
      };

      for (let i = 0; i < 200; i += 1) {
        if (input.signal.aborted) {
          abortObserved = true;
          return;
        }

        await sleep(50);
        if (input.signal.aborted) {
          abortObserved = true;
          return;
        }

        yield `t${i}`;
      }
    };

    const app = buildServer({ logger: false, streamProvider: provider });
    await app.ready();

    const tenantId = "tenant_test";
    const projectId = "proj_default";

    const createResponse = await app.inject({
      method: "POST",
      url: "/api/graphql",
      headers: {
        "content-type": "application/json",
        "x-tenant-id": tenantId,
        "x-project-id": projectId
      },
      payload: JSON.stringify({
        query: `
          mutation CreateTask($input: CreateTaskInput!) {
            createTask(input: $input) {
              taskId
            }
          }
        `,
        variables: {
          input: {
            projectId,
            templateDefinition: {
              schemaVersion: "v1",
              systemPrompt: "sys",
              prompt: "prompt",
              tools: [],
              workflowPolicy: { maxSteps: 1, retry: { maxRetries: 0 } },
              citationPolicy: { mode: "optional" },
              guardrailsPolicy: { enforceHonorCode: true }
            }
          }
        }
      })
    });

    expect(createResponse.statusCode).toBe(200);

    const CreateEnvelopeSchema = z
      .object({
        data: z
          .object({
            createTask: z
              .object({
                taskId: z.string().min(1)
              })
              .passthrough()
          })
          .passthrough()
      })
      .passthrough();

    const created = CreateEnvelopeSchema.parse(createResponse.json());
    const taskId = created.data.createTask.taskId;

    const address = await app.listen({ port: 0, host: "127.0.0.1" });
    const url = new URL(`${address}/api/stream`);

    const payload = JSON.stringify({
      taskId,
      messages: [{ role: "user", content: "hello" }],
      templateRef: { templateId: "tmpl_1", templateVersion: "v1" },
      options: { tokenDelayMs: 50 }
    });

    let responseText = "";
    let cancelRequested = false;
    let cancelSucceeded = false;

    let resolveCancelDone: (() => void) | undefined;
    let rejectCancelDone: ((err: Error) => void) | undefined;
    const cancelDone = new Promise<void>((resolve, reject) => {
      resolveCancelDone = resolve;
      rejectCancelDone = reject;
    });

    const waitForAbort = async (): Promise<void> => {
      const startedAt = Date.now();
      while (!abortObserved) {
        if (Date.now() - startedAt > 2000) {
          throw new Error("Abort not observed");
        }
        await new Promise<void>((resolve) => setTimeout(resolve, 20));
      }
    };

    await new Promise<void>((resolve, reject) => {
      const req = http.request(
        {
          method: "POST",
          host: url.hostname,
          port: Number(url.port),
          path: url.pathname,
          headers: {
            "content-type": "application/json",
            "content-length": Buffer.byteLength(payload),
            "x-request-id": "req_stream_cancel_task_1",
            "x-tenant-id": tenantId,
            "x-project-id": "proj_test"
          }
        },
        (res: http.IncomingMessage) => {
          res.on("data", (chunk: Buffer) => {
            responseText += chunk.toString();

            if (cancelRequested) {
              return;
            }
            cancelRequested = true;

            void (async () => {
              const cancelResponse = await app.inject({
                method: "POST",
                url: "/api/graphql",
                headers: {
                  "content-type": "application/json",
                  "x-tenant-id": tenantId,
                  "x-project-id": projectId
                },
                payload: JSON.stringify({
                  query: `
                    mutation CancelTask($taskId: ID!) {
                      cancelTask(taskId: $taskId) {
                        id
                        status
                      }
                    }
                  `,
                  variables: { taskId }
                })
              });

              expect(cancelResponse.statusCode).toBe(200);

              const CancelEnvelopeSchema = z
                .object({
                  data: z
                    .object({
                      cancelTask: z
                        .object({
                          id: z.string().min(1),
                          status: z.string().min(1)
                        })
                        .passthrough()
                    })
                    .passthrough()
                })
                .passthrough();

              const cancelled = CancelEnvelopeSchema.parse(cancelResponse.json());
              expect(cancelled.data.cancelTask.id).toBe(taskId);
              expect(cancelled.data.cancelTask.status).toBe("cancelled");

              cancelSucceeded = true;
              resolveCancelDone?.();
            })().catch((err: unknown) => {
              const error = err instanceof Error ? err : new Error(String(err));
              rejectCancelDone?.(error);
              reject(error);
            });
          });

          res.on("end", () => resolve());
          res.on("error", () => resolve());
        }
      );

      req.once("error", (err: Error) => reject(err));
      req.write(payload);
      req.end();
    });

    await cancelDone;
    expect(cancelSucceeded).toBe(true);
    await waitForAbort();

    const lines = decodeVercelAiDataStreamLinesFromText(responseText);
    const dataLines = lines.filter((l) => l.kind === "data");
    const allDataItems = dataLines.flatMap((l) => (l.kind === "data" ? l.data : []));
    const parsedItems = parseVercelAiDataStreamDataItems(allDataItems);

    const stepEvents = parsedItems
      .filter((i) => i.kind === "part")
      .map((i) => (i.kind === "part" ? i.part : undefined))
      .filter((p) => p?.type === "data-step-event")
      .map((p) => {
        if (p?.type !== "data-step-event") {
          throw new Error("Invariant violated: expected data-step-event part");
        }
        return StepEventSchema.parse(p.data);
      });

    expect(stepEvents.length).toBeGreaterThan(0);

    expect(stepEvents.some((e) => e.type === "step_started")).toBe(true);
    expect(stepEvents.some((e) => e.type === "tool_called")).toBe(true);

    expect(stepEvents.some((e) => e.type === "step_completed")).toBe(false);

    await app.close();
  });

  it("emits StepEvents that include requestId/taskId/stepId/timestamp", async () => {
    const app = buildServer({ logger: false });
    await app.ready();

    const requestId = "req_stream_events_1";
    const taskId = "t_events_1";

    const response = await app.inject({
      method: "POST",
      url: "/api/stream",
      headers: {
        "content-type": "application/json",
        "x-request-id": requestId,
        "x-tenant-id": "tenant_test",
        "x-project-id": "proj_test"
      },
      payload: JSON.stringify({
        taskId,
        messages: [{ role: "user", content: "hello" }],
        templateRef: { templateId: "tmpl_1", templateVersion: "v1" }
      })
    });

    expect(response.statusCode).toBe(200);

    const lines = decodeVercelAiDataStreamLinesFromText(response.payload);
    const dataLines = lines.filter((l) => l.kind === "data");
    const allDataItems = dataLines.flatMap((l) => (l.kind === "data" ? l.data : []));
    const parsedItems = parseVercelAiDataStreamDataItems(allDataItems);

    const stepEvents = parsedItems
      .filter((i) => i.kind === "part")
      .map((i) => (i.kind === "part" ? i.part : undefined))
      .filter((p) => p?.type === "data-step-event")
      .map((p) => {
        if (p?.type !== "data-step-event") {
          throw new Error("Invariant violated: expected data-step-event part");
        }
        return StepEventSchema.parse(p.data);
      });

    expect(stepEvents.length).toBeGreaterThan(0);

    const types = new Set(stepEvents.map((e) => e.type));
    expect(types.has("step_started")).toBe(true);
    expect(types.has("tool_called")).toBe(true);
    expect(types.has("step_completed")).toBe(true);

    for (const e of stepEvents) {
      expect(e.requestId).toBe(requestId);
      expect(e.taskId).toBe(taskId);
      expect(typeof e.stepId).toBe("string");
      expect(e.stepId.length).toBeGreaterThan(0);
      expect(typeof e.timestamp).toBe("string");
      expect(e.timestamp.length).toBeGreaterThan(0);
    }

    await app.close();
  });

  it("returns an error block that can be parsed to AppError", async () => {
    const app = buildServer({ logger: false });
    await app.ready();

    const requestId = "req_stream_err_1";

    const response = await app.inject({
      method: "POST",
      url: "/api/stream",
      headers: {
        "content-type": "application/json",
        "x-request-id": requestId,
        "x-tenant-id": "tenant_test",
        "x-project-id": "proj_test"
      },
      payload: JSON.stringify({
        taskId: "t_1",
        messages: [{ role: "user", content: "hello" }],
        templateRef: { templateId: "tmpl_1", templateVersion: "v1" },
        options: { forceError: true }
      })
    });

    expect(response.statusCode).toBe(200);

    const lines = decodeVercelAiDataStreamLinesFromText(response.payload);

    const dataLines = lines.filter((l) => l.kind === "data");
    const allDataItems = dataLines.flatMap((l) => (l.kind === "data" ? l.data : []));
    const parsedItems = parseVercelAiDataStreamDataItems(allDataItems);

    const errorPart = parsedItems
      .filter((i) => i.kind === "part")
      .map((i) => (i.kind === "part" ? i.part : undefined))
      .find((p) => p?.type === "data-app-error");

    expect(errorPart?.type).toBe("data-app-error");

    if (errorPart?.type !== "data-app-error") {
      throw new Error("Missing data-app-error part");
    }

    const appError = AppErrorSchema.parse(errorPart.data);
    expect(appError.requestId).toBe(requestId);
    expect(appError.code.length).toBeGreaterThan(0);
    expect(appError.message.length).toBeGreaterThan(0);

    expect(lines.some((l) => l.kind === "error" && l.errorText.length > 0)).toBe(true);

    await app.close();
  });

  it("cancels the underlying provider when the client disconnects", async () => {
    let abortObserved = false;

    const provider: StreamProvider = async function* (input) {
      if (input.signal.aborted) {
        abortObserved = true;
        return;
      }

      input.signal.addEventListener(
        "abort",
        () => {
          abortObserved = true;
        },
        { once: true }
      );

      const sleep = (ms: number): Promise<void> => {
        return new Promise<void>((resolve) => {
          if (input.signal.aborted) {
            abortObserved = true;
            resolve();
            return;
          }

          const timeout = setTimeout(() => resolve(), ms);
          input.signal.addEventListener(
            "abort",
            () => {
              abortObserved = true;
              clearTimeout(timeout);
              resolve();
            },
            { once: true }
          );
        });
      };

      for (let i = 0; i < 100; i += 1) {
        if (input.signal.aborted) {
          abortObserved = true;
          return;
        }

        yield `t${i}`;
        await sleep(50);
      }
    };

    const app = buildServer({ logger: false, streamProvider: provider });
    await app.ready();

    const address = await app.listen({ port: 0, host: "127.0.0.1" });

    const url = new URL(`${address}/api/stream`);

    const payload = JSON.stringify({
      taskId: "t_1",
      messages: [{ role: "user", content: "hello" }],
      templateRef: { templateId: "tmpl_1", templateVersion: "v1" },
      options: { tokenDelayMs: 50 }
    });

    const waitForAbort = async (): Promise<void> => {
      const startedAt = Date.now();
      while (!abortObserved) {
        if (Date.now() - startedAt > 2000) {
          throw new Error("Abort not observed");
        }
        await new Promise<void>((resolve) => setTimeout(resolve, 20));
      }
    };

    await new Promise<void>((resolve, reject) => {
      const req = http.request(
        {
          method: "POST",
          host: url.hostname,
          port: Number(url.port),
          path: url.pathname,
          headers: {
            "content-type": "application/json",
            "content-length": Buffer.byteLength(payload),
            "x-request-id": "req_stream_cancel_1",
            "x-tenant-id": "tenant_test",
            "x-project-id": "proj_test"
          }
        },
        (res: http.IncomingMessage) => {
          res.once("data", () => {
            res.destroy();
            resolve();
          });
          res.once("error", () => {
            resolve();
          });
        }
      );

      req.once("error", (err: Error) => {
        reject(err);
      });

      req.write(payload);
      req.end();
    });

    await waitForAbort();
    expect(abortObserved).toBe(true);

    await app.close();
  });

  it("records TTFT in logs", async () => {
    let logBuffer = "";

    const captureStream = new Writable({
      write(chunk, _encoding, callback) {
        logBuffer += chunk.toString();
        callback();
      }
    });

    const logger = {
      level: "info",
      stream: captureStream
    } as unknown as NonNullable<FastifyServerOptions["logger"]>;

    const app = buildServer({ logger });
    await app.ready();

    const requestId = "req_stream_ttft_1";

    const response = await app.inject({
      method: "POST",
      url: "/api/stream",
      headers: {
        "content-type": "application/json",
        "x-request-id": requestId,
        "x-tenant-id": "tenant_test",
        "x-project-id": "proj_test"
      },
      payload: JSON.stringify({
        taskId: "t_1",
        messages: [{ role: "user", content: "hello" }],
        templateRef: { templateId: "tmpl_1", templateVersion: "v1" },
        options: { tokenDelayMs: 1 }
      })
    });

    expect(response.statusCode).toBe(200);

    const logLines = logBuffer
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const parsedLogs: Array<{ event?: string; requestId?: string; ttftMs?: number }> = [];
    for (const line of logLines) {
      try {
        parsedLogs.push(JSON.parse(line) as { event?: string; requestId?: string; ttftMs?: number });
      } catch {
        continue;
      }
    }

    const ttft = parsedLogs.find((l) => l.event === "stream_ttft");
    expect(ttft?.requestId).toBe(requestId);
    expect(typeof ttft?.ttftMs).toBe("number");

    await app.close();
  });
});
