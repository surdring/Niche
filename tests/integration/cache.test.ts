import { describe, expect, it } from "vitest";

import {
  createLruTtlCache,
  decodeVercelAiDataStreamLinesFromText,
  parseVercelAiDataStreamDataItems,
  type Citation
} from "@niche/core";

import { buildServer } from "../../apps/api/src/main";

type StreamProvider = NonNullable<NonNullable<Parameters<typeof buildServer>[0]>["streamProvider"]>;

type ResponseCacheEntry = {
  text: string;
  citations?: readonly Citation[];
  cachedAt: string;
};

describe("integration/cache", () => {
  it("serves cached response on repeat request and emits cache metadata", async () => {
    let calls = 0;

    const provider: StreamProvider = async function* () {
      calls += 1;
      yield "A";
      yield "B";
    };

    const cache = createLruTtlCache<ResponseCacheEntry>({
      maxEntries: 16,
      ttlMs: 60_000
    });

    const app = buildServer({
      logger: false,
      streamProvider: provider,
      streamProviderId: "test_provider",
      streamModelId: "test_model",
      responseCacheEnabled: true,
      responseCache: cache
    });
    await app.ready();

    const payload = JSON.stringify({
      taskId: "t_cache_1",
      messages: [{ role: "user", content: "hello" }],
      templateRef: { templateId: "tmpl_1", templateVersion: "v1" }
    });

    const response1 = await app.inject({
      method: "POST",
      url: "/api/stream",
      headers: {
        "content-type": "application/json",
        "x-request-id": "req_stream_cache_1",
        "x-tenant-id": "tenant_test",
        "x-project-id": "proj_test"
      },
      payload
    });

    expect(response1.statusCode).toBe(200);
    expect(calls).toBe(1);

    const lines1 = decodeVercelAiDataStreamLinesFromText(response1.payload);
    const items1 = lines1.filter((l) => l.kind === "data").flatMap((l) => (l.kind === "data" ? l.data : []));
    const parsed1 = parseVercelAiDataStreamDataItems(items1);
    expect(parsed1.some((i) => i.kind === "part" && i.part.type === "data-cache-metadata")).toBe(true);

    const response2 = await app.inject({
      method: "POST",
      url: "/api/stream",
      headers: {
        "content-type": "application/json",
        "x-request-id": "req_stream_cache_2",
        "x-tenant-id": "tenant_test",
        "x-project-id": "proj_test"
      },
      payload
    });

    expect(response2.statusCode).toBe(200);
    expect(calls).toBe(1);

    const lines2 = decodeVercelAiDataStreamLinesFromText(response2.payload);
    const items2 = lines2.filter((l) => l.kind === "data").flatMap((l) => (l.kind === "data" ? l.data : []));
    const parsed2 = parseVercelAiDataStreamDataItems(items2);

    const meta = parsed2
      .filter((i) => i.kind === "part")
      .map((i) => (i.kind === "part" ? i.part : undefined))
      .find((p) => p?.type === "data-cache-metadata");

    expect(meta?.type).toBe("data-cache-metadata");
    if (meta?.type !== "data-cache-metadata") {
      throw new Error("Missing data-cache-metadata part");
    }

    expect(meta.data.cached).toBe(true);
    expect(typeof meta.data.cacheKey).toBe("string");

    await app.close();
  });

  it("disables response cache when streamModelId is missing", async () => {
    let calls = 0;

    const provider: StreamProvider = async function* () {
      calls += 1;
      yield `M${calls}`;
    };

    const cache = createLruTtlCache<ResponseCacheEntry>({
      maxEntries: 16,
      ttlMs: 60_000
    });

    const app = buildServer({
      logger: false,
      streamProvider: provider,
      streamProviderId: "test_provider",
      responseCacheEnabled: true,
      responseCache: cache
    });
    await app.ready();

    const payload = JSON.stringify({
      taskId: "t_cache_missing_model_id",
      messages: [{ role: "user", content: "hello" }],
      templateRef: { templateId: "tmpl_1", templateVersion: "v1" }
    });

    const call = async (requestId: string) => {
      return app.inject({
        method: "POST",
        url: "/api/stream",
        headers: {
          "content-type": "application/json",
          "x-request-id": requestId,
          "x-tenant-id": "tenant_test",
          "x-project-id": "proj_test"
        },
        payload
      });
    };

    const r1 = await call("req_stream_cache_missing_model_1");
    expect(r1.statusCode).toBe(200);

    const r2 = await call("req_stream_cache_missing_model_2");
    expect(r2.statusCode).toBe(200);

    expect(calls).toBe(2);

    const lines = decodeVercelAiDataStreamLinesFromText(r2.payload);
    const items = lines.filter((l) => l.kind === "data").flatMap((l) => (l.kind === "data" ? l.data : []));
    const parsed = parseVercelAiDataStreamDataItems(items);
    expect(parsed.some((i) => i.kind === "part" && i.part.type === "data-cache-metadata")).toBe(false);

    await app.close();
  });

  it("expires cached response after TTL and calls provider again", async () => {
    let calls = 0;
    let now = 0;

    const provider: StreamProvider = async function* () {
      calls += 1;
      yield `C${calls}`;
    };

    const cache = createLruTtlCache<ResponseCacheEntry>({
      maxEntries: 16,
      ttlMs: 10,
      now: () => now
    });

    const app = buildServer({
      logger: false,
      streamProvider: provider,
      streamProviderId: "test_provider",
      streamModelId: "test_model",
      responseCacheEnabled: true,
      responseCache: cache
    });
    await app.ready();

    const payload = JSON.stringify({
      taskId: "t_cache_2",
      messages: [{ role: "user", content: "hello" }],
      templateRef: { templateId: "tmpl_1", templateVersion: "v1" }
    });

    const call = async (requestId: string) => {
      return app.inject({
        method: "POST",
        url: "/api/stream",
        headers: {
          "content-type": "application/json",
          "x-request-id": requestId,
          "x-tenant-id": "tenant_test",
          "x-project-id": "proj_test"
        },
        payload
      });
    };

    await call("req_stream_cache_ttl_1");
    expect(calls).toBe(1);

    now += 5;
    await call("req_stream_cache_ttl_2");
    expect(calls).toBe(1);

    now += 20;
    await call("req_stream_cache_ttl_3");
    expect(calls).toBe(2);

    await app.close();
  });
});
