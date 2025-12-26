import { describe, expect, it } from "vitest";
import { z } from "zod";

import { AppErrorSchema } from "@niche/core";

import { buildServer } from "./main";

const GraphqlEnvelopeSchema = z
  .object({
    data: z.unknown().optional(),
    errors: z
      .array(
        z
          .object({
            message: z.string().min(1)
          })
          .passthrough()
      )
      .optional()
  })
  .passthrough();

describe("graphql", () => {
  it("createTask returns taskId and persists non-empty templateRef hash; cancelTask is observable", async () => {
    const app = buildServer({ logger: false });
    await app.ready();

    const tenantId = "tenant_test";
    const projectId = "proj_default";

    const createQuery = `
      mutation CreateTask($input: CreateTaskInput!) {
        createTask(input: $input) {
          taskId
          task {
            id
            status
            templateRef {
              templateId
              templateVersion
              templateDefinitionHash
            }
          }
          session {
            id
            templateRef {
              templateId
              templateVersion
              templateDefinitionHash
            }
          }
        }
      }
    `;

    const templateDefinition = {
      schemaVersion: "v1",
      systemPrompt: "You are Study Copilot.",
      prompt: "Help the user learn effectively.",
      tools: [],
      workflowPolicy: { maxSteps: 1, retry: { maxRetries: 0 } },
      citationPolicy: { mode: "optional" },
      guardrailsPolicy: { enforceHonorCode: true }
    };

    const createResponse = await app.inject({
      method: "POST",
      url: "/api/graphql",
      headers: {
        "content-type": "application/json",
        "x-tenant-id": tenantId,
        "x-project-id": projectId
      },
      payload: JSON.stringify({
        query: createQuery,
        variables: {
          input: {
            projectId,
            templateDefinition
          }
        }
      })
    });

    expect(createResponse.statusCode).toBe(200);

    const createEnvelope = GraphqlEnvelopeSchema.parse(createResponse.json());
    expect(createEnvelope.errors).toBeUndefined();

    const CreateTaskDataSchema = z
      .object({
        createTask: z
          .object({
            taskId: z.string().min(1),
            task: z
              .object({
                id: z.string().min(1),
                status: z.string().min(1),
                templateRef: z
                  .object({
                    templateId: z.string().min(1).nullable().optional(),
                    templateVersion: z.string().min(1).nullable().optional(),
                    templateDefinitionHash: z.string().min(1).nullable().optional()
                  })
                  .passthrough()
              })
              .passthrough(),
            session: z
              .object({
                id: z.string().min(1),
                templateRef: z
                  .object({
                    templateId: z.string().min(1).nullable().optional(),
                    templateVersion: z.string().min(1).nullable().optional(),
                    templateDefinitionHash: z.string().min(1).nullable().optional()
                  })
                  .passthrough()
              })
              .passthrough()
          })
          .passthrough()
      })
      .passthrough();

    const createData = CreateTaskDataSchema.parse(createEnvelope.data);
    expect(createData.createTask.taskId).toBe(createData.createTask.task.id);

    const taskRefHash = createData.createTask.task.templateRef.templateDefinitionHash ?? undefined;
    const sessionRefHash = createData.createTask.session.templateRef.templateDefinitionHash ?? undefined;

    expect(typeof taskRefHash).toBe("string");
    expect(taskRefHash?.length).toBeGreaterThan(0);
    expect(typeof sessionRefHash).toBe("string");
    expect(sessionRefHash?.length).toBeGreaterThan(0);

    const taskId = createData.createTask.taskId;

    const cancelQuery = `
      mutation CancelTask($taskId: ID!) {
        cancelTask(taskId: $taskId) {
          id
          status
        }
      }
    `;

    const cancelResponse = await app.inject({
      method: "POST",
      url: "/api/graphql",
      headers: {
        "content-type": "application/json",
        "x-tenant-id": tenantId,
        "x-project-id": projectId
      },
      payload: JSON.stringify({
        query: cancelQuery,
        variables: { taskId }
      })
    });

    expect(cancelResponse.statusCode).toBe(200);

    const cancelEnvelope = GraphqlEnvelopeSchema.parse(cancelResponse.json());
    expect(cancelEnvelope.errors).toBeUndefined();

    const CancelTaskDataSchema = z
      .object({
        cancelTask: z
          .object({
            id: z.string().min(1),
            status: z.string().min(1)
          })
          .passthrough()
      })
      .passthrough();

    const cancelData = CancelTaskDataSchema.parse(cancelEnvelope.data);
    expect(cancelData.cancelTask.id).toBe(taskId);
    expect(cancelData.cancelTask.status).toBe("cancelled");

    const taskQuery = `
      query Task($id: ID!) {
        task(id: $id) {
          id
          status
          templateRef {
            templateDefinitionHash
            templateVersion
          }
        }
      }
    `;

    const taskResponse = await app.inject({
      method: "POST",
      url: "/api/graphql",
      headers: {
        "content-type": "application/json",
        "x-tenant-id": tenantId,
        "x-project-id": projectId
      },
      payload: JSON.stringify({
        query: taskQuery,
        variables: { id: taskId }
      })
    });

    expect(taskResponse.statusCode).toBe(200);

    const taskEnvelope = GraphqlEnvelopeSchema.parse(taskResponse.json());
    expect(taskEnvelope.errors).toBeUndefined();

    const TaskQueryDataSchema = z
      .object({
        task: z
          .object({
            id: z.string().min(1),
            status: z.string().min(1),
            templateRef: z
              .object({
                templateDefinitionHash: z.string().min(1).nullable().optional(),
                templateVersion: z.string().min(1).nullable().optional()
              })
              .passthrough()
          })
          .nullable()
          .optional()
      })
      .passthrough();

    const queried = TaskQueryDataSchema.parse(taskEnvelope.data);
    expect(queried.task?.id).toBe(taskId);
    expect(queried.task?.status).toBe("cancelled");

    await app.close();
  });

  it("returns structured AppError in GraphQL errors[].extensions.appError", async () => {
    const app = buildServer({ logger: false });
    await app.ready();

    const tenantId = "tenant_test";

    const query = `
      query Tasks($projectId: ID!) {
        tasks(projectId: $projectId) {
          id
        }
      }
    `;

    const res = await app.inject({
      method: "POST",
      url: "/api/graphql",
      headers: {
        "content-type": "application/json",
        "x-tenant-id": tenantId,
        "x-project-id": "proj_default"
      },
      payload: JSON.stringify({
        query,
        variables: { projectId: "proj_other" }
      })
    });

    expect(res.statusCode).toBe(200);

    const envelope = GraphqlEnvelopeSchema.parse(res.json());
    expect(Array.isArray(envelope.errors)).toBe(true);

    const errors = envelope.errors ?? [];
    expect(errors.length).toBeGreaterThan(0);

    const first = errors[0] as Record<string, unknown>;
    const extensions =
      typeof first["extensions"] === "object" && first["extensions"] !== null
        ? (first["extensions"] as Record<string, unknown>)
        : undefined;

    expect(extensions).toBeDefined();
    const appError = extensions?.["appError"];
    const parsed = AppErrorSchema.safeParse(appError);
    expect(parsed.success).toBe(true);
    expect(parsed.success ? parsed.data.requestId.length > 0 : false).toBe(true);

    await app.close();
  });
});
