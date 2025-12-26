import { z } from "zod";

import { EvidenceSchema, type Evidence } from "../../contracts/citation";
import type { RequestContext } from "../../contracts/context";

/**
 * Evidence record stored by the ragflow adapter.
 *
 * Notes:
 * - `tenantId`/`projectId` are persisted to enforce isolation during lookup.
 * - `evidence.citationId` is the primary key.
 */
export const RagflowEvidenceRecordSchema = z
  .object({
    tenantId: z.string().min(1),
    projectId: z.string().min(1),
    evidence: EvidenceSchema
  })
  .strict();

export type RagflowEvidenceRecord = z.infer<typeof RagflowEvidenceRecordSchema>;

/**
 * Storage interface for ragflow evidence.
 *
 * Implementations must enforce tenant/project isolation in `get`.
 */
export type RagflowEvidenceStore = {
  put(record: RagflowEvidenceRecord): void;
  get(ctx: RequestContext, citationId: string): Evidence | undefined;
};

/**
 * Create an in-memory evidence store for ragflow citations.
 *
 * This is intended for:
 * - local development
 * - unit/integration tests
 * - ephemeral runtime use cases
 */
export const createInMemoryRagflowEvidenceStore = (): RagflowEvidenceStore => {
  const byCitationId = new Map<string, RagflowEvidenceRecord>();

  return {
    put(record) {
      const parsed = RagflowEvidenceRecordSchema.parse(record);
      byCitationId.set(parsed.evidence.citationId, parsed);
    },

    get(ctx, citationId) {
      const rec = byCitationId.get(citationId);
      if (rec === undefined) {
        return undefined;
      }
      if (rec.tenantId !== ctx.tenantId) {
        return undefined;
      }
      if (ctx.projectId !== undefined && rec.projectId !== ctx.projectId) {
        return undefined;
      }
      return rec.evidence;
    }
  };
};
