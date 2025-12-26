import { describe, expect, it } from "vitest";
import { z } from "zod";

import type { RequestContext } from "../contracts/context";

import { MockLanguageModel } from "./language-model";
import { generateObjectWithRetries } from "./structured-output";

describe("structured output", () => {
  it("retries until schema matches", async () => {
    const model = new MockLanguageModel([
      { kind: "object", object: { a: 1 } },
      { kind: "object", object: { a: "ok" } }
    ]);

    const ctx: RequestContext = { requestId: "req_struct_ok", tenantId: "tenant_1" };

    const schema = z.object({ a: z.string() }).strict();

    const out = await generateObjectWithRetries(model, ctx, { prompt: "p", schema }, { maxRetries: 1 });
    expect(out.ok).toBe(true);
    if (!out.ok) {
      return;
    }

    expect(out.value.a).toBe("ok");
    expect(out.attempts).toBe(2);
  });

  it("returns CONTRACT_VIOLATION when retries exceeded", async () => {
    const model = new MockLanguageModel([{ kind: "object", object: { a: 1 } }]);

    const ctx: RequestContext = { requestId: "req_struct_fail", tenantId: "tenant_1" };

    const schema = z.object({ a: z.string() }).strict();

    const out = await generateObjectWithRetries(model, ctx, { prompt: "p", schema }, { maxRetries: 0 });
    expect(out.ok).toBe(false);
    if (out.ok) {
      return;
    }

    expect(out.error.code).toBe("CONTRACT_VIOLATION");
    expect(out.error.requestId).toBe(ctx.requestId);

    const details = out.error.details as unknown;
    const DetailsSchema = z
      .object({
        attempts: z.number().int().nonnegative(),
        issues: z.array(z.object({ path: z.string(), message: z.string(), code: z.string() }))
      })
      .passthrough();

    const parsed = DetailsSchema.parse(details);
    expect(parsed.attempts).toBeGreaterThan(0);
    expect(parsed.issues.length).toBeGreaterThan(0);
  });
});
