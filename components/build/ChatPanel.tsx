"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Phase, Project } from "@/lib/types";
import { useApp } from "@/components/providers/AppProvider";
import { uid } from "@/lib/storage";

const PHASE_ORDER: Phase[] = ["consulting", "blueprint", "crew", "stage"];

export function ChatPanel({ project }: { project: Project }) {
  const { updateProject, prefs, showToast } = useApp();
  const router = useRouter();
  const [draft, setDraft] = useState("");
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<Phase[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [project.chat.length, running]);

  const navigateChip = (c: string) => {
    const lower = c.toLowerCase();
    if (lower.includes("deploy")) {
      router.push(`/projects/${project.id}?view=ship`);
      return;
    }
    if (lower.includes("agent")) {
      router.push(`/projects/${project.id}?view=agents`);
      return;
    }
    if (lower.includes("blueprint")) {
      router.push(`/projects/${project.id}?view=blueprint`);
      return;
    }
    if (lower.includes("code") || lower.includes("show code")) {
      router.push(`/projects/${project.id}?view=code`);
      return;
    }
    if (lower.includes("tweak") || lower.includes("preview")) {
      showToast("Use Visual tweak on the Stage toolbar");
      return;
    }
    send(c);
  };

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
    setProgress([]);
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
      setProgress((prev) => [...prev.filter((p) => p !== step.phase), step.phase]);
      await wait(700);
      chat = [
        ...chat,
        {
          id: uid("msg"),
          role: "system",
          phase: step.phase,
          content: `${capitalize(step.phase)} phase complete`,
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
              : step.phase === "crew"
                ? ["Open Agents", "Add auth"]
                : ["Make casual", "Open Blueprint"],
        },
      ];
      updateProject(project.id, {
        phase: step.phase,
        chat,
        previewReady: step.phase === "stage" ? true : project.previewReady,
        status: step.phase === "stage" ? "building" : "building",
      });
    }
    setRunning(false);
    showToast("Generate complete — Stage is ready");
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div
        className="flex items-center justify-between gap-2 px-3 py-2.5 border-b shrink-0"
        style={{ borderColor: "var(--border)" }}
      >
        <div>
          <div className="label-caps">
            Chat · {prefs.mode === "builder" ? "Consultant" : "Staff eng"}
          </div>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          disabled={running}
          onClick={generate}
        >
          {running ? "Generating…" : project.previewReady ? "Re-generate" : "Generate"}
        </button>
      </div>

      {running && (
        <div className="px-3 pt-3">
          <div className="progress-card fade-in">
            <div className="text-xs font-semibold mb-1.5">Building narrative</div>
            {PHASE_ORDER.map((p) => {
              const done = progress.includes(p) && project.phase !== p;
              const active = running && (progress[progress.length - 1] === p || project.phase === p);
              const cls = done || (progress.includes(p) && p !== progress[progress.length - 1])
                ? "progress-step done"
                : active || progress.includes(p)
                  ? "progress-step active"
                  : "progress-step";
              return (
                <div key={p} className={cls}>
                  <span>{progress.includes(p) ? "✓" : "○"}</span>
                  <span className="capitalize">{p}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="scroll-y flex-1 px-3 py-3 space-y-2.5 min-h-0">
        {project.chat.map((m) => (
          <div
            key={m.id}
            className="msg-enter rounded-[10px] p-3"
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
            <p className="m-0 text-sm whitespace-pre-wrap leading-relaxed">{m.content}</p>
            {m.chips && m.chips.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {m.chips.map((c) => (
                  <button key={c} type="button" className="chip" onClick={() => navigateChip(c)}>
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div
        className="p-3 border-t shrink-0"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <div className="flex gap-2">
          <input
            className="input"
            placeholder={
              prefs.mode === "builder"
                ? "Steer the build — e.g. make the tone warmer…"
                : "Steer — e.g. add rate limiting to CRM writer…"
            }
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
          />
          <button type="button" className="btn btn-primary" onClick={() => send()} disabled={!draft.trim()}>
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
