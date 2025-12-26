import { describe, expect, it } from "vitest";

import type { RequestContext } from "../../contracts/context";

import { buildRagflowSearchRequest } from "./request";

describe("ragflow request", () => {
  it("injects projectId filter from context", () => {
    const ctx: RequestContext = { requestId: "req_1", tenantId: "tenant_1", projectId: "proj_1" };

    const out = buildRagflowSearchRequest(ctx, { query: "hello" });
    expect(out.ok).toBe(true);
    if (!out.ok) {
      return;
    }

    expect(out.value.filters.projectId).toBe("proj_1");
  });

  it("rejects when projectId is missing", () => {
    const ctx: RequestContext = { requestId: "req_missing", tenantId: "tenant_1" };

    const out = buildRagflowSearchRequest(ctx, { query: "hello" });
    expect(out.ok).toBe(false);
    if (out.ok) {
      return;
    }

    expect(out.error.code).toBe("AUTH_ERROR");
    expect(out.error.message).toContain("Missing projectId");
    expect(out.error.message).toContain("requestId=req_missing");
  });

  it("rejects when ctx.projectId mismatches input.filters.projectId", () => {
    const ctx: RequestContext = { requestId: "req_mismatch", tenantId: "tenant_1", projectId: "proj_1" };

    const out = buildRagflowSearchRequest(ctx, { query: "hello", filters: { projectId: "proj_2" } });
    expect(out.ok).toBe(false);
    if (out.ok) {
      return;
    }

    expect(out.error.code).toBe("AUTH_ERROR");
    expect(out.error.message).toContain("projectId mismatch");
    expect(out.error.message).toContain("requestId=req_mismatch");
  });
});
