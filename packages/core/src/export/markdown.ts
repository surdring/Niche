import { z } from "zod";

import { CitationSchema, type Citation } from "../contracts/citation";
import { TemplateRefSchema, type TemplateRef } from "../contracts/template";

export const MarkdownExportInputSchema = z
  .object({
    title: z.string().min(1).optional(),
    output: z.string(),
    citations: z.array(CitationSchema),
    taskId: z.string().min(1).optional(),
    sessionId: z.string().min(1).optional(),
    requestId: z.string().min(1).optional(),
    templateRef: TemplateRefSchema.optional()
  })
  .passthrough();

export type MarkdownExportInput = z.infer<typeof MarkdownExportInputSchema>;

type YamlValue = null | boolean | number | string | readonly YamlValue[] | { readonly [k: string]: YamlValue };

const isYamlObject = (value: YamlValue): value is { readonly [k: string]: YamlValue } => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const toYamlValue = (value: unknown): YamlValue => {
  if (value === null) {
    return null;
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "bigint") {
    return value.toString();
  }

  if (typeof value === "undefined") {
    return null;
  }

  if (Array.isArray(value)) {
    return value.map((v) => toYamlValue(v));
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "object") {
    const out: Record<string, YamlValue> = {};
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj).sort();
    for (const k of keys) {
      out[k] = toYamlValue(obj[k]);
    }
    return out;
  }

  return String(value);
};

const encodeYamlScalar = (value: null | boolean | number | string): string => {
  if (value === null) {
    return "null";
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "null";
  }
  return JSON.stringify(value);
};

const encodeYamlKey = (key: string): string => {
  return /^[A-Za-z0-9_-]+$/.test(key) ? key : JSON.stringify(key);
};

const yamlStringify = (value: YamlValue, indent = 0): string => {
  const pad = " ".repeat(indent);

  if (value === null || typeof value === "boolean" || typeof value === "number" || typeof value === "string") {
    return `${pad}${encodeYamlScalar(value)}`;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return `${pad}[]`;
    }

    const lines: string[] = [];
    for (const item of value) {
      if (item === null || typeof item === "boolean" || typeof item === "number" || typeof item === "string") {
        lines.push(`${pad}- ${encodeYamlScalar(item)}`);
        continue;
      }

      lines.push(`${pad}-`);
      lines.push(yamlStringify(item, indent + 2));
    }
    return lines.join("\n");
  }

  if (!isYamlObject(value)) {
    return `${pad}{}`;
  }

  const keys = Object.keys(value).sort();
  if (keys.length === 0) {
    return `${pad}{}`;
  }

  const lines: string[] = [];
  for (const k of keys) {
    const v = value[k] ?? null;
    const kk = encodeYamlKey(k);

    if (v === null || typeof v === "boolean" || typeof v === "number" || typeof v === "string") {
      lines.push(`${pad}${kk}: ${encodeYamlScalar(v)}`);
      continue;
    }

    lines.push(`${pad}${kk}:`);
    lines.push(yamlStringify(v, indent + 2));
  }

  return lines.join("\n");
};

const safeTrim = (text: string): string => {
  const trimmed = text.trim();
  return trimmed.length > 0 ? trimmed : "(no output)";
};

const sortCitationsDeterministic = (citations: readonly Citation[]): readonly Citation[] => {
  return [...citations].sort((a, b) => {
    const idA = a.citationId;
    const idB = b.citationId;
    if (idA < idB) {
      return -1;
    }
    if (idA > idB) {
      return 1;
    }

    const locA = JSON.stringify(toYamlValue(a.locator));
    const locB = JSON.stringify(toYamlValue(b.locator));
    if (locA < locB) {
      return -1;
    }
    if (locA > locB) {
      return 1;
    }

    return 0;
  });
};

type LocatorSummaryParts = {
  page?: number;
  section?: string;
  offsetStart?: number;
  offsetEnd?: number;
};

const toLocatorSummaryParts = (citation: Citation): LocatorSummaryParts => {
  const locator = citation.locator;
  const out: LocatorSummaryParts = {};
  if (typeof locator.page === "number") {
    out.page = locator.page;
  }
  if (typeof locator.section === "string") {
    out.section = locator.section;
  }
  if (typeof locator.offsetStart === "number") {
    out.offsetStart = locator.offsetStart;
  }
  if (typeof locator.offsetEnd === "number") {
    out.offsetEnd = locator.offsetEnd;
  }
  return out;
};

const formatLocatorSummary = (citation: Citation): string => {
  const parts = toLocatorSummaryParts(citation);
  const tokens: string[] = [];

  if (parts.page !== undefined) {
    tokens.push(`page ${parts.page}`);
  }

  if (parts.section !== undefined) {
    tokens.push(`section ${parts.section}`);
  }

  if (parts.offsetStart !== undefined || parts.offsetEnd !== undefined) {
    const start = parts.offsetStart !== undefined ? String(parts.offsetStart) : "?";
    const end = parts.offsetEnd !== undefined ? String(parts.offsetEnd) : "?";
    tokens.push(`offset ${start}-${end}`);
  }

  return tokens.length > 0 ? tokens.join(", ") : "(no locator)";
};

const normalizeCitationForMetadata = (c: Citation): YamlValue => {
  return {
    citationId: c.citationId,
    sourceType: c.sourceType,
    projectId: c.projectId,
    documentId: c.documentId ?? null,
    status: c.status,
    degradedReason: c.degradedReason ?? null,
    snippet: c.snippet ?? null,
    locator: toYamlValue(c.locator)
  };
};

const normalizeTemplateRefForMetadata = (ref: TemplateRef | undefined): YamlValue => {
  if (ref === undefined) {
    return null;
  }

  return {
    templateId: ref.templateId ?? null,
    templateVersion: ref.templateVersion ?? null,
    templateDefinitionHash: ref.templateDefinitionHash ?? null
  };
};

export const exportToMarkdown = (input: unknown): string => {
  const parsed = MarkdownExportInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Invalid markdown export input");
  }

  const model = parsed.data;

  const title = model.title ?? "任务结果";
  const output = safeTrim(model.output);

  const citationsSorted = sortCitationsDeterministic(model.citations);

  const citationLines: string[] = [];
  for (const [idx, c] of citationsSorted.entries()) {
    citationLines.push(`${idx + 1}. [${c.citationId}] 来源：${c.sourceType}, 项目：${c.projectId}, 位置：${formatLocatorSummary(c)}`);
  }

  const meta: YamlValue = {
    exportVersion: "v1",
    taskId: model.taskId ?? null,
    sessionId: model.sessionId ?? null,
    requestId: model.requestId ?? null,
    templateRef: normalizeTemplateRefForMetadata(model.templateRef)
  };

  const citationsMeta: YamlValue = citationsSorted.map((c) => normalizeCitationForMetadata(c));

  const yamlRoot: YamlValue = {
    meta,
    citations: citationsMeta
  };

  return [
    `# ${title}`,
    "",
    output,
    "",
    "## 引用",
    "",
    ...(citationLines.length > 0 ? citationLines : ["(no citations)"]),
    "",
    "---",
    "",
    "<!-- Metadata (Obsidian friendly) -->",
    "",
    "```yaml",
    yamlStringify(yamlRoot),
    "```",
    ""
  ].join("\n");
};
