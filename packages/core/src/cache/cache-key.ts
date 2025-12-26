import { z } from "zod";

import { CitationSchema, type Citation } from "../contracts/citation";
import { TemplateRefSchema, type TemplateRef } from "../contracts/template";

export const CacheMessageSchema = z
  .object({
    role: z.enum(["user", "assistant", "system"]),
    content: z.string().min(1)
  })
  .passthrough();

export type CacheMessage = z.infer<typeof CacheMessageSchema>;

export const CacheRetrievalSchema = z
  .object({
    providerId: z.string().min(1),
    query: z.string().min(1)
  })
  .passthrough();

export type CacheRetrieval = z.infer<typeof CacheRetrievalSchema>;

export const CacheModelInfoSchema = z
  .object({
    providerId: z.string().min(1),
    modelId: z.string().min(1).optional(),
    version: z.string().min(1).optional()
  })
  .passthrough();

export type CacheModelInfo = z.infer<typeof CacheModelInfoSchema>;

export const ResponseCacheKeySchema = z.string().regex(/^cache:v1:sha256:[a-f0-9]{64}$/);

export type ResponseCacheKey = z.infer<typeof ResponseCacheKeySchema>;

export const ComputeResponseCacheKeyInputSchema = z
  .object({
    tenantId: z.string().min(1),
    projectId: z.string().min(1),
    templateRef: TemplateRefSchema,
    messages: z.array(CacheMessageSchema).min(1),
    retrieval: CacheRetrievalSchema.optional(),
    citations: z.array(CitationSchema).optional(),
    modelInfo: CacheModelInfoSchema
  })
  .strict();

export type ComputeResponseCacheKeyInput = z.infer<typeof ComputeResponseCacheKeyInputSchema>;

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

const stableJsonStringify = (value: StableJsonValue): string => {
  if (value === null) {
    return "null";
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "null";
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

const formatTemplateRef = (ref: TemplateRef): string => {
  if (typeof ref.templateDefinitionHash === "string" && ref.templateDefinitionHash.length > 0) {
    return `hash:${ref.templateDefinitionHash}`;
  }

  const id = ref.templateId ?? "";
  const version = ref.templateVersion ?? "";
  return `id:${id}@${version}`;
};

const toStableCitationIds = (citations: readonly Citation[]): readonly string[] => {
  return citations
    .map((c) => c.citationId)
    .filter((id): id is string => typeof id === "string" && id.length > 0)
    .slice()
    .sort();
};

const formatModelInfo = (info: CacheModelInfo): string => {
  const modelId = info.modelId ?? "";
  const version = info.version ?? "";
  return `${info.providerId}:${modelId}:${version}`;
};

export const computeResponseCacheKey = (input: unknown): ResponseCacheKey => {
  const parsed = ComputeResponseCacheKeyInputSchema.parse(input);

  const inputHash = sha256Hex(
    stableJsonStringify(
      parsed.messages.map((m) => {
        return { role: m.role, content: m.content };
      })
    )
  );

  const retrievalHash = parsed.citations
    ? sha256Hex(stableJsonStringify(toStableCitationIds(parsed.citations)))
    : parsed.retrieval
      ? sha256Hex(
          stableJsonStringify({
            providerId: parsed.retrieval.providerId,
            query: parsed.retrieval.query
          })
        )
      : "";

  const payload: StableJsonValue = {
    tenantId: parsed.tenantId,
    projectId: parsed.projectId,
    templateRef: formatTemplateRef(parsed.templateRef),
    inputHash,
    retrievalHash,
    modelInfo: formatModelInfo(parsed.modelInfo)
  };

  const hex = sha256Hex(stableJsonStringify(payload));
  return ResponseCacheKeySchema.parse(`cache:v1:sha256:${hex}`);
};
