"use client";

import type { Project } from "@/lib/types";
import { useApp } from "@/components/providers/AppProvider";
import { DEFAULT_INTEGRATIONS } from "@/lib/mock/seed";

export function IntegrationsPanel({ project }: { project: Project }) {
  const { updateProject, showToast } = useApp();
  const connectors =
    project.integrations?.length
      ? project.integrations
      : DEFAULT_INTEGRATIONS.map((c) => ({ ...c }));

  const toggle = (id: string) => {
    const next = connectors.map((c) =>
      c.id === id ? { ...c, connected: !c.connected } : c
    );
    const target = next.find((c) => c.id === id);
    updateProject(project.id, { integrations: next });
    showToast(
      target?.connected
        ? `${target.name} connected`
        : `${target?.name || "Connector"} disconnected`
    );
  };

  return (
    <div className="scroll-y h-full p-5">
      <div className="max-w-3xl mx-auto">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="display text-[28px] m-0">Integrations</h2>
            <p className="text-sm mt-1 mb-0" style={{ color: "var(--ink-muted)" }}>
              Connectors for the crew. Demo toggles — no real OAuth.
            </p>
          </div>
          <span className="chip chip-accent">
            {connectors.filter((c) => c.connected).length}/{connectors.length} connected
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {connectors.map((c) => (
            <div key={c.id} className="card p-4 flex flex-col gap-3 fade-in">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold">{c.name}</div>
                  <p className="m-0 mt-1 text-sm" style={{ color: "var(--ink-muted)" }}>
                    {c.blurb}
                  </p>
                </div>
                <span className={`chip ${c.connected ? "chip-accent" : ""}`}>
                  {c.connected ? "Connected" : "Not connected"}
                </span>
              </div>
              <p className="m-0 text-xs" style={{ color: "var(--ink-faint)" }}>
                Permissions: {c.permissions}
              </p>
              <button
                type="button"
                className={`btn ${c.connected ? "" : "btn-primary"} self-start`}
                onClick={() => toggle(c.id)}
              >
                {c.connected ? "Disconnect" : "Connect"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
