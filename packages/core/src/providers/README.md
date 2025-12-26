# Providers

This folder contains the Provider Adapter abstraction and minimal multi-model routing.

## Provider Adapter

- Interface: `packages/core/src/providers/provider.ts`
- Routed model wrapper: `packages/core/src/providers/routed-language-model.ts`

A provider implements `ProviderAdapter<TContext>` and can be swapped by configuration without changing business orchestration.

## Routing Config (deterministic)

The routed language model accepts a `routing` config validated by Zod (`ProviderRoutingConfigSchema`).

### Minimal config

```ts
const routing = {
  primary: { providerId: "openai", modelId: "gpt-4o-mini" },
  fallbacks: [{ providerId: "openai", modelId: "gpt-4o" }]
};
```

### Heuristic routing (prompt length)

```ts
const routing = {
  primary: { providerId: "openai", modelId: "gpt-4o-mini" },
  fallbacks: [{ providerId: "openai", modelId: "gpt-4o" }],
  heuristic: {
    thresholdChars: 800,
    low: { providerId: "openai", modelId: "gpt-4o-mini" },
    high: { providerId: "openai", modelId: "gpt-4o" }
  }
};
```

### Fallback policy

```ts
const routing = {
  primary: { providerId: "openai", modelId: "gpt-4o-mini" },
  fallbacks: [
    { providerId: "openai", modelId: "gpt-4o" },
    { providerId: "openai", modelId: "gpt-4.1" }
  ],
  fallbackPolicy: {
    // Limit how many candidates will be attempted
    maxAttempts: 2,

    // Skip providers at runtime (e.g. feature flag / incident mitigation)
    skipProviderIds: ["anthropic"]
  }
};
```

### Retry policy (only for retryable errors)

The routed model retries a provider call only when the thrown error can be normalized into `AppError` with `retryable=true`.

```ts
const routing = {
  primary: { providerId: "openai", modelId: "gpt-4o-mini" },
  fallbacks: [{ providerId: "openai", modelId: "gpt-4o" }],

  // Retry the same provider before moving to the next candidate.
  // Total attempts per candidate = 1 + maxRetries.
  retryPolicy: {
    maxRetries: 2
  }
};
```

Notes:

- Non-retryable errors (e.g. `VALIDATION_ERROR`, `AUTH_ERROR`, `CONTRACT_VIOLATION`, `GUARDRAIL_BLOCKED`) will not be retried.
- When retries are exhausted, the model proceeds to the next candidate in `fallbacks`.
- If all candidates fail, it throws a unified `UPSTREAM_UNAVAILABLE` `AppError`.

### Hint-based routing

A routed model can use `hintResolver` to inject a routing hint per request.

```ts
const model = createRoutedLanguageModel({
  routing,
  providers,
  hintResolver: (_ctx, input) => {
    if (input.prompt.length > 2000) {
      return { complexity: "high" };
    }
    return { complexity: "low" };
  }
});
```

## OpenAI Provider

- Implementation: `packages/core/src/providers/openai-provider.ts`

### Usage

```ts
const openai = createOpenAIProviderAdapter({
  id: "openai",
  config: {
    apiKey: process.env.OPENAI_API_KEY,
    baseUrl: "https://api.openai.com/v1",
    timeoutMs: 60_000
  }
});

const model = createRoutedLanguageModel({
  routing,
  providers: [openai]
});
```

Security note: do not hardcode API keys.
