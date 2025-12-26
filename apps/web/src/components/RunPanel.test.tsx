import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RunPanel } from "./RunPanel";

describe("RunPanel", () => {
  beforeEach(() => {
    (globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  });

  it("renders skeletons when templates are loading", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root: Root = createRoot(container);

    await act(async () => {
      root.render(
        <RunPanel
          tenantId="tenant_1"
          onTenantIdChange={() => undefined}
          projectId="proj_1"
          onProjectIdChange={() => undefined}
          templatesStatus="loading"
          templateOptions={[]}
          selectedTemplateKey=""
          onSelectedTemplateKeyChange={() => undefined}
          selectedTemplateDescription={undefined}
          prompt="hello"
          onPromptChange={() => undefined}
          canRun={false}
          canCancel={false}
          canRetry={false}
          onRun={() => undefined}
          onCancel={() => undefined}
          runStatus="idle"
          taskId={undefined}
          sessionId={undefined}
          stage={undefined}
          templateRef={undefined}
        />
      );
    });

    const select = container.querySelector("select");
    expect(select).toBeNull();

    const runBtn = container.querySelector("[data-testid='run-btn']");
    expect(runBtn).not.toBeNull();

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it("allows running via Enter on template select when canRun is true", async () => {
    const onRun = vi.fn();

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root: Root = createRoot(container);

    await act(async () => {
      root.render(
        <RunPanel
          tenantId="tenant_1"
          onTenantIdChange={() => undefined}
          projectId="proj_1"
          onProjectIdChange={() => undefined}
          templatesStatus="ready"
          templateOptions={[{ key: "tpl_1@v1", label: "Template 1" }]}
          selectedTemplateKey="tpl_1@v1"
          onSelectedTemplateKeyChange={() => undefined}
          selectedTemplateDescription={"desc"}
          prompt="hello"
          onPromptChange={() => undefined}
          canRun={true}
          canCancel={false}
          canRetry={false}
          onRun={onRun}
          onCancel={() => undefined}
          runStatus="idle"
          taskId={undefined}
          sessionId={undefined}
          stage={undefined}
          templateRef={undefined}
        />
      );
    });

    const select = container.querySelector<HTMLSelectElement>("select");
    expect(select).not.toBeNull();

    await act(async () => {
      select?.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    });

    expect(onRun).toHaveBeenCalledTimes(1);

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it("allows running via Ctrl+Enter in prompt textarea when canRun is true", async () => {
    const onRun = vi.fn();

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root: Root = createRoot(container);

    await act(async () => {
      root.render(
        <RunPanel
          tenantId="tenant_1"
          onTenantIdChange={() => undefined}
          projectId="proj_1"
          onProjectIdChange={() => undefined}
          templatesStatus="ready"
          templateOptions={[{ key: "tpl_1@v1", label: "Template 1" }]}
          selectedTemplateKey="tpl_1@v1"
          onSelectedTemplateKeyChange={() => undefined}
          selectedTemplateDescription={undefined}
          prompt="hello"
          onPromptChange={() => undefined}
          canRun={true}
          canCancel={false}
          canRetry={false}
          onRun={onRun}
          onCancel={() => undefined}
          runStatus="idle"
          taskId={undefined}
          sessionId={undefined}
          stage={undefined}
          templateRef={undefined}
        />
      );
    });

    const textarea = container.querySelector<HTMLTextAreaElement>("textarea");
    expect(textarea).not.toBeNull();

    await act(async () => {
      textarea?.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", ctrlKey: true, bubbles: true }));
    });

    expect(onRun).toHaveBeenCalledTimes(1);

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });
});
