import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import App from "./App";

describe("App", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    (globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    globalThis.fetch = vi.fn(async () => new Response("ok", { status: 200, headers: { "x-request-id": "req_test_1" } })) as unknown as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("renders basic layout", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root: Root = createRoot(container);

    await act(async () => {
      root.render(<App />);
    });

    expect(container.textContent ?? "").toContain("Niche Study Copilot");
    expect(container.querySelector("[data-testid='layout-grid']")).not.toBeNull();
    expect(container.querySelector("[data-testid='output']")).not.toBeNull();
    expect(container.querySelector("[data-testid='timeline']")).not.toBeNull();

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });
});
