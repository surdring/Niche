import type { RequestContext } from "../../contracts/context";

import { createRagflowAuthError } from "./errors";
import { RagflowSearchRequestSchema, type RagflowRetrieveInput, type RagflowSearchRequest } from "./types";

export type BuildRagflowSearchRequestResult =
  | { ok: true; value: RagflowSearchRequest }
  | { ok: false; error: ReturnType<typeof createRagflowAuthError> };

/**
 * Build a validated RAGFlow search request.
 *
 * Security and isolation:
 * - `projectId` is required and is injected from `ctx.projectId` when not provided.
 * - If both `ctx.projectId` and `input.filters.projectId` exist, they must match.
 *
 * Returns a discriminated union result:
 * - `{ ok: true, value }` for a validated `RagflowSearchRequest`
 * - `{ ok: false, error }` for an auth error (e.g. missing/mismatched projectId)
 */
export const buildRagflowSearchRequest = (
  ctx: RequestContext,
  input: RagflowRetrieveInput
): BuildRagflowSearchRequestResult => {
  const ctxProjectId = ctx.projectId;
  const inputProjectId = input.filters?.projectId;

  const projectId = inputProjectId ?? ctxProjectId;
  if (projectId === undefined) {
    return {
      ok: false,
      error: createRagflowAuthError(ctx.requestId, "Missing projectId", { missing: "projectId" })
    };
  }

  if (ctxProjectId !== undefined && ctxProjectId !== projectId) {
    return {
      ok: false,
      error: createRagflowAuthError(ctx.requestId, "projectId mismatch", {
        expectedProjectId: ctxProjectId,
        actualProjectId: projectId
      })
    };
  }

  const filters = {
    ...(input.filters ?? {}),
    projectId
  };

  const req = RagflowSearchRequestSchema.parse({
    query: input.query,
    filters,
    ...(input.topK !== undefined ? { topK: input.topK } : {}),
    ...(input.scoreThreshold !== undefined ? { scoreThreshold: input.scoreThreshold } : {})
  });

  return { ok: true, value: req };
};
