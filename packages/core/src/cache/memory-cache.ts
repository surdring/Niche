import { z } from "zod";

export const LruTtlCacheOptionsSchema = z
  .object({
    maxEntries: z.number().int().positive(),
    ttlMs: z.number().int().positive(),
    now: z.function().returns(z.number()).optional()
  })
  .strict();

export type LruTtlCacheOptions = z.infer<typeof LruTtlCacheOptionsSchema>;

export type LruTtlCache<V> = {
  get(key: string): V | undefined;
  set(key: string, value: V): void;
  delete(key: string): boolean;
  size(): number;
  clear(): void;
};

type Entry<V> = {
  value: V;
  expiresAtMs: number;
};

export const createLruTtlCache = <V>(options: LruTtlCacheOptions): LruTtlCache<V> => {
  const parsed = LruTtlCacheOptionsSchema.parse(options);
  const now = parsed.now ?? (() => Date.now());

  const byKey = new Map<string, Entry<V>>();

  const purgeExpired = (key: string, entry: Entry<V>): boolean => {
    if (entry.expiresAtMs > now()) {
      return false;
    }
    byKey.delete(key);
    return true;
  };

  const touch = (key: string, entry: Entry<V>): void => {
    byKey.delete(key);
    byKey.set(key, entry);
  };

  const evictIfNeeded = (): void => {
    while (byKey.size > parsed.maxEntries) {
      const oldest = byKey.keys().next().value as string | undefined;
      if (oldest === undefined) {
        return;
      }
      byKey.delete(oldest);
    }
  };

  return {
    get(key) {
      const entry = byKey.get(key);
      if (entry === undefined) {
        return undefined;
      }

      if (purgeExpired(key, entry)) {
        return undefined;
      }

      touch(key, entry);
      return entry.value;
    },

    set(key, value) {
      const expiresAtMs = now() + parsed.ttlMs;
      const entry: Entry<V> = { value, expiresAtMs };
      byKey.set(key, entry);
      touch(key, entry);
      evictIfNeeded();
    },

    delete(key) {
      return byKey.delete(key);
    },

    size() {
      return byKey.size;
    },

    clear() {
      byKey.clear();
    }
  };
};
