import React from "react";

export type SpinnerProps = {
  label?: string;
};

export const Spinner = ({ label }: SpinnerProps) => {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#444", fontSize: 12 }}>
      <span
        aria-label="loading"
        style={{
          width: 12,
          height: 12,
          borderRadius: 999,
          border: "2px solid #cbd5e1",
          borderTopColor: "#2563eb",
          animation: "niche-spin 0.8s linear infinite"
        }}
      />
      {label !== undefined ? <span>{label}</span> : null}
      <style>{`@keyframes niche-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
