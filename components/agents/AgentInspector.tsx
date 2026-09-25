"use client";

import { useEffect, useState } from "react";
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
  const [draft, setDraft] = useState<AgentNode | null>(agent);

  useEffect(() => {
    setDraft(agent);
  }, [agent]);

  if (!agent || !draft) {
    return (
      <aside
        className="w-[340px] shrink-0 border-l p-5"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <div className="sketch-empty p-6">
          <p className="text-sm m-0">Select an agent to inspect prompts, tools, and knowledge.</p>
        </div>
      </aside>
    );
  }

  const toggleTool = (tool: string) => {
    const tools = draft.tools.includes(tool)
      ? draft.tools.filter((t) => t !== tool)
      : [...draft.tools, tool];
    setDraft({ ...draft, tools });
  };

  return (
    <aside
      className="w-[340px] shrink-0 border-l flex flex-col min-h-0"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2 mb-1">
          <span className={`status-dot ${draft.status}`} />
          <span className="chip">{draft.status}</span>
        </div>
        <h3 className="m-0 display text-xl">{draft.name}</h3>
        <p className="m-0 mt-1 text-sm" style={{ color: "var(--ink-muted)" }}>
          {draft.role}
        </p>
      </div>
      <div className="scroll-y flex-1 p-4 space-y-4">
        <label className="block">
          <span className="label-caps">Model</span>
          <select
            className="input mt-1.5"
            value={draft.model}
            onChange={(e) => setDraft({ ...draft, model: e.target.value })}
          >
            {MODELS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label-caps">System prompt</span>
          <textarea
            className="textarea mt-1.5 mono text-xs"
            rows={9}
            value={draft.systemPrompt}
            onChange={(e) => setDraft({ ...draft, systemPrompt: e.target.value })}
          />
        </label>
        <div>
          <div className="label-caps mb-2">Tools</div>
          <div className="flex flex-wrap gap-1.5">
            {ALL_TOOLS.map((t) => (
              <button
                key={t}
                type="button"
                className={`chip ${draft.tools.includes(t) ? "chip-accent" : ""}`}
                onClick={() => toggleTool(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="label-caps mb-2">Knowledge</div>
          <div className="flex flex-wrap gap-1.5">
            {draft.kb.length ? (
              draft.kb.map((k) => (
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
        <button type="button" className="btn btn-primary flex-1" onClick={() => onChange(draft)}>
          Save changes
        </button>
        <button type="button" className="btn" onClick={onStudio}>
          Studio
        </button>
      </div>
    </aside>
  );
}
