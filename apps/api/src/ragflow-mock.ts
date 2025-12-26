import type { RagflowClient } from "@niche/core";

export const createMockRagflowClient = (): RagflowClient => {
  return {
    async search(_ctx, input) {
      return {
        ok: true,
        value: {
          chunks: [
            {
              chunk_id: `chunk_${input.filters.projectId}_1`,
              document_id: "doc_1",
              content: "mock snippet",
              page_number: 1,
              offset_start: 0,
              offset_end: 10,
              score: 0.9
            }
          ]
        }
      };
    }
  };
};
