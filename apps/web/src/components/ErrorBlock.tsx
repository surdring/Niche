import { type AppError } from "@niche/core/contracts";

export type ErrorBlockProps = {
  error: AppError;
};

export const ErrorBlock = ({ error }: ErrorBlockProps) => {
  return (
    <div style={{ padding: 12, border: "1px solid #f2b8b5", background: "#fff5f5", marginBottom: 12 }}>
      <div style={{ fontWeight: 700, color: "#b42318" }}>
        {error.code}: {error.message}
      </div>
      <div style={{ marginTop: 4, fontSize: 12, color: "#555" }}>
        requestId={error.requestId} retryable={String(error.retryable)}
      </div>
      {error.details !== undefined ? (
        <pre style={{ marginTop: 8, whiteSpace: "pre-wrap", fontSize: 12 }}>{JSON.stringify(error.details, null, 2)}</pre>
      ) : null}
    </div>
  );
};
