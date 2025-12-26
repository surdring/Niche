import { createAppError, type AppError } from "../contracts/error";
import type { Evidence } from "../contracts/citation";
import { CitationSchema, type Citation } from "../contracts/citation";
import type { RequestContext } from "../contracts/context";

export interface EvidenceProvider<TContext extends RequestContext> {
  getEvidence(ctx: TContext, citationId: string): Promise<Evidence | undefined>;
}

export type CitationVerificationResult =
  | { ok: true; citations: readonly Citation[] }
  | { ok: false; error: AppError };

export const verifyCitations = async <TContext extends RequestContext>(
  ctx: TContext,
  citationsInput: unknown,
  evidenceProvider: EvidenceProvider<TContext>
): Promise<CitationVerificationResult> => {
  const parsed = CitationSchema.array().safeParse(citationsInput);
  if (!parsed.success) {
    return {
      ok: false,
      error: createAppError({
        code: "CONTRACT_VIOLATION",
        message: "Invalid citations",
        retryable: false,
        requestId: ctx.requestId,
        details: {
          reason: "CitationSchema validation failed",
          issues: parsed.error.issues
        }
      })
    };
  }

  for (const citation of parsed.data) {
    if (ctx.projectId !== undefined && citation.projectId !== ctx.projectId) {
      return {
        ok: false,
        error: createAppError({
          code: "CONTRACT_VIOLATION",
          message: "Citation projectId mismatch",
          retryable: false,
          requestId: ctx.requestId,
          details: {
            citationId: citation.citationId,
            expectedProjectId: ctx.projectId,
            actualProjectId: citation.projectId
          }
        })
      };
    }

    const evidence = await evidenceProvider.getEvidence(ctx, citation.citationId);
    if (evidence === undefined) {
      return {
        ok: false,
        error: createAppError({
          code: "CONTRACT_VIOLATION",
          message: "Citation is not verifiable",
          retryable: false,
          requestId: ctx.requestId,
          details: {
            citationId: citation.citationId
          }
        })
      };
    }

    if (evidence.citationId !== citation.citationId) {
      return {
        ok: false,
        error: createAppError({
          code: "CONTRACT_VIOLATION",
          message: "Evidence citationId mismatch",
          retryable: false,
          requestId: ctx.requestId,
          details: {
            citationId: citation.citationId,
            evidenceCitationId: evidence.citationId
          }
        })
      };
    }

    if (ctx.projectId !== undefined && evidence.projectId !== ctx.projectId) {
      return {
        ok: false,
        error: createAppError({
          code: "CONTRACT_VIOLATION",
          message: "Evidence projectId mismatch",
          retryable: false,
          requestId: ctx.requestId,
          details: {
            citationId: citation.citationId,
            expectedProjectId: ctx.projectId,
            evidenceProjectId: evidence.projectId
          }
        })
      };
    }
  }

  return { ok: true, citations: parsed.data };
};
