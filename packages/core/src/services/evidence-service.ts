import { z } from "zod";

import { EvidenceSchema, type Evidence } from "../contracts/citation";
import { AppErrorSchema, type AppError } from "../contracts/error";
import type { RequestContext } from "../contracts/context";
import { CitationIdSchema, parseRagflowCitationId, type CitationRepo } from "../repos/citation-repo";

export type GetEvidenceResult =
  | { ok: true; evidence: Evidence }
  | {
      ok: false;
      error: AppError;
    };

const createAuthError = (requestId: string, message: string, details?: Record<string, unknown>): AppError => {
  return AppErrorSchema.parse({
    code: "AUTH_ERROR",
    message: `${message} (requestId=${requestId})`,
    retryable: false,
    requestId,
    ...(details !== undefined ? { details: z.record(z.string(), z.unknown()).parse(details) } : {})
  });
};

const createValidationError = (requestId: string, message: string, details?: Record<string, unknown>): AppError => {
  return AppErrorSchema.parse({
    code: "VALIDATION_ERROR",
    message: `${message} (requestId=${requestId})`,
    retryable: false,
    requestId,
    ...(details !== undefined ? { details: z.record(z.string(), z.unknown()).parse(details) } : {})
  });
};

/**
 * Resolve evidence display data by `citationId`.
 *
 * Behavior:
 * - Validates `citationId` format.
 * - Enforces tenant/project isolation:
 *   - `ctx.projectId` must be present.
 *   - For RAGFlow citation IDs (`ragflow:{tenantId}:{projectId}:{chunkId}`), tenantId/projectId must match `ctx`.
 *   - For repository hits, returned record tenantId/projectId must match `ctx`.
 * - Degrades when evidence cannot be verified:
 *   - If no record exists in repository, returns `ok: true` with `status=unavailable` and a non-empty `degradedReason`.
 *   - Must not fabricate evidence: when unavailable, `snippet` is omitted.
 *
 * Error mapping:
 * - Returns `ok: false` with `AppError.code=VALIDATION_ERROR` for invalid `citationId`.
 * - Returns `ok: false` with `AppError.code=AUTH_ERROR` for missing/mismatched tenantId/projectId.
 */
export const getEvidenceByCitationId = async (
  ctx: RequestContext,
  citationId: string,
  deps: {
    repo: CitationRepo;
  }
): Promise<GetEvidenceResult> => {
  const parsedCitationId = CitationIdSchema.safeParse(citationId);
  if (!parsedCitationId.success) {
    return {
      ok: false,
      error: createValidationError(ctx.requestId, "Invalid citationId")
    };
  }

  const projectId = ctx.projectId;
  if (projectId === undefined) {
    return {
      ok: false,
      error: createAuthError(ctx.requestId, "Missing projectId", { missing: "projectId" })
    };
  }

  const ragflowParts = parseRagflowCitationId(parsedCitationId.data);
  if (ragflowParts !== undefined) {
    if (ragflowParts.tenantId !== ctx.tenantId) {
      return {
        ok: false,
        error: createAuthError(ctx.requestId, "tenantId mismatch", {
          expectedTenantId: ctx.tenantId,
          actualTenantId: ragflowParts.tenantId
        })
      };
    }

    if (ragflowParts.projectId !== projectId) {
      return {
        ok: false,
        error: createAuthError(ctx.requestId, "projectId mismatch", {
          expectedProjectId: projectId,
          actualProjectId: ragflowParts.projectId
        })
      };
    }
  }

  const record = await deps.repo.getByCitationId(ctx, parsedCitationId.data);
  if (record !== undefined) {
    if (record.tenantId !== ctx.tenantId) {
      return {
        ok: false,
        error: createAuthError(ctx.requestId, "tenantId mismatch", {
          expectedTenantId: ctx.tenantId,
          actualTenantId: record.tenantId
        })
      };
    }

    if (record.projectId !== projectId) {
      return {
        ok: false,
        error: createAuthError(ctx.requestId, "projectId mismatch", {
          expectedProjectId: projectId,
          actualProjectId: record.projectId
        })
      };
    }

    return { ok: true, evidence: EvidenceSchema.parse(record.evidence) };
  }

  const sourceType: Evidence["sourceType"] = ragflowParts !== undefined ? "ragflow_chunk" : "document";

  return {
    ok: true,
    evidence: EvidenceSchema.parse({
      citationId: parsedCitationId.data,
      sourceType,
      projectId,
      locator: {},
      status: "unavailable",
      degradedReason: "Citation record not found in repository"
    })
  };
};
