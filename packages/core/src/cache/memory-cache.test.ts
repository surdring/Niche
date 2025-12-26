import { describe, expect, it } from "vitest";

import { createLruTtlCache } from "./memory-cache";

describe("cache/memory-cache", () => {
  it("evicts least recently used entry when maxEntries is exceeded", () => {
    const cache = createLruTtlCache<string>({ maxEntries: 2, ttlMs: 1000 });

    cache.set("a", "A");
    cache.set("b", "B");

    expect(cache.get("a")).toBe("A");

    cache.set("c", "C");

    expect(cache.get("b")).toBeUndefined();
    expect(cache.get("a")).toBe("A");
    expect(cache.get("c")).toBe("C");
  });

  it("expires entries based on ttlMs", () => {
    let now = 0;
    const cache = createLruTtlCache<string>({
      maxEntries: 10,
      ttlMs: 100,
      now: () => now
    });

    cache.set("a", "A");
    expect(cache.get("a")).toBe("A");

    now = 50;
    expect(cache.get("a")).toBe("A");

    now = 150;
    expect(cache.get("a")).toBeUndefined();
  });
});
