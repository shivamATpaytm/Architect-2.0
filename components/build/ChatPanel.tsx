"use client";

import { useEffect, useRef, useState } from "react";
import type { Phase, Project } from "@/lib/types";
import { useApp } from "@/components/providers/AppProvider";
import { uid } from "@/lib/storage";

const PHASE_ORDER: Phase[] = ["consulting", "blueprint", "crew", "stage"];

export function ChatPanel({
  project,
  onPhaseAdvance,
}: {
  project: Project;
  onPhaseAdvance?: (phase: Phase) => void;
}) {
  const { updateProject, prefs, showToast } = useApp();
  const [draft, setDraft] = useState("");
  const [running, setRunning] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [project.chat.length]);

  const send = (text?: string) => {
    const content = (text ?? draft).trim();
    if (!content) return;
    updateProject(project.id, {
      chat: [
        ...project.chat,
        {
          id: uid("msg"),
          role: "user",
          content,
          timestamp: new Date().toISOString(),
        },
        {
          id: uid("msg"),
          role: "assistant",
          content:
            prefs.mode === "builder"
              ? "Noted. I'll fold that into the Blueprint and keep the Stage preview in sync."
              : "Acknowledged. Diff will appear under Code; agent prompts stay editable in Agents.",
          timestamp: new Date().toISOString(),
          chips: ["Open Blueprint", "Open Agents", "Show code"],
        },
      ],
    });
    setDraft("");
  };

  const generate = async () => {
    if (running) return;
    setRunning(true);
    let chat = [...project.chat];
    const start = Math.max(0, PHASE_ORDER.indexOf(project.phase));
    const script = [
      {
        phase: "consulting" as Phase,
        msg:
          prefs.mode === "builder"
            ? "Framed as a sales-ops crew that saves ~6 hrs/week on nurture."
            : "Contract: 4 agents, HubSpot+Gmail tools, shared ICP KB.",
      },
      {
        phase: "blueprint" as Phase,
        msg: "Blueprint ready — review PRD sections under Blueprint view.",
      },
      {
        phase: "crew" as Phase,
        msg: "Crew graph live. Inspect prompts & tools in Agents.",
      },
      {
        phase: "stage" as Phase,
        msg: "Preview dashboard is on Stage. Deploy when ready.",
      },
    ];

    for (let i = start; i < script.length; i++) {
      const step = script[i];
      await wait(650);
      chat = [
        ...chat,
        {
          id: uid("msg"),
          role: "system",
          phase: step.phase,
          content: `${capitalize(step.phase)} phase`,
          timestamp: new Date().toISOString(),
        },
        {
          id: uid("msg"),
          role: "assistant",
          phase: step.phase,
          content: step.msg,
          timestamp: new Date().toISOString(),
          chips:
            step.phase === "stage"
              ? ["Open Agents", "Deploy"]
              : ["Make casual", "Add auth"],
        },
      ];
      updateProject(project.id, {
        phase: step.phase,
        chat,
        previewReady: step.phase === "stage" ? true : project.previewReady,
        status: "building",
      });
      onPhaseAdvance?.(step.phase);
    }
    setRunning(false);
    showToast("Generate complete");
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div
        className="flex items-center justify-between gap-2 px-3 py-2 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <span className="text-xs uppercase tracking-wider" style={{ color: "var(--ink-muted)" }}>
          Chat · {prefs.mode === "builder" ? "Consultant" : "Staff eng"}
        </span>
        <button
          type="button"
          className="btn btn-primary"
          disabled={running}
          onClick={generate}
        >
          {running ? "Generating…" : "Generate"}
        </button>
      </div>
      <div className="scroll-y flex-1 px-3 py-3 space-y-3 min-h-0">
        {project.chat.map((m) => (
          <div
            key={m.id}
            className="rounded-[10px] p-3"
            style={{
              background:
                m.role === "user"
                  ? "var(--accent-soft)"
                  : m.role === "system"
                    ? "var(--surface-2)"
                    : "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="mono text-[11px]" style={{ color: "var(--ink-muted)" }}>
                {m.role === "user" ? "You" : m.role === "system" ? "Phase" : "Architect"}
              </span>
              {m.phase && <span className="chip">{m.phase}</span>}
            </div>
            <p className="m-0 text-sm whitespace-pre-wrap">{m.content}</p>
            {m.chips && m.chips.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {m.chips.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className="chip"
                    onClick={() => {
                      if (c.toLowerCase().includes("deploy")) {
                        showToast("Open Ship view to deploy");
                      } else {
                        send(c);
                      }
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="p-3 border-t" style={{ borderColor: "var(--border)" }}>
        <div className="flex gap-2">
          <input
            className="input"
            placeholder="Steer the build…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
          />
          <button type="button" className="btn btn-primary" onClick={() => send()}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
