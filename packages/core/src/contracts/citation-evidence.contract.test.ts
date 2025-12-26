import { describe, expect, it } from "vitest";

import type { EvidenceProvider } from "../agent/evidence";
import { verifyCitations } from "../agent/evidence";
import { getEvidenceByCitationId } from "../services/evidence-service";
import type { CitationRepo } from "../repos/citation-repo";

import { CitationSchema, EvidenceSchema } from "./index";

describe("contract/citation-evidence", () => {
  const makeCtx = (): { requestId: string; tenantId: string; projectId: string } => {
    return { requestId: "req_citation_contract_1", tenantId: "tenant_1", projectId: "proj_1" };
  };

  it("parses Citation and Evidence and requires projectId", () => {
    const citation = CitationSchema.parse({
      citationId: "c_contract_1",
      sourceType: "document",
      projectId: "proj_contract_1",
      locator: { page: 1 },
      status: "verifiable"
    });

    expect(citation.projectId).toBe("proj_contract_1");

    const evidence = EvidenceSchema.parse({
      citationId: "e_contract_1",
      sourceType: "document",
      projectId: "proj_contract_1",
      locator: {},
      status: "unavailable",
      degradedReason: "Not found"
    });

    expect(evidence.projectId).toBe("proj_contract_1");
  });

  it("allows empty locator for unavailable evidence (boundary)", () => {
    const evidence = EvidenceSchema.parse({
      citationId: "e_contract_locator_empty_1",
      sourceType: "document",
      projectId: "proj_contract_1",
      locator: {},
      status: "unavailable",
      degradedReason: "Not available"
    });

    expect(evidence.status).toBe("unavailable");
  });

  it("rejects verifiable citations without locator.page or locator.offsetStart", () => {
    expect(() => {
      CitationSchema.parse({
        citationId: "c_contract_locator_invalid_1",
        sourceType: "document",
        projectId: "proj_contract_1",
        locator: {},
        status: "verifiable"
      });
    }).toThrow();
  });

  it("rejects locator when offsetEnd < offsetStart", () => {
    expect(() => {
      CitationSchema.parse({
        citationId: "c_contract_locator_offsets_invalid_1",
        sourceType: "document",
        projectId: "proj_contract_1",
        locator: { offsetStart: 10, offsetEnd: 9 },
        status: "unavailable",
        degradedReason: "Not available"
      });
    }).toThrow();
  });

  it("rejects cross-project citations in verifyCitations (project isolation)", async () => {
    const ctx = makeCtx();

    const evidenceProvider: EvidenceProvider<typeof ctx> = {
      async getEvidence() {
        throw new Error("should_not_call");
      }
    };

    const out = await verifyCitations(
      ctx,
      [
        {
          citationId: "c_mismatch_1",
          sourceType: "document",
          projectId: "proj_2",
          locator: { page: 1 },
          status: "verifiable"
        }
      ],
      evidenceProvider
    );

    expect(out.ok).toBe(false);
    if (out.ok) {
      return;
    }

    expect(out.error.code).toBe("CONTRACT_VIOLATION");
    expect(out.error.message).toContain("projectId mismatch");
  });

  it("rejects cross-project ragflow citationId in getEvidenceByCitationId (project isolation)", async () => {
    const ctx = makeCtx();

    const repo: CitationRepo = {
      async getByCitationId() {
        throw new Error("should_not_call");
      }
    };

    const out = await getEvidenceByCitationId(ctx, "ragflow:tenant_1:proj_2:chunk_1", { repo });
    expect(out.ok).toBe(false);
    if (out.ok) {
      return;
    }

    expect(out.error.code).toBe("AUTH_ERROR");
    expect(out.error.message).toContain("projectId mismatch");
  });
});
