import * as http from "node:http";

import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  AppErrorSchema,
  StepEventSchema,
  decodeVercelAiDataStreamLinesFromText,
  parseVercelAiDataStreamDataItems
} from "@niche/core";

import type { buildServer } from "../../apps/api/src/main";

import { buildE2eServer } from "./mocks/build-e2e-server";
import { createLongRunningStreamProvider } from "./mocks/stream-provider";

type StreamProvider = NonNullable<NonNullable<Parameters<typeof buildServer>[0]>["streamProvider"]>;

const CreateTaskEnvelopeSchema = z
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

const CancelTaskEnvelopeSchema = z
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

const AbortTimeoutMs = z
  .coerce
  .number()
  .int()
  .positive()
  .parse(process.env.E2E_CANCEL_ABORT_TIMEOUT_MS ?? "2000");

describe("e2e/cancel", () => {
  it("cancelTask aborts stream and task enters cancelled", async () => {
    let abortObserved = false;

    const inner = createLongRunningStreamProvider();

    const provider: StreamProvider = async function* (input) {
      input.signal.addEventListener(
        "abort",
        () => {
          abortObserved = true;
        },
        { once: true }
      );

      for await (const chunk of inner(input)) {
        yield chunk;
      }
    };

    const app = buildE2eServer({ streamProvider: provider });
    await app.ready();

    const tenantId = "tenant_test";
    const projectId = "proj_default";

    const createRes = await app.inject({
      method: "POST",
      url: "/api/graphql",
      headers: {
        "content-type": "application/json",
        "x-request-id": "req_e2e_cancel_create_1",
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
            templateId: "default",
            templateVersion: "0"
          }
        }
      })
    });

    expect(createRes.statusCode).toBe(200);

    const created = CreateTaskEnvelopeSchema.parse(createRes.json() as unknown);
    const taskId = created.data.createTask.taskId;

    const address = await app.listen({ port: 0, host: "127.0.0.1" });
    const url = new URL(`${address}/api/stream`);

    const payload = JSON.stringify({
      taskId,
      messages: [{ role: "user", content: "hello" }],
      templateRef: { templateId: "default", templateVersion: "0" },
      options: { tokenDelayMs: 50 }
    });

    const requestId = "req_e2e_cancel_stream_1";

    let responseText = "";
    let cancelTriggered = false;
    let cancelSucceeded = false;
    let resolveCancelDone: (() => void) | undefined;
    let rejectCancelDone: ((error: Error) => void) | undefined;

    const cancelDone = new Promise<void>((resolve) => {
      resolveCancelDone = resolve;
    });
    const cancelFailed = new Promise<void>((_, reject) => {
      rejectCancelDone = reject;
    });

    const waitForAbort = async (): Promise<void> => {
      const startedAt = Date.now();
      while (!abortObserved) {
        if (Date.now() - startedAt > AbortTimeoutMs) {
          throw new Error("Abort not observed");
        }
        await new Promise<void>((resolve) => setTimeout(resolve, 20));
      }
    };

    await Promise.race([
      new Promise<void>((resolve, reject) => {
        const req = http.request(
          {
            method: "POST",
            host: url.hostname,
            port: Number(url.port),
            path: url.pathname,
            headers: {
              "content-type": "application/json",
              "content-length": Buffer.byteLength(payload),
              "x-request-id": requestId,
              "x-tenant-id": tenantId,
              "x-project-id": projectId
            }
          },
          (res: http.IncomingMessage) => {
            res.on("data", (chunk: Buffer) => {
              responseText += chunk.toString();

              if (cancelTriggered) {
                return;
              }
              cancelTriggered = true;

              void (async () => {
                try {
                  const cancelResponse = await app.inject({
                    method: "POST",
                    url: "/api/graphql",
                    headers: {
                      "content-type": "application/json",
                      "x-request-id": "req_e2e_cancel_mutation_1",
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

                  const cancelPayload = CancelTaskEnvelopeSchema.parse(cancelResponse.json() as unknown);
                  expect(cancelPayload.data.cancelTask.id).toBe(taskId);
                  expect(cancelPayload.data.cancelTask.status).toBe("cancelled");

                  cancelSucceeded = true;
                  resolveCancelDone?.();
                } catch (err: unknown) {
                  const error = err instanceof Error ? err : new Error(String(err));
                  rejectCancelDone?.(error);
                  reject(error);
                }
              })();
            });

            res.on("end", () => resolve());
            res.on("error", () => resolve());
          }
        );

        req.once("error", (err: Error) => reject(err));
        req.write(payload);
        req.end();
      }),
      cancelFailed
    ]);

    await cancelDone;
    expect(cancelSucceeded).toBe(true);
    await waitForAbort();

    const lines = decodeVercelAiDataStreamLinesFromText(responseText);
    const allDataItems = lines.filter((l) => l.kind === "data").flatMap((l) => (l.kind === "data" ? l.data : []));
    const parsedItems = parseVercelAiDataStreamDataItems(allDataItems);

    const maybeErrorPart = parsedItems
      .filter((i) => i.kind === "part")
      .map((i) => (i.kind === "part" ? i.part : undefined))
      .find((p) => p?.type === "data-app-error");

    if (maybeErrorPart?.type === "data-app-error") {
      const appError = AppErrorSchema.parse(maybeErrorPart.data);
      expect(appError.code).toBe("CANCELLED");
      expect(appError.requestId).toBe(requestId);
    }

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

    expect(stepEvents.some((e) => e.type === "step_started")).toBe(true);
    expect(stepEvents.some((e) => e.type === "step_completed")).toBe(false);

    await app.close();
  });
});
