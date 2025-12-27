import { describe, expect, it } from "vitest";
import { z } from "zod";

import { AppErrorSchema, CitationSchema } from "@niche/core";

import { buildE2eServer } from "./mocks/build-e2e-server";

const RetrieveResponseSchema = z
  .object({
    citations: z.array(CitationSchema).min(1)
  })
  .passthrough();

describe("e2e/isolation", () => {
  it("cross project evidence request returns AUTH_ERROR with requestId", async () => {
    const app = buildE2eServer();
    await app.ready();

    const tenantId = "tenant_test";

    const retrieveRes = await app.inject({
      method: "POST",
      url: "/api/retrieve",
      headers: {
        "content-type": "application/json",
        "x-request-id": "req_e2e_isolation_retrieve_1",
        "x-tenant-id": tenantId,
        "x-project-id": "proj_a"
      },
      payload: JSON.stringify({ query: "hello" })
    });

    expect(retrieveRes.statusCode).toBe(200);

    const retrievePayload = RetrieveResponseSchema.parse(retrieveRes.json() as unknown);
    const citation = retrievePayload.citations[0];
    if (citation === undefined) {
      throw new Error("Invariant violated: expected at least one citation");
    }

    const requestId = "req_e2e_isolation_evidence_1";

    const evidenceRes = await app.inject({
      method: "GET",
      url: `/api/evidence?citationId=${encodeURIComponent(citation.citationId)}`,
      headers: {
        "x-request-id": requestId,
        "x-tenant-id": tenantId,
        "x-project-id": "proj_b"
      }
    });

    expect(evidenceRes.statusCode).toBe(401);

    const appError = AppErrorSchema.parse(evidenceRes.json() as unknown);
    expect(appError.code).toBe("AUTH_ERROR");
    expect(appError.requestId).toBe(requestId);
    expect(appError.message).toContain(`requestId=${requestId}`);

    await app.close();
  });
});
