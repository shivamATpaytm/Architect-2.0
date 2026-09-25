"use client";

import { useState } from "react";
import type { AgentNode, Project } from "@/lib/types";
import { useApp } from "@/components/providers/AppProvider";
import { AgentInspector } from "./AgentInspector";

export function AgentCanvas({ project }: { project: Project }) {
  const { prefs, updateProject, showToast } = useApp();
  const agents = project.agents.filter((a) => a.id.startsWith("agent-") || a.id === "node-kb");
  const crew = agents.filter((a) => a.id.startsWith("agent-"));
  const [selected, setSelected] = useState<string | null>(crew[0]?.id ?? agents[0]?.id ?? null);
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
        <div className="flex-1 scroll-y p-5">
          <div className="mb-4">
            <h2 className="display text-2xl m-0">Your crew</h2>
            <p className="text-sm mt-1 mb-0" style={{ color: "var(--ink-muted)" }}>
              Each agent owns a step in the nurture pipeline. Click to inspect and edit.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 content-start">
            {crew.map((a) => (
              <button
                key={a.id}
                type="button"
                className="card card-hover p-4 text-left"
                style={{
                  borderColor: selected === a.id ? "var(--accent)" : "var(--border)",
                  boxShadow: selected === a.id ? "0 0 0 3px var(--accent-ring)" : undefined,
                }}
                onClick={() => setSelected(a.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`status-dot ${a.status}`} />
                    <span className="font-semibold">{a.name}</span>
                  </div>
                  <span className="chip">{a.status}</span>
                </div>
                <p className="m-0 text-sm" style={{ color: "var(--ink-muted)" }}>
                  {a.role}
                </p>
                <div className="flex flex-wrap gap-1 mt-3">
                  {a.tools.length ? (
                    a.tools.map((t) => (
                      <span key={t} className="chip chip-accent">
                        {t}
                      </span>
                    ))
                  ) : (
                    <span className="chip">No tools</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
        <AgentInspector
          agent={active}
          onChange={saveAgent}
          onStudio={() => showToast("Open in Studio — coming soon (demo)")}
        />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0">
      <div className="flex-1 relative blueprint-grid overflow-auto min-h-[520px]">
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <span className="chip chip-accent">{crew.length} agents</span>
          <span className="chip">1 KB</span>
          <span className="chip mono">graph</span>
        </div>
        <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="var(--accent)" opacity="0.5" />
            </marker>
          </defs>
          <line x1="160" y1="160" x2="340" y2="120" stroke="var(--accent)" strokeOpacity="0.4" strokeWidth="1.5" markerEnd="url(#arrow)" />
          <line x1="420" y1="120" x2="580" y2="160" stroke="var(--accent)" strokeOpacity="0.4" strokeWidth="1.5" markerEnd="url(#arrow)" />
          <line x1="620" y1="180" x2="500" y2="300" stroke="var(--accent)" strokeOpacity="0.4" strokeWidth="1.5" markerEnd="url(#arrow)" />
          <line x1="260" y1="340" x2="380" y2="160" stroke="var(--border-strong)" strokeWidth="1.25" strokeDasharray="5 4" />
          <line x1="260" y1="340" x2="480" y2="320" stroke="var(--border-strong)" strokeWidth="1.25" strokeDasharray="5 4" />
        </svg>
        {agents.map((a) => (
          <button
            key={a.id}
            type="button"
            className={`agent-node ${selected === a.id ? "selected" : ""} ${a.status === "running" ? "pulse-running" : ""}`}
            style={{
              left: a.x,
              top: a.y,
              background: a.id === "node-kb" ? "var(--surface-2)" : "var(--surface)",
            }}
            onClick={() => setSelected(a.id)}
          >
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="label-caps" style={{ fontSize: 10 }}>
                {a.id === "node-kb" ? "KB" : "Agent"}
              </span>
              <span className={`status-dot ${a.status}`} />
            </div>
            <div className="font-semibold text-sm">{a.name}</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--ink-muted)" }}>
              {a.role}
            </div>
            {a.model !== "—" && (
              <div className="mono text-[10px] mt-1.5" style={{ color: "var(--ink-faint)" }}>
                {a.model}
              </div>
            )}
          </button>
        ))}
      </div>
      <AgentInspector
        agent={active}
        onChange={saveAgent}
        onStudio={() => showToast("Open in Studio — coming soon (demo)")}
      />
    </div>
  );
}
