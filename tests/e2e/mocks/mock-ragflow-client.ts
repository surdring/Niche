import { z } from "zod";

import type { RagflowClient } from "@niche/core";

import { readFixture } from "./fixture-loader";

const RagflowFixtureSchemaVersionSchema = z.literal(1);

const RagflowChunkFixtureSchema = z
  .object({
    document_id: z.string().min(1),
    content: z.string().min(1),
    page_number: z.number().int().positive(),
    offset_start: z.number().int().nonnegative(),
    offset_end: z.number().int().nonnegative(),
    score: z.number().min(0).max(1)
  })
  .passthrough();

const RagflowMockFixtureSchema = z
  .object({
    schemaVersion: RagflowFixtureSchemaVersionSchema,
    search: z
      .object({
        chunks: z.array(RagflowChunkFixtureSchema).min(1)
      })
      .strict()
  })
  .strict();

export const createDeterministicRagflowClient = (): RagflowClient => {
  const fixture = readFixture("mock-ragflow-responses.json", RagflowMockFixtureSchema);
  const base = fixture.search.chunks[0];
  if (base === undefined) {
    throw new Error("Invariant violated: ragflow fixture missing chunks[0]");
  }

  return {
    async search(_ctx, input) {
      return {
        ok: true,
        value: {
          chunks: [
            {
              chunk_id: `chunk_${input.filters.projectId}_1`,
              document_id: base.document_id,
              content: base.content,
              page_number: base.page_number,
              offset_start: base.offset_start,
              offset_end: base.offset_end,
              score: base.score
            }
          ]
        }
      };
    }
  };
};
