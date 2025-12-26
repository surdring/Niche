import { describe, expect, it } from "vitest";

import type { RequestContext } from "../../contracts/context";
import { CitationSchema } from "../../contracts/citation";

import { createRagflowClient } from "./client";
import { retrieveWithRagflow } from "./retrieve";

describe("contract/ragflow-mapping", () => {
  const makeCtx = (): RequestContext => {
    return { requestId: "req_ragflow_contract_1", tenantId: "tenant_1", projectId: "proj_1" };
  };

  it("maps a stable mock ragflow response into citations that satisfy CitationSchema", async () => {
    const ctx = makeCtx();

    const out = await retrieveWithRagflow(
      ctx,
      { query: "hello" },
      {
        client: {
          async search() {
            return {
              ok: true,
              value: {
                chunks: [
                  {
                    chunk_id: "chunk_1",
                    document_id: "doc_1",
                    content: "snippet",
                    page_number: 1,
                    offset_start: 0,
                    offset_end: 10,
                    score: 0.9
                  }
                ]
              }
            };
          }
        }
      }
    );

    expect(out.ok).toBe(true);
    if (!out.ok) {
      return;
    }

    expect(out.value.citations.length).toBe(1);
    const citation = CitationSchema.parse(out.value.citations[0]);
    expect(citation.projectId).toBe("proj_1");
    expect(citation.sourceType).toBe("ragflow_chunk");
  });

  it("handles empty chunks response (boundary)", async () => {
    const ctx = makeCtx();

    const out = await retrieveWithRagflow(
      ctx,
      { query: "hello" },
      {
        client: {
          async search() {
            return {
              ok: true,
              value: {
                chunks: []
              }
            };
          }
        }
      }
    );

    expect(out.ok).toBe(true);
    if (!out.ok) {
      return;
    }

    expect(out.value.citations.length).toBe(0);
    expect(out.value.chunks.length).toBe(0);
  });

  it("returns CONTRACT_VIOLATION when upstream response schema changes", async () => {
    const ctx = makeCtx();

    const client = createRagflowClient({
      baseUrl: "https://ragflow.invalid",
      fetchImpl: async () => {
        return new Response(JSON.stringify({ wrong_field: [] }), {
          status: 200,
          headers: { "content-type": "application/json" }
        });
      },
      timeoutMs: 500
    });

    const out = await client.search(ctx, { query: "hello", filters: { projectId: "proj_1" } });
    expect(out.ok).toBe(false);
    if (out.ok) {
      return;
    }

    expect(out.error.code).toBe("CONTRACT_VIOLATION");
    expect(out.error.message).toContain("schema validation failed");
  });
});
