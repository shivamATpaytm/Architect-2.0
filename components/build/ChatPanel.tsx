"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { BuildStep, Project } from "@/lib/types";
import { useApp } from "@/components/providers/AppProvider";
import { uid } from "@/lib/storage";

const STEP_ORDER: BuildStep[] = ["understanding", "spec", "ui", "agents", "ready"];
const REFINE_CHIPS = ["Make denser", "Add auth", "Dark dashboard", "Make casual"];

export function ChatPanel({
  project,
  onShowPreview,
}: {
  project: Project;
  onShowPreview?: () => void;
}) {
  const { updateProject, prefs, showToast, refineProject, checkpointProject } = useApp();
  const router = useRouter();
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [showJump, setShowJump] = useState(false);

  const building =
    project.status === "building" ||
    project.status === "queued" ||
    (project.buildProgress?.state === "building");
  const currentStep = project.buildProgress?.step || (project.previewReady ? "ready" : "understanding");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowJump(false);
  }, [project.chat.length, building]);

  const onScroll = () => {
    const el = listRef.current;
    if (!el) return;
    const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowJump(dist > 120);
  };

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
      if (onShowPreview && lower.includes("preview")) {
        onShowPreview();
        showToast("Switched to Preview");
        return;
      }
      showToast("Use Visual tweak on the Stage toolbar");
      return;
    }
    // v0-like refine chips mutate UI + docs
    if (
      REFINE_CHIPS.some((r) => r.toLowerCase() === lower) ||
      /denser|auth|dark|casual|warmer|slack|compact/.test(lower)
    ) {
      refineProject(project.id, c);
      return;
    }
    send(c);
  };

  const send = (text?: string) => {
    const content = (text ?? draft).trim();
    if (!content) return;
    // Chat follow-ups that look like refinements mutate Stage (Bolt-like)
    if (
      /denser|compact|auth|sso|dark|casual|warmer|friendly|add |make |remove |slack/.test(
        content.toLowerCase()
      ) &&
      project.previewReady
    ) {
      refineProject(project.id, content);
      setDraft("");
      return;
    }
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
              ? "Noted. Try refine chips (Make denser / Add auth / Dark dashboard) to mutate Stage + Blueprint together — or describe the change in plain language."
              : "Acknowledged. Diff stays under Code; refine chips mutate screens + PRD. Agent prompts remain editable in Agents.",
          timestamp: new Date().toISOString(),
          chips: ["Make denser", "Add auth", "Dark dashboard", "Open Blueprint"],
        },
      ],
    });
    setDraft("");
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
        <div className="flex gap-1.5">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => checkpointProject(project.id)}
            disabled={!project.previewReady}
            title="Save checkpoint"
          >
            Checkpoint
          </button>
          <span className="chip mono">
            {building ? "Building…" : project.previewReady ? "Ready" : "Queued"}
          </span>
        </div>
      </div>

      {(building || !project.previewReady) && (
        <div className="px-3 pt-3">
          <div className="progress-card fade-in">
            <div className="text-xs font-semibold mb-1.5">
              Thinking → Spec → UI → Agents → Ready
            </div>
            {STEP_ORDER.map((p) => {
              const idx = STEP_ORDER.indexOf(p);
              const cur = STEP_ORDER.indexOf(currentStep);
              const done = idx < cur || currentStep === "ready";
              const active = p === currentStep && currentStep !== "ready";
              const cls = done && !active
                ? "progress-step done"
                : active
                  ? "progress-step active"
                  : "progress-step";
              return (
                <div key={p} className={cls}>
                  <span>{done && !active ? "✓" : active ? "●" : "○"}</span>
                  <span className="capitalize">
                    {p === "spec" ? "Spec / docs" : p === "ui" ? "UI screens" : p}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div
        ref={listRef}
        onScroll={onScroll}
        className="scroll-y flex-1 px-3 py-3 space-y-2.5 min-h-0 relative"
      >
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
        {showJump && (
          <button
            type="button"
            className="btn btn-sm"
            style={{
              position: "sticky",
              bottom: 8,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 2,
            }}
            onClick={() => {
              bottomRef.current?.scrollIntoView({ behavior: "smooth" });
              setShowJump(false);
            }}
          >
            Jump to latest
          </button>
        )}
      </div>

      {project.previewReady && (
        <div
          className="px-3 pb-1 flex flex-wrap gap-1.5 shrink-0"
        >
          {REFINE_CHIPS.map((c) => (
            <button key={c} type="button" className="chip chip-accent" onClick={() => refineProject(project.id, c)}>
              {c}
            </button>
          ))}
        </div>
      )}

      {onShowPreview && (
        <div className="px-3 pb-2 shrink-0 md:hidden sticky bottom-0 z-[1]">
          <button
            type="button"
            className="btn btn-signal w-full"
            onClick={() => {
              onShowPreview();
              requestAnimationFrame(() => {
                document.getElementById("stage-panel")?.scrollIntoView({
                  behavior: "smooth",
                  block: "nearest",
                });
              });
            }}
          >
            Show preview
          </button>
        </div>
      )}

      <div
        className="p-3 border-t shrink-0"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <div className="flex gap-2">
          <input
            className="input"
            placeholder={
              prefs.mode === "builder"
                ? "Refine — e.g. make denser, add auth…"
                : "Steer — e.g. add rate limiting, dark dashboard…"
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
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => send()}
            disabled={!draft.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
