import { existsSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";
import { z } from "zod";

const WorkflowPath = ".github/workflows/ci.yml" as const;

function mustInclude(text: string, needle: string): string {
  if (!text.includes(needle)) {
    throw new Error(`Contract violation: expected workflow to include ${JSON.stringify(needle)}`);
  }
  return needle;
}

describe("ci/ci-workflow.contract", () => {
  it("workflow exists and includes lint/typecheck/test/build steps", () => {
    expect(existsSync(WorkflowPath)).toBe(true);

    const raw = readFileSync(WorkflowPath, "utf-8");
    const content = z.string().min(1).parse(raw);

    const found = {
      onPullRequest: mustInclude(content, "pull_request"),
      onPush: mustInclude(content, "push"),
      lint: mustInclude(content, "npm run lint"),
      typecheck: mustInclude(content, "npm run typecheck"),
      test: mustInclude(content, "npm run test"),
      build: mustInclude(content, "npm run build")
    };

    const FoundSchema = z
      .object({
        onPullRequest: z.string().min(1),
        onPush: z.string().min(1),
        lint: z.string().min(1),
        typecheck: z.string().min(1),
        test: z.string().min(1),
        build: z.string().min(1)
      })
      .strict();

    FoundSchema.parse(found);
  });
});
