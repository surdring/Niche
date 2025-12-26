import { z } from "zod";

export const CitationSourceTypeSchema = z.enum(["ragflow_chunk", "document", "web"]);

export type CitationSourceType = z.infer<typeof CitationSourceTypeSchema>;

export const CitationStatusSchema = z.enum(["verifiable", "unavailable", "degraded"]);

export type CitationStatus = z.infer<typeof CitationStatusSchema>;

export const CitationBBoxSchema = z.tuple([z.number(), z.number(), z.number(), z.number()]);

export type CitationBBox = z.infer<typeof CitationBBoxSchema>;

export const CitationLocatorSchema = z
  .object({
    page: z.number().int().positive().optional(),
    offsetStart: z.number().int().nonnegative().optional(),
    offsetEnd: z.number().int().nonnegative().optional(),
    section: z.string().min(1).optional(),
    bbox: CitationBBoxSchema.optional()
  })
  .passthrough()
  .superRefine((val, ctx) => {
    if (val.offsetStart !== undefined && val.offsetEnd !== undefined && val.offsetEnd < val.offsetStart) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "locator.offsetEnd must be >= locator.offsetStart",
        path: ["offsetEnd"]
      });
    }
  });

export type CitationLocator = z.infer<typeof CitationLocatorSchema>;

export const CitationSchema = z
  .object({
    citationId: z.string().min(1),
    sourceType: CitationSourceTypeSchema,
    documentId: z.string().min(1).optional(),
    projectId: z.string().min(1),
    locator: CitationLocatorSchema,
    snippet: z.string().min(1).optional(),
    status: CitationStatusSchema,
    degradedReason: z.string().min(1).optional()
  })
  .passthrough()
  .superRefine((val, ctx) => {
    if (val.status === "degraded" && val.degradedReason === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "degradedReason is required when status is degraded",
        path: ["degradedReason"]
      });
    }

    if (val.status === "verifiable" && val.degradedReason !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "degradedReason is not allowed when status is verifiable",
        path: ["degradedReason"]
      });
    }

    if (val.status === "verifiable" && val.locator.page === undefined && val.locator.offsetStart === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "verifiable citation requires locator.page or locator.offsetStart",
        path: ["locator", "page"]
      });
    }
  });

export type Citation = z.infer<typeof CitationSchema>;

export const EvidenceSchema = CitationSchema;

export type Evidence = z.infer<typeof EvidenceSchema>;
