import { describe, expect, it, vi } from "vitest";

import { runStream } from "./stream";

describe("runStream", () => {
  it("throws CONTRACT_VIOLATION when request body does not match contract", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    await expect(
      runStream(
        {
          tenantId: "tenant_1",
          projectId: "proj_1",
          requestId: "req_test_1"
        },
        {
          messages: [{ role: "user", content: "hi" }],
          templateRef: {} as unknown as { templateId: string }
        }
      )
    ).rejects.toMatchObject({
      code: "CONTRACT_VIOLATION",
      requestId: "req_test_1"
    });

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("throws CONTRACT_VIOLATION when an error line cannot be converted into StreamPart", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    fetchSpy.mockResolvedValue(
      new Response(new TextEncoder().encode('3:""\n'), {
        status: 200,
        headers: {
          "x-request-id": "req_stream_1",
          "X-Vercel-AI-Data-Stream": "v1",
          "Content-Type": "text/plain; charset=utf-8"
        }
      })
    );

    await expect(
      runStream(
        {
          tenantId: "tenant_1",
          projectId: "proj_1",
          requestId: "req_test_2"
        },
        {
          messages: [{ role: "user", content: "hi" }],
          templateRef: { templateId: "tpl_1" }
        }
      )
    ).rejects.toMatchObject({
      code: "CONTRACT_VIOLATION",
      requestId: "req_stream_1"
    });
  });
});
