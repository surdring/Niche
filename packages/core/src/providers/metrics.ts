import type { TokenUsage } from "./provider";

export type ProviderCallKind = "generate_text" | "stream_text";

export type ProviderCallMetric = {
  kind: ProviderCallKind;
  requestId: string;
  taskId?: string;
  providerId: string;
  modelId: string;
  attempt: number;
  startedAtIso: string;
  durationMs: number;
  ttftMs?: number;
  success: boolean;
  errorMessage?: string;
  usage?: TokenUsage;
};

export interface ProviderMetricsSink {
  record(metric: ProviderCallMetric): void;
}

export const createNoopProviderMetricsSink = (): ProviderMetricsSink => {
  return {
    record: (_metric) => {
      return;
    }
  };
};
