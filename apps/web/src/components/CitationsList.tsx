import React, { useEffect, useMemo, useRef } from "react";

import { type Citation } from "@niche/core/contracts";

export type CitationsListProps = {
  citations: readonly Citation[];
  selectedCitationId: string | undefined;
  onSelect: (citationId: string) => void;
};

export const CitationsList = ({ citations, selectedCitationId, onSelect }: CitationsListProps) => {
  const ref = useRef<HTMLDivElement | null>(null);

  const hasSelectedCitation = useMemo(() => {
    if (selectedCitationId === undefined) {
      return false;
    }
    return citations.some((c) => c.citationId === selectedCitationId);
  }, [citations, selectedCitationId]);

  useEffect(() => {
    if (!hasSelectedCitation && citations.length > 0) {
      const first = citations[0];
      if (first !== undefined) {
        onSelect(first.citationId);
      }
    }
  }, [citations, hasSelectedCitation, onSelect]);

  return (
    <div>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Citations</div>

      <div ref={ref} data-testid="citations" style={{ border: "1px solid #eee", background: "#fff", padding: 8 }}>
        {citations.length === 0 ? (
          <div style={{ color: "#666" }}>(no citations yet)</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
            {citations.map((c, idx) => {
              const isSelected = c.citationId === selectedCitationId;
              const isTabStop = isSelected || (!hasSelectedCitation && idx === 0);
              const title = c.snippet ?? c.citationId;
              const locatorText = JSON.stringify(c.locator);

              return (
                <button
                  key={c.citationId}
                  onClick={() => onSelect(c.citationId)}
                  onKeyDown={(e) => {
                    if (citations.length === 0) {
                      return;
                    }
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelect(c.citationId);
                      return;
                    }
                    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                      e.preventDefault();
                      const delta = e.key === "ArrowDown" ? 1 : -1;
                      const nextIdx = (idx + delta + citations.length) % citations.length;
                      const nextId = citations[nextIdx]?.citationId;
                      if (nextId === undefined) {
                        return;
                      }
                      const nextButton = ref.current?.querySelector<HTMLButtonElement>(`button[data-citation-id="${nextId}"]`);
                      nextButton?.focus();
                      onSelect(nextId);
                    }
                  }}
                  tabIndex={isTabStop ? 0 : -1}
                  data-citation-id={c.citationId}
                  aria-pressed={isSelected}
                  style={{
                    textAlign: "left",
                    padding: 10,
                    border: isSelected ? "1px solid #333" : "1px solid #eee",
                    background: isSelected ? "#fafafa" : "#fff",
                    outline: isSelected ? "2px solid #333" : "2px solid transparent",
                    outlineOffset: 2,
                    cursor: "pointer"
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 12 }}>{c.status}</div>
                  <div style={{ marginTop: 4, fontSize: 12, color: "#333" }}>{title}</div>
                  {c.status === "degraded" && c.degradedReason ? (
                    <div style={{ marginTop: 4, fontSize: 12, color: "#b42318" }}>{c.degradedReason}</div>
                  ) : null}
                  <div style={{ marginTop: 4, fontSize: 12, color: "#666" }}>{locatorText}</div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
