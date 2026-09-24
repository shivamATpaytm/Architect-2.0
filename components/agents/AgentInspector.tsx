"use client";

import type { AgentNode } from "@/lib/types";

const MODELS = ["claude-sonnet-4", "gpt-4.1", "gpt-4.1-mini", "—"];
const ALL_TOOLS = ["Web search", "Gmail", "HubSpot", "LinkedIn stub", "Slack"];

export function AgentInspector({
  agent,
  onChange,
  onStudio,
}: {
  agent: AgentNode | null;
  onChange: (a: AgentNode) => void;
  onStudio: () => void;
}) {
  if (!agent) {
    return (
      <aside
        className="w-[320px] shrink-0 border-l p-4"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
          Select an agent to inspect.
        </p>
      </aside>
    );
  }

  const toggleTool = (tool: string) => {
    const tools = agent.tools.includes(tool)
      ? agent.tools.filter((t) => t !== tool)
      : [...agent.tools, tool];
    onChange({ ...agent, tools });
  };

  return (
    <aside
      className="w-[320px] shrink-0 border-l flex flex-col min-h-0"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
        <h3 className="m-0 display text-xl">{agent.name}</h3>
        <p className="m-0 mt-1 text-sm" style={{ color: "var(--ink-muted)" }}>
          {agent.role}
        </p>
      </div>
      <div className="scroll-y flex-1 p-4 space-y-3">
        <label className="block text-xs uppercase tracking-wide" style={{ color: "var(--ink-muted)" }}>
          Model
          <select
            className="input mt-1"
            value={agent.model}
            onChange={(e) => onChange({ ...agent, model: e.target.value })}
          >
            {MODELS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs uppercase tracking-wide" style={{ color: "var(--ink-muted)" }}>
          System prompt
          <textarea
            className="textarea mt-1 mono text-xs"
            rows={8}
            value={agent.systemPrompt}
            onChange={(e) => onChange({ ...agent, systemPrompt: e.target.value })}
          />
        </label>
        <div>
          <div className="text-xs uppercase tracking-wide mb-2" style={{ color: "var(--ink-muted)" }}>
            Tools
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ALL_TOOLS.map((t) => (
              <button
                key={t}
                type="button"
                className={`chip ${agent.tools.includes(t) ? "chip-accent" : ""}`}
                onClick={() => toggleTool(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide mb-2" style={{ color: "var(--ink-muted)" }}>
            Knowledge
          </div>
          <div className="flex flex-wrap gap-1.5">
            {agent.kb.length ? (
              agent.kb.map((k) => (
                <span key={k} className="chip">
                  {k}
                </span>
              ))
            ) : (
              <span className="text-sm" style={{ color: "var(--ink-muted)" }}>
                None attached
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="p-3 border-t flex gap-2" style={{ borderColor: "var(--border)" }}>
        <button type="button" className="btn btn-primary flex-1" onClick={() => onChange(agent)}>
          Save
        </button>
        <button type="button" className="btn" onClick={onStudio}>
          Open in Studio
        </button>
      </div>
    </aside>
  );
}
