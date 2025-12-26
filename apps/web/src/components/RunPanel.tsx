import React from "react";

import { type TemplateRef } from "@niche/core/contracts";

import { Skeleton } from "./Skeleton";

export type TemplateOption = {
  key: string;
  label: string;
  description?: string;
};

export type RunPanelProps = {
  tenantId: string;
  onTenantIdChange: (value: string) => void;
  projectId: string;
  onProjectIdChange: (value: string) => void;

  templatesStatus: "idle" | "loading" | "ready" | "error";
  templateOptions: readonly TemplateOption[];

  selectedTemplateKey: string;
  onSelectedTemplateKeyChange: (value: string) => void;
  selectedTemplateDescription: string | undefined;

  prompt: string;
  onPromptChange: (value: string) => void;

  canRun: boolean;
  canCancel: boolean;
  canRetry: boolean;

  onRun: () => void;
  onCancel: () => void;

  runStatus: string;
  taskId: string | undefined;
  sessionId: string | undefined;
  stage: string | undefined;
  templateRef: TemplateRef | undefined;
};

export const RunPanel = (props: RunPanelProps) => {
  return (
    <div style={{ padding: 16, overflow: "auto" }}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Run</div>

      <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginTop: 12 }}>tenantId</label>
      <input
        value={props.tenantId}
        onChange={(e) => props.onTenantIdChange(e.target.value)}
        style={{ width: "100%", padding: 8, boxSizing: "border-box" }}
        disabled={props.runStatus === "running"}
      />

      <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginTop: 12 }}>projectId</label>
      <input
        value={props.projectId}
        onChange={(e) => props.onProjectIdChange(e.target.value)}
        style={{ width: "100%", padding: 8, boxSizing: "border-box" }}
        disabled={props.runStatus === "running"}
      />

      <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginTop: 12 }}>template</label>
      {props.templatesStatus === "loading" || props.templatesStatus === "idle" ? (
        <div style={{ display: "grid", gap: 8 }}>
          <Skeleton height={34} />
          <Skeleton height={10} width="60%" />
        </div>
      ) : (
        <select
          value={props.selectedTemplateKey}
          onChange={(e) => props.onSelectedTemplateKeyChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (props.canRun) {
                e.preventDefault();
                props.onRun();
              }
            }
          }}
          style={{ width: "100%", padding: 8, boxSizing: "border-box" }}
          disabled={props.runStatus === "running" || props.templatesStatus !== "ready"}
        >
          {props.templatesStatus !== "ready" ? <option value="">Loading...</option> : null}
          {props.templatesStatus === "ready"
            ? props.templateOptions.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label}
                </option>
              ))
            : null}
        </select>
      )}

      {props.selectedTemplateDescription ? (
        <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>{props.selectedTemplateDescription}</div>
      ) : null}

      <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginTop: 12 }}>prompt</label>
      <textarea
        value={props.prompt}
        onChange={(e) => props.onPromptChange(e.target.value)}
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
            e.preventDefault();
            if (props.canRun) {
              props.onRun();
            }
          }
        }}
        rows={6}
        style={{ width: "100%", padding: 8, boxSizing: "border-box", resize: "vertical" }}
        disabled={props.runStatus === "running"}
      />

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button data-testid="run-btn" onClick={props.onRun} disabled={!props.canRun} style={{ padding: "8px 12px" }}>
          Run
        </button>
        <button data-testid="cancel-btn" onClick={props.onCancel} disabled={!props.canCancel} style={{ padding: "8px 12px" }}>
          Cancel
        </button>
        <button data-testid="retry-btn" onClick={props.onRun} disabled={!props.canRetry} style={{ padding: "8px 12px" }}>
          Retry
        </button>
      </div>

      <div style={{ marginTop: 12, fontSize: 12, color: "#666" }}>
        <div>
          <span style={{ fontWeight: 600 }}>taskId</span>
          {": "}
          <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{props.taskId ?? "-"}</span>
        </div>
        <div>
          <span style={{ fontWeight: 600 }}>sessionId</span>
          {": "}
          <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{props.sessionId ?? "-"}</span>
        </div>
        <div>
          <span style={{ fontWeight: 600 }}>stage</span>
          {": "}
          {props.stage ?? "-"}
        </div>
        <div>
          <span style={{ fontWeight: 600 }}>templateRef</span>
          {": "}
          <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
            {props.templateRef !== undefined ? JSON.stringify(props.templateRef) : "-"}
          </span>
        </div>
      </div>
    </div>
  );
};
