import { z } from "zod";

import { readFixture } from "./fixture-loader";

import type { buildServer } from "../../../apps/api/src/main";

const ProviderFixtureSchemaVersionSchema = z.literal(1);

const ProviderHappyFixtureSchema = z
  .object({
    chunks: z.array(z.string()),
    tokenDelayMs: z.number().int().nonnegative()
  })
  .strict();

const ProviderCancelFixtureSchema = z
  .object({
    chunks: z.number().int().positive(),
    chunkPrefix: z.string(),
    tokenDelayMs: z.number().int().nonnegative()
  })
  .strict();

const ProviderErrorFixtureSchema = z
  .object({
    chunks: z.array(z.string()),
    forceErrorAtIndex: z.number().int().nonnegative(),
    errorMessage: z.string().min(1),
    tokenDelayMs: z.number().int().nonnegative()
  })
  .strict();

const ProviderFixtureSchema = z
  .object({
    schemaVersion: ProviderFixtureSchemaVersionSchema,
    happy: ProviderHappyFixtureSchema,
    cancel: ProviderCancelFixtureSchema,
    error: ProviderErrorFixtureSchema
  })
  .strict();

const sleep = (ms: number, signal: AbortSignal): Promise<void> => {
  return new Promise<void>((resolve) => {
    if (signal.aborted) {
      resolve();
      return;
    }

    const timeout = setTimeout(() => resolve(), ms);

    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timeout);
        resolve();
      },
      { once: true }
    );
  });
};

export type StreamProviderInput = {
  ctx: NonNullable<Parameters<NonNullable<NonNullable<Parameters<typeof buildServer>[0]>["streamProvider"]>>[0]>["ctx"];
  prompt: string;
  signal: AbortSignal;
  options: {
    tokenDelayMs: number;
    forceError: boolean;
  };
};

export type StreamProvider = NonNullable<NonNullable<Parameters<typeof buildServer>[0]>["streamProvider"]>;

const StreamProviderScenarioSchema = z.enum(["happy", "error", "long_running"]);
export type StreamProviderScenario = z.infer<typeof StreamProviderScenarioSchema>;

const createProviderStrategies = (fixture: z.infer<typeof ProviderFixtureSchema>): Record<StreamProviderScenario, StreamProvider> => {
  return {
    happy: async function* (input) {
      void input.ctx;
      void input.prompt;

      for (const chunk of fixture.happy.chunks) {
        if (input.signal.aborted) {
          return;
        }

        const delay = input.options.tokenDelayMs > 0 ? input.options.tokenDelayMs : fixture.happy.tokenDelayMs;
        if (delay > 0) {
          await sleep(delay, input.signal);
        }

        if (input.signal.aborted) {
          return;
        }

        yield chunk;
      }
    },
    error: async function* (input) {
      void input.ctx;
      void input.prompt;

      for (let idx = 0; idx < fixture.error.chunks.length; idx += 1) {
        if (input.signal.aborted) {
          return;
        }

        const delay = input.options.tokenDelayMs > 0 ? input.options.tokenDelayMs : fixture.error.tokenDelayMs;
        if (delay > 0) {
          await sleep(delay, input.signal);
        }

        if (input.signal.aborted) {
          return;
        }

        if (input.options.forceError && idx === fixture.error.forceErrorAtIndex) {
          throw new Error(fixture.error.errorMessage);
        }

        yield fixture.error.chunks[idx] ?? "";
      }
    },
    long_running: async function* (input) {
      void input.ctx;
      void input.prompt;

      const delay = input.options.tokenDelayMs > 0 ? input.options.tokenDelayMs : fixture.cancel.tokenDelayMs;

      for (let idx = 0; idx < fixture.cancel.chunks; idx += 1) {
        if (input.signal.aborted) {
          return;
        }

        if (delay > 0) {
          await sleep(delay, input.signal);
        }

        if (input.signal.aborted) {
          return;
        }

        yield `${fixture.cancel.chunkPrefix}${idx}`;
      }
    }
  };
};

export const createStreamProvider = (scenario: StreamProviderScenario): StreamProvider => {
  const parsedScenario = StreamProviderScenarioSchema.parse(scenario);
  const fixture = readFixture("mock-provider-responses.json", ProviderFixtureSchema);
  const strategies = createProviderStrategies(fixture);
  return strategies[parsedScenario];
};

export const createHappyStreamProvider = (): StreamProvider => createStreamProvider("happy");

export const createErrorStreamProvider = (): StreamProvider => createStreamProvider("error");

export const createLongRunningStreamProvider = (): StreamProvider => createStreamProvider("long_running");
