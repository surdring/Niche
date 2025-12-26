import React, { useMemo, useState } from "react";

import { type Evidence } from "@niche/core/contracts";

import { Spinner } from "./Spinner";

export type EvidenceState =
  | { status: "idle" }
  | { status: "loading"; citationId: string }
  | { status: "ready"; citationId: string; evidence: Evidence }
  | { status: "error"; citationId?: string; message: string };

export type EvidencePanelProps = {
  selectedCitationId: string | undefined;
  evidenceState: EvidenceState;
  onClose: () => void;
};

const highlightText = (text: string, query: string): React.ReactNode => {
  const q = query.trim();
  if (q.length === 0) {
    return text;
  }
  const lower = text.toLowerCase();
  const lowerQ = q.toLowerCase();
  const parts: React.ReactNode[] = [];
  let i = 0;
  while (i < text.length) {
    const idx = lower.indexOf(lowerQ, i);
    if (idx < 0) {
      parts.push(text.slice(i));
      break;
    }
    if (idx > i) {
      parts.push(text.slice(i, idx));
    }
    parts.push(<mark key={idx} style={{ background: "#fef08a" }}>{text.slice(idx, idx + q.length)}</mark>);
    i = idx + q.length;
  }
  return <>{parts}</>;
};

export const EvidencePanel = ({ selectedCitationId, evidenceState, onClose }: EvidencePanelProps) => {
  const [status, setStatus] = useState<string>("");
  const [highlight, setHighlight] = useState<string>("");

  const evidence: Evidence | undefined = evidenceState.status === "ready" ? evidenceState.evidence : undefined;

  const maybeUrl = useMemo(() => {
    if (evidence === undefined) {
      return undefined;
    }
    const raw = evidence as unknown as Record<string, unknown>;
    const url = raw["url"];
    if (typeof url === "string" && url.length > 0) {
      return url;
    }
    const sourceUrl = raw["sourceUrl"];
    if (typeof sourceUrl === "string" && sourceUrl.length > 0) {
      return sourceUrl;
    }
    return undefined;
  }, [evidence]);

  const onCopySnippet = async () => {
    if (evidence?.snippet === undefined) {
      return;
    }
    try {
      await navigator.clipboard.writeText(evidence.snippet);
      setStatus("Copied");
    } catch {
      setStatus("Copy failed");
    }
    setTimeout(() => {
      setStatus("");
    }, 1200);
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontWeight: 700 }}>Evidence</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {status.length > 0 ? <div style={{ fontSize: 12, color: "#444" }}>{status}</div> : null}
          {selectedCitationId !== undefined ? (
            <button data-testid="evidence-close-btn" onClick={onClose} style={{ padding: "6px 10px" }}>
              Close
            </button>
          ) : null}
        </div>
      </div>

      <div data-testid="evidence" style={{ border: "1px solid #eee", background: "#fff", padding: 8 }}>
        {selectedCitationId === undefined ? (
          <div style={{ color: "#666" }}>(select a citation)</div>
        ) : evidenceState.status === "idle" ? (
          <div style={{ color: "#666" }}>(not loaded)</div>
        ) : evidenceState.status === "loading" ? (
          <Spinner label={`Loading evidence for ${evidenceState.citationId}...`} />
        ) : evidenceState.status === "error" ? (
          <div style={{ color: "#b42318" }}>{evidenceState.message}</div>
        ) : (
          <div>
            <div style={{ fontSize: 12, color: "#444" }}>
              citationId={evidenceState.evidence.citationId} status={evidenceState.evidence.status}
            </div>

            {maybeUrl !== undefined ? (
              <div style={{ marginTop: 8, fontSize: 12 }}>
                <a href={maybeUrl} target="_blank" rel="noreferrer">
                  Open source
                </a>
              </div>
            ) : null}

            {evidenceState.evidence.snippet ? (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "space-between" }}>
                  <input
                    value={highlight}
                    onChange={(e) => setHighlight(e.target.value)}
                    placeholder="Highlight keyword"
                    style={{ flex: 1, padding: 8, boxSizing: "border-box" }}
                  />
                  <button onClick={() => void onCopySnippet()} style={{ padding: "6px 10px" }}>
                    Copy snippet
                  </button>
                </div>
                <pre style={{ marginTop: 8, whiteSpace: "pre-wrap", fontSize: 12 }}>{highlightText(evidenceState.evidence.snippet, highlight)}</pre>
              </div>
            ) : null}

            <details style={{ marginTop: 8 }}>
              <summary style={{ fontSize: 12, cursor: "pointer", color: "#555" }}>raw</summary>
              <pre style={{ marginTop: 8, whiteSpace: "pre-wrap", fontSize: 12 }}>{JSON.stringify(evidenceState.evidence, null, 2)}</pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};
