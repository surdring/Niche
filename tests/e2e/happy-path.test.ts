import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  AppErrorSchema,
  CitationSchema,
  EvidenceSchema,
  decodeVercelAiDataStreamLinesFromText,
  exportToMarkdown,
  parseVercelAiDataStreamDataItems,
  StepEventSchema,
  type StepEvent,
  type Citation
} from "@niche/core";

import { buildE2eServer } from "./mocks/build-e2e-server";
import { createHappyStreamProvider } from "./mocks/stream-provider";

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

describe("e2e/happy-path", () => {
  it("template launch -> run -> citations -> evidence -> export", async () => {
    const app = buildE2eServer({ streamProvider: createHappyStreamProvider() });
    await app.ready();

    const tenantId = "tenant_test";
    const projectId = "proj_default";

    const createRes = await app.inject({
      method: "POST",
      url: "/api/graphql",
      headers: {
        "content-type": "application/json",
        "x-request-id": "req_e2e_happy_create_1",
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

    const createPayload = CreateTaskEnvelopeSchema.parse(createRes.json() as unknown);
    const taskId = createPayload.data.createTask.taskId;

    const requestId = "req_e2e_happy_stream_1";

    const streamRes = await app.inject({
      method: "POST",
      url: "/api/stream",
      headers: {
        "content-type": "application/json",
        "x-request-id": requestId,
        "x-tenant-id": tenantId,
        "x-project-id": projectId
      },
      payload: JSON.stringify({
        taskId,
        messages: [{ role: "user", content: "hello" }],
        templateRef: { templateId: "default", templateVersion: "0" }
      })
    });

    expect(streamRes.statusCode).toBe(200);
    expect(streamRes.headers["x-vercel-ai-data-stream"]).toBe("v1");

    const lines = decodeVercelAiDataStreamLinesFromText(streamRes.payload);
    expect(lines.some((l) => l.kind === "start-step")).toBe(true);
    expect(lines.some((l) => l.kind === "finish-message")).toBe(true);

    const text = lines
      .filter((l) => l.kind === "text")
      .map((l) => (l.kind === "text" ? l.text : ""))
      .join("");

    expect(text).toContain("Hello");
    expect(text).toContain("world");

    const allDataItems = lines.filter((l) => l.kind === "data").flatMap((l) => (l.kind === "data" ? l.data : []));
    const parsedItems = parseVercelAiDataStreamDataItems(allDataItems);

    const stepEvents = parsedItems
      .filter((i): i is Extract<typeof i, { kind: "part" }> => i.kind === "part")
      .filter((i) => i.part.type === "data-step-event")
      .map((i) => StepEventSchema.parse(i.part.data));

    const toolCalled = stepEvents.find(
      (e): e is Extract<StepEvent, { type: "tool_called" }> => e.type === "tool_called"
    );
    expect(toolCalled).toBeDefined();
    if (toolCalled === undefined) {
      throw new Error("Invariant violated: expected tool_called event");
    }

    const argsSummary = toolCalled.payload.argsSummary;
    expect(typeof argsSummary).toBe("string");
    expect(argsSummary).not.toContain("sk-");
    expect(argsSummary).not.toContain("secret");

    const citations = parsedItems
      .filter((i): i is Extract<typeof i, { kind: "part" }> => i.kind === "part")
      .filter((i) => i.part.type === "data-citations")
      .flatMap((i) => i.part.data);

    const citationsParsed = CitationSchema.array().min(1).parse(citations as unknown);
    const first: Citation | undefined = citationsParsed[0];
    if (first === undefined) {
      throw new Error("Invariant violated: expected at least one citation");
    }

    const evidenceRes = await app.inject({
      method: "GET",
      url: `/api/evidence?citationId=${encodeURIComponent(first.citationId)}`,
      headers: {
        "x-request-id": "req_e2e_happy_evidence_1",
        "x-tenant-id": tenantId,
        "x-project-id": projectId
      }
    });

    expect(evidenceRes.statusCode).toBe(200);
    const evidence = EvidenceSchema.parse(evidenceRes.json() as unknown);
    expect(evidence.citationId).toBe(first.citationId);
    expect(evidence.projectId).toBe(projectId);
    expect(evidence.status).toBe("verifiable");
    expect(typeof evidence.snippet).toBe("string");
    expect((evidence.snippet ?? "").length).toBeGreaterThan(0);

    const markdown = exportToMarkdown({
      output: text,
      citations: citationsParsed,
      taskId,
      requestId,
      templateRef: { templateId: "default", templateVersion: "0" }
    });

    expect(markdown).toContain("```yaml");
    expect(markdown).toContain(`requestId: ${JSON.stringify(requestId)}`);
    expect(markdown).toContain(first.citationId);

    await app.close();
  });

  it("includes requestId in streamed errors", async () => {
    const app = buildE2eServer({ streamProvider: createHappyStreamProvider() });
    await app.ready();

    const response = await app.inject({
      method: "POST",
      url: "/api/stream",
      headers: {
        "content-type": "application/json",
        "x-request-id": "req_e2e_happy_missing_project_1",
        "x-tenant-id": "tenant_test"
      },
      payload: JSON.stringify({
        taskId: "t_missing_project",
        messages: [{ role: "user", content: "hello" }],
        templateRef: { templateId: "default", templateVersion: "0" }
      })
    });

    expect(response.statusCode).toBe(401);
    const appError = AppErrorSchema.parse(response.json() as unknown);
    expect(appError.code).toBe("AUTH_ERROR");
    expect(appError.requestId).toBe("req_e2e_happy_missing_project_1");

    await app.close();
  });
});
