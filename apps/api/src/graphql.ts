import { randomUUID } from "node:crypto";

import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { GraphQLScalarType, Kind, type ValueNode } from "graphql";
import { z } from "zod";

import mercurius, { type IResolvers, type MercuriusContext } from "mercurius";

import {
  DefaultTemplateDefinition,
  DEFAULT_TEMPLATE_ID,
  DEFAULT_TEMPLATE_VERSION,
  createAppError,
  ProjectSchema,
  SessionSchema,
  TaskSchema,
  TemplateRefSchema,
  resolveTemplateSelection,
  toAppError,
  type Project,
  type RequestContext,
  type Session,
  type Task,
  type TemplateDefinition
} from "@niche/core";

type GraphqlContextShape = {
  request: FastifyRequest;
  reply: FastifyReply;
  nicheContext: RequestContext;
  store: NicheStore;
};

type PromiseType<T> = T extends PromiseLike<infer U> ? U : T;

declare module "mercurius" {
  // make MercuriusContext include our injected fields
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface MercuriusContext extends PromiseType<ReturnType<typeof buildContext>> {}
}

type TemplateInfo = {
  id: string;
  version: string;
  name: string;
  description?: string;
};

type StoredSession = Session & {
  templateDefinition: TemplateDefinition;
};

type StoredTask = Task & {
  templateDefinition: TemplateDefinition;
};

type CreateTaskResult = {
  task: Task;
  session: Session;
};

const requireProjectId = (ctx: MercuriusContext): string => {
  const projectId = ctx.nicheContext.projectId;
  if (projectId === undefined) {
    throw createAppError({
      code: "AUTH_ERROR",
      message: "Missing projectId",
      retryable: false,
      requestId: ctx.nicheContext.requestId
    });
  }
  return projectId;
};

const buildContext = (request: FastifyRequest, reply: FastifyReply, store: NicheStore): GraphqlContextShape => {
  return {
    request,
    reply,
    nicheContext: request.nicheContext,
    store
  };
};

export type NicheStore = {
  listTemplates(): readonly TemplateInfo[];
  listProjects(tenantId: string): readonly Project[];
  getProject(tenantId: string, projectId: string): Project | undefined;
  createTask(input: {
    requestId: string;
    tenantId: string;
    projectId: string;
    templateId?: string;
    templateVersion?: string;
    templateDefinition?: unknown;
  }): CreateTaskResult;
  cancelTask(input: { tenantId: string; taskId: string }): Task;
  getAbortSignal(input: { tenantId: string; taskId: string }): AbortSignal | undefined;
  listTasks(input: { tenantId: string; projectId: string }): readonly Task[];
  getTask(input: { tenantId: string; taskId: string }): Task | undefined;
  getSession(input: { tenantId: string; sessionId: string }): Session | undefined;
};

export const createInMemoryStore = (): NicheStore => {
  const templates: readonly TemplateInfo[] = [
    {
      id: DEFAULT_TEMPLATE_ID,
      version: DEFAULT_TEMPLATE_VERSION,
      name: "Default",
      description: "Default Study Copilot template"
    }
  ];

  const templateRegistry: Record<string, { version?: string; definition: TemplateDefinition }> = {
    [DEFAULT_TEMPLATE_ID]: { version: DEFAULT_TEMPLATE_VERSION, definition: DefaultTemplateDefinition }
  };

  const projectsByTenant = new Map<string, Map<string, Project>>();
  const tasksById = new Map<string, StoredTask>();
  const sessionsById = new Map<string, StoredSession>();
  const abortByTaskId = new Map<string, AbortController>();

  const ensureDefaultProject = (tenantId: string): Project => {
    let projects = projectsByTenant.get(tenantId);
    if (projects === undefined) {
      projects = new Map();
      projectsByTenant.set(tenantId, projects);
    }

    const existing = projects.get("proj_default");
    if (existing !== undefined) {
      return existing;
    }

    const createdAt = new Date().toISOString();
    const created = ProjectSchema.parse({
      id: "proj_default",
      tenantId,
      name: "Default Project",
      createdAt
    });

    projects.set(created.id, created);
    return created;
  };

  const listProjects = (tenantId: string): readonly Project[] => {
    ensureDefaultProject(tenantId);
    const projects = projectsByTenant.get(tenantId);
    if (projects === undefined) {
      return [];
    }
    return Array.from(projects.values());
  };

  const getProject = (tenantId: string, projectId: string): Project | undefined => {
    ensureDefaultProject(tenantId);
    return projectsByTenant.get(tenantId)?.get(projectId);
  };

  const listTasks = (input: { tenantId: string; projectId: string }): readonly Task[] => {
    const out: Task[] = [];
    for (const t of tasksById.values()) {
      if (t.tenantId !== input.tenantId) {
        continue;
      }
      if (t.projectId !== input.projectId) {
        continue;
      }
      out.push(TaskSchema.parse(t));
    }
    return out;
  };

  const getTask = (input: { tenantId: string; taskId: string }): Task | undefined => {
    const t = tasksById.get(input.taskId);
    if (t === undefined) {
      return undefined;
    }
    if (t.tenantId !== input.tenantId) {
      return undefined;
    }
    return TaskSchema.parse(t);
  };

  const getSession = (input: { tenantId: string; sessionId: string }): Session | undefined => {
    const s = sessionsById.get(input.sessionId);
    if (s === undefined) {
      return undefined;
    }
    if (s.tenantId !== input.tenantId) {
      return undefined;
    }
    return SessionSchema.parse(s);
  };

  const createTask = (input: {
    requestId: string;
    tenantId: string;
    projectId: string;
    templateId?: string;
    templateVersion?: string;
    templateDefinition?: unknown;
  }): CreateTaskResult => {
    const project = getProject(input.tenantId, input.projectId);
    if (project === undefined) {
      throw createAppError({
        code: "AUTH_ERROR",
        message: "Unknown projectId",
        retryable: false,
        requestId: input.requestId,
        details: {
          projectId: input.projectId
        }
      });
    }

    const resolved = resolveTemplateSelection(
      input.requestId,
      {
        templateId: input.templateId,
        templateVersion: input.templateVersion,
        templateDefinition: input.templateDefinition
      },
      { templateRegistry }
    );

    if (!resolved.ok) {
      throw resolved.error;
    }

    const now = new Date().toISOString();
    const sessionId = `s_${randomUUID()}`;
    const taskId = `t_${randomUUID()}`;

    const session: StoredSession = {
      ...SessionSchema.parse({
        id: sessionId,
        tenantId: input.tenantId,
        projectId: project.id,
        taskId,
        templateRef: resolved.value.templateRef,
        createdAt: now
      }),
      templateDefinition: resolved.value.templateDefinition
    };

    const task: StoredTask = {
      ...TaskSchema.parse({
        id: taskId,
        tenantId: input.tenantId,
        projectId: project.id,
        sessionId,
        templateRef: resolved.value.templateRef,
        status: "running",
        createdAt: now,
        updatedAt: now
      }),
      templateDefinition: resolved.value.templateDefinition
    };

    sessionsById.set(session.id, session);
    tasksById.set(task.id, task);

    const abort = new AbortController();
    abortByTaskId.set(task.id, abort);

    return {
      task: TaskSchema.parse(task),
      session: SessionSchema.parse(session)
    };
  };

  const getAbortSignal = (input: { tenantId: string; taskId: string }): AbortSignal | undefined => {
    const existing = tasksById.get(input.taskId);
    if (existing === undefined || existing.tenantId !== input.tenantId) {
      return undefined;
    }

    const abort = abortByTaskId.get(input.taskId);
    return abort?.signal;
  };

  const cancelTask = (input: { tenantId: string; taskId: string }): Task => {
    const existing = tasksById.get(input.taskId);
    if (existing === undefined || existing.tenantId !== input.tenantId) {
      throw new Error("Task not found");
    }

    const abort = abortByTaskId.get(input.taskId);
    if (abort !== undefined && !abort.signal.aborted) {
      abort.abort();
    }

    const now = new Date().toISOString();
    const updated: StoredTask = {
      ...existing,
      status: "cancelled",
      updatedAt: now
    };

    tasksById.set(updated.id, updated);
    return TaskSchema.parse(updated);
  };

  return {
    listTemplates: () => templates,
    listProjects,
    getProject,
    createTask,
    cancelTask,
    getAbortSignal,
    listTasks,
    getTask,
    getSession
  };
};

const JsonScalar = new GraphQLScalarType({
  name: "JSON",
  description: "Arbitrary JSON value",
  serialize(value: unknown): unknown {
    return value;
  },
  parseValue(value: unknown): unknown {
    return value;
  },
  parseLiteral(ast: ValueNode): unknown {
    const toValue = (node: ValueNode): unknown => {
      switch (node.kind) {
        case Kind.NULL:
          return null;
        case Kind.BOOLEAN:
          return node.value;
        case Kind.INT:
          return Number.parseInt(node.value, 10);
        case Kind.FLOAT:
          return Number.parseFloat(node.value);
        case Kind.STRING:
          return node.value;
        case Kind.LIST: {
          const listNode = node as unknown as { readonly values: readonly ValueNode[] };
          return listNode.values.map((v) => toValue(v));
        }
        case Kind.OBJECT: {
          const objectNode = node as unknown as {
            readonly fields: readonly { readonly name: { readonly value: string }; readonly value: ValueNode }[];
          };
          const out: Record<string, unknown> = {};
          for (const f of objectNode.fields) {
            out[f.name.value] = toValue(f.value);
          }
          return out;
        }
        default:
          return null;
      }
    };

    return toValue(ast);
  }
});

const SchemaText = `
  scalar JSON

  type Template {
    id: ID!
    version: String!
    name: String!
    description: String
  }

  type TemplateRef {
    templateId: ID
    templateVersion: String
    templateDefinitionHash: String
  }

  enum TaskStatus {
    created
    running
    cancelled
    completed
    failed
  }

  type Project {
    id: ID!
    tenantId: ID!
    name: String!
    createdAt: String!
  }

  type Task {
    id: ID!
    projectId: ID!
    sessionId: ID!
    templateRef: TemplateRef!
    status: TaskStatus!
    createdAt: String!
    updatedAt: String!
  }

  type Session {
    id: ID!
    taskId: ID!
    templateRef: TemplateRef!
    createdAt: String!
  }

  input CreateTaskInput {
    projectId: ID!
    templateId: ID
    templateVersion: String
    templateDefinition: JSON
  }

  type CreateTaskPayload {
    taskId: ID!
    task: Task!
    session: Session!
  }

  type Query {
    templates: [Template!]!
    projects: [Project!]!
    tasks(projectId: ID!): [Task!]!
    task(id: ID!): Task
    session(id: ID!): Session
  }

  type Mutation {
    createTask(input: CreateTaskInput!): CreateTaskPayload!
    cancelTask(taskId: ID!): Task!
  }
`;

const CreateTaskInputSchema = z
  .object({
    projectId: z.string().min(1),
    templateId: z.preprocess((v: unknown) => (v === null ? undefined : v), z.string().min(1).optional()),
    templateVersion: z.preprocess((v: unknown) => (v === null ? undefined : v), z.string().min(1).optional()),
    templateDefinition: z.preprocess((v: unknown) => (v === null ? undefined : v), z.unknown().optional())
  })
  .strict()
  .superRefine((val, ctx) => {
    const hasId = val.templateId !== undefined;
    const hasDef = val.templateDefinition !== undefined;

    if (hasId && hasDef) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide either templateId or templateDefinition, not both",
        path: ["templateDefinition"]
      });
      return;
    }

    if (!hasId && !hasDef) {
      return;
    }

    if (val.templateVersion !== undefined && !hasId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "templateVersion is only allowed when templateId is provided",
        path: ["templateVersion"]
      });
    }
  });

type CreateTaskInput = z.infer<typeof CreateTaskInputSchema>;

export const registerGraphQL = (app: FastifyInstance, options?: { store?: NicheStore }): void => {
  const store = options?.store ?? createInMemoryStore();

  const resolvers: IResolvers = {
    JSON: JsonScalar,
    Query: {
      templates: (_root: unknown, _args: unknown, ctx: MercuriusContext) => {
        return ctx.store.listTemplates();
      },
      projects: (_root: unknown, _args: unknown, ctx: MercuriusContext) => {
        return ctx.store.listProjects(ctx.nicheContext.tenantId);
      },
      tasks: (_root: unknown, args: unknown, ctx: MercuriusContext) => {
        const ctxProjectId = requireProjectId(ctx);
        const parsed = z
          .object({ projectId: z.string().min(1) })
          .strict()
          .parse(args);

        if (ctxProjectId !== parsed.projectId) {
          throw createAppError({
            code: "AUTH_ERROR",
            message: "projectId mismatch",
            retryable: false,
            requestId: ctx.nicheContext.requestId,
            details: {
              expectedProjectId: ctxProjectId,
              actualProjectId: parsed.projectId
            }
          });
        }

        const project = ctx.store.getProject(ctx.nicheContext.tenantId, parsed.projectId);
        if (project === undefined) {
          throw createAppError({
            code: "AUTH_ERROR",
            message: "Unknown projectId",
            retryable: false,
            requestId: ctx.nicheContext.requestId,
            details: {
              projectId: parsed.projectId
            }
          });
        }

        return ctx.store.listTasks({ tenantId: ctx.nicheContext.tenantId, projectId: parsed.projectId });
      },
      task: (_root: unknown, args: unknown, ctx: MercuriusContext) => {
        const ctxProjectId = requireProjectId(ctx);
        const parsed = z
          .object({ id: z.string().min(1) })
          .strict()
          .parse(args);

        const task = ctx.store.getTask({ tenantId: ctx.nicheContext.tenantId, taskId: parsed.id });
        if (task === undefined) {
          return null;
        }
        if (task.projectId !== ctxProjectId) {
          throw createAppError({
            code: "AUTH_ERROR",
            message: "projectId mismatch",
            retryable: false,
            requestId: ctx.nicheContext.requestId,
            details: {
              expectedProjectId: ctxProjectId,
              actualProjectId: task.projectId
            }
          });
        }
        return task;
      },
      session: (_root: unknown, args: unknown, ctx: MercuriusContext) => {
        const ctxProjectId = requireProjectId(ctx);
        const parsed = z
          .object({ id: z.string().min(1) })
          .strict()
          .parse(args);

        const session = ctx.store.getSession({ tenantId: ctx.nicheContext.tenantId, sessionId: parsed.id });
        if (session === undefined) {
          return null;
        }
        if (session.projectId !== ctxProjectId) {
          throw createAppError({
            code: "AUTH_ERROR",
            message: "projectId mismatch",
            retryable: false,
            requestId: ctx.nicheContext.requestId,
            details: {
              expectedProjectId: ctxProjectId,
              actualProjectId: session.projectId
            }
          });
        }
        return session;
      }
    },
    Mutation: {
      createTask: (_root: unknown, args: unknown, ctx: MercuriusContext) => {
        const ctxProjectId = requireProjectId(ctx);
        const parsedArgs = z
          .object({ input: CreateTaskInputSchema })
          .strict()
          .parse(args);

        const input: CreateTaskInput = parsedArgs.input;

        if (ctxProjectId !== input.projectId) {
          throw createAppError({
            code: "AUTH_ERROR",
            message: "projectId mismatch",
            retryable: false,
            requestId: ctx.nicheContext.requestId,
            details: {
              expectedProjectId: ctxProjectId,
              actualProjectId: input.projectId
            }
          });
        }

        const createInput: {
          requestId: string;
          tenantId: string;
          projectId: string;
          templateId?: string;
          templateVersion?: string;
          templateDefinition?: unknown;
        } = {
          requestId: ctx.nicheContext.requestId,
          tenantId: ctx.nicheContext.tenantId,
          projectId: input.projectId,
          ...(input.templateId !== undefined ? { templateId: input.templateId } : {}),
          ...(input.templateVersion !== undefined ? { templateVersion: input.templateVersion } : {}),
          ...(input.templateDefinition !== undefined ? { templateDefinition: input.templateDefinition } : {})
        };

        const result = ctx.store.createTask(createInput);

        const templateRef = TemplateRefSchema.parse(result.task.templateRef);
        const hasVersion = typeof templateRef.templateVersion === "string" && templateRef.templateVersion.length > 0;
        const hasHash =
          typeof templateRef.templateDefinitionHash === "string" && templateRef.templateDefinitionHash.length > 0;

        if (!hasVersion && !hasHash) {
          throw createAppError({
            code: "CONTRACT_VIOLATION",
            message: "Invariant violated: templateRef must include templateVersion or templateDefinitionHash",
            retryable: false,
            requestId: ctx.nicheContext.requestId
          });
        }

        return {
          taskId: result.task.id,
          task: result.task,
          session: result.session
        };
      },
      cancelTask: (_root: unknown, args: unknown, ctx: MercuriusContext) => {
        const ctxProjectId = requireProjectId(ctx);
        const parsed = z
          .object({ taskId: z.string().min(1) })
          .strict()
          .parse(args);

        const existing = ctx.store.getTask({ tenantId: ctx.nicheContext.tenantId, taskId: parsed.taskId });
        if (existing === undefined) {
          throw createAppError({
            code: "VALIDATION_ERROR",
            message: "Task not found",
            retryable: false,
            requestId: ctx.nicheContext.requestId,
            details: {
              taskId: parsed.taskId
            }
          });
        }
        if (existing.projectId !== ctxProjectId) {
          throw createAppError({
            code: "AUTH_ERROR",
            message: "projectId mismatch",
            retryable: false,
            requestId: ctx.nicheContext.requestId,
            details: {
              expectedProjectId: ctxProjectId,
              actualProjectId: existing.projectId
            }
          });
        }

        return ctx.store.cancelTask({ tenantId: ctx.nicheContext.tenantId, taskId: parsed.taskId });
      }
    }
  };

  void app.register(mercurius, {
    schema: SchemaText,
    resolvers,
    path: "/api/graphql",
    graphiql: true,
    errorFormatter: (execution, context) => {
      const formatted = mercurius.defaultErrorFormatter(execution, context);
      const errors = execution.errors;
      if (!Array.isArray(errors) || errors.length === 0) {
        return formatted;
      }

      const requestId = context.nicheContext?.requestId;
      if (requestId === undefined) {
        return formatted;
      }

      const baseErrors = Array.isArray(formatted.response.errors) ? formatted.response.errors : [];
      const mappedErrors = errors.map((err, i) => {
        const original =
          typeof err === "object" && err !== null && "originalError" in err
            ? (err as { originalError?: unknown }).originalError
            : undefined;
        const appError = toAppError(requestId, original ?? err);

        const base = baseErrors[i];
        const existingExtensions =
          typeof base === "object" && base !== null && "extensions" in base && typeof (base as { extensions?: unknown }).extensions === "object"
            ? ((base as { extensions: Record<string, unknown> }).extensions as Record<string, unknown>)
            : undefined;

        return {
          ...(typeof base === "object" && base !== null ? (base as Record<string, unknown>) : { message: appError.message }),
          message: appError.message,
          extensions: {
            ...(existingExtensions !== undefined ? existingExtensions : {}),
            appError
          }
        };
      });

      return {
        ...formatted,
        response: {
          ...formatted.response,
          errors: mappedErrors
        }
      };
    },
    context: (request: FastifyRequest, reply: FastifyReply): GraphqlContextShape => {
      return buildContext(request, reply, store);
    }
  });
};
