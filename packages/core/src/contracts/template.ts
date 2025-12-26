import { z } from "zod";

import { AppErrorSchema, createAppError, type AppError } from "./error";

const sha256Hex = (message: string): string => {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);

  const rotr = (value: number, bits: number): number => {
    return (value >>> bits) | (value << (32 - bits));
  };

  const ch = (x: number, y: number, z_: number): number => {
    return (x & y) ^ (~x & z_);
  };

  const maj = (x: number, y: number, z_: number): number => {
    return (x & y) ^ (x & z_) ^ (y & z_);
  };

  const bigSigma0 = (x: number): number => {
    return rotr(x, 2) ^ rotr(x, 13) ^ rotr(x, 22);
  };

  const bigSigma1 = (x: number): number => {
    return rotr(x, 6) ^ rotr(x, 11) ^ rotr(x, 25);
  };

  const smallSigma0 = (x: number): number => {
    return rotr(x, 7) ^ rotr(x, 18) ^ (x >>> 3);
  };

  const smallSigma1 = (x: number): number => {
    return rotr(x, 17) ^ rotr(x, 19) ^ (x >>> 10);
  };

  const k: readonly number[] = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  const messageLenBits = data.length * 8;
  const withOne = data.length + 1;
  const padLen = (64 - ((withOne + 8) % 64)) % 64;
  const totalLen = withOne + padLen + 8;

  const padded = new Uint8Array(totalLen);
  padded.set(data, 0);
  padded[data.length] = 0x80;

  const view = new DataView(padded.buffer);
  const high = Math.floor(messageLenBits / 2 ** 32);
  const low = messageLenBits >>> 0;
  view.setUint32(totalLen - 8, high, false);
  view.setUint32(totalLen - 4, low, false);

  const w = new Uint32Array(64);

  for (let offset = 0; offset < padded.length; offset += 64) {
    for (let i = 0; i < 16; i += 1) {
      w[i] = view.getUint32(offset + i * 4, false);
    }
    for (let i = 16; i < 64; i += 1) {
      const s0 = smallSigma0(w[i - 15] ?? 0);
      const s1 = smallSigma1(w[i - 2] ?? 0);
      const a = (w[i - 16] ?? 0) + s0;
      const b = (w[i - 7] ?? 0) + s1;
      w[i] = (a + b) >>> 0;
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let i = 0; i < 64; i += 1) {
      const t1 = (h + bigSigma1(e) + ch(e, f, g) + (k[i] ?? 0) + (w[i] ?? 0)) >>> 0;
      const t2 = (bigSigma0(a) + maj(a, b, c)) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + t1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) >>> 0;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  const toHex32 = (n: number): string => {
    return n.toString(16).padStart(8, "0");
  };

  return `${toHex32(h0)}${toHex32(h1)}${toHex32(h2)}${toHex32(h3)}${toHex32(h4)}${toHex32(h5)}${toHex32(h6)}${toHex32(h7)}`;
};

export const TemplateIdSchema = z.string().min(1).max(128);

export type TemplateId = z.infer<typeof TemplateIdSchema>;

export const TemplateVersionSchema = z.string().min(1).max(64);

export type TemplateVersion = z.infer<typeof TemplateVersionSchema>;

export const TemplateDefinitionHashSchema = z.string().regex(/^sha256:[a-f0-9]{64}$/);

export type TemplateDefinitionHash = z.infer<typeof TemplateDefinitionHashSchema>;

export const TemplateRefSchema = z
  .object({
    templateId: TemplateIdSchema.optional(),
    templateVersion: TemplateVersionSchema.optional(),
    templateDefinitionHash: TemplateDefinitionHashSchema.optional()
  })
  .passthrough()
  .superRefine((val, ctx) => {
    const hasId = typeof val.templateId === "string";
    const hasHash = typeof val.templateDefinitionHash === "string";

    if (!hasId && !hasHash) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "templateRef must include templateId or templateDefinitionHash",
        path: ["templateId"]
      });
      return;
    }

    if (hasId && hasHash) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "templateRef must not include both templateId and templateDefinitionHash",
        path: ["templateDefinitionHash"]
      });
    }

    if (val.templateVersion !== undefined && !hasId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "templateVersion is only allowed when templateId is provided",
        path: ["templateVersion"]
      });
    }
  });

export type TemplateRef = z.infer<typeof TemplateRefSchema>;

export const ZodSchemaSchema = z.custom<z.ZodTypeAny>((val) => {
  return val instanceof z.ZodType;
});

export type ZodSchemaValue = z.infer<typeof ZodSchemaSchema>;

export const TemplateToolSchema = z
  .object({
    name: z.string().min(1),
    description: z.string().min(1).optional(),
    argsSchema: ZodSchemaSchema,
    resultSchema: ZodSchemaSchema.optional()
  })
  .passthrough();

export type TemplateTool = z.infer<typeof TemplateToolSchema>;

export const WorkflowRetryPolicySchema = z
  .object({
    maxRetries: z.number().int().nonnegative().default(0)
  })
  .passthrough();

export type WorkflowRetryPolicy = z.infer<typeof WorkflowRetryPolicySchema>;

export const WorkflowPolicySchema = z
  .object({
    maxSteps: z.number().int().positive().default(8),
    retry: WorkflowRetryPolicySchema.optional()
  })
  .passthrough();

export type WorkflowPolicy = z.infer<typeof WorkflowPolicySchema>;

export const CitationPolicyModeSchema = z.enum(["off", "optional", "required"]);

export type CitationPolicyMode = z.infer<typeof CitationPolicyModeSchema>;

export const CitationPolicySchema = z
  .object({
    mode: CitationPolicyModeSchema.default("optional")
  })
  .passthrough();

export type CitationPolicy = z.infer<typeof CitationPolicySchema>;

export const GuardrailsPolicySchema = z
  .object({
    enforceHonorCode: z.boolean().default(true)
  })
  .passthrough();

export type GuardrailsPolicy = z.infer<typeof GuardrailsPolicySchema>;

export const TemplateDefinitionSchema = z
  .object({
    schemaVersion: z.string().min(1).optional(),
    systemPrompt: z.string().min(1),
    prompt: z.string().min(1),
    tools: z.array(TemplateToolSchema),
    outputSchema: ZodSchemaSchema.optional(),
    workflowPolicy: WorkflowPolicySchema,
    citationPolicy: CitationPolicySchema,
    guardrailsPolicy: GuardrailsPolicySchema
  })
  .passthrough();

export type TemplateDefinition = z.infer<typeof TemplateDefinitionSchema>;

export const TemplateSelectionInputSchema = z
  .object({
    templateId: TemplateIdSchema.optional(),
    templateVersion: TemplateVersionSchema.optional(),
    templateDefinition: TemplateDefinitionSchema.optional()
  })
  .passthrough()
  .superRefine((val, ctx) => {
    const hasId = val.templateId !== undefined;
    const hasDef = val.templateDefinition !== undefined;

    if (hasId && hasDef) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide either templateId or templateDefinition, not both",
        path: ["templateDefinition"]
      });
      return;
    }

    if (!hasId && !hasDef) {
      return;
    }

    if (val.templateVersion !== undefined && !hasId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "templateVersion is only allowed when templateId is provided",
        path: ["templateVersion"]
      });
    }
  });

export type TemplateSelectionInput = z.infer<typeof TemplateSelectionInputSchema>;

export type ValidationIssue = {
  path: string;
  message: string;
  code: string;
};

export const ValidationIssueSchema = z
  .object({
    path: z.string(),
    message: z.string(),
    code: z.string()
  })
  .strict();

export type ValidationErrorDetails = {
  issues: readonly ValidationIssue[];
};

export const ValidationErrorDetailsSchema = z
  .object({
    issues: z.array(ValidationIssueSchema).min(1)
  })
  .strict();

const formatZodPath = (path: readonly (string | number)[]): string => {
  if (path.length === 0) {
    return "";
  }

  let out = "";
  for (const item of path) {
    if (typeof item === "number") {
      out += `[${item}]`;
      continue;
    }

    if (out.length === 0) {
      out += item;
    } else {
      out += `.${item}`;
    }
  }

  return out;
};

const toValidationIssues = (error: z.ZodError): ValidationIssue[] => {
  return error.issues.map((i) => {
    return {
      path: formatZodPath(i.path),
      message: i.message,
      code: i.code
    };
  });
};

export const createValidationError = (requestId: string, message: string, error: z.ZodError): AppError => {
  const details: ValidationErrorDetails = {
    issues: toValidationIssues(error)
  };

  return AppErrorSchema.parse({
    code: "VALIDATION_ERROR",
    message,
    retryable: false,
    requestId,
    details: ValidationErrorDetailsSchema.parse(details)
  });
};

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: AppError };

export const validateTemplateDefinition = (
  requestId: string,
  input: unknown
): ValidationResult<TemplateDefinition> => {
  const parsed = TemplateDefinitionSchema.safeParse(input);
  if (parsed.success) {
    return { ok: true, value: parsed.data };
  }

  return {
    ok: false,
    error: createValidationError(requestId, "Invalid templateDefinition", parsed.error)
  };
};

type StableJsonValue =
  | null
  | boolean
  | number
  | string
  | readonly StableJsonValue[]
  | { readonly [k: string]: StableJsonValue };

const isStableJsonObject = (value: StableJsonValue): value is { readonly [k: string]: StableJsonValue } => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const toStableJsonValue = (value: unknown): StableJsonValue => {
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

  if (typeof value === "symbol") {
    return value.toString();
  }

  if (typeof value === "function") {
    return "[Function]";
  }

  if (Array.isArray(value)) {
    return value.map((v) => toStableJsonValue(v));
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "object") {
    const out: Record<string, StableJsonValue> = {};
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj).sort();
    for (const k of keys) {
      out[k] = toStableJsonValue(obj[k]);
    }
    return out;
  }

  return "[Unknown]";
};

const stableJsonStringify = (value: StableJsonValue): string => {
  if (value === null) {
    return "null";
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  if (typeof value === "number") {
    if (Number.isFinite(value)) {
      return String(value);
    }
    return "null";
  }

  if (typeof value === "string") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((v) => stableJsonStringify(v)).join(",")}]`;
  }

  if (!isStableJsonObject(value)) {
    return "{}";
  }

  const keys = Object.keys(value).sort();
  const items = keys.map((k) => {
    const v = value[k] ?? null;
    return `${JSON.stringify(k)}:${stableJsonStringify(v)}`;
  });

  return `{${items.join(",")}}`;
};

const normalizeZodSchemaForHash = (schema: z.ZodTypeAny): StableJsonValue => {
  const def = schema._def as { typeName?: string };
  const typeName = typeof def.typeName === "string" ? def.typeName : "unknown";

  return {
    __kind: "zod",
    typeName,
    description: schema.description ?? null
  };
};

const normalizeTemplateDefinitionForHash = (def: TemplateDefinition): StableJsonValue => {
  return {
    schemaVersion: def.schemaVersion ?? null,
    systemPrompt: def.systemPrompt,
    prompt: def.prompt,
    tools: def.tools.map((t) => {
      return {
        name: t.name,
        description: t.description ?? null,
        argsSchema: normalizeZodSchemaForHash(t.argsSchema),
        resultSchema: t.resultSchema ? normalizeZodSchemaForHash(t.resultSchema) : null
      };
    }),
    outputSchema: def.outputSchema ? normalizeZodSchemaForHash(def.outputSchema) : null,
    workflowPolicy: toStableJsonValue(def.workflowPolicy),
    citationPolicy: toStableJsonValue(def.citationPolicy),
    guardrailsPolicy: toStableJsonValue(def.guardrailsPolicy)
  };
};

export const computeTemplateDefinitionHash = (definition: TemplateDefinition): TemplateDefinitionHash => {
  const normalized = normalizeTemplateDefinitionForHash(definition);
  const text = stableJsonStringify(normalized);

  const hex = sha256Hex(text);
  return TemplateDefinitionHashSchema.parse(`sha256:${hex}`);
};

export const createTemplateRefFromId = (templateId: string, templateVersion?: string): TemplateRef => {
  return TemplateRefSchema.parse({
    templateId: TemplateIdSchema.parse(templateId),
    ...(templateVersion !== undefined ? { templateVersion: TemplateVersionSchema.parse(templateVersion) } : {})
  });
};

export const createTemplateRefFromDefinition = (
  requestId: string,
  input: unknown
): ValidationResult<{ templateDefinition: TemplateDefinition; templateRef: TemplateRef }> => {
  const parsed = validateTemplateDefinition(requestId, input);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }

  const hash = computeTemplateDefinitionHash(parsed.value);
  const templateRef = TemplateRefSchema.parse({
    templateDefinitionHash: hash
  });

  return {
    ok: true,
    value: {
      templateDefinition: parsed.value,
      templateRef
    }
  };
};

export type ResolvedTemplate = {
  templateDefinition: TemplateDefinition;
  templateRef: TemplateRef;
};

export type ResolveTemplateOptions = {
  defaultTemplateId?: string;
  defaultTemplateVersion?: string;
  defaultTemplateDefinition?: TemplateDefinition;
  templateRegistry?: Record<string, { version?: string; definition: TemplateDefinition }>;
};

export const DEFAULT_TEMPLATE_ID = "default";
export const DEFAULT_TEMPLATE_VERSION = "0";

export const DefaultTemplateDefinition: TemplateDefinition = TemplateDefinitionSchema.parse({
  schemaVersion: "v1",
  systemPrompt: "You are Study Copilot.",
  prompt: "Help the user learn effectively.",
  tools: [],
  workflowPolicy: {
    maxSteps: 8,
    retry: {
      maxRetries: 0
    }
  },
  citationPolicy: {
    mode: "optional"
  },
  guardrailsPolicy: {
    enforceHonorCode: true
  }
});

export const resolveTemplateSelection = (
  requestId: string,
  input: unknown,
  options?: ResolveTemplateOptions
): ValidationResult<ResolvedTemplate> => {
  const parsed = TemplateSelectionInputSchema.safeParse(input === undefined || input === null ? {} : input);
  if (!parsed.success) {
    return {
      ok: false,
      error: createValidationError(requestId, "Invalid template selection", parsed.error)
    };
  }

  const { templateRegistry } = options ?? {};

  if (parsed.data.templateDefinition !== undefined) {
    const refResult = createTemplateRefFromDefinition(requestId, parsed.data.templateDefinition);
    if (!refResult.ok) {
      return refResult;
    }

    return {
      ok: true,
      value: {
        templateDefinition: refResult.value.templateDefinition,
        templateRef: refResult.value.templateRef
      }
    };
  }

  if (parsed.data.templateId !== undefined) {
    const id = parsed.data.templateId;
    const fromRegistry = templateRegistry?.[id];

    if (fromRegistry === undefined) {
      const error = createAppError({
        code: "VALIDATION_ERROR",
        message: "Unknown templateId",
        retryable: false,
        requestId,
        details: ValidationErrorDetailsSchema.parse({
          issues: [{ path: "templateId", message: "Unknown templateId", code: "custom" }]
        })
      });

      return { ok: false, error };
    }

    const templateRef = createTemplateRefFromId(
      id,
      parsed.data.templateVersion ?? fromRegistry.version ?? options?.defaultTemplateVersion
    );

    return {
      ok: true,
      value: {
        templateDefinition: fromRegistry.definition,
        templateRef
      }
    };
  }

  const defaultId = options?.defaultTemplateId ?? DEFAULT_TEMPLATE_ID;
  const defaultVersion = options?.defaultTemplateVersion ?? DEFAULT_TEMPLATE_VERSION;
  const defaultDefinition = options?.defaultTemplateDefinition ?? DefaultTemplateDefinition;

  return {
    ok: true,
    value: {
      templateDefinition: defaultDefinition,
      templateRef: createTemplateRefFromId(defaultId, defaultVersion)
    }
  };
};
