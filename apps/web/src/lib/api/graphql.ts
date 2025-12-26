import { z } from "zod";

import {
  AppErrorSchema,
  GraphqlCancelTaskResponseSchema,
  GraphqlCreateTaskResponseSchema,
  GraphqlTemplatesResponseSchema,
  type GraphqlCreateTaskPayload,
  type GraphqlTask,
  type GraphqlTemplate
} from "@niche/core/contracts";

import { createContractViolationError, readRequestIdFromResponse } from "../errors";
import { GraphqlErrorsSchema, parseAppErrorResponse, parseJsonOrThrow, toObservabilityHeaders, type RequestContextHeaders } from "./http";

const GraphqlEnvelopeSchema = z
  .object({
    data: z.unknown().optional(),
    errors: z.array(z.unknown()).optional()
  })
  .passthrough();

type GraphqlEnvelope = z.infer<typeof GraphqlEnvelopeSchema>;

type GraphqlRequest<TVariables> = {
  query: string;
  variables?: TVariables;
};

const postGraphql = async <TResponseSchema extends z.ZodTypeAny, TVariables>(
  ctx: RequestContextHeaders,
  request: GraphqlRequest<TVariables>,
  responseSchema: TResponseSchema
): Promise<z.infer<TResponseSchema>> => {
  const res = await fetch("/api/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...toObservabilityHeaders(ctx)
    },
    body: JSON.stringify(request)
  });

  const requestId = readRequestIdFromResponse(res);

  if (!res.ok) {
    const appError = await parseAppErrorResponse(res);
    if (appError !== undefined) {
      throw appError;
    }

    throw createContractViolationError(`HTTP ${res.status} from /api/graphql`, requestId);
  }

  const json = await parseJsonOrThrow(res);
  const envelope: GraphqlEnvelope = GraphqlEnvelopeSchema.parse(json);

  if (Array.isArray(envelope.errors) && envelope.errors.length > 0) {
    const parsedErrors = GraphqlErrorsSchema.safeParse(envelope.errors);
    if (!parsedErrors.success) {
      throw createContractViolationError("GraphQL errors do not match contract", requestId, parsedErrors.error);
    }

    const message = parsedErrors.data
      .map((e) => e.message)
      .filter((m) => m.length > 0)
      .join("; ");

    throw AppErrorSchema.parse({
      code: "UPSTREAM_UNAVAILABLE",
      message: message.length > 0 ? message : "GraphQL returned errors",
      retryable: true,
      requestId: requestId ?? "unknown",
      details: {
        graphqlErrors: parsedErrors.data
      }
    });
  }

  const parsed = responseSchema.safeParse(envelope);
  if (!parsed.success) {
    throw createContractViolationError("GraphQL response does not match contract", requestId, parsed.error);
  }

  return parsed.data;
};

export const listTemplates = async (ctx: RequestContextHeaders): Promise<readonly GraphqlTemplate[]> => {
  const out = await postGraphql(
    ctx,
    {
      query: `query Templates { templates { id version name description } }`
    },
    GraphqlTemplatesResponseSchema
  );

  return out.data.templates;
};

export type CreateTaskInput = {
  projectId: string;
  templateId?: string;
  templateVersion?: string;
  templateDefinition?: unknown;
};

const CreateTaskInputSchema = z
  .object({
    projectId: z.string().min(1),
    templateId: z.string().min(1).optional(),
    templateVersion: z.string().min(1).optional(),
    templateDefinition: z.unknown().optional()
  })
  .strict();

export const createTask = async (ctx: RequestContextHeaders, input: CreateTaskInput): Promise<GraphqlCreateTaskPayload> => {
  const parsedInput = CreateTaskInputSchema.parse(input);
  const out = await postGraphql(
    ctx,
    {
      query: `mutation CreateTask($input: CreateTaskInput!) { createTask(input: $input) { taskId task { id projectId sessionId templateRef { templateId templateVersion templateDefinitionHash } status createdAt updatedAt } session { id taskId templateRef { templateId templateVersion templateDefinitionHash } createdAt } } }`,
      variables: { input: parsedInput }
    },
    GraphqlCreateTaskResponseSchema
  );

  return out.data.createTask;
};

export const cancelTask = async (ctx: RequestContextHeaders, taskId: string): Promise<GraphqlTask> => {
  const TaskIdSchema = z.string().min(1);
  const parsedTaskId = TaskIdSchema.parse(taskId);

  const out = await postGraphql(
    ctx,
    {
      query: `mutation CancelTask($taskId: ID!) { cancelTask(taskId: $taskId) { id projectId sessionId templateRef { templateId templateVersion templateDefinitionHash } status createdAt updatedAt } }`,
      variables: { taskId: parsedTaskId }
    },
    GraphqlCancelTaskResponseSchema
  );

  return out.data.cancelTask;
};
