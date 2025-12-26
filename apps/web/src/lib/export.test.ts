import { describe, expect, it } from "vitest";

import { formatMarkdownExport } from "./export";

describe("formatMarkdownExport", () => {
  it("includes output, metadata, and citations", () => {
    const md = formatMarkdownExport({
      output: "Hello world",
      citations: [
        {
          citationId: "c_1",
          sourceType: "document",
          projectId: "proj_default",
          locator: { offsetStart: 1, offsetEnd: 2 },
          status: "verifiable",
          snippet: "Evidence"
        }
      ],
      taskId: "t_1",
      sessionId: "s_1",
      requestId: "req_1",
      templateRef: { templateId: "tpl", templateVersion: "v1" }
    });

    expect(md).toContain("Hello world");
    expect(md).toContain("## 引用");
    expect(md).toContain("[c_1]");
    expect(md).toContain("```yaml");
    expect(md).toContain("taskId:");
    expect(md).toContain("\"t_1\"");
    expect(md).toContain("citationId:");
    expect(md).toContain("\"c_1\"");
    expect(md).toContain("projectId:");
    expect(md).toContain("\"proj_default\"");
    expect(md).toContain("offsetStart: 1");
  });
});
