import { describe, expect, it } from "vitest";
import { z } from "zod";

import { AppErrorSchema, decodeVercelAiDataStreamLinesFromText, parseVercelAiDataStreamDataItems } from "@niche/core";

import { buildE2eServer } from "./mocks/build-e2e-server";
import { createErrorStreamProvider } from "./mocks/stream-provider";

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

describe("e2e/error-retry", () => {
  it("provider failure yields retryable error then retry succeeds", async () => {
    const app = buildE2eServer({ streamProvider: createErrorStreamProvider() });
    await app.ready();

    const tenantId = "tenant_test";
    const projectId = "proj_default";

    const createRes = await app.inject({
      method: "POST",
      url: "/api/graphql",
      headers: {
        "content-type": "application/json",
        "x-request-id": "req_e2e_retry_create_1",
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

    const requestId1 = "req_e2e_retry_stream_1";
    const res1 = await app.inject({
      method: "POST",
      url: "/api/stream",
      headers: {
        "content-type": "application/json",
        "x-request-id": requestId1,
        "x-tenant-id": tenantId,
        "x-project-id": projectId
      },
      payload: JSON.stringify({
        taskId,
        messages: [{ role: "user", content: "hello" }],
        templateRef: { templateId: "default", templateVersion: "0" },
        options: { forceError: true }
      })
    });

    expect(res1.statusCode).toBe(200);

    const lines1 = decodeVercelAiDataStreamLinesFromText(res1.payload);
    const allDataItems1 = lines1.filter((l) => l.kind === "data").flatMap((l) => (l.kind === "data" ? l.data : []));
    const parsed1 = parseVercelAiDataStreamDataItems(allDataItems1);

    const appErrors = parsed1
      .filter((i): i is Extract<typeof i, { kind: "part" }> => i.kind === "part")
      .filter((i) => i.part.type === "data-app-error")
      .map((i) => i.part.data);

    expect(appErrors.length).toBeGreaterThan(0);

    const appError = AppErrorSchema.parse(appErrors[0]);
    expect(appError.code).toBe("UPSTREAM_UNAVAILABLE");
    expect(appError.retryable).toBe(true);
    expect(appError.requestId).toBe(requestId1);
    expect(appError.message).toContain(`requestId=${requestId1}`);

    const requestId2 = "req_e2e_retry_stream_2";
    const res2 = await app.inject({
      method: "POST",
      url: "/api/stream",
      headers: {
        "content-type": "application/json",
        "x-request-id": requestId2,
        "x-tenant-id": tenantId,
        "x-project-id": projectId
      },
      payload: JSON.stringify({
        taskId,
        messages: [{ role: "user", content: "hello" }],
        templateRef: { templateId: "default", templateVersion: "0" },
        options: { forceError: false }
      })
    });

    expect(res2.statusCode).toBe(200);

    const lines2 = decodeVercelAiDataStreamLinesFromText(res2.payload);
    const hasFinish = lines2.some((l) => l.kind === "finish-message");
    expect(hasFinish).toBe(true);

    await app.close();
  });
});
