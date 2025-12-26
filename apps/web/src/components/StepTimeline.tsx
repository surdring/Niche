import React, { useEffect, useMemo, useRef, useState } from "react";

import { type StepEvent } from "@niche/core/contracts";

import { Spinner } from "./Spinner";

type StepGroupStatus = "running" | "completed" | "failed";

type StepGroup = {
  stepId: string;
  stepName: string;
  firstTimestamp: string;
  lastTimestamp: string;
  status: StepGroupStatus;
  events: readonly StepEvent[];
};

export type StepTimelineProps = {
  events: readonly StepEvent[];
  groupTimeline: boolean;
  onGroupTimelineChange: (value: boolean) => void;
  autoScroll: boolean;
  isRunning: boolean;
  formatEventSummary: (ev: StepEvent) => string;
};

const EventTypeOrder: readonly StepEvent["type"][] = [
  "step_started",
  "step_progress",
  "tool_called",
  "tool_result",
  "step_completed",
  "step_failed"
];

export const StepTimeline = ({ events, groupTimeline, onGroupTimelineChange, autoScroll, isRunning, formatEventSummary }: StepTimelineProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const [search, setSearch] = useState<string>("");
  const [enabledTypes, setEnabledTypes] = useState<ReadonlySet<StepEvent["type"]>>(() => new Set(EventTypeOrder));
  const [status, setStatus] = useState<string>("");

  const sortedEvents = useMemo(() => {
    const decorated = events.map((ev, idx) => ({ ev, idx }));
    decorated.sort((a, b) => {
      const t = a.ev.timestamp.localeCompare(b.ev.timestamp);
      return t !== 0 ? t : a.idx - b.idx;
    });
    return decorated;
  }, [events]);

  const groupedTimeline = useMemo((): readonly StepGroup[] => {
    const map = new Map<string, { stepId: string; stepName: string; firstTimestamp: string; lastTimestamp: string; events: StepEvent[] }>();

    for (const item of sortedEvents) {
      const ev = item.ev;
      const existing = map.get(ev.stepId);
      if (existing === undefined) {
        map.set(ev.stepId, {
          stepId: ev.stepId,
          stepName: ev.stepName,
          firstTimestamp: ev.timestamp,
          lastTimestamp: ev.timestamp,
          events: [ev]
        });
      } else {
        existing.stepName = ev.stepName;
        existing.firstTimestamp = existing.firstTimestamp.localeCompare(ev.timestamp) <= 0 ? existing.firstTimestamp : ev.timestamp;
        existing.lastTimestamp = existing.lastTimestamp.localeCompare(ev.timestamp) >= 0 ? existing.lastTimestamp : ev.timestamp;
        existing.events.push(ev);
      }
    }

    const groups: StepGroup[] = [];
    for (const g of map.values()) {
      let statusValue: StepGroupStatus = "running";
      if (g.events.some((e) => e.type === "step_failed")) {
        statusValue = "failed";
      } else if (g.events.some((e) => e.type === "step_completed")) {
        statusValue = "completed";
      }

      groups.push({
        stepId: g.stepId,
        stepName: g.stepName,
        firstTimestamp: g.firstTimestamp,
        lastTimestamp: g.lastTimestamp,
        status: statusValue,
        events: g.events
      });
    }

    groups.sort((a, b) => {
      const t = a.firstTimestamp.localeCompare(b.firstTimestamp);
      return t !== 0 ? t : a.stepId.localeCompare(b.stepId);
    });

    return groups;
  }, [sortedEvents]);

  const filteredDecorated = useMemo(() => {
    const q = search.trim().toLowerCase();

    return sortedEvents.filter(({ ev }) => {
      if (!enabledTypes.has(ev.type)) {
        return false;
      }
      if (q.length === 0) {
        return true;
      }
      const hay = `${ev.timestamp} ${ev.type} ${ev.stepId} ${ev.stepName} ${formatEventSummary(ev)} ${JSON.stringify(ev.payload)}`.toLowerCase();
      return hay.includes(q);
    });
  }, [enabledTypes, formatEventSummary, search, sortedEvents]);

  const filteredGroups = useMemo((): readonly StepGroup[] => {
    const allowedStepIds = new Set(filteredDecorated.map((x) => x.ev.stepId));
    return groupedTimeline
      .map((g) => {
        const filtered = g.events.filter((ev) => enabledTypes.has(ev.type));
        return { ...g, events: filtered };
      })
      .filter((g) => g.events.length > 0 && allowedStepIds.has(g.stepId));
  }, [enabledTypes, filteredDecorated, groupedTimeline]);

  useEffect(() => {
    if (!autoScroll) {
      return;
    }
    if (rafRef.current !== null) {
      return;
    }

    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      const el = ref.current;
      if (el !== null) {
        el.scrollTop = el.scrollHeight;
      }
    });

    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [autoScroll, filteredDecorated.length, filteredGroups.length, groupTimeline]);

  const onToggleType = (type: StepEvent["type"]) => {
    setEnabledTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const onCopyEvent = async (ev: StepEvent) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(ev, null, 2));
      setStatus("Copied");
    } catch {
      setStatus("Copy failed");
    }
    setTimeout(() => {
      setStatus("");
    }, 1200);
  };

  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontWeight: 700 }}>Step events</div>
          {isRunning ? <Spinner label="Running" /> : null}
        </div>
        <label style={{ fontSize: 12, color: "#444", display: "flex", alignItems: "center", gap: 6 }}>
          <input type="checkbox" checked={groupTimeline} onChange={(e) => onGroupTimelineChange(e.target.checked)} />
          Group by step
        </label>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8, marginBottom: 8 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search events"
          style={{ width: "100%", padding: 8, boxSizing: "border-box" }}
        />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {EventTypeOrder.map((t) => (
            <label key={t} style={{ fontSize: 12, display: "flex", gap: 6, alignItems: "center" }}>
              <input type="checkbox" checked={enabledTypes.has(t)} onChange={() => onToggleType(t)} />
              {t}
            </label>
          ))}
          {status.length > 0 ? <div style={{ fontSize: 12, color: "#444" }}>{status}</div> : null}
        </div>
      </div>

      <div ref={ref} data-testid="timeline" style={{ border: "1px solid #eee", background: "#fff", padding: 8, height: 420, overflow: "auto" }}>
        {filteredDecorated.length === 0 ? (
          <div style={{ color: "#666" }}>(no events yet)</div>
        ) : groupTimeline ? (
          filteredGroups.map((group, groupIdx) => (
            <div
              key={group.stepId}
              style={{ padding: "10px 8px", borderBottom: groupIdx === filteredGroups.length - 1 ? "none" : "1px solid #f2f2f2" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>
                    {group.stepName} ({group.stepId})
                  </div>
                  <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12, color: "#555" }}>
                    {group.firstTimestamp} - {group.lastTimestamp}
                  </div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: group.status === "failed" ? "#b42318" : "#444" }}>{group.status}</div>
              </div>

              <div style={{ marginTop: 8 }}>
                {group.events.map((ev, evIdx) => (
                  <div key={`${group.stepId}_${ev.type}_${ev.timestamp}_${evIdx}`} style={{ padding: "6px 0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12 }}>
                        {ev.timestamp} {ev.type}
                      </div>
                      <button onClick={() => void onCopyEvent(ev)} style={{ padding: "4px 8px" }}>
                        Copy JSON
                      </button>
                    </div>
                    <div style={{ marginTop: 2, fontSize: 12, color: "#333" }}>{formatEventSummary(ev)}</div>
                    <details style={{ marginTop: 4 }}>
                      <summary style={{ fontSize: 12, cursor: "pointer", color: "#555" }}>payload</summary>
                      <pre style={{ margin: "6px 0 0", fontSize: 12, whiteSpace: "pre-wrap" }}>{JSON.stringify(ev.payload, null, 2)}</pre>
                    </details>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          filteredDecorated.map(({ ev, idx: originalIdx }, idx) => (
            <div
              key={`${ev.type}_${ev.stepId}_${originalIdx}`}
              style={{ padding: "8px 6px", borderBottom: idx === filteredDecorated.length - 1 ? "none" : "1px solid #f2f2f2" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12 }}>
                  {ev.timestamp} {ev.type}
                </div>
                <button onClick={() => void onCopyEvent(ev)} style={{ padding: "4px 8px" }}>
                  Copy JSON
                </button>
              </div>
              <div style={{ fontSize: 12, color: "#444", marginTop: 2 }}>
                {ev.stepName} ({ev.stepId})
              </div>
              <div style={{ marginTop: 6, fontSize: 12, color: "#333" }}>{formatEventSummary(ev)}</div>
              <details style={{ marginTop: 6 }}>
                <summary style={{ fontSize: 12, cursor: "pointer", color: "#555" }}>payload</summary>
                <pre style={{ margin: "6px 0 0", fontSize: 12, whiteSpace: "pre-wrap" }}>{JSON.stringify(ev.payload, null, 2)}</pre>
              </details>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
