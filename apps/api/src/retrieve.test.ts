import { describe, expect, it } from "vitest";

import { CitationSchema, EvidenceSchema } from "@niche/core";
import { z } from "zod";

import { buildServer } from "./main";

describe("/api/retrieve", () => {
  it("returns citations that can be parsed and evidence can be fetched by citationId", async () => {
    const app = buildServer({ logger: false });
    await app.ready();

    const requestId = "req_retrieve_1";

    const retrieveRes = await app.inject({
      method: "POST",
      url: "/api/retrieve",
      headers: {
        "content-type": "application/json",
        "x-request-id": requestId,
        "x-tenant-id": "tenant_test",
        "x-project-id": "proj_test"
      },
      payload: JSON.stringify({ query: "hello" })
    });

    expect(retrieveRes.statusCode).toBe(200);

    const RetrieveResponseSchema = z
      .object({
        chunks: z.array(z.unknown()),
        citations: z.array(CitationSchema).min(1)
      })
      .passthrough();

    const payload = RetrieveResponseSchema.parse(retrieveRes.json() as unknown);
    const citation = payload.citations[0];
    if (citation === undefined) {
      throw new Error("Invariant violated: expected at least one citation");
    }

    expect(citation.projectId).toBe("proj_test");

    const evidenceRes = await app.inject({
      method: "GET",
      url: `/api/evidence?citationId=${encodeURIComponent(citation.citationId)}`,
      headers: {
        "x-request-id": "req_evidence_from_retrieve_1",
        "x-tenant-id": "tenant_test",
        "x-project-id": "proj_test"
      }
    });

    expect(evidenceRes.statusCode).toBe(200);
    const evidence = EvidenceSchema.parse(evidenceRes.json() as unknown);
    expect(evidence.citationId).toBe(citation.citationId);

    await app.close();
  });

  it("rejects requests without projectId", async () => {
    const app = buildServer({ logger: false });
    await app.ready();

    const response = await app.inject({
      method: "POST",
      url: "/api/retrieve",
      headers: {
        "content-type": "application/json",
        "x-request-id": "req_retrieve_missing_project",
        "x-tenant-id": "tenant_test"
      },
      payload: JSON.stringify({ query: "hello" })
    });

    expect(response.statusCode).toBe(401);

    await app.close();
  });
});
