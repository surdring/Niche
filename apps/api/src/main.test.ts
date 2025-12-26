import { Writable } from "node:stream";

import type { FastifyServerOptions } from "fastify";
import { describe, expect, it } from "vitest";
import { z } from "zod";

import { buildServer } from "./main";

type JsonLogLine = {
  requestId?: string;
  event?: string;
  stepEvent?: {
    requestId?: string;
  };
};

describe("api", () => {
  it("propagates requestId into inbound log and step event", async () => {
    let logBuffer = "";

    const captureStream = new Writable({
      write(chunk, _encoding, callback) {
        logBuffer += chunk.toString();
        callback();
      }
    });

    const logger = {
      level: "info",
      stream: captureStream
    } as unknown as NonNullable<FastifyServerOptions["logger"]>;

    const app = buildServer({ logger });
    await app.ready();

    const requestId = "req_test_123";
    const response = await app.inject({
      method: "GET",
      url: "/api/_debug/trace",
      headers: {
        "x-request-id": requestId,
        "x-tenant-id": "tenant_test"
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["x-request-id"]).toBe(requestId);

    const logLines = logBuffer
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const parsedLogs: JsonLogLine[] = [];
    for (const line of logLines) {
      try {
        parsedLogs.push(JSON.parse(line) as JsonLogLine);
      } catch {
        continue;
      }
    }

    const inbound = parsedLogs.find((l) => l.event === "request_received");
    const stepLog = parsedLogs.find((l) => l.event === "step_event_emitted");

    expect(inbound?.requestId).toBe(requestId);
    expect(stepLog?.requestId).toBe(requestId);
    expect(stepLog?.stepEvent?.requestId).toBe(requestId);

    await app.close();
  });

  it("rejects requests without tenantId with AUTH_ERROR and includes requestId", async () => {
    const app = buildServer({ logger: false });
    await app.ready();

    const requestId = "req_missing_tenant_1";
    const response = await app.inject({
      method: "GET",
      url: "/api/_debug/trace",
      headers: {
        "x-request-id": requestId
      }
    });

    expect(response.statusCode).toBe(401);
    const payload = AppErrorPayloadSchema.parse(response.json());
    expect(payload.code).toBe("AUTH_ERROR");
    expect(payload.requestId).toBe(requestId);

    await app.close();
  });

  it("rejects evidence requests without projectId with AUTH_ERROR and includes requestId", async () => {
    const app = buildServer({ logger: false });
    await app.ready();

    const requestId = "req_missing_project_1";
    const response = await app.inject({
      method: "GET",
      url: "/api/evidence?citationId=c_1",
      headers: {
        "x-request-id": requestId,
        "x-tenant-id": "tenant_test"
      }
    });

    expect(response.statusCode).toBe(401);
    const payload = AppErrorPayloadSchema.parse(response.json());
    expect(payload.code).toBe("AUTH_ERROR");
    expect(payload.requestId).toBe(requestId);

    await app.close();
  });

  it("has a placeholder test", () => {
    expect(true).toBe(true);
  });
});

const AppErrorPayloadSchema = z
  .object({
    code: z.string().min(1),
    requestId: z.string().min(1)
  })
  .passthrough();
