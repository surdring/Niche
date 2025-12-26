import { describe, expect, it } from "vitest";

import type { RequestContext } from "../../contracts/context";
import { CitationSchema } from "../../contracts/citation";

import { mapRagflowChunkToCitation, mapRagflowChunkToRetrievedChunk, ragflowCitationIdFromChunkId } from "./mapper";

describe("ragflow mapper", () => {
  it("maps a ragflow chunk to a verifiable Citation", () => {
    const ctx: RequestContext = { requestId: "req_1", tenantId: "tenant_1", projectId: "proj_1" };

    const citation = mapRagflowChunkToCitation(ctx, "proj_1", {
      chunk_id: "chunk_1",
      document_id: "doc_1",
      content: "snippet",
      page_number: 1,
      offset_start: 0,
      offset_end: 10,
      score: 0.9
    });

    const parsed = CitationSchema.parse(citation);
    expect(parsed.status).toBe("verifiable");
    expect(parsed.projectId).toBe("proj_1");
    expect(parsed.locator.page).toBe(1);
  });

  it("degrades when locator fields are missing", () => {
    const ctx: RequestContext = { requestId: "req_2", tenantId: "tenant_1", projectId: "proj_1" };

    const citation = mapRagflowChunkToCitation(ctx, "proj_1", {
      chunk_id: "chunk_missing_locator",
      content: "snippet"
    });

    const parsed = CitationSchema.parse(citation);
    expect(parsed.status).toBe("degraded");
    expect(typeof parsed.degradedReason).toBe("string");
    expect(parsed.degradedReason?.length).toBeGreaterThan(0);
  });

  it("builds stable citationId and trims only when needed", () => {
    const id1 = ragflowCitationIdFromChunkId("tenant_1", "proj_1", "chunk_1");
    expect(id1).toBe("ragflow:tenant_1:proj_1:chunk_1");

    const id2 = ragflowCitationIdFromChunkId(" tenant_1 ", " proj_1", "chunk_1 ");
    expect(id2).toBe("ragflow:tenant_1:proj_1:chunk_1");
  });

  it("keeps special characters in citationId components", () => {
    const id = ragflowCitationIdFromChunkId("tenant-1", "proj/1", "chunk:1?#中文");
    expect(id).toBe("ragflow:tenant-1:proj/1:chunk:1?#中文");
  });

  it("returns undefined retrieved chunk when content is whitespace", () => {
    const out = mapRagflowChunkToRetrievedChunk({ chunk_id: "chunk_whitespace", content: "   \n\t  " });
    expect(out).toBe(undefined);
  });
});
