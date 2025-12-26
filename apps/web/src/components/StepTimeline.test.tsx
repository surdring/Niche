import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { StepTimeline } from "./StepTimeline";

describe("StepTimeline", () => {
  beforeEach(() => {
    (globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("renders events and allows filtering by search", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root: Root = createRoot(container);

    await act(async () => {
      root.render(
        <StepTimeline
          events={[
            {
              type: "step_started",
              taskId: "t_1",
              stepId: "s_1",
              stepName: "Answer",
              requestId: "req_1",
              timestamp: "2025-01-01T00:00:00.000Z",
              payload: {}
            },
            {
              type: "tool_called",
              taskId: "t_1",
              stepId: "s_1",
              stepName: "Answer",
              requestId: "req_1",
              timestamp: "2025-01-01T00:00:01.000Z",
              payload: { toolName: "search", argsSummary: "{}" }
            }
          ]}
          groupTimeline={false}
          onGroupTimelineChange={() => undefined}
          autoScroll={false}
          isRunning={false}
          formatEventSummary={(ev) => ev.type}
        />
      );
    });

    const timeline = container.querySelector("[data-testid='timeline']");
    expect(timeline?.textContent ?? "").toContain("step_started");

    const searchInput = container.querySelector<HTMLInputElement>("input[placeholder='Search events']");
    expect(searchInput).not.toBeNull();

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
      if (searchInput) {
        setNativeValue(searchInput, "tool_called");
        searchInput.dispatchEvent(new Event("input", { bubbles: true }));
        searchInput.dispatchEvent(new Event("change", { bubbles: true }));
      }

      await Promise.resolve();
    });

    const timelineAfter = container.querySelector("[data-testid='timeline']");
    expect(timelineAfter?.textContent ?? "").not.toContain("step_started");

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it("filters by event type checkboxes", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root: Root = createRoot(container);

    await act(async () => {
      root.render(
        <StepTimeline
          events={[
            {
              type: "step_started",
              taskId: "t_1",
              stepId: "s_1",
              stepName: "Answer",
              requestId: "req_1",
              timestamp: "2025-01-01T00:00:00.000Z",
              payload: {}
            },
            {
              type: "tool_called",
              taskId: "t_1",
              stepId: "s_1",
              stepName: "Answer",
              requestId: "req_1",
              timestamp: "2025-01-01T00:00:01.000Z",
              payload: { toolName: "search", argsSummary: "{}" }
            }
          ]}
          groupTimeline={false}
          onGroupTimelineChange={() => undefined}
          autoScroll={false}
          isRunning={false}
          formatEventSummary={(ev) => ev.type}
        />
      );
    });

    const timeline = container.querySelector("[data-testid='timeline']");
    expect(timeline?.textContent ?? "").toContain("step_started");
    expect(timeline?.textContent ?? "").toContain("tool_called");

    const labelEl = Array.from(container.querySelectorAll("label")).find((l) => (l.textContent ?? "").includes("tool_called"));
    expect(labelEl).not.toBeUndefined();
    const checkbox = labelEl?.querySelector<HTMLInputElement>("input[type='checkbox']");
    expect(checkbox).not.toBeNull();

    await act(async () => {
      checkbox?.click();
      await Promise.resolve();
    });

    const timelineAfter = container.querySelector("[data-testid='timeline']");
    expect(timelineAfter?.textContent ?? "").toContain("step_started");
    expect(timelineAfter?.textContent ?? "").not.toContain("tool_called");

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it("copies single event JSON", async () => {
    const writeText = vi.fn(async (_value: string) => undefined);
    (navigator as unknown as { clipboard?: { writeText: (value: string) => Promise<void> } }).clipboard = { writeText };

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root: Root = createRoot(container);

    await act(async () => {
      root.render(
        <StepTimeline
          events={[
            {
              type: "tool_called",
              taskId: "t_1",
              stepId: "s_1",
              stepName: "Answer",
              requestId: "req_1",
              timestamp: "2025-01-01T00:00:01.000Z",
              payload: { toolName: "search", argsSummary: "{}" }
            }
          ]}
          groupTimeline={false}
          onGroupTimelineChange={() => undefined}
          autoScroll={false}
          isRunning={false}
          formatEventSummary={(ev) => ev.type}
        />
      );
    });

    const buttons = Array.from(container.querySelectorAll("button"));
    const copyBtn = buttons.find((b) => (b.textContent ?? "").includes("Copy JSON"));
    expect(copyBtn).not.toBeUndefined();

    await act(async () => {
      copyBtn?.click();
      await Promise.resolve();
    });

    expect(writeText).toHaveBeenCalledTimes(1);
    const payload = writeText.mock.calls[0]?.[0];
    if (typeof payload !== "string") {
      throw new Error("Expected clipboard payload to be a string");
    }
    expect(payload).toContain("\"type\": \"tool_called\"");

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });
});
