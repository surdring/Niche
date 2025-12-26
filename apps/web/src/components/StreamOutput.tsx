import React, { useEffect, useRef } from "react";

import { Spinner } from "./Spinner";

export type StreamOutputProps = {
  output: string;
  autoScroll: boolean;
  onAutoScrollChange: (value: boolean) => void;
  isRunning: boolean;
};

export const StreamOutput = ({ output, autoScroll, onAutoScrollChange, isRunning }: StreamOutputProps) => {
  const ref = useRef<HTMLPreElement | null>(null);
  const rafRef = useRef<number | null>(null);

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
  }, [output, autoScroll]);

  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontWeight: 700 }}>Output</div>
          {isRunning ? <Spinner label="Running" /> : null}
        </div>
        <label style={{ fontSize: 12, color: "#444", display: "flex", alignItems: "center", gap: 6 }}>
          <input type="checkbox" checked={autoScroll} onChange={(e) => onAutoScrollChange(e.target.checked)} />
          Auto-scroll
        </label>
      </div>
      <pre
        ref={ref}
        data-testid="output"
        style={{
          margin: 0,
          padding: 12,
          border: "1px solid #eee",
          background: "#fafafa",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          minHeight: 240,
          maxHeight: 420,
          overflow: "auto"
        }}
      >
        {output.length > 0 ? output : "(no output yet)"}
      </pre>
    </div>
  );
};
