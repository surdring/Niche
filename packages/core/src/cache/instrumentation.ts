import { z } from "zod";

export const ResponseCacheInstrumentationBaseSchema = z
  .object({
    requestId: z.string().min(1),
    tenantId: z.string().min(1),
    projectId: z.string().min(1),
    taskId: z.string().min(1).optional(),
    cacheKey: z.string().min(1)
  })
  .passthrough();

export type ResponseCacheInstrumentationBase = z.infer<typeof ResponseCacheInstrumentationBaseSchema>;

export const ResponseCacheHitEventSchema = ResponseCacheInstrumentationBaseSchema.extend({
  event: z.literal("response_cache_hit"),
  cachedAt: z.string().datetime().optional()
}).passthrough();

export type ResponseCacheHitEvent = z.infer<typeof ResponseCacheHitEventSchema>;

export const ResponseCacheMissEventSchema = ResponseCacheInstrumentationBaseSchema.extend({
  event: z.literal("response_cache_miss")
}).passthrough();

export type ResponseCacheMissEvent = z.infer<typeof ResponseCacheMissEventSchema>;

export const ResponseCacheStoreEventSchema = ResponseCacheInstrumentationBaseSchema.extend({
  event: z.literal("response_cache_store"),
  cachedAt: z.string().datetime()
}).passthrough();

export type ResponseCacheStoreEvent = z.infer<typeof ResponseCacheStoreEventSchema>;
