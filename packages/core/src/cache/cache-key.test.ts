import { describe, expect, it } from "vitest";

import type { Citation } from "../contracts/citation";
import { computeResponseCacheKey } from "./cache-key";

describe("cache/cache-key", () => {
  it("is deterministic and stable across repeated calls", () => {
    const input = {
      tenantId: "tenant_1",
      projectId: "project_1",
      templateRef: { templateId: "tmpl_1", templateVersion: "v1" },
      messages: [{ role: "user", content: "hello" }],
      modelInfo: { providerId: "p1", modelId: "m1" }
    };

    const k1 = computeResponseCacheKey(input);
    const k2 = computeResponseCacheKey(input);

    expect(k1).toBe(k2);
    expect(k1).toMatch(/^cache:v1:sha256:[a-f0-9]{64}$/);
  });

  it("changes when input messages change", () => {
    const base = {
      tenantId: "tenant_1",
      projectId: "project_1",
      templateRef: { templateId: "tmpl_1", templateVersion: "v1" },
      modelInfo: { providerId: "p1", modelId: "m1" }
    };

    const k1 = computeResponseCacheKey({
      ...base,
      messages: [{ role: "user", content: "hello" }]
    });

    const k2 = computeResponseCacheKey({
      ...base,
      messages: [{ role: "user", content: "hello!" }]
    });

    expect(k1).not.toBe(k2);
  });

  it("is insensitive to citations ordering", () => {
    const base = {
      tenantId: "tenant_1",
      projectId: "project_1",
      templateRef: { templateId: "tmpl_1", templateVersion: "v1" },
      messages: [{ role: "user", content: "hello" }],
      modelInfo: { providerId: "p1", modelId: "m1" }
    };

    const c1: Citation = {
      citationId: "c1",
      sourceType: "document",
      projectId: "project_1",
      locator: { page: 1 },
      status: "verifiable"
    };

    const c2: Citation = {
      citationId: "c2",
      sourceType: "document",
      projectId: "project_1",
      locator: { page: 2 },
      status: "verifiable"
    };

    const k1 = computeResponseCacheKey({ ...base, citations: [c1, c2] });
    const k2 = computeResponseCacheKey({ ...base, citations: [c2, c1] });

    expect(k1).toBe(k2);
  });

  it("changes when templateRef changes", () => {
    const base = {
      tenantId: "tenant_1",
      projectId: "project_1",
      messages: [{ role: "user", content: "hello" }],
      modelInfo: { providerId: "p1", modelId: "m1" }
    };

    const k1 = computeResponseCacheKey({
      ...base,
      templateRef: { templateId: "tmpl_1", templateVersion: "v1" }
    });

    const k2 = computeResponseCacheKey({
      ...base,
      templateRef: { templateId: "tmpl_2", templateVersion: "v1" }
    });

    expect(k1).not.toBe(k2);
  });
});
