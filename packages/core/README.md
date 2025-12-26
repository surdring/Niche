# @niche/core

## Purpose

`@niche/core` contains the shared runtime + contracts used by the Study Copilot project.

It is designed to be imported by:

- `apps/api` (Fastify + GraphQL/REST/Streaming)
- `apps/web` (frontend, when needed)
- future workers/CLI tools

## Main Exports

### Contracts (`contracts/*`)

- Request context: `RequestContextSchema`
- Error model: `AppErrorSchema`, `KnownAppErrorCodeSchema`
- Streaming protocol helpers (SSE + Vercel AI Data Stream codec)
- Step events: `StepEventSchema`
- Citation/Evidence: `CitationSchema`, `EvidenceSchema`

### Agent Runtime (`agent/*`)

- Language model abstraction: `LanguageModel`
- Middleware chain: `wrapLanguageModel`
- Runtime config builder: `buildRuntimeConfig`
- Guardrails and evidence helpers
- Agent proxy orchestrator: `runAgentProxy`

### Config (`config/*`)

- Environment schema: `AppEnvSchema`
- Environment loader: `loadAppEnv`

## Usage Examples

### Validate an AppError

```ts
import { AppErrorSchema } from "@niche/core";

const parsed = AppErrorSchema.parse({
  code: "UPSTREAM_TIMEOUT",
  message: "Upstream timeout",
  retryable: true,
  requestId: "req_1"
});
```

### Load environment variables

```ts
import { loadAppEnv } from "@niche/core";

const env = loadAppEnv();
// env.API_PORT / env.WEB_PORT / env.NODE_ENV
```

## Development

### Commands

From repo root:

- `npm run test -w @niche/core`
- `npm run typecheck -w @niche/core`
- `npm run lint -w @niche/core`

### Notes

- The project enforces TypeScript `strict` and forbids `any`.
- All external-facing inputs/outputs should be validated with Zod.
