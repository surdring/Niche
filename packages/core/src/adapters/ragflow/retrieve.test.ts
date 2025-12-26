import { describe, expect, it } from "vitest";

import type { RequestContext } from "../../contracts/context";
import { CitationSchema } from "../../contracts/citation";

import type { RagflowClient } from "./client";
import { createInMemoryRagflowEvidenceStore } from "./evidence-store";
import { retrieveWithRagflow } from "./retrieve";

describe("ragflow retrieve", () => {
  it("returns citations that can be parsed by CitationSchema and stored for evidence lookup", async () => {
    const ctx: RequestContext = { requestId: "req_ragflow_1", tenantId: "tenant_1", projectId: "proj_1" };

    const client: RagflowClient = {
      async search(_ctx, _input) {
        return {
          ok: true,
          value: {
            chunks: [
              {
                chunk_id: "chunk_1",
                document_id: "doc_1",
                content: "hello",
                page_number: 1,
                score: 0.8
              }
            ]
          }
        };
      }
    };

    const store = createInMemoryRagflowEvidenceStore();

    const out = await retrieveWithRagflow(ctx, { query: "hi" }, { client }, { evidenceStore: store });
    expect(out.ok).toBe(true);
    if (!out.ok) {
      return;
    }

    expect(out.value.citations.length).toBe(1);
    const parsed = CitationSchema.parse(out.value.citations[0]);
    expect(parsed.sourceType).toBe("ragflow_chunk");

    const evidence = store.get(ctx, parsed.citationId);
    expect(evidence?.citationId).toBe(parsed.citationId);
  });

  it("rejects when query is empty", async () => {
    const ctx: RequestContext = { requestId: "req_ragflow_empty_query", tenantId: "tenant_1", projectId: "proj_1" };

    const client: RagflowClient = {
      async search() {
        throw new Error("should_not_call");
      }
    };

    const out = await retrieveWithRagflow(ctx, { query: "" }, { client });
    expect(out.ok).toBe(false);
    if (out.ok) {
      return;
    }
    expect(out.error.code).toBe("CONTRACT_VIOLATION");
    expect(out.error.message).toContain("Invalid ragflow retrieve input");
  });

  it("supports concurrent retrieval calls that store evidence", async () => {
    const store = createInMemoryRagflowEvidenceStore();

    const makeCtx = (i: number): RequestContext => ({
      requestId: `req_ragflow_concurrent_${i}`,
      tenantId: "tenant_1",
      projectId: "proj_1"
    });

    const client: RagflowClient = {
      async search(_ctx, input) {
        return {
          ok: true,
          value: {
            chunks: [
              {
                chunk_id: `chunk_${input.filters.projectId}_${input.query}`,
                document_id: "doc_1",
                content: `snippet_${input.query}`,
                page_number: 1,
                score: 0.8
              }
            ]
          }
        };
      }
    };

    const results = await Promise.all([
      retrieveWithRagflow(makeCtx(1), { query: "q1" }, { client }, { evidenceStore: store }),
      retrieveWithRagflow(makeCtx(2), { query: "q2" }, { client }, { evidenceStore: store }),
      retrieveWithRagflow(makeCtx(3), { query: "q3" }, { client }, { evidenceStore: store })
    ]);

    for (const r of results) {
      expect(r.ok).toBe(true);
      if (!r.ok) {
        continue;
      }
      expect(r.value.citations.length).toBe(1);
      const parsed = CitationSchema.parse(r.value.citations[0]);
      const evidence = store.get({ requestId: "req_verify", tenantId: "tenant_1", projectId: "proj_1" }, parsed.citationId);
      expect(evidence?.citationId).toBe(parsed.citationId);
    }
  });

  it("rejects when projectId is missing", async () => {
    const ctx: RequestContext = { requestId: "req_ragflow_no_proj", tenantId: "tenant_1" };

    const client: RagflowClient = {
      async search() {
        throw new Error("should_not_call");
      }
    };

    const out = await retrieveWithRagflow(ctx, { query: "hi" }, { client });
    expect(out.ok).toBe(false);
    if (out.ok) {
      return;
    }

    expect(out.error.code).toBe("AUTH_ERROR");
    expect(out.error.message).toContain("Missing projectId");
  });
});
