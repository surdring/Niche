# @niche/api

## Purpose

`@niche/api` is the backend service for Study Copilot.

It exposes:

- GraphQL API (Mercurius)
- REST endpoints (health, evidence, upload)
- Streaming endpoint (`/api/stream`) using Vercel AI Data Stream Protocol compatible framing

## Getting Started

### Prerequisites

- Node.js (repo uses npm workspaces)

### Install

From repo root:

- `npm install`

### Run (development)

- `npm run dev -w @niche/api`

### Build & run (production-like)

- `npm run build -w @niche/api`
- `npm run start -w @niche/api`

## Environment Variables

This service uses environment variables validated by `@niche/core` (`AppEnvSchema`).

- `NODE_ENV`: `development` | `test` | `production` (default: `development`)
- `API_PORT`: API server port (default: `3001`)
- `WEB_PORT`: web dev server port (default: `5173`)

See `.env.example` for a minimal template.

## Request Headers (Observability / Isolation)

Most endpoints require:

- `x-tenant-id`: required for all non-health endpoints
- `x-project-id`: required for selected endpoints (see below)
- `x-request-id`: optional (if absent, server generates one)

Additional optional headers:

- `x-task-id`
- `x-session-id`

## Endpoints

### Health

- `GET /health`
- `GET /api/health`

### GraphQL

- `POST /api/graphql`

Notes:

- You must send `Content-Type: application/json`.
- When `graphiql` is enabled, Mercurius also serves an IDE route (see Mercurius defaults in runtime).

### Streaming

- `POST /api/stream`

Headers:

- `x-tenant-id`: required
- `x-project-id`: required

### Evidence

- `GET /api/evidence?citationId=...`

Headers:

- `x-tenant-id`: required
- `x-project-id`: required

### Upload

- `POST /api/upload`

Headers:

- `x-tenant-id`: required
- `x-project-id`: required

## Development & Debugging

### Run tests

- `npm run test -w @niche/api`

### Typecheck

- `npm run typecheck -w @niche/api`

### Lint

- `npm run lint -w @niche/api`

### Debug trace endpoint

- `GET /api/_debug/trace`

This endpoint emits a minimal step event over SSE framing for debugging.
