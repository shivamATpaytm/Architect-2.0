"use client";

import { useState } from "react";
import type { AgentNode, Project } from "@/lib/types";
import { useApp } from "@/components/providers/AppProvider";
import { AgentInspector } from "./AgentInspector";

export function AgentCanvas({ project }: { project: Project }) {
  const { prefs, updateProject, showToast } = useApp();
  const agents = project.agents.filter((a) => a.id.startsWith("agent-") || a.id === "node-kb");
  const [selected, setSelected] = useState<string | null>(agents[0]?.id ?? null);
  const active = agents.find((a) => a.id === selected) || null;

  const saveAgent = (next: AgentNode) => {
    updateProject(project.id, {
      agents: project.agents.map((a) => (a.id === next.id ? next : a)),
    });
    showToast(`Saved ${next.name}`);
  };

  if (prefs.mode === "builder") {
    return (
      <div className="flex h-full min-h-0">
        <div className="flex-1 scroll-y p-4 grid gap-3 sm:grid-cols-2 content-start">
          {agents
            .filter((a) => a.id.startsWith("agent-"))
            .map((a) => (
              <button
                key={a.id}
                type="button"
                className="card p-4 text-left"
                style={{
                  borderColor: selected === a.id ? "var(--accent)" : "var(--border)",
                }}
                onClick={() => setSelected(a.id)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold">{a.name}</span>
                  <span className="chip">{a.status}</span>
                </div>
                <p className="m-0 text-sm" style={{ color: "var(--ink-muted)" }}>
                  {a.role}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {a.tools.map((t) => (
                    <span key={t} className="chip chip-accent">
                      {t}
                    </span>
                  ))}
                </div>
              </button>
            ))}
        </div>
        <AgentInspector
          agent={active}
          onChange={saveAgent}
          onStudio={() => showToast("Open in Studio — coming soon")}
        />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0">
      <div className="flex-1 relative blueprint-grid overflow-auto min-h-[480px]">
        <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
          <line x1="160" y1="160" x2="360" y2="120" stroke="var(--accent)" strokeOpacity="0.45" strokeWidth="1.5" />
          <line x1="400" y1="120" x2="600" y2="160" stroke="var(--accent)" strokeOpacity="0.45" strokeWidth="1.5" />
          <line x1="600" y1="180" x2="480" y2="300" stroke="var(--accent)" strokeOpacity="0.45" strokeWidth="1.5" />
          <line x1="260" y1="340" x2="400" y2="160" stroke="var(--border-strong)" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="260" y1="340" x2="480" y2="320" stroke="var(--border-strong)" strokeWidth="1" strokeDasharray="4 4" />
        </svg>
        {agents.map((a) => (
          <button
            key={a.id}
            type="button"
            className={`absolute card p-3 text-left w-[160px] ${a.status === "running" ? "pulse-running" : ""}`}
            style={{
              left: a.x,
              top: a.y,
              borderColor: selected === a.id ? "var(--accent)" : "var(--border)",
              background: a.id === "node-kb" ? "var(--surface-2)" : "var(--surface)",
            }}
            onClick={() => setSelected(a.id)}
          >
            <div className="text-xs uppercase tracking-wide mb-1" style={{ color: "var(--ink-muted)" }}>
              {a.id === "node-kb" ? "KB" : "Agent"}
            </div>
            <div className="font-semibold text-sm">{a.name}</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--ink-muted)" }}>
              {a.role}
            </div>
          </button>
        ))}
      </div>
      <AgentInspector
        agent={active}
        onChange={saveAgent}
        onStudio={() => showToast("Open in Studio — coming soon")}
      />
    </div>
  );
}
