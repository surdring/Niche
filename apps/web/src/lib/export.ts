import { exportToMarkdown } from "@niche/core/export/markdown";
import { type Citation, type TemplateRef } from "@niche/core/contracts";

export type ExportModel = {
  output: string;
  citations: readonly Citation[];
  taskId?: string;
  sessionId?: string;
  requestId?: string;
  templateRef?: TemplateRef;
};

export const formatMarkdownExport = (model: ExportModel): string => {
  return exportToMarkdown({
    title: "Study Copilot Export",
    output: model.output,
    citations: [...model.citations],
    taskId: model.taskId,
    sessionId: model.sessionId,
    requestId: model.requestId,
    templateRef: model.templateRef
  });
};
