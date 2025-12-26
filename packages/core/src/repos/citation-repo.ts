import { z } from "zod";

import type { RagflowEvidenceStore } from "../adapters/ragflow/evidence-store";
import { EvidenceSchema, type Evidence } from "../contracts/citation";
import type { RequestContext } from "../contracts/context";

export const CitationIdSchema = z.string().min(1);

export const RagflowCitationIdPartsSchema = z
  .object({
    tenantId: z.string().min(1),
    projectId: z.string().min(1),
    chunkId: z.string().min(1)
  })
  .strict();

export type RagflowCitationIdParts = z.infer<typeof RagflowCitationIdPartsSchema>;

export const parseRagflowCitationId = (citationId: string): RagflowCitationIdParts | undefined => {
  const parsedId = CitationIdSchema.safeParse(citationId);
  if (!parsedId.success) {
    return undefined;
  }

  if (!parsedId.data.startsWith("ragflow:")) {
    return undefined;
  }

  const parts = parsedId.data.split(":");
  if (parts[0] !== "ragflow") {
    return undefined;
  }

  if (parts.length < 4) {
    return undefined;
  }

  const tenantId = parts[1] ?? "";
  const projectId = parts[2] ?? "";
  const chunkId = parts.slice(3).join(":");

  const parsedParts = RagflowCitationIdPartsSchema.safeParse({ tenantId, projectId, chunkId });
  if (!parsedParts.success) {
    return undefined;
  }

  return parsedParts.data;
};

export const CitationRecordSchema = z
  .object({
    tenantId: z.string().min(1),
    projectId: z.string().min(1),
    evidence: EvidenceSchema
  })
  .strict();

export type CitationRecord = z.infer<typeof CitationRecordSchema>;

export interface CitationRepo {
  getByCitationId(ctx: RequestContext, citationId: string): Promise<CitationRecord | undefined>;
}

export const createRagflowCitationRepo = (store: RagflowEvidenceStore): CitationRepo => {
  return {
    async getByCitationId(ctx, citationId) {
      const parsedId = CitationIdSchema.safeParse(citationId);
      if (!parsedId.success) {
        return undefined;
      }

      const idParts = parseRagflowCitationId(parsedId.data);
      if (idParts === undefined) {
        return undefined;
      }

      const lookupCtx: RequestContext = {
        requestId: ctx.requestId,
        tenantId: idParts.tenantId,
        projectId: idParts.projectId
      };

      const evidence: Evidence | undefined = store.get(lookupCtx, parsedId.data);
      if (evidence === undefined) {
        return undefined;
      }

      return CitationRecordSchema.parse({
        tenantId: idParts.tenantId,
        projectId: idParts.projectId,
        evidence
      });
    }
  };
};
