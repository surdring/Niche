import type { RequestContext } from "../../contracts/context";
import { CitationSchema, type Citation } from "../../contracts/citation";

import type { RagflowChunk, RagflowRetrievedChunk } from "./types";

const trimIfNeeded = (value: string): string => {
  if (value.length === 0) {
    return value.trim();
  }
  const first = value.charAt(0);
  const last = value.charAt(value.length - 1);
  if (/^\s$/.test(first) || /^\s$/.test(last)) {
    return value.trim();
  }
  return value;
};

/**
 * Build a stable `citationId` for a RAGFlow chunk.
 *
 * Format: `ragflow:{tenantId}:{projectId}:{chunkId}`.
 *
 * Note: to keep IDs stable across systems, this function trims leading/trailing
 * whitespace only when needed.
 */
export const ragflowCitationIdFromChunkId = (tenantId: string, projectId: string, chunkId: string): string => {
  const safeTenant = trimIfNeeded(tenantId);
  const safeProject = trimIfNeeded(projectId);
  const safeChunk = trimIfNeeded(chunkId);
  return `ragflow:${safeTenant}:${safeProject}:${safeChunk}`;
};

/**
 * Map a raw RAGFlow chunk into a normalized retrieved chunk.
 *
 * Returns `undefined` when the chunk has no usable `content`.
 */
export const mapRagflowChunkToRetrievedChunk = (chunk: RagflowChunk): RagflowRetrievedChunk | undefined => {
  const text = chunk.content;
  if (text === undefined || text.trim().length === 0) {
    return undefined;
  }

  return {
    chunkId: chunk.chunk_id,
    ...(chunk.document_id !== undefined ? { documentId: chunk.document_id } : {}),
    text,
    ...(chunk.score !== undefined ? { score: chunk.score } : {})
  };
};

/**
 * Map a RAGFlow chunk into the unified `Citation` model.
 *
 * - Produces `status=verifiable` when locator fields exist.
 * - Produces `status=degraded` when RAGFlow does not provide enough locator info.
 */
export const mapRagflowChunkToCitation = (
  ctx: RequestContext,
  projectId: string,
  chunk: RagflowChunk
): Citation => {
  const citationId = ragflowCitationIdFromChunkId(ctx.tenantId, projectId, chunk.chunk_id);

  const hasPage = chunk.page_number !== undefined;
  const hasOffsetStart = chunk.offset_start !== undefined;

  if (!hasPage && !hasOffsetStart) {
    return CitationSchema.parse({
      citationId,
      sourceType: "ragflow_chunk",
      ...(chunk.document_id !== undefined ? { documentId: chunk.document_id } : {}),
      projectId,
      locator: {},
      ...(chunk.content !== undefined ? { snippet: chunk.content } : {}),
      status: "degraded",
      degradedReason: "RAGFlow response missing page_number and offset_start fields",
      ragflow: {
        chunkId: chunk.chunk_id,
        ...(chunk.document_id !== undefined ? { documentId: chunk.document_id } : {}),
        ...(chunk.score !== undefined ? { score: chunk.score } : {})
      }
    });
  }

  const locator: Record<string, unknown> = {};
  if (chunk.page_number !== undefined) {
    locator.page = chunk.page_number;
  }
  if (chunk.offset_start !== undefined) {
    locator.offsetStart = chunk.offset_start;
  }
  if (chunk.offset_end !== undefined) {
    locator.offsetEnd = chunk.offset_end;
  }

  return CitationSchema.parse({
    citationId,
    sourceType: "ragflow_chunk",
    ...(chunk.document_id !== undefined ? { documentId: chunk.document_id } : {}),
    projectId,
    locator,
    ...(chunk.content !== undefined ? { snippet: chunk.content } : {}),
    status: "verifiable",
    ragflow: {
      chunkId: chunk.chunk_id,
      ...(chunk.document_id !== undefined ? { documentId: chunk.document_id } : {}),
      ...(chunk.score !== undefined ? { score: chunk.score } : {})
    }
  });
};
