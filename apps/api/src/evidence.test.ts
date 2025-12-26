import { describe, expect, it } from "vitest";

import { AppErrorSchema, CitationSchema, EvidenceSchema } from "@niche/core";
import { z } from "zod";

import { buildServer } from "./main";

describe("/api/evidence", () => {
  it("rejects cross project citationId with AUTH_ERROR and includes requestId", async () => {
    const app = buildServer({ logger: false });
    await app.ready();

    const retrieveRes = await app.inject({
      method: "POST",
      url: "/api/retrieve",
      headers: {
        "content-type": "application/json",
        "x-request-id": "req_retrieve_for_cross_project_1",
        "x-tenant-id": "tenant_test",
        "x-project-id": "proj_a"
      },
      payload: JSON.stringify({ query: "hello" })
    });

    expect(retrieveRes.statusCode).toBe(200);

    const RetrieveResponseSchema = z
      .object({
        citations: z.array(CitationSchema).min(1)
      })
      .passthrough();

    const retrievePayload = RetrieveResponseSchema.parse(retrieveRes.json() as unknown);
    const citation = retrievePayload.citations[0];
    if (citation === undefined) {
      throw new Error("Invariant violated: expected at least one citation");
    }

    const requestId = "req_evidence_cross_project_1";

    const evidenceRes = await app.inject({
      method: "GET",
      url: `/api/evidence?citationId=${encodeURIComponent(citation.citationId)}`,
      headers: {
        "x-request-id": requestId,
        "x-tenant-id": "tenant_test",
        "x-project-id": "proj_b"
      }
    });

    expect(evidenceRes.statusCode).toBe(401);
    const payload = AppErrorSchema.parse(evidenceRes.json() as unknown);
    expect(payload.code).toBe("AUTH_ERROR");
    expect(payload.requestId).toBe(requestId);
    expect(payload.message).toContain(`requestId=${requestId}`);

    await app.close();
  });

  it("returns 400 VALIDATION_ERROR when citationId is empty", async () => {
    const app = buildServer({ logger: false });
    await app.ready();

    const requestId = "req_evidence_invalid_citation_empty_1";

    const response = await app.inject({
      method: "GET",
      url: "/api/evidence?citationId=",
      headers: {
        "x-request-id": requestId,
        "x-tenant-id": "tenant_test",
        "x-project-id": "proj_test"
      }
    });

    expect(response.statusCode).toBe(400);
    const payload = AppErrorSchema.parse(response.json() as unknown);
    expect(payload.code).toBe("VALIDATION_ERROR");
    expect(payload.requestId).toBe(requestId);
    expect(payload.message).toContain(`requestId=${requestId}`);

    await app.close();
  });

  it("returns 400 VALIDATION_ERROR when citationId is provided multiple times", async () => {
    const app = buildServer({ logger: false });
    await app.ready();

    const requestId = "req_evidence_invalid_citation_multi_1";

    const response = await app.inject({
      method: "GET",
      url: "/api/evidence?citationId=a&citationId=b",
      headers: {
        "x-request-id": requestId,
        "x-tenant-id": "tenant_test",
        "x-project-id": "proj_test"
      }
    });

    expect(response.statusCode).toBe(400);
    const payload = AppErrorSchema.parse(response.json() as unknown);
    expect(payload.code).toBe("VALIDATION_ERROR");
    expect(payload.requestId).toBe(requestId);
    expect(payload.message).toContain(`requestId=${requestId}`);

    await app.close();
  });

  it("rejects missing tenantId with AUTH_ERROR and includes requestId", async () => {
    const app = buildServer({ logger: false });
    await app.ready();

    const requestId = "req_evidence_missing_tenant_1";

    const response = await app.inject({
      method: "GET",
      url: "/api/evidence?citationId=c_missing",
      headers: {
        "x-request-id": requestId,
        "x-project-id": "proj_test"
      }
    });

    expect(response.statusCode).toBe(401);
    const payload = AppErrorSchema.parse(response.json() as unknown);
    expect(payload.code).toBe("AUTH_ERROR");
    expect(payload.requestId).toBe(requestId);
    expect(payload.message).toContain(`requestId=${requestId}`);

    await app.close();
  });

  it("rejects ragflow citationId when tenantId mismatches", async () => {
    const app = buildServer({ logger: false });
    await app.ready();

    const projectId = "proj_test";
    const retrieveRes = await app.inject({
      method: "POST",
      url: "/api/retrieve",
      headers: {
        "content-type": "application/json",
        "x-request-id": "req_retrieve_for_tenant_mismatch_1",
        "x-tenant-id": "tenant_a",
        "x-project-id": projectId
      },
      payload: JSON.stringify({ query: "hello" })
    });

    expect(retrieveRes.statusCode).toBe(200);

    const RetrieveResponseSchema = z
      .object({
        citations: z.array(CitationSchema).min(1)
      })
      .passthrough();

    const retrievePayload = RetrieveResponseSchema.parse(retrieveRes.json() as unknown);
    const citation = retrievePayload.citations[0];
    if (citation === undefined) {
      throw new Error("Invariant violated: expected at least one citation");
    }

    const requestId = "req_evidence_tenant_mismatch_1";

    const evidenceRes = await app.inject({
      method: "GET",
      url: `/api/evidence?citationId=${encodeURIComponent(citation.citationId)}`,
      headers: {
        "x-request-id": requestId,
        "x-tenant-id": "tenant_b",
        "x-project-id": projectId
      }
    });

    expect(evidenceRes.statusCode).toBe(401);
    const payload = AppErrorSchema.parse(evidenceRes.json() as unknown);
    expect(payload.code).toBe("AUTH_ERROR");
    expect(payload.requestId).toBe(requestId);
    expect(payload.message).toContain(`requestId=${requestId}`);

    await app.close();
  });

  it("returns status=unavailable without snippet when citation cannot be verified", async () => {
    const app = buildServer({ logger: false });
    await app.ready();

    const response = await app.inject({
      method: "GET",
      url: "/api/evidence?citationId=c_missing",
      headers: {
        "x-request-id": "req_evidence_unavailable_1",
        "x-tenant-id": "tenant_test",
        "x-project-id": "proj_test"
      }
    });

    expect(response.statusCode).toBe(200);

    const evidence = EvidenceSchema.parse(response.json() as unknown);
    expect(evidence.citationId).toBe("c_missing");
    expect(evidence.projectId).toBe("proj_test");
    expect(evidence.status).toBe("unavailable");
    expect(evidence.snippet).toBeUndefined();
    expect(typeof evidence.degradedReason).toBe("string");
    expect((evidence.degradedReason ?? "").length).toBeGreaterThan(0);

    await app.close();
  });
});
