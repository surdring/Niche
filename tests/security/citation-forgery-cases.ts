export type CitationForgeryCaseKind =
  | "unmappable_citation_id"
  | "cross_project_citation_id"
  | "invalid_locator"
  | "invalid_citation_id"
  | "long_citation_id"
  | "special_char_citation_id"
  | "invalid_status";

export type CitationForgeryCase = {
  id: string;
  kind: CitationForgeryCaseKind;
  title: string;
  structuredOutput: {
    answer: string;
    citations: unknown;
  };
  tags?: readonly string[];
  expectedErrorCode: "CONTRACT_VIOLATION";
};

const longCitationId = `c_${"x".repeat(2048)}`;

export const citationForgeryCases: readonly CitationForgeryCase[] = [
  {
    id: "unmappable_citation_id_missing_from_retrieval",
    kind: "unmappable_citation_id",
    title: "Unmappable citationId: citationId does not exist in retrieval records",
    structuredOutput: {
      answer: "ok",
      citations: [
        {
          citationId: "c_missing",
          sourceType: "document",
          projectId: "p_1",
          locator: { page: 1 },
          status: "verifiable"
        }
      ]
    },
    expectedErrorCode: "CONTRACT_VIOLATION"
  },
  {
    id: "cross_project_citation_id_project_mismatch",
    kind: "cross_project_citation_id",
    title: "Cross projectId citationId: citation.projectId mismatches ctx.projectId",
    structuredOutput: {
      answer: "bad",
      citations: [
        {
          citationId: "c_1",
          sourceType: "document",
          projectId: "p_2",
          locator: { page: 1 },
          status: "verifiable"
        }
      ]
    },
    expectedErrorCode: "CONTRACT_VIOLATION"
  },
  {
    id: "invalid_locator_offset_end_lt_offset_start",
    kind: "invalid_locator",
    title: "Invalid locator: locator format invalid or missing",
    structuredOutput: {
      answer: "bad",
      citations: [
        {
          citationId: "c_1",
          sourceType: "document",
          projectId: "p_1",
          locator: { offsetStart: 10, offsetEnd: 1 },
          status: "verifiable"
        }
      ]
    },
    tags: ["schema_invalid"],
    expectedErrorCode: "CONTRACT_VIOLATION"
  },
  {
    id: "invalid_locator_missing_page_and_offset",
    kind: "invalid_locator",
    title: "Invalid locator: verifiable citation missing locator.page and locator.offsetStart",
    structuredOutput: {
      answer: "bad",
      citations: [
        {
          citationId: "c_1",
          sourceType: "document",
          projectId: "p_1",
          locator: {},
          status: "verifiable"
        }
      ]
    },
    tags: ["schema_invalid"],
    expectedErrorCode: "CONTRACT_VIOLATION"
  },
  {
    id: "invalid_citation_id_empty_string",
    kind: "invalid_citation_id",
    title: "Invalid citationId: empty string",
    structuredOutput: {
      answer: "bad",
      citations: [
        {
          citationId: "",
          sourceType: "document",
          projectId: "p_1",
          locator: { page: 1 },
          status: "verifiable"
        }
      ]
    },
    tags: ["boundary", "schema_invalid"],
    expectedErrorCode: "CONTRACT_VIOLATION"
  },
  {
    id: "long_citation_id_unverifiable",
    kind: "long_citation_id",
    title: "Long citationId: very long citationId should still be rejected if unverifiable",
    structuredOutput: {
      answer: "bad",
      citations: [
        {
          citationId: longCitationId,
          sourceType: "document",
          projectId: "p_1",
          locator: { page: 1 },
          status: "verifiable"
        }
      ]
    },
    tags: ["boundary"],
    expectedErrorCode: "CONTRACT_VIOLATION"
  },
  {
    id: "special_char_citation_id_unverifiable",
    kind: "special_char_citation_id",
    title: "Special characters in citationId: should still be rejected if unverifiable",
    structuredOutput: {
      answer: "bad",
      citations: [
        {
          citationId: "c_!@#$%^&*()_+{}[]:;<>?",
          sourceType: "document",
          projectId: "p_1",
          locator: { page: 1 },
          status: "verifiable"
        }
      ]
    },
    tags: ["boundary"],
    expectedErrorCode: "CONTRACT_VIOLATION"
  },
  {
    id: "invalid_status_degraded_missing_degraded_reason",
    kind: "invalid_status",
    title: "Invalid citation status: degraded requires degradedReason",
    structuredOutput: {
      answer: "bad",
      citations: [
        {
          citationId: "c_1",
          sourceType: "document",
          projectId: "p_1",
          locator: { page: 1 },
          status: "degraded"
        }
      ]
    },
    tags: ["schema_invalid"],
    expectedErrorCode: "CONTRACT_VIOLATION"
  }
];
