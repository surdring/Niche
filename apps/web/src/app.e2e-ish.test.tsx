import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  encodeVercelAiDataStreamFinishMessageLine,
  encodeVercelAiDataStreamPartsLine,
  encodeVercelAiDataStreamTextLine,
  type Citation
} from "@niche/core/contracts";

import App from "./App";

type Rendered = {
  root: Root;
  container: HTMLDivElement;
  unmount: () => Promise<void>;
};

const renderApp = async (): Promise<Rendered> => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  await act(async () => {
    root.render(<App />);
  });

  return {
    root,
    container,
    unmount: async () => {
      await act(async () => {
        root.unmount();
      });
      container.remove();
    }
  };
};

const waitFor = async (assertion: () => void, timeoutMs = 2000, intervalMs = 10): Promise<void> => {
  const start = Date.now();
  let lastError: unknown = undefined;

  while (Date.now() - start < timeoutMs) {
    try {
      assertion();
      return;
    } catch (e) {
      lastError = e;
    }

    await act(async () => {
      await new Promise<void>((resolve) => {
        setTimeout(resolve, intervalMs);
      });
    });
  }

  throw lastError ?? new Error("waitFor timeout");
};

const getText = (el: Element | null): string => {
  return el?.textContent ?? "";
};

const setWindowWidth = async (width: number): Promise<void> => {
  await act(async () => {
    Object.defineProperty(window, "innerWidth", { value: width, configurable: true });
    window.dispatchEvent(new Event("resize"));
  });
};

type RecordedRequest = {
  url: string;
  method: string;
  headers: Headers;
  bodyText?: string;
};

const makeStreamBody = (lines: readonly { delayMs: number; line: string }[], signal?: AbortSignal): ReadableStream<Uint8Array> => {
  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    start(controller) {
      let closed = false;

      const closeOnce = () => {
        if (closed) {
          return;
        }
        closed = true;
        controller.close();
      };

      if (signal !== undefined) {
        if (signal.aborted) {
          closeOnce();
          return;
        }
        signal.addEventListener(
          "abort",
          () => {
            closeOnce();
          },
          { once: true }
        );
      }

      for (const item of lines) {
        setTimeout(() => {
          if (closed) {
            return;
          }
          controller.enqueue(encoder.encode(item.line));
        }, item.delayMs);
      }

      const totalDelay = lines.reduce((max, item) => Math.max(max, item.delayMs), 0);
      setTimeout(() => {
        closeOnce();
      }, totalDelay + 5);
    }
  });
};

describe("T12 e2e-ish", () => {
  const originalFetch = globalThis.fetch;

  let recorded: RecordedRequest[] = [];
  let createTaskRequestId: string | undefined;
  let streamScenario: "happy" | "error" | "error_then_happy" = "happy";
  let streamCallCount = 0;

  beforeEach(() => {
    recorded = [];
    createTaskRequestId = undefined;
    streamScenario = "happy";
    streamCallCount = 0;
    (globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const url = typeof input === "string" ? input : input.toString();
      const method = init?.method ?? "GET";
      const headers = new Headers(init?.headers);
      const bodyText = typeof init?.body === "string" ? init.body : undefined;

      recorded.push({
        url,
        method,
        headers,
        ...(bodyText !== undefined ? { bodyText } : {})
      });

      if (url === "/api/health") {
        return new Response("ok", { status: 200, headers: { "x-request-id": "req_health_1" } });
      }

      if (url === "/api/graphql") {
        const rid = headers.get("x-request-id") ?? undefined;

        const parsedBody = bodyText ? (JSON.parse(bodyText) as { query?: string; variables?: unknown }) : undefined;
        const query = typeof parsedBody?.query === "string" ? parsedBody.query : "";

        if (query.includes("query Templates")) {
          const payload = {
            data: {
              templates: [
                {
                  id: "tpl_default",
                  version: "v1",
                  name: "Default",
                  description: "Default template"
                }
              ]
            }
          };
          return new Response(JSON.stringify(payload), {
            status: 200,
            headers: { "Content-Type": "application/json", "x-request-id": rid ?? "req_graphql_unknown" }
          });
        }

        if (query.includes("mutation CreateTask")) {
          createTaskRequestId = rid;
          const payload = {
            data: {
              createTask: {
                taskId: "t_1",
                task: {
                  id: "t_1",
                  projectId: "proj_default",
                  sessionId: "s_1",
                  templateRef: {
                    templateId: "tpl_default",
                    templateVersion: "v1"
                  },
                  status: "running",
                  createdAt: "2025-01-01T00:00:00.000Z",
                  updatedAt: "2025-01-01T00:00:00.000Z"
                },
                session: {
                  id: "s_1",
                  taskId: "t_1",
                  templateRef: {
                    templateId: "tpl_default",
                    templateVersion: "v1"
                  },
                  createdAt: "2025-01-01T00:00:00.000Z"
                }
              }
            }
          };
          return new Response(JSON.stringify(payload), {
            status: 200,
            headers: { "Content-Type": "application/json", "x-request-id": rid ?? "req_graphql_unknown" }
          });
        }

        if (query.includes("mutation CancelTask")) {
          const payload = {
            data: {
              cancelTask: {
                id: "t_1",
                projectId: "proj_default",
                sessionId: "s_1",
                templateRef: {
                  templateId: "tpl_default",
                  templateVersion: "v1"
                },
                status: "cancelled",
                createdAt: "2025-01-01T00:00:00.000Z",
                updatedAt: "2025-01-01T00:00:01.000Z"
              }
            }
          };
          return new Response(JSON.stringify(payload), {
            status: 200,
            headers: { "Content-Type": "application/json", "x-request-id": rid ?? "req_graphql_unknown" }
          });
        }

        return new Response(JSON.stringify({ errors: [{ message: "Unknown GraphQL query" }] }), {
          status: 200,
          headers: { "Content-Type": "application/json", "x-request-id": rid ?? "req_graphql_unknown" }
        });
      }

      if (url === "/api/stream") {
        const rid = headers.get("x-request-id") ?? "req_stream_unknown";
        streamCallCount += 1;

        const shouldFail =
          streamScenario === "error" || (streamScenario === "error_then_happy" && streamCallCount === 1);

        if (shouldFail) {
          const lines = [
            { delayMs: 0, line: encodeVercelAiDataStreamPartsLine([{ type: "data-stage", data: { stage: "answer" } }]) },
            {
              delayMs: 10,
              line: encodeVercelAiDataStreamPartsLine([
                {
                  type: "data-app-error",
                  data: {
                    code: "UPSTREAM_UNAVAILABLE",
                    message: `Mock stream error (requestId=${rid})`,
                    retryable: true,
                    requestId: rid
                  }
                }
              ])
            },
            {
              delayMs: 20,
              line: encodeVercelAiDataStreamFinishMessageLine({
                finishReason: "error",
                usage: { promptTokens: 0, completionTokens: 0 }
              })
            }
          ];

          const body = makeStreamBody(lines, init?.signal ?? undefined);
          return new Response(body, {
            status: 200,
            headers: {
              "x-request-id": rid,
              "X-Vercel-AI-Data-Stream": "v1",
              "Content-Type": "text/plain; charset=utf-8"
            }
          });
        }

        const citation: Citation = {
          citationId: "c_1",
          sourceType: "document",
          projectId: "proj_default",
          locator: { offsetStart: 1, offsetEnd: 10 },
          snippet: "Evidence snippet",
          status: "verifiable"
        };

        const stepCommon = {
          taskId: "t_1",
          stepId: "s_1",
          stepName: "Answer",
          requestId: rid,
          timestamp: "2025-01-01T00:00:00.000Z"
        };

        const lines = [
          { delayMs: 0, line: encodeVercelAiDataStreamPartsLine([{ type: "data-stage", data: { stage: "answer" } }]) },
          {
            delayMs: 0,
            line: encodeVercelAiDataStreamPartsLine([
              {
                type: "data-step-event",
                data: { type: "step_started", ...stepCommon, payload: {} }
              },
              {
                type: "data-step-event",
                data: {
                  type: "tool_called",
                  ...stepCommon,
                  timestamp: "2025-01-01T00:00:00.100Z",
                  payload: { toolName: "mock_tool", argsSummary: "{\"query\":\"hello\"}" }
                }
              }
            ])
          },
          { delayMs: 20, line: encodeVercelAiDataStreamTextLine("Hello ") },
          { delayMs: 200, line: encodeVercelAiDataStreamTextLine("world") },
          { delayMs: 220, line: encodeVercelAiDataStreamPartsLine([{ type: "data-citations", data: [citation] }]) },
          {
            delayMs: 240,
            line: encodeVercelAiDataStreamPartsLine([
              {
                type: "data-step-event",
                data: {
                  type: "step_completed",
                  ...stepCommon,
                  timestamp: "2025-01-01T00:00:01.000Z",
                  payload: { outputSummary: "Hello world" }
                }
              }
            ])
          },
          {
            delayMs: 260,
            line: encodeVercelAiDataStreamFinishMessageLine({
              finishReason: "stop",
              usage: { promptTokens: 0, completionTokens: 2 }
            })
          }
        ];

        const body = makeStreamBody(lines, init?.signal ?? undefined);
        return new Response(body, {
          status: 200,
          headers: {
            "x-request-id": rid,
            "X-Vercel-AI-Data-Stream": "v1",
            "Content-Type": "text/plain; charset=utf-8"
          }
        });
      }

      if (url.startsWith("/api/evidence")) {
        const rid = headers.get("x-request-id") ?? "req_evidence_unknown";
        const u = new URL(url, "http://localhost");
        const citationId = u.searchParams.get("citationId") ?? "";

        const payload = {
          citationId,
          sourceType: "document",
          projectId: "proj_default",
          locator: { offsetStart: 1, offsetEnd: 10 },
          snippet: "Evidence snippet",
          status: "verifiable"
        };

        return new Response(JSON.stringify(payload), {
          status: 200,
          headers: { "Content-Type": "application/json", "x-request-id": rid }
        });
      }

      return new Response("not found", { status: 404 });
    });

    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(async () => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("export: preview and copy include output and citation metadata", async () => {
    await setWindowWidth(1024);

    const writeText = vi.fn(async () => undefined);
    (navigator as unknown as { clipboard?: { writeText: (value: string) => Promise<void> } }).clipboard = { writeText };

    const rendered = await renderApp();

    try {
      await waitFor(() => {
        const btn = rendered.container.querySelector<HTMLButtonElement>("[data-testid='run-btn']");
        expect(btn).not.toBeNull();
        expect(btn?.disabled).toBe(false);
      });

      await act(async () => {
        rendered.container.querySelector<HTMLButtonElement>("[data-testid='run-btn']")?.click();
      });

      await waitFor(() => {
        const preview = rendered.container.querySelector<HTMLTextAreaElement>("[data-testid='export-preview']");
        expect(preview).not.toBeNull();
        expect(preview?.value).toContain("Hello world");
      });

      await waitFor(() => {
        const preview = rendered.container.querySelector<HTMLTextAreaElement>("[data-testid='export-preview']");
        expect(preview?.value).toContain("## 引用");
        expect(preview?.value).toContain("[c_1]");
        expect(preview?.value).toContain("```yaml");
        expect(preview?.value).toContain("citationId:");
        expect(preview?.value).toContain("\"c_1\"");
        expect(preview?.value).toContain("projectId:");
        expect(preview?.value).toContain("\"proj_default\"");
        expect(preview?.value).toContain("offsetStart: 1");
      });

      const copyBtn = rendered.container.querySelector<HTMLButtonElement>("[data-testid='export-copy-btn']");
      expect(copyBtn).not.toBeNull();

      await act(async () => {
        copyBtn?.click();
        await Promise.resolve();
      });

      const preview = rendered.container.querySelector<HTMLTextAreaElement>("[data-testid='export-preview']");
      expect(writeText).toHaveBeenCalledTimes(1);
      expect(writeText).toHaveBeenCalledWith(preview?.value ?? "");
    } finally {
      await rendered.unmount();
    }
  });

  it("happy path: run -> output increments -> events -> citations -> evidence", async () => {
    await setWindowWidth(1024);
    const rendered = await renderApp();

    try {
      const runBtn = rendered.container.querySelector<HTMLButtonElement>("[data-testid='run-btn']");
      expect(runBtn).not.toBeNull();

      await waitFor(() => {
        const btn = rendered.container.querySelector<HTMLButtonElement>("[data-testid='run-btn']");
        expect(btn).not.toBeNull();
        expect(btn?.disabled).toBe(false);
      });

      await act(async () => {
        runBtn?.click();
      });

      await waitFor(() => {
        const outputEl = rendered.container.querySelector("[data-testid='output']");
        expect(getText(outputEl)).toContain("Hello ");
      });
      expect(getText(rendered.container.querySelector("[data-testid='output']"))).not.toContain("world");

      await waitFor(() => {
        const outputEl = rendered.container.querySelector("[data-testid='output']");
        expect(getText(outputEl)).toContain("Hello world");
      });

      await waitFor(() => {
        const timelineEl = rendered.container.querySelector("[data-testid='timeline']");
        expect(getText(timelineEl)).toContain("step_started");
      });
      await waitFor(() => {
        const timelineEl = rendered.container.querySelector("[data-testid='timeline']");
        expect(getText(timelineEl)).toContain("tool_called");
      });
      await waitFor(() => {
        const timelineEl = rendered.container.querySelector("[data-testid='timeline']");
        expect(getText(timelineEl)).toContain("step_completed");
      });

      await waitFor(() => {
        const citationsEl = rendered.container.querySelector("[data-testid='citations']");
        expect(getText(citationsEl)).toContain("Evidence snippet");
      });

      const citationsEl = rendered.container.querySelector("[data-testid='citations']");
      const firstCitationButton = citationsEl?.querySelector<HTMLButtonElement>("button");
      expect(firstCitationButton).not.toBeNull();

      await act(async () => {
        firstCitationButton?.click();
      });

      await waitFor(() => {
        const evidenceEl = rendered.container.querySelector("[data-testid='evidence']");
        expect(getText(evidenceEl)).toContain("status=verifiable");
      });

      const evidenceReq = recorded.find((r) => r.url.startsWith("/api/evidence"));
      expect(evidenceReq).toBeDefined();
      expect(evidenceReq?.headers.get("x-request-id")).toBe(createTaskRequestId);
    } finally {
      await rendered.unmount();
    }
  });

  it("cancel: aborts stream and status becomes cancelled", async () => {
    const rendered = await renderApp();

    try {
      await waitFor(() => {
        const btn = rendered.container.querySelector<HTMLButtonElement>("[data-testid='run-btn']");
        expect(btn).not.toBeNull();
        expect(btn?.disabled).toBe(false);
      });

      await act(async () => {
        rendered.container.querySelector<HTMLButtonElement>("[data-testid='run-btn']")?.click();
      });

      await waitFor(() => {
        const outputEl = rendered.container.querySelector("[data-testid='output']");
        expect(getText(outputEl)).toContain("Hello ");
      });
      const outputEl = rendered.container.querySelector("[data-testid='output']");
      expect(getText(outputEl)).not.toContain("world");

      await act(async () => {
        rendered.container.querySelector<HTMLButtonElement>("[data-testid='cancel-btn']")?.click();
      });

      const headerText = () => getText(rendered.container);
      await waitFor(() => {
        expect(headerText()).toContain("Run status");
        expect(headerText()).toContain("cancelled");
      });

      await act(async () => {
        await new Promise<void>((resolve) => {
          setTimeout(resolve, 80);
        });
      });
      expect(getText(outputEl)).not.toContain("Hello world");
    } finally {
      await rendered.unmount();
    }
  });

  it("error: shows error block then retry succeeds", async () => {
    await setWindowWidth(1024);
    streamScenario = "error_then_happy";

    const rendered = await renderApp();

    try {
      await waitFor(() => {
        const btn = rendered.container.querySelector<HTMLButtonElement>("[data-testid='run-btn']");
        expect(btn).not.toBeNull();
        expect(btn?.disabled).toBe(false);
      });

      await act(async () => {
        rendered.container.querySelector<HTMLButtonElement>("[data-testid='run-btn']")?.click();
      });

      await waitFor(() => {
        const text = getText(rendered.container);
        expect(text).toContain("Run status");
        expect(text).toContain("error");
        expect(text).toContain("UPSTREAM_UNAVAILABLE");
      });

      const streamReqs1 = recorded.filter((r) => r.url === "/api/stream");
      expect(streamReqs1.length).toBe(1);
      const rid1 = streamReqs1[0]?.headers.get("x-request-id") ?? "";
      expect(rid1.length).toBeGreaterThan(0);

      await waitFor(() => {
        const text = getText(rendered.container);
        expect(text).toContain(`requestId=${rid1}`);
        expect(text).toContain("retryable=true");
      });

      await waitFor(() => {
        const retryBtn = rendered.container.querySelector<HTMLButtonElement>("[data-testid='retry-btn']");
        expect(retryBtn).not.toBeNull();
        expect(retryBtn?.disabled).toBe(false);
      });

      const retryBtn = rendered.container.querySelector<HTMLButtonElement>("[data-testid='retry-btn']");
      expect(retryBtn?.disabled).toBe(false);

      await act(async () => {
        retryBtn?.click();
      });

      await waitFor(() => {
        const outputEl = rendered.container.querySelector("[data-testid='output']");
        expect(getText(outputEl)).toContain("Hello world");
      });

      await waitFor(() => {
        const text = getText(rendered.container);
        expect(text).toContain("Run status");
        expect(text).toContain("completed");
      });

      const streamReqs2 = recorded.filter((r) => r.url === "/api/stream");
      expect(streamReqs2.length).toBe(2);

      const rid2 = streamReqs2[1]?.headers.get("x-request-id") ?? "";
      expect(rid2.length).toBeGreaterThan(0);
      expect(rid2).not.toBe(rid1);

      expect(getText(rendered.container)).not.toContain("UPSTREAM_UNAVAILABLE");
    } finally {
      await rendered.unmount();
    }
  });

  it("responsive layout switches to single column on narrow widths", async () => {
    await setWindowWidth(375);
    const rendered = await renderApp();

    try {
      const layout = rendered.container.querySelector<HTMLElement>("[data-testid='layout-grid']");
      expect(layout).not.toBeNull();

      await waitFor(() => {
        expect((layout as HTMLElement).classList.contains("layout-grid")).toBe(true);
      });

      const styleText = () => {
        const style = rendered.container.querySelector("style");
        return style?.textContent ?? "";
      };

      await waitFor(() => {
        expect(styleText()).toContain(".layout-grid");
      });
      await waitFor(() => {
        expect(styleText()).toContain("@media (min-width: 900px)");
      });
    } finally {
      await rendered.unmount();
    }
  });
});
