import { z } from "zod";

import { EvidenceSchema, type Evidence } from "@niche/core/contracts";

import { createContractViolationError, readRequestIdFromResponse } from "../errors";
import { parseAppErrorResponse, parseJsonOrThrow, toObservabilityHeaders, type RequestContextHeaders } from "./http";

const EvidenceQuerySchema = z
  .object({
    citationId: z.string().min(1)
  })
  .strict();

export const fetchEvidence = async (ctx: RequestContextHeaders, citationId: string): Promise<Evidence> => {
  let parsedQuery: z.infer<typeof EvidenceQuerySchema>;
  try {
    parsedQuery = EvidenceQuerySchema.parse({ citationId });
  } catch (error) {
    throw createContractViolationError("Evidence request query does not match contract", ctx.requestId, error);
  }

  const params = new URLSearchParams({ citationId: parsedQuery.citationId });
  const res = await fetch(`/api/evidence?${params.toString()}`, {
    method: "GET",
    headers: {
      ...toObservabilityHeaders(ctx)
    }
  });

  const requestId = readRequestIdFromResponse(res);

  if (!res.ok) {
    const appError = await parseAppErrorResponse(res);
    if (appError !== undefined) {
      throw appError;
    }

    throw createContractViolationError(`HTTP ${res.status} from /api/evidence`, requestId);
  }

  const json = await parseJsonOrThrow(res);
  const parsed = EvidenceSchema.safeParse(json);
  if (!parsed.success) {
    throw createContractViolationError("Evidence response does not match contract", requestId, parsed.error);
  }

  return parsed.data;
};
