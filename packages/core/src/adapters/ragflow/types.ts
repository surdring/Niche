import { z } from "zod";

import { CitationSchema } from "../../contracts/citation";

export const RagflowRetrieveFiltersSchema = z
  .object({
    projectId: z.string().min(1)
  })
  .passthrough();

export type RagflowRetrieveFilters = z.infer<typeof RagflowRetrieveFiltersSchema>;

export const RagflowRetrieveInputSchema = z
  .object({
    query: z.string().min(1),
    filters: RagflowRetrieveFiltersSchema.optional(),
    topK: z.number().int().positive().optional(),
    scoreThreshold: z.number().min(0).max(1).optional()
  })
  .passthrough();

export type RagflowRetrieveInput = z.infer<typeof RagflowRetrieveInputSchema>;

export const RagflowSearchRequestSchema = z
  .object({
    query: z.string().min(1),
    filters: RagflowRetrieveFiltersSchema,
    topK: z.number().int().positive().optional(),
    scoreThreshold: z.number().min(0).max(1).optional()
  })
  .passthrough();

export type RagflowSearchRequest = z.infer<typeof RagflowSearchRequestSchema>;

export const RagflowChunkSchema = z
  .object({
    chunk_id: z.string().min(1),
    document_id: z.string().min(1).optional(),
    content: z.string().min(1).optional(),
    page_number: z.number().int().positive().optional(),
    offset_start: z.number().int().nonnegative().optional(),
    offset_end: z.number().int().nonnegative().optional(),
    score: z.number().optional()
  })
  .passthrough();

export type RagflowChunk = z.infer<typeof RagflowChunkSchema>;

export const RagflowSearchResponseSchema = z
  .object({
    chunks: z.array(RagflowChunkSchema)
  })
  .passthrough();

export type RagflowSearchResponse = z.infer<typeof RagflowSearchResponseSchema>;

export const RagflowRetrievedChunkSchema = z
  .object({
    chunkId: z.string().min(1),
    documentId: z.string().min(1).optional(),
    text: z.string().min(1),
    score: z.number().optional()
  })
  .passthrough();

export type RagflowRetrievedChunk = z.infer<typeof RagflowRetrievedChunkSchema>;

export const RagflowRetrieveOutputSchema = z
  .object({
    chunks: z.array(RagflowRetrievedChunkSchema),
    citations: z.array(CitationSchema)
  })
  .strict();

export type RagflowRetrieveOutput = z.infer<typeof RagflowRetrieveOutputSchema>;
