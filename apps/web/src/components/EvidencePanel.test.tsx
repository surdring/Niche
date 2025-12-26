import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type Evidence } from "@niche/core/contracts";

import { EvidencePanel, type EvidenceState } from "./EvidencePanel";

describe("EvidencePanel", () => {
  beforeEach(() => {
    (globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("shows placeholder when no citation is selected", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root: Root = createRoot(container);

    await act(async () => {
      root.render(<EvidencePanel selectedCitationId={undefined} evidenceState={{ status: "idle" }} onClose={() => undefined} />);
    });

    const evidence = container.querySelector("[data-testid='evidence']");
    expect(evidence?.textContent ?? "").toContain("(select a citation)");

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it("shows loading state when evidence is loading", async () => {
    const state: EvidenceState = { status: "loading", citationId: "c_1" };

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root: Root = createRoot(container);

    await act(async () => {
      root.render(<EvidencePanel selectedCitationId={"c_1"} evidenceState={state} onClose={() => undefined} />);
    });

    const evidence = container.querySelector("[data-testid='evidence']");
    expect(evidence?.textContent ?? "").toContain("Loading evidence for c_1");

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it("calls onClose when close button is clicked", async () => {
    const onClose = vi.fn();

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root: Root = createRoot(container);

    await act(async () => {
      root.render(<EvidencePanel selectedCitationId={"c_1"} evidenceState={{ status: "idle" }} onClose={onClose} />);
    });

    const btn = container.querySelector<HTMLButtonElement>("[data-testid='evidence-close-btn']");
    expect(btn).not.toBeNull();

    await act(async () => {
      btn?.click();
    });

    expect(onClose).toHaveBeenCalledTimes(1);

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it("filters snippet highlighting", async () => {
    const evidence: Evidence = {
      citationId: "c_1",
      sourceType: "document",
      projectId: "proj_1",
      locator: { offsetStart: 1, offsetEnd: 2 },
      snippet: "Hello World",
      status: "verifiable"
    };

    const state: EvidenceState = { status: "ready", citationId: "c_1", evidence };

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root: Root = createRoot(container);

    await act(async () => {
      root.render(<EvidencePanel selectedCitationId={"c_1"} evidenceState={state} onClose={() => undefined} />);
    });

    const input = container.querySelector<HTMLInputElement>("input[placeholder='Highlight keyword']");
    expect(input).not.toBeNull();

    const setNativeValue = (el: HTMLInputElement, value: string) => {
      const proto = Object.getPrototypeOf(el) as HTMLInputElement;
      const desc = Object.getOwnPropertyDescriptor(proto, "value");
      const setter = desc?.set;
      if (setter) {
        setter.call(el, value);
      } else {
        el.value = value;
      }
    };

    await act(async () => {
      if (input) {
        setNativeValue(input, "world");
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }
      await Promise.resolve();
    });

    const evidenceEl = container.querySelector("[data-testid='evidence']");
    expect(evidenceEl?.querySelector("mark")).not.toBeNull();

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it("copies snippet to clipboard", async () => {
    const writeText = vi.fn(async () => undefined);
    (navigator as unknown as { clipboard?: { writeText: (value: string) => Promise<void> } }).clipboard = { writeText };

    const evidence: Evidence = {
      citationId: "c_1",
      sourceType: "document",
      projectId: "proj_1",
      locator: { offsetStart: 1, offsetEnd: 2 },
      snippet: "Hello World",
      status: "verifiable"
    };

    const state: EvidenceState = { status: "ready", citationId: "c_1", evidence };

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root: Root = createRoot(container);

    await act(async () => {
      root.render(<EvidencePanel selectedCitationId={"c_1"} evidenceState={state} onClose={() => undefined} />);
    });

    const buttons = Array.from(container.querySelectorAll("button"));
    const copyBtn = buttons.find((b) => (b.textContent ?? "").includes("Copy snippet"));
    expect(copyBtn).not.toBeUndefined();

    await act(async () => {
      copyBtn?.click();
      await Promise.resolve();
    });

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText).toHaveBeenCalledWith("Hello World");

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it("shows Open source link when evidence contains url", async () => {
    const evidenceWithUrl = {
      citationId: "c_1",
      sourceType: "document",
      projectId: "proj_1",
      locator: { offsetStart: 1, offsetEnd: 2 },
      snippet: "Hello World",
      status: "verifiable",
      url: "https://example.com/source"
    };

    const state: EvidenceState = {
      status: "ready",
      citationId: "c_1",
      evidence: evidenceWithUrl as unknown as Evidence
    };

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root: Root = createRoot(container);

    await act(async () => {
      root.render(<EvidencePanel selectedCitationId={"c_1"} evidenceState={state} onClose={() => undefined} />);
    });

    const link = Array.from(container.querySelectorAll("a")).find((a) => (a.textContent ?? "").includes("Open source"));
    expect(link).not.toBeUndefined();
    expect(link?.getAttribute("href")).toBe("https://example.com/source");

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });
});
