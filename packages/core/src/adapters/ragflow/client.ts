import type { RequestContext } from "../../contracts/context";
import type { AppError } from "../../contracts/error";

import {
  createRagflowContractViolationError,
  createRagflowUpstreamTimeoutError,
  createRagflowUpstreamUnavailableError
} from "./errors";
import { RagflowSearchResponseSchema, type RagflowSearchRequest, type RagflowSearchResponse } from "./types";

export type RagflowFetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

type RagflowLogger = {
  info(payload: Record<string, unknown>, message: string): void;
  warn(payload: Record<string, unknown>, message: string): void;
  error(payload: Record<string, unknown>, message: string): void;
};

type RequestContextWithLogger = RequestContext & { log?: RagflowLogger };

export type RagflowClientOptions = {
  baseUrl: string;
  fetchImpl?: RagflowFetch;
  timeoutMs?: number;
};

export type RagflowClient = {
  search(ctx: RequestContext, input: RagflowSearchRequest, options?: { signal?: AbortSignal }): Promise<RagflowClientResult>;
};

export type RagflowClientResult =
  | { ok: true; value: RagflowSearchResponse }
  | { ok: false; error: AppError };

const safeReadText = async (res: Response): Promise<string> => {
  try {
    return await res.text();
  } catch {
    return "";
  }
};

/**
 * Create a RAGFlow HTTP client.
 *
 * The returned client automatically injects context headers:
 * - `x-request-id`
 * - `x-tenant-id`
 * - `x-project-id` (when present)
 *
 * Timeout and request cancelation:
 * - `timeoutMs` controls an internal timeout
 * - an optional external `AbortSignal` can be passed to `search`
 */
export const createRagflowClient = (options: RagflowClientOptions): RagflowClient => {
  const fetchImpl: RagflowFetch = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? 8000;

  const baseUrl = options.baseUrl.replace(/\/+$/, "");
  const endpoint = `${baseUrl}/search`;

  return {
    async search(ctx, input, requestOptions) {
      const log = (ctx as RequestContextWithLogger).log;
      const startMs = Date.now();

      const abortController = new AbortController();
      const onAbort = () => {
        if (!abortController.signal.aborted) {
          abortController.abort();
        }
      };

      const external = requestOptions?.signal;
      if (external !== undefined) {
        if (external.aborted) {
          return {
            ok: false,
            error: createRagflowUpstreamUnavailableError(ctx.requestId, "RAGFlow request aborted")
          };
        }
        external.addEventListener("abort", onAbort, { once: true });
      }

      const timeout = setTimeout(() => {
        abortController.abort();
      }, timeoutMs);

      try {
        log?.info(
          {
            requestId: ctx.requestId,
            tenantId: ctx.tenantId,
            projectId: ctx.projectId,
            event: "ragflow_request_start",
            endpoint
          },
          "RAGFlow request started"
        );

        const res = await fetchImpl(endpoint, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-request-id": ctx.requestId,
            "x-tenant-id": ctx.tenantId,
            ...(ctx.projectId !== undefined ? { "x-project-id": ctx.projectId } : {})
          },
          body: JSON.stringify(input),
          signal: abortController.signal
        });

        if (!res.ok) {
          const body = await safeReadText(res);
          log?.warn(
            {
              requestId: ctx.requestId,
              tenantId: ctx.tenantId,
              projectId: ctx.projectId,
              event: "ragflow_request_failed",
              status: res.status,
              durationMs: Date.now() - startMs
            },
            "RAGFlow request failed"
          );
          return {
            ok: false,
            error: createRagflowUpstreamUnavailableError(ctx.requestId, "RAGFlow request failed", {
              status: res.status,
              body: body.slice(0, 512)
            })
          };
        }

        let json: unknown;
        try {
          json = (await res.json()) as unknown;
        } catch {
          const body = await safeReadText(res);
          return {
            ok: false,
            error: createRagflowContractViolationError(ctx.requestId, "RAGFlow returned non-JSON response", {
              body: body.slice(0, 512)
            })
          };
        }

        const parsed = RagflowSearchResponseSchema.safeParse(json);
        if (!parsed.success) {
          log?.warn(
            {
              requestId: ctx.requestId,
              tenantId: ctx.tenantId,
              projectId: ctx.projectId,
              event: "ragflow_response_invalid",
              durationMs: Date.now() - startMs
            },
            "RAGFlow response schema validation failed"
          );
          return {
            ok: false,
            error: createRagflowContractViolationError(ctx.requestId, "RAGFlow response schema validation failed", {
              reason: "RagflowSearchResponseSchema validation failed"
            })
          };
        }

        log?.info(
          {
            requestId: ctx.requestId,
            tenantId: ctx.tenantId,
            projectId: ctx.projectId,
            event: "ragflow_request_success",
            durationMs: Date.now() - startMs,
            chunksCount: parsed.data.chunks.length
          },
          "RAGFlow request succeeded"
        );
        return { ok: true, value: parsed.data };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);

        if (abortController.signal.aborted) {
          log?.warn(
            {
              requestId: ctx.requestId,
              tenantId: ctx.tenantId,
              projectId: ctx.projectId,
              event: "ragflow_request_timeout",
              durationMs: Date.now() - startMs,
              message
            },
            "RAGFlow request timed out"
          );
          return {
            ok: false,
            error: createRagflowUpstreamTimeoutError(ctx.requestId, "RAGFlow request timed out", { message })
          };
        }

        log?.warn(
          {
            requestId: ctx.requestId,
            tenantId: ctx.tenantId,
            projectId: ctx.projectId,
            event: "ragflow_request_error",
            durationMs: Date.now() - startMs,
            message
          },
          "RAGFlow request error"
        );
        return {
          ok: false,
          error: createRagflowUpstreamUnavailableError(ctx.requestId, "RAGFlow request failed", { message })
        };
      } finally {
        clearTimeout(timeout);
        if (external !== undefined) {
          external.removeEventListener("abort", onAbort);
        }
      }
    }
  };
};
