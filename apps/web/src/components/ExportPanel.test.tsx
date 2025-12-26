import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ExportPanel } from "./ExportPanel";

describe("ExportPanel", () => {
  beforeEach(() => {
    (globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("copies markdown to clipboard", async () => {
    const writeText = vi.fn(async () => undefined);
    (navigator as unknown as { clipboard?: { writeText: (value: string) => Promise<void> } }).clipboard = { writeText };

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root: Root = createRoot(container);

    await act(async () => {
      root.render(<ExportPanel markdown="hello" defaultFileName="x.md" />);
    });

    const btn = container.querySelector<HTMLButtonElement>("[data-testid='export-copy-btn']");
    expect(btn).not.toBeNull();

    await act(async () => {
      btn?.click();
      await Promise.resolve();
    });

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText).toHaveBeenCalledWith("hello");

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it("downloads markdown as a file", async () => {
    if (!("createObjectURL" in URL)) {
      Object.defineProperty(URL, "createObjectURL", {
        value: () => "blob:placeholder",
        writable: true,
        configurable: true
      });
    }
    if (!("revokeObjectURL" in URL)) {
      Object.defineProperty(URL, "revokeObjectURL", {
        value: () => undefined,
        writable: true,
        configurable: true
      });
    }

    const createObjectURL = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock");
    const revokeObjectURL = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);

    const originalCreateElement = document.createElement.bind(document);
    let createdAnchor: HTMLAnchorElement | undefined;

    vi.spyOn(document, "createElement").mockImplementation((tagName: string, options?: ElementCreationOptions) => {
      const el = originalCreateElement(tagName, options);
      if (tagName.toLowerCase() === "a") {
        createdAnchor = el as HTMLAnchorElement;
      }
      return el;
    });

    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root: Root = createRoot(container);

    await act(async () => {
      root.render(<ExportPanel markdown="# Title" defaultFileName="export.md" />);
    });

    const btn = container.querySelector<HTMLButtonElement>("[data-testid='export-download-btn']");
    expect(btn).not.toBeNull();

    await act(async () => {
      btn?.click();
    });

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);

    expect(createdAnchor?.download).toBe("export.md");
    expect(createdAnchor?.href).toBe("blob:mock");

    await act(async () => {
      vi.runOnlyPendingTimers();
    });

    expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock");

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });
});
