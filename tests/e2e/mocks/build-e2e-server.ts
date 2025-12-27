import { createInMemoryRagflowEvidenceStore } from "@niche/core";

import { buildServer } from "../../../apps/api/src/main";

import { createDeterministicRagflowClient } from "./mock-ragflow-client";
import type { StreamProvider } from "./stream-provider";

export const buildE2eServer = (options?: { streamProvider?: StreamProvider }) => {
  const server = buildServer({
    logger: false,
    ragflowClient: createDeterministicRagflowClient(),
    ragflowEvidenceStore: createInMemoryRagflowEvidenceStore(),
    ...(options?.streamProvider !== undefined ? { streamProvider: options.streamProvider } : {})
  });

  return server;
};
