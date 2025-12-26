import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { loadAppEnv } from "./load-app-env";
import { AppEnvSchema } from "./schema";

type AppEnvKeysSnapshot = {
  NODE_ENV?: string | undefined;
  API_PORT?: string | undefined;
  WEB_PORT?: string | undefined;
};

const snapshotAppEnvKeys = (): AppEnvKeysSnapshot => {
  return {
    NODE_ENV: process.env.NODE_ENV,
    API_PORT: process.env.API_PORT,
    WEB_PORT: process.env.WEB_PORT
  };
};

const restoreAppEnvKeys = (snapshot: AppEnvKeysSnapshot): void => {
  const keys: Array<keyof AppEnvKeysSnapshot> = ["NODE_ENV", "API_PORT", "WEB_PORT"];
  for (const key of keys) {
    const value = snapshot[key];
    if (value === undefined) {
      delete process.env[key];
      continue;
    }
    process.env[key] = value;
  }
};

const setAppEnvKeys = (next: AppEnvKeysSnapshot): void => {
  const keys: Array<keyof AppEnvKeysSnapshot> = ["NODE_ENV", "API_PORT", "WEB_PORT"];
  for (const key of keys) {
    const value = next[key];
    if (value === undefined) {
      delete process.env[key];
      continue;
    }
    process.env[key] = value;
  }
};

const createIsolatedCwd = (): string => {
  return fs.mkdtempSync(path.join(os.tmpdir(), "niche-env-"));
};

describe("AppEnvSchema", () => {
  it("applies defaults", () => {
    const parsed = AppEnvSchema.parse({});
    expect(parsed.API_PORT).toBe(3001);
    expect(parsed.WEB_PORT).toBe(5173);
    expect(parsed.NODE_ENV).toBe("development");
  });
});

describe("loadAppEnv", () => {
  const initialCwd = process.cwd();
  const initialEnvKeys = snapshotAppEnvKeys();

  afterEach(() => {
    restoreAppEnvKeys(initialEnvKeys);
    process.chdir(initialCwd);
  });

  it("returns defaults when env is empty", () => {
    const cwd = createIsolatedCwd();
    process.chdir(cwd);

    setAppEnvKeys({});

    const env = loadAppEnv();
    expect(env).toEqual(AppEnvSchema.parse({}));
  });

  it("coerces numeric ports from strings", () => {
    const cwd = createIsolatedCwd();
    process.chdir(cwd);

    setAppEnvKeys({
      NODE_ENV: "test",
      API_PORT: "4010",
      WEB_PORT: "5174"
    });

    const env = loadAppEnv();
    expect(env.NODE_ENV).toBe("test");
    expect(env.API_PORT).toBe(4010);
    expect(env.WEB_PORT).toBe(5174);
  });

  it("throws when NODE_ENV is invalid", () => {
    const cwd = createIsolatedCwd();
    process.chdir(cwd);

    setAppEnvKeys({
      NODE_ENV: "invalid",
      API_PORT: "3001",
      WEB_PORT: "5173"
    });

    expect(() => loadAppEnv()).toThrow(/Invalid environment variables:/);
  });

  it("throws when ports are invalid", () => {
    const cwd = createIsolatedCwd();
    process.chdir(cwd);

    setAppEnvKeys({
      NODE_ENV: "development",
      API_PORT: "0",
      WEB_PORT: "-1"
    });

    expect(() => loadAppEnv()).toThrow(/Invalid environment variables:/);
  });
});
