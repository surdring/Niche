import type { RequestContext } from "../../contracts/context";
import type { AppError } from "../../contracts/error";

import { createRagflowContractViolationError } from "./errors";
import type { RagflowClient } from "./client";
import { mapRagflowChunkToCitation, mapRagflowChunkToRetrievedChunk } from "./mapper";
import { buildRagflowSearchRequest } from "./request";
import {
  RagflowRetrieveInputSchema,
  RagflowRetrieveOutputSchema,
  type RagflowRetrieveOutput
} from "./types";
import type { RagflowEvidenceStore } from "./evidence-store";

export type RagflowRetrieveResult =
  | { ok: true; value: RagflowRetrieveOutput }
  | { ok: false; error: AppError };

export type RetrieveWithRagflowOptions = {
  signal?: AbortSignal;
  evidenceStore?: RagflowEvidenceStore;
};

type RagflowLogger = {
  info(payload: Record<string, unknown>, message: string): void;
  warn(payload: Record<string, unknown>, message: string): void;
  error(payload: Record<string, unknown>, message: string): void;
};

type RequestContextWithLogger = RequestContext & { log?: RagflowLogger };

/**
 * Retrieve relevant knowledge chunks from RAGFlow and map them to normalized chunks + citations.
 *
 * Contract:
 * - `input` is validated by `RagflowRetrieveInputSchema`.
 * - `projectId` isolation is enforced by `buildRagflowSearchRequest`.
 *
 * Evidence:
 * - When `options.evidenceStore` is provided, all produced citations are stored for later verification.
 */
export const retrieveWithRagflow = async (
  ctx: RequestContext,
  input: unknown,
  deps: { client: RagflowClient },
  options?: RetrieveWithRagflowOptions
): Promise<RagflowRetrieveResult> => {
  const log = (ctx as RequestContextWithLogger).log;
  const startMs = Date.now();

  const parsedInput = RagflowRetrieveInputSchema.safeParse(input);
  if (!parsedInput.success) {
    return {
      ok: false,
      error: createRagflowContractViolationError(ctx.requestId, "Invalid ragflow retrieve input", {
        reason: "RagflowRetrieveInputSchema validation failed"
      })
    };
  }

  const requestBuilt = buildRagflowSearchRequest(ctx, parsedInput.data);
  if (!requestBuilt.ok) {
    return { ok: false, error: requestBuilt.error };
  }

  const projectId = requestBuilt.value.filters.projectId;

  const upstream = await deps.client.search(
    ctx,
    requestBuilt.value,
    options?.signal !== undefined ? { signal: options.signal } : undefined
  );
  if (!upstream.ok) {
    return upstream;
  }

  const chunks = upstream.value.chunks
    .map((c) => mapRagflowChunkToRetrievedChunk(c))
    .filter((c): c is NonNullable<typeof c> => c !== undefined);
  const citations = upstream.value.chunks.map((c) => mapRagflowChunkToCitation(ctx, projectId, c));

  if (options?.evidenceStore !== undefined) {
    log?.info(
      {
        requestId: ctx.requestId,
        tenantId: ctx.tenantId,
        projectId,
        event: "ragflow_evidence_store_put_start",
        citationsCount: citations.length
      },
      "RAGFlow evidence store put started"
    );
    for (const cite of citations) {
      options.evidenceStore.put({
        tenantId: ctx.tenantId,
        projectId,
        evidence: cite
      });
    }
    log?.info(
      {
        requestId: ctx.requestId,
        tenantId: ctx.tenantId,
        projectId,
        event: "ragflow_evidence_store_put_done",
        citationsCount: citations.length
      },
      "RAGFlow evidence store put finished"
    );
  }

  const out: RagflowRetrieveOutput = {
    chunks,
    citations
  };

  log?.info(
    {
      requestId: ctx.requestId,
      tenantId: ctx.tenantId,
      projectId,
      event: "ragflow_retrieve_completed",
      durationMs: Date.now() - startMs,
      chunksCount: out.chunks.length,
      citationsCount: out.citations.length
    },
    "RAGFlow retrieve completed"
  );

  return { ok: true, value: RagflowRetrieveOutputSchema.parse(out) };
};
