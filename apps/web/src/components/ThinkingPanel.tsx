import { useState } from "react";
import type { StepEvent } from "@niche/core/contracts";
import { Card, Icons, theme } from "./ui";

interface ThinkingPanelProps {
  runStatus: "idle" | "running" | "cancelled" | "completed" | "error";
  events: readonly StepEvent[];
  formatEventSummary: (event: StepEvent) => string;
}

export const ThinkingPanel = ({ runStatus, events, formatEventSummary }: ThinkingPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (events.length === 0) {
    return null;
  }

  return (
    <Card style={{
      marginBottom: "24px",
      border: `1px solid ${theme.primary}30`,
      backgroundColor: `${theme.primary}05`,
      overflow: "hidden",
      padding: 0
    }}>
      <div
        style={{
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          fontSize: "13px",
          fontWeight: 500,
          color: theme.primary,
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {runStatus === "running" ? <span className="animate-pulse">●</span> : <Icons.Sparkles />}
          {runStatus === "running" ? "Agent is thinking..." : "Thought Process"}
        </div>
        {isExpanded ? <Icons.ChevronDown /> : <Icons.ChevronRight />}
      </div>
      {isExpanded && (
        <div style={{ padding: "0 16px 12px", borderTop: `1px solid ${theme.primary}10` }}>
          {events.map((ev, i) => (
            <div key={i} style={{ fontSize: "12px", color: theme.textSec, padding: "4px 0", display: "flex", gap: "8px", alignItems: "center" }}>
              {ev.type === "step_failed" ? <span style={{ color: theme.danger }}>✗</span> : <span style={{ color: theme.success }}>✓</span>}
              {formatEventSummary(ev)}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
