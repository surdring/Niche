import { describe, expect, it, vi } from "vitest";

import { fetchEvidence } from "./evidence";

describe("fetchEvidence", () => {
  it("throws CONTRACT_VIOLATION when query does not match contract", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    await expect(
      fetchEvidence(
        {
          tenantId: "tenant_1",
          projectId: "proj_1",
          requestId: "req_test_1"
        },
        ""
      )
    ).rejects.toMatchObject({
      code: "CONTRACT_VIOLATION",
      requestId: "req_test_1"
    });

    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
