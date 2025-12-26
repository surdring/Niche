import { describe, expect, it } from "vitest";

import { exportToMarkdown } from "./markdown";

describe("exportToMarkdown", () => {
  it("is deterministic for same semantic input (citation order does not matter)", () => {
    const a = exportToMarkdown({
      title: "任务结果",
      output: "Hello world",
      citations: [
        {
          citationId: "c_b",
          sourceType: "document",
          projectId: "proj_default",
          locator: { offsetStart: 2, offsetEnd: 3 },
          status: "verifiable",
          snippet: "B"
        },
        {
          citationId: "c_a",
          sourceType: "ragflow_chunk",
          projectId: "proj_default",
          locator: { section: "2.3" },
          status: "unavailable",
          degradedReason: "Missing"
        }
      ],
      taskId: "t_1",
      sessionId: "s_1",
      requestId: "req_1",
      templateRef: { templateId: "tpl", templateVersion: "v1" }
    });

    const b = exportToMarkdown({
      title: "任务结果",
      output: "Hello world",
      citations: [
        {
          citationId: "c_a",
          sourceType: "ragflow_chunk",
          projectId: "proj_default",
          locator: { section: "2.3" },
          status: "unavailable",
          degradedReason: "Missing"
        },
        {
          citationId: "c_b",
          sourceType: "document",
          projectId: "proj_default",
          locator: { offsetStart: 2, offsetEnd: 3 },
          status: "verifiable",
          snippet: "B"
        }
      ],
      taskId: "t_1",
      sessionId: "s_1",
      requestId: "req_1",
      templateRef: { templateId: "tpl", templateVersion: "v1" }
    });

    expect(a).toBe(b);
  });

  it("includes citationId and projectId/locator in the YAML metadata block", () => {
    const md = exportToMarkdown({
      output: "Hello world",
      citations: [
        {
          citationId: "c_1",
          sourceType: "document",
          projectId: "proj_default",
          locator: { page: 5, offsetStart: 100, offsetEnd: 200 },
          status: "verifiable"
        }
      ]
    });

    expect(md).toContain("# 任务结果");
    expect(md).toContain("\n\nHello world\n\n");
    expect(md).toContain("## 引用");
    expect(md).toContain("1. [c_1] 来源：document, 项目：proj_default");
    expect(md).toContain("\n\n---\n\n");
    expect(md).toContain("<!-- Metadata (Obsidian friendly) -->");
    expect(md).toContain("```yaml");
    expect(md).toContain("\nmeta:\n");
    expect(md).toContain('exportVersion: "v1"');
    expect(md).toContain("\ncitations:\n");
    expect(md).toContain("citationId:");
    expect(md).toContain('"c_1"');
    expect(md).toContain("projectId:");
    expect(md).toContain('"proj_default"');
    expect(md).toContain("page: 5");
    expect(md).toContain("offsetStart: 100");
    expect(md).toContain("offsetEnd: 200");

    expect(md).toMatchInlineSnapshot(`
"# 任务结果\n\nHello world\n\n## 引用\n\n1. [c_1] 来源：document, 项目：proj_default, 位置：page 5, offset 100-200\n\n---\n\n<!-- Metadata (Obsidian friendly) -->\n\n\`\`\`yaml\ncitations:\n  -\n    citationId: "c_1"\n    degradedReason: null\n    documentId: null\n    locator:\n      offsetEnd: 200\n      offsetStart: 100\n      page: 5\n    projectId: "proj_default"\n    snippet: null\n    sourceType: "document"\n    status: "verifiable"\nmeta:\n  exportVersion: "v1"\n  requestId: null\n  sessionId: null\n  taskId: null\n  templateRef: null\n\`\`\`\n"
`);
  });
});
