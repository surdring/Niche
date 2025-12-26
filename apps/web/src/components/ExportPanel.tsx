import { useMemo, useState } from "react";

export type ExportPanelProps = {
  markdown: string;
  defaultFileName: string;
};

const downloadTextFile = (fileName: string, text: string): void => {
  const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 0);
};

export const ExportPanel = ({ markdown, defaultFileName }: ExportPanelProps) => {
  const [status, setStatus] = useState<string>("");

  const fileName = useMemo(() => {
    return defaultFileName.trim().length > 0 ? defaultFileName : "study-copilot.md";
  }, [defaultFileName]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setStatus("Copied");
    } catch {
      setStatus("Copy failed");
    }
    setTimeout(() => {
      setStatus("");
    }, 1200);
  };

  const onDownload = () => {
    try {
      downloadTextFile(fileName, markdown);
      setStatus("Downloaded");
    } catch {
      setStatus("Download failed");
    }
    setTimeout(() => {
      setStatus("");
    }, 1200);
  };

  return (
    <div style={{ border: "1px solid #eee", background: "#fff", padding: 8 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontWeight: 700 }}>Export</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {status.length > 0 ? <div style={{ fontSize: 12, color: "#444" }}>{status}</div> : null}
          <button data-testid="export-copy-btn" onClick={() => void onCopy()} style={{ padding: "6px 10px" }}>
            Copy
          </button>
          <button data-testid="export-download-btn" onClick={onDownload} style={{ padding: "6px 10px" }}>
            Download
          </button>
        </div>
      </div>

      <textarea
        data-testid="export-preview"
        readOnly
        value={markdown}
        rows={10}
        style={{ width: "100%", boxSizing: "border-box", padding: 8, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
      />
    </div>
  );
};
