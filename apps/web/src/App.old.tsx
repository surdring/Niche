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
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerTitle}>
          <Icons.Book /> Niche Study Copilot
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {cacheMeta?.cached && <span style={{ fontSize: '12px', color: '#34c759', padding: '2px 8px', background: '#34c75910', borderRadius: '99px' }}>Cached</span>}
          {runStatus === 'completed' && (
            <Button variant="icon" style={{ border: `1px solid #ddd` }} onClick={handleExport} title="Export Markdown">
              <Icons.Download />
            </Button>
          )}
          <Button variant="icon" onClick={() => setShowSettings(!showSettings)} title="Settings">
            <Icons.Settings />
          </Button>
        </div>
      </header>

      {/* --- SETTINGS MODAL (Absolute) --- */}
      {showSettings && (
        <Card style={styles.settingsOverlay}>
          <div style={{ marginBottom: '10px', fontWeight: 600 }}>Environment Config</div>
          <label style={{ fontSize: '12px' }}>Tenant ID</label>
          <input style={styles.inputField} value={tenantId} onChange={e => setTenantId(e.target.value)} />
          <label style={{ fontSize: '12px' }}>Project ID</label>
          <input style={styles.inputField} value={projectId} onChange={e => setProjectId(e.target.value)} />
          <div style={{ fontSize: '11px', color: '#6b7280' }}>API Status: {health.status}</div>
        </Card>
      )}

      {/* --- MAIN LAYOUT --- */}
      <div style={styles.main}>
        {/* --- CENTER CONTENT --- */}
        <div style={{ ...styles.contentArea, marginRight: selectedCitationId ? '320px' : '0' }}>
          <div style={styles.scrollContainer}>
            {/* Error Banner */}
            {error && (
              <Card style={{ marginBottom: '20px', minHeight: 'auto', borderLeft: `4px solid #ef4444`, padding: '16px' }}>
                <div style={{ color: '#ef4444', fontWeight: 600 }}>Error: {error.code}</div>
                <div style={{ color: '#6b7280', marginTop: '4px' }}>{error.message}</div>
              </Card>
            )}

            {/* Document Surface */}
            <Card style={styles.document}>
              <ThinkingPanel runStatus={runStatus} events={events} formatEventSummary={formatEventSummary} />

              {/* Main Content Output */}
              {output ? (
                <div style={styles.markdown}>
                  {/* Note: In a real app, use <ReactMarkdown> here. This is a simple renderer simulator. */}
                  {output.split('\n').map((line, i) => (
                    <p key={i} style={{ minHeight: '1em', margin: '0.5em 0' }}>
                      {line}
                    </p>
                  ))}
                </div>
              ) : (
                <div style={{ color: '#6b7280', textAlign: 'center', paddingTop: '40px' }}>
                  Start a research task by entering a prompt below.
                </div>
              )}
            </Card>

            {/* Citations Footer in Document */}
            {citations.length > 0 && (
              <Card style={{ marginTop: '24px', minHeight: 'auto', padding: '24px' }}>
                <div style={{ fontWeight: 600, marginBottom: '12px', fontSize: '14px' }}>References</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {citations.map((c, i) => (
                    <button
                      key={c.citationId}
                      onClick={() => handleCitationClick(c.citationId)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '99px',
                        border: `1px solid ${selectedCitationId === c.citationId ? '#2563eb' : '#ddd'}`,
                        backgroundColor: selectedCitationId === c.citationId ? '#2563eb10' : 'transparent',
                        color: selectedCitationId === c.citationId ? '#2563eb' : '#6b7280',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      [{i + 1}] {typeof c.sourceId === 'string' ? c.sourceId.slice(0, 8) : "Source"}
                    </button>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* --- FLOATING INPUT BAR --- */}
          <div style={styles.inputWrapper}>
            <Card style={styles.inputBox}>
              <textarea
                style={styles.textarea}
                placeholder="Ask anything..."
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                disabled={runStatus === 'running'}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (prompt.trim() && runStatus !== 'running') handleRun();
                  }
                }}
              />
              <div style={styles.inputToolbar}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icons.Sparkles /> {/* Icon representing "Model/Template" */}
                  <select
                    style={styles.select}
                    value={selectedTemplateKey}
                    onChange={e => setSelectedTemplateKey(e.target.value)}
                    disabled={runStatus === 'running'}
                  >
                    {templateOptions.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
                  </select>
                </div>
                {runStatus === 'running' ? (
                  <Button style={{ backgroundColor: '#6b7280' }} onClick={handleCancel}>
                    <Icons.Stop /> Stop
                  </Button>
                ) : (
                  <Button onClick={handleRun} disabled={!prompt.trim() || templates.status !== 'ready'}>
                    <Icons.Play /> Run
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* --- RIGHT SIDEBAR (EVIDENCE) --- */}
        <EvidenceSidebar
          evidenceState={evidenceState}
          onClose={() => {
            setSelectedCitationId(undefined);
            setEvidenceState({ status: "idle" });
          }}
        />

      </div>

      {/* Global Styles injection for pulse animation */}
      <style>{`
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
      `}</style>
    </div>
  );
};

export default App;
