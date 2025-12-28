import { useEffect, useMemo, useRef, useState } from "react";

import {
  AppErrorSchema,
  type AppError,
  type Citation,
  type StepEvent,
  type StreamCacheMetadata,
  type TemplateRef
} from "@niche/core/contracts";

import { cancelTask, createTask, listTemplates, type CreateTaskInput } from "./lib/api/graphql";
import { runStream } from "./lib/api/stream";
import { fetchEvidence } from "./lib/api/evidence";
import { createContractViolationError, tryParseAppError } from "./lib/errors";
import { formatMarkdownExport, type ExportModel } from "./lib/export";
import { ExportPanel } from "./components/ExportPanel";
import { ErrorBlock } from "./components/ErrorBlock";
import { RunPanel } from "./components/RunPanel";
import { StreamOutput } from "./components/StreamOutput";
import { StepTimeline } from "./components/StepTimeline";
import { CitationsEvidencePanel } from "./components/CitationsEvidencePanel";
import { type EvidenceState } from "./components/EvidencePanel";

type HealthState =
  | { status: "idle"; requestId?: string }
  | { status: "ok"; requestId?: string }
  | { status: "error"; message: string; requestId?: string };

type TemplatesState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; templates: readonly { id: string; version: string; name: string; description?: string }[] }
  | { status: "error"; message: string };

type RunStatus = "idle" | "running" | "cancelled" | "completed" | "error";

const createRequestId = (): string => {
  const cryptoObj = globalThis.crypto as Crypto | undefined;
  if (cryptoObj?.randomUUID) {
    return `req_web_${cryptoObj.randomUUID()}`;
  }
  return `req_web_${Math.random().toString(16).slice(2)}`;
};

const toErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};

const formatEventSummary = (ev: StepEvent): string => {
  if (ev.type === "step_progress") {
    const progress = ev.payload.progress;
    const pct = typeof progress === "number" ? `${Math.round(progress * 100)}%` : "";
    const msg = ev.payload.message;
    return [pct, msg].filter((x) => typeof x === "string" && x.length > 0).join(" ");
  }

  if (ev.type === "tool_called") {
    return `${ev.payload.toolName}: ${ev.payload.argsSummary}`;
  }

  if (ev.type === "tool_result") {
    return `${ev.payload.toolName}: ${ev.payload.resultSummary ?? "(no result summary)"}`;
  }

  if (ev.type === "step_completed") {
    return ev.payload.outputSummary ?? "(completed)";
  }

  if (ev.type === "step_failed") {
    return `${ev.payload.error.code}: ${ev.payload.error.message}`;
  }

  return "";
};

const App = () => {
  const abortRef = useRef<AbortController | null>(null);

  const [health, setHealth] = useState<HealthState>({ status: "idle" });
  const [templates, setTemplates] = useState<TemplatesState>({ status: "idle" });

  const [tenantId, setTenantId] = useState<string>("tenant_1");
  const [projectId, setProjectId] = useState<string>("proj_default");

  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("Explain the difference between BFS and DFS.");

  const [runStatus, setRunStatus] = useState<RunStatus>("idle");
  const [runRequestId, setRunRequestId] = useState<string>("");
  const [taskId, setTaskId] = useState<string | undefined>(undefined);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [templateRef, setTemplateRef] = useState<TemplateRef | undefined>(undefined);

  const [stage, setStage] = useState<string | undefined>(undefined);

  const [output, setOutput] = useState<string>("");
  const [events, setEvents] = useState<readonly StepEvent[]>([]);
  const [error, setError] = useState<AppError | undefined>(undefined);

  const [citations, setCitations] = useState<readonly Citation[]>([]);
  const [selectedCitationId, setSelectedCitationId] = useState<string | undefined>(undefined);
  const [evidenceState, setEvidenceState] = useState<EvidenceState>({ status: "idle" });

  const [cacheMeta, setCacheMeta] = useState<StreamCacheMetadata | undefined>(undefined);

  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [groupTimeline, setGroupTimeline] = useState<boolean>(true);

  const templateOptions = useMemo(() => {
    if (templates.status !== "ready") {
      return [];
    }
    return templates.templates.map((t) => {
      return { key: `${t.id}@${t.version}`, label: `${t.name} (${t.id}@${t.version})`, template: t };
    });
  }, [templates]);

  const selectedTemplate = useMemo(() => {
    const found = templateOptions.find((t) => t.key === selectedTemplateKey);
    return found?.template;
  }, [selectedTemplateKey, templateOptions]);

  const exportMarkdown = useMemo(() => {
    const model: ExportModel = {
      output,
      citations
    };

    if (taskId !== undefined) {
      model.taskId = taskId;
    }
    if (sessionId !== undefined) {
      model.sessionId = sessionId;
    }
    if (runRequestId.length > 0) {
      model.requestId = runRequestId;
    }
    if (templateRef !== undefined) {
      model.templateRef = templateRef;
    }

    return formatMarkdownExport(model);
  }, [citations, output, runRequestId, sessionId, taskId, templateRef]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedCitationId !== undefined) {
        e.preventDefault();
        setSelectedCitationId(undefined);
        setEvidenceState({ status: "idle" });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedCitationId]);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/health");
        const rid = res.headers.get("x-request-id") ?? undefined;
        if (!res.ok) {
          setHealth({
            status: "error",
            message: `Health check failed: ${res.status}`,
            ...(rid !== undefined ? { requestId: rid } : {})
          });
          return;
        }
        setHealth({ status: "ok", ...(rid !== undefined ? { requestId: rid } : {}) });
      } catch (e) {
        setHealth({ status: "error", message: `Health check failed: ${toErrorMessage(e)}` });
      }
    };
    void run();
  }, []);

  useEffect(() => {
    const load = async () => {
      setTemplates({ status: "loading" });
      try {
        const list = await listTemplates({ tenantId });
        const items = list.map((t) => {
          const description = t.description;
          return {
            id: t.id,
            version: t.version,
            name: t.name,
            ...(description !== undefined ? { description } : {})
          };
        });
        setTemplates({ status: "ready", templates: items });
        if (items.length > 0 && selectedTemplateKey.length === 0) {
          setSelectedTemplateKey(`${items[0]?.id ?? ""}@${items[0]?.version ?? ""}`);
        }
      } catch (e) {
        setTemplates({ status: "error", message: toErrorMessage(e) });
      }
    };

    if (tenantId.trim().length === 0) {
      return;
    }

    void load();
  }, [tenantId, selectedTemplateKey.length]);

  const resetRunState = () => {
    setRunStatus("idle");
    setRunRequestId("");
    setTaskId(undefined);
    setSessionId(undefined);
    setTemplateRef(undefined);
    setStage(undefined);
    setOutput("");
    setEvents([]);
    setError(undefined);
    setCitations([]);
    setSelectedCitationId(undefined);
    setEvidenceState({ status: "idle" });
    setCacheMeta(undefined);
  };

  const selectCitation = async (citationId: string) => {
    setSelectedCitationId(citationId);

    if (runRequestId.length === 0) {
      setEvidenceState({ status: "error", citationId, message: "Missing requestId" });
      return;
    }

    setEvidenceState({ status: "loading", citationId });

    try {
      const evidence = await fetchEvidence({ tenantId, projectId, requestId: runRequestId }, citationId);
      setEvidenceState({ status: "ready", citationId, evidence });
    } catch (e) {
      const parsed = tryParseAppError(e);
      const message = parsed !== undefined ? `${parsed.code}: ${parsed.message}` : toErrorMessage(e);
      setEvidenceState({ status: "error", citationId, message });
    }
  };

  const canRun = templates.status === "ready" && runStatus !== "running";
  const canCancel = runStatus === "running";
  const canRetry = templates.status === "ready" && runStatus !== "running" && runStatus !== "idle";

  const doRun = async (requestId: string, input: CreateTaskInput) => {
    setRunStatus("running");
    setOutput("");
    setEvents([]);
    setError(undefined);
    setStage(undefined);

    const ctx = { tenantId, projectId, requestId };

    const created = await createTask(ctx, input);
    setTaskId(created.taskId);
    setSessionId(created.session.id);
    setTemplateRef(created.task.templateRef);

    const abort = new AbortController();
    abortRef.current = abort;

    let sawError = false;

    try {
      await runStream(
        ctx,
        {
          taskId: created.taskId,
          messages: [{ role: "user", content: prompt }],
          templateRef: created.task.templateRef
        },
        {
          signal: abort.signal,
          onToken: (text) => {
            setOutput((prev) => prev + text);
          },
          onPart: (part) => {
            if (part.type === "data-stage") {
              setStage(part.data.stage);
              return;
            }
            if (part.type === "data-cache-metadata") {
              setCacheMeta(part.data);
              return;
            }
            if (part.type === "data-step-event") {
              setEvents((prev) => [...prev, part.data]);
              return;
            }
            if (part.type === "data-citations") {
              setCitations(part.data);
              setSelectedCitationId((prev) => {
                if (prev !== undefined) {
                  return prev;
                }
                const first = part.data[0];
                return first?.citationId;
              });
              return;
            }
            if (part.type === "data-app-error") {
              sawError = true;
              setError(part.data);
              return;
            }
            if (part.type === "error") {
              sawError = true;
              setError(
                AppErrorSchema.parse({
                  code: "UPSTREAM_UNAVAILABLE",
                  message: part.errorText,
                  retryable: true,
                  requestId
                })
              );
            }
          }
        }
      );
    } catch (e) {
      if (!abort.signal.aborted) {
        sawError = true;
        const parsed = tryParseAppError(e);
        setError(parsed ?? createContractViolationError(`Stream failed: ${toErrorMessage(e)}`, requestId, e));
      }
    } finally {
      abortRef.current = null;
    }

    if (abort.signal.aborted) {
      setRunStatus("cancelled");
      return;
    }

    if (sawError) {
      setRunStatus("error");
      return;
    }

    setRunStatus("completed");
  };

  const onRun = async () => {
    resetRunState();

    if (tenantId.trim().length === 0) {
      setRunStatus("error");
      setError(
        AppErrorSchema.parse({
          code: "VALIDATION_ERROR",
          message: "tenantId is required",
          retryable: false,
          requestId: "unknown"
        })
      );
      return;
    }

    if (projectId.trim().length === 0) {
      setRunStatus("error");
      setError(
        AppErrorSchema.parse({
          code: "VALIDATION_ERROR",
          message: "projectId is required",
          retryable: false,
          requestId: "unknown"
        })
      );
      return;
    }

    if (prompt.trim().length === 0) {
      setRunStatus("error");
      setError(
        AppErrorSchema.parse({
          code: "VALIDATION_ERROR",
          message: "prompt is required",
          retryable: false,
          requestId: "unknown"
        })
      );
      return;
    }

    if (selectedTemplate === undefined) {
      setRunStatus("error");
      setError(
        AppErrorSchema.parse({
          code: "VALIDATION_ERROR",
          message: "template is required",
          retryable: false,
          requestId: "unknown"
        })
      );
      return;
    }

    const requestId = createRequestId();
    setRunRequestId(requestId);

    try {
      await doRun(requestId, {
        projectId,
        templateId: selectedTemplate.id,
        templateVersion: selectedTemplate.version
      });
    } catch (e) {
      const parsed = tryParseAppError(e);
      setRunStatus("error");
      setError(
        parsed ??
          AppErrorSchema.parse({
            code: "UPSTREAM_UNAVAILABLE",
            message: `Run failed: ${toErrorMessage(e)}`,
            retryable: true,
            requestId
          })
      );
    }
  };

  const onCancel = async () => {
    const controller = abortRef.current;
    if (controller !== null && !controller.signal.aborted) {
      controller.abort();
    }

    if (taskId === undefined || runRequestId.length === 0) {
      setRunStatus("cancelled");
      return;
    }

    try {
      await cancelTask({ tenantId, projectId, requestId: runRequestId }, taskId);
      setRunStatus("cancelled");
    } catch (e) {
      const parsed = tryParseAppError(e);
      setRunStatus("error");
      setError(
        parsed ??
          AppErrorSchema.parse({
            code: "UPSTREAM_UNAVAILABLE",
            message: `Cancel failed: ${toErrorMessage(e)}`,
            retryable: true,
            requestId: runRequestId
          })
      );
    }
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", fontFamily: "ui-sans-serif, system-ui" }}>
      <style>{`
        button:focus-visible,
        input:focus-visible,
        select:focus-visible,
        textarea:focus-visible {
          outline: 2px solid #2563eb;
          outline-offset: 2px;
        }

        .layout-grid {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr;
          grid-template-rows: auto 1fr;
          min-height: 0;
        }

        @media (min-width: 900px) {
          .layout-grid {
            grid-template-columns: 360px 1fr;
            grid-template-rows: 1fr;
          }
        }

        .left-pane {
          border-right: none;
        }

        @media (min-width: 900px) {
          .left-pane {
            border-right: 1px solid #eee;
          }
        }

        .main-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          min-height: 0;
        }

        @media (min-width: 900px) {
          .main-grid {
            grid-template-columns: 1fr 380px;
          }
        }
      `}</style>

      <div style={{ padding: 16, borderBottom: "1px solid #eee" }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>Niche Study Copilot</div>
        <div style={{ marginTop: 6, color: "#555", display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div>
            <span style={{ fontWeight: 600 }}>API</span>
            {": "}
            {health.status === "idle" ? "Checking..." : health.status === "ok" ? "OK" : health.message}
            {health.requestId !== undefined ? ` (requestId=${health.requestId})` : ""}
          </div>
          <div>
            <span style={{ fontWeight: 600 }}>Run status</span>
            {": "}
            {runStatus}
          </div>
          {runRequestId.length > 0 ? (
            <div>
              <span style={{ fontWeight: 600 }}>requestId</span>
              {": "}
              <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{runRequestId}</span>
            </div>
          ) : null}
          {cacheMeta?.cached === true ? (
            <div>
              <span style={{ fontWeight: 600 }}>cache</span>
              {": hit"}
              {cacheMeta.cacheKey !== undefined ? ` (key=${cacheMeta.cacheKey})` : ""}
            </div>
          ) : null}
        </div>
      </div>

      <div data-testid="layout-grid" className="layout-grid">
        <div className="left-pane" style={{ padding: 16, overflow: "auto" }}>
          <RunPanel
            tenantId={tenantId}
            onTenantIdChange={setTenantId}
            projectId={projectId}
            onProjectIdChange={setProjectId}
            templatesStatus={templates.status}
            templateOptions={templateOptions.map((t) => {
              const description = t.template.description;
              return {
                key: t.key,
                label: t.label,
                ...(description !== undefined ? { description } : {})
              };
            })}
            selectedTemplateKey={selectedTemplateKey}
            onSelectedTemplateKeyChange={setSelectedTemplateKey}
            selectedTemplateDescription={selectedTemplate?.description}
            prompt={prompt}
            onPromptChange={setPrompt}
            canRun={canRun}
            canCancel={canCancel}
            canRetry={canRetry}
            onRun={() => void onRun()}
            onCancel={() => void onCancel()}
            runStatus={runStatus}
            taskId={taskId}
            sessionId={sessionId}
            stage={stage}
            templateRef={templateRef}
          />
        </div>

        <div style={{ padding: 16, overflow: "auto", minWidth: 0 }}>
          {error !== undefined ? <ErrorBlock error={error} /> : null}

          <div className="main-grid">
            <StreamOutput output={output} autoScroll={autoScroll} onAutoScrollChange={setAutoScroll} isRunning={runStatus === "running"} />

            <div style={{ minWidth: 0 }}>
              <StepTimeline
                events={events}
                groupTimeline={groupTimeline}
                onGroupTimelineChange={setGroupTimeline}
                autoScroll={autoScroll}
                isRunning={runStatus === "running"}
                formatEventSummary={formatEventSummary}
              />

              <CitationsEvidencePanel
                citations={citations}
                selectedCitationId={selectedCitationId}
                onSelectCitation={(citationId) => void selectCitation(citationId)}
                evidenceState={evidenceState}
                onCloseEvidence={() => {
                  setSelectedCitationId(undefined);
                  setEvidenceState({ status: "idle" });
                }}
              />

              <div style={{ marginTop: 12 }}>
                <ExportPanel markdown={exportMarkdown} defaultFileName={`study-copilot_${taskId ?? "run"}.md`} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
