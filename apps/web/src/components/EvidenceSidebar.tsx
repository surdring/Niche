import type { CSSProperties } from "react";
import type { Evidence } from "@niche/core/contracts";
import { Button, Icons, theme } from "./ui";

export type EvidenceState =
  | { status: "idle" }
  | { status: "loading"; citationId: string }
  | { status: "ready"; citationId: string; evidence: Evidence }
  | { status: "error"; citationId: string; message: string };

interface EvidenceSidebarProps {
  evidenceState: EvidenceState;
  onClose: () => void;
}

const sidebarStyle: CSSProperties = {
  width: "320px",
  borderLeft: `1px solid ${theme.border}`,
  backgroundColor: theme.surface,
  display: "flex",
  flexDirection: "column",
  flexShrink: 0,
};

const headerStyle: CSSProperties = {
  padding: "16px",
  borderBottom: `1px solid ${theme.border}`,
  fontWeight: 600,
  fontSize: "14px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const evidenceCardStyle: CSSProperties = {
  padding: "12px",
  margin: "12px",
  border: `1px solid ${theme.border}`,
  borderRadius: theme.radius,
  fontSize: "13px",
};

export const EvidenceSidebar = ({ evidenceState, onClose }: EvidenceSidebarProps) => {
  if (evidenceState.status === 'idle') {
    return null;
  }

  const snippet = evidenceState.status === "ready" ? evidenceState.evidence.snippet : undefined;

  return (
    <aside style={sidebarStyle}>
      <div style={headerStyle}>
        <span>Source Evidence</span>
        <Button variant="icon" onClick={onClose}><Icons.X /></Button>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {evidenceState.status === "loading" && <div style={{ padding: "20px", color: theme.textSec, textAlign: "center" }}>Loading source...</div>}
        {evidenceState.status === "error" && <div style={{ padding: "20px", color: theme.danger }}>{evidenceState.message || "Failed to load evidence."}</div>}
        {evidenceState.status === "ready" && (
          <div style={evidenceCardStyle}>
            <div style={{ marginBottom: "8px", fontWeight: 600, color: theme.primary }}>Quote Match</div>
            <div style={{ lineHeight: "1.5", whiteSpace: "pre-wrap" }}>{snippet ?? "No snippet available."}</div>
          </div>
        )}
      </div>
    </aside>
  );
};
