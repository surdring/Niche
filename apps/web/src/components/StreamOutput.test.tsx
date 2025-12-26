import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { StreamOutput } from "./StreamOutput";

describe("StreamOutput", () => {
  beforeEach(() => {
    (globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  });

  it("shows placeholder when output is empty", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root: Root = createRoot(container);

    await act(async () => {
      root.render(<StreamOutput output="" autoScroll={false} onAutoScrollChange={() => undefined} isRunning={false} />);
    });

    const output = container.querySelector("[data-testid='output']");
    expect(output?.textContent ?? "").toContain("(no output yet)");

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it("calls onAutoScrollChange when checkbox is toggled", async () => {
    const onAutoScrollChange = vi.fn();

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root: Root = createRoot(container);

    await act(async () => {
      root.render(<StreamOutput output="hello" autoScroll={false} onAutoScrollChange={onAutoScrollChange} isRunning={false} />);
    });

    const checkbox = container.querySelector<HTMLInputElement>("input[type='checkbox']");
    expect(checkbox).not.toBeNull();

    await act(async () => {
      checkbox?.click();
    });

    expect(onAutoScrollChange).toHaveBeenCalledTimes(1);
    expect(onAutoScrollChange).toHaveBeenCalledWith(true);

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it("auto-scrolls to bottom when output changes and autoScroll is true", async () => {
    const rafSpy = vi.spyOn(window, "requestAnimationFrame");
    rafSpy.mockImplementation((cb: FrameRequestCallback): number => {
      cb(0);
      return 1;
    });

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root: Root = createRoot(container);

    await act(async () => {
      root.render(<StreamOutput output="first" autoScroll={true} onAutoScrollChange={() => undefined} isRunning={false} />);
    });

    const pre = container.querySelector<HTMLPreElement>("[data-testid='output']");
    expect(pre).not.toBeNull();
    if (pre) {
      Object.defineProperty(pre, "scrollHeight", { value: 500, configurable: true });
      pre.scrollTop = 0;
    }

    await act(async () => {
      root.render(<StreamOutput output="first\nsecond" autoScroll={true} onAutoScrollChange={() => undefined} isRunning={false} />);
    });

    expect(rafSpy).toHaveBeenCalled();
    expect(pre?.scrollTop).toBe(500);

    await act(async () => {
      root.unmount();
    });

    rafSpy.mockRestore();
    container.remove();
  });
});
