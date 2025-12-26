import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type Citation } from "@niche/core/contracts";

import { CitationsList } from "./CitationsList";

describe("CitationsList", () => {
  beforeEach(() => {
    (globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  });

  it("renders empty state when there are no citations", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root: Root = createRoot(container);

    await act(async () => {
      root.render(<CitationsList citations={[]} selectedCitationId={undefined} onSelect={() => undefined} />);
    });

    const el = container.querySelector("[data-testid='citations']");
    expect(el?.textContent ?? "").toContain("(no citations yet)");

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it("auto-selects first citation when selectedCitationId is missing", async () => {
    const onSelect = vi.fn();

    const citations: Citation[] = [
      {
        citationId: "c_1",
        sourceType: "document",
        projectId: "proj_1",
        locator: { offsetStart: 1, offsetEnd: 2 },
        snippet: "Evidence snippet",
        status: "verifiable"
      }
    ];

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root: Root = createRoot(container);

    await act(async () => {
      root.render(<CitationsList citations={citations} selectedCitationId={undefined} onSelect={onSelect} />);
    });

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith("c_1");

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it("supports arrow key navigation and selection", async () => {
    const onSelect = vi.fn();

    const citations: Citation[] = [
      {
        citationId: "c_1",
        sourceType: "document",
        projectId: "proj_1",
        locator: { offsetStart: 1, offsetEnd: 2 },
        snippet: "Evidence 1",
        status: "verifiable"
      },
      {
        citationId: "c_2",
        sourceType: "document",
        projectId: "proj_1",
        locator: { offsetStart: 3, offsetEnd: 4 },
        snippet: "Evidence 2",
        status: "verifiable"
      }
    ];

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root: Root = createRoot(container);

    await act(async () => {
      root.render(<CitationsList citations={citations} selectedCitationId={"c_1"} onSelect={onSelect} />);
    });

    const firstButton = container.querySelector<HTMLButtonElement>("button[data-citation-id='c_1']");
    expect(firstButton).not.toBeNull();

    await act(async () => {
      firstButton?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    });

    expect(onSelect).toHaveBeenCalledWith("c_2");

    const secondButton = container.querySelector<HTMLButtonElement>("button[data-citation-id='c_2']");
    expect(secondButton).not.toBeNull();

    await act(async () => {
      secondButton?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
    });

    expect(onSelect).toHaveBeenCalledWith("c_1");

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });
});
