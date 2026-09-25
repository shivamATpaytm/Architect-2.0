"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { PreviewScreen, Project } from "@/lib/types";
import { useApp } from "@/components/providers/AppProvider";

type Device = "desktop" | "tablet" | "mobile";

const BUILD_STEPS = [
  { id: "understanding", label: "Understanding" },
  { id: "spec", label: "Spec / docs" },
  { id: "ui", label: "UI screens" },
  { id: "agents", label: "Agents" },
  { id: "ready", label: "Ready" },
] as const;

export function PreviewStage({ project }: { project: Project }) {
  const { prefs, showToast, updateProject, restoreCheckpoint, checkpointProject } = useApp();
  const router = useRouter();
  const [device, setDevice] = useState<Device>("desktop");
  const [tweak, setTweak] = useState(false);
  const runningRef = useRef(false);
  const width = device === "mobile" ? 360 : device === "tablet" ? 768 : "100%";
  const outreach = project.outreach ?? {
    status: "idle" as const,
    counts: { leads: 128, drafts: 34, crm: 19 },
    logs: [] as string[],
  };
  const screens = project.screens || [];
  const activeId = project.activeScreenId || screens[0]?.id;
  const active = screens.find((s) => s.id === activeId) || screens[0];
  const step = project.buildProgress?.step || (project.previewReady ? "ready" : "understanding");
  const stepIdx = BUILD_STEPS.findIndex((s) => s.id === step);

  const runOutreach = async () => {
    if (runningRef.current) return;
    if (outreach.status === "queued" || outreach.status === "running") return;
    runningRef.current = true;

    const base = outreach.counts;
    const startLogs = [`[${ts()}] QUEUED workflow batch`];
    updateProject(project.id, {
      outreach: {
        status: "queued",
        startedAt: new Date().toISOString(),
        counts: base,
        logs: startLogs,
      },
    });
    showToast("Workflow queued");

    await wait(600);
    updateProject(project.id, {
      outreach: {
        status: "running",
        startedAt: new Date().toISOString(),
        counts: { ...base, leads: Math.max(0, base.leads - 3) },
        logs: [
          ...startLogs,
          `[${ts()}] RUNNING crew · primary action`,
          `[${ts()}] POST /api/run 201`,
        ],
      },
      agents: project.agents.map((a, i) =>
        i === 0 && a.id.startsWith("agent-") ? { ...a, status: "running" as const } : a
      ),
    });

    await wait(900);
    updateProject(project.id, {
      outreach: {
        status: "running",
        startedAt: new Date().toISOString(),
        counts: {
          leads: Math.max(0, base.leads - 3),
          drafts: base.drafts + 3,
          crm: base.crm + 1,
        },
        logs: [
          ...startLogs,
          `[${ts()}] RUNNING crew · primary action`,
          `[${ts()}] POST /api/run 201`,
          `[${ts()}] Artifacts drafted ×3`,
          `[${ts()}] QA scored · 2 pass / 1 revise`,
        ],
      },
      agents: project.agents.map((a) =>
        a.id.startsWith("agent-")
          ? { ...a, status: a.name.toLowerCase().includes("qa") || a.name.toLowerCase().includes("review") ? ("running" as const) : ("ready" as const) }
          : a
      ),
    });

    await wait(800);
    const fail = Math.random() < 0.08;
    if (fail) {
      updateProject(project.id, {
        outreach: {
          status: "fail",
          startedAt: new Date().toISOString(),
          finishedAt: new Date().toISOString(),
          counts: {
            leads: Math.max(0, base.leads - 3),
            drafts: base.drafts + 1,
            crm: base.crm,
          },
          logs: [
            ...startLogs,
            `[${ts()}] RUNNING crew · primary action`,
            `[${ts()}] POST /api/run 201`,
            `[${ts()}] FAIL connector rate limit — retry later`,
          ],
        },
        agents: project.agents.map((a) =>
          a.id.startsWith("agent-") ? { ...a, status: "ready" as const } : a
        ),
      });
      showToast("Run failed — connector rate limit");
    } else {
      updateProject(project.id, {
        outreach: {
          status: "done",
          startedAt: new Date().toISOString(),
          finishedAt: new Date().toISOString(),
          counts: {
            leads: Math.max(0, base.leads - 3),
            drafts: base.drafts + 3,
            crm: base.crm + 3,
          },
          logs: [
            ...startLogs,
            `[${ts()}] RUNNING crew · primary action`,
            `[${ts()}] POST /api/run 201`,
            `[${ts()}] Artifacts drafted ×3`,
            `[${ts()}] QA scored · 2 pass / 1 revise`,
            `[${ts()}] Downstream sync ×3`,
            `[${ts()}] DONE workflow batch`,
          ],
        },
        agents: project.agents.map((a) =>
          a.id.startsWith("agent-") ? { ...a, status: "ready" as const } : a
        ),
      });
      showToast("Run complete — artifacts ready");
    }
    runningRef.current = false;
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div
        className="flex items-center justify-between gap-2 px-3 py-2.5 border-b flex-wrap shrink-0"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-2">
          <span className="label-caps">Stage</span>
          {project.status === "live" && <span className="live-pill">LIVE</span>}
          {project.generationVersion != null && project.generationVersion > 0 && (
            <span className="chip mono">v{project.generationVersion}</span>
          )}
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          <div className="seg">
            {(["desktop", "tablet", "mobile"] as Device[]).map((d) => (
              <button
                key={d}
                type="button"
                className={`seg-item ${device === d ? "active" : ""}`}
                onClick={() => setDevice(d)}
              >
                {d[0].toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => showToast("Preview refreshed")}
          >
            Refresh
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setTweak((v) => !v)}
          >
            Visual tweak
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => router.push(`/projects/${project.id}?view=agents`)}
          >
            Agents
          </button>
        </div>
      </div>

      {/* Generation timeline — Lovable/Bolt-like thinking → ready */}
      {(project.status === "building" || project.status === "queued" || !project.previewReady) && (
        <div
          className="px-3 py-2 border-b shrink-0 fade-in"
          style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}
        >
          <div className="flex flex-wrap gap-1.5 items-center mb-1.5">
            {BUILD_STEPS.map((s, i) => {
              const done = i < stepIdx || step === "ready";
              const activeStep = s.id === step;
              return (
                <span
                  key={s.id}
                  className={`chip ${activeStep ? "chip-accent" : ""} ${done && !activeStep ? "chip-signal" : ""}`}
                  style={{ fontSize: 10 }}
                >
                  {done && !activeStep ? "✓" : activeStep ? "●" : "○"} {s.label}
                </span>
              );
            })}
          </div>
          {project.buildProgress && (
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ background: "var(--surface-3)" }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${project.buildProgress.percent}%`,
                  background: "var(--accent)",
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Screen tabs */}
      {screens.length > 0 && (
        <div
          className="flex gap-1 px-3 py-2 border-b overflow-x-auto shrink-0"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          {screens.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`chip ${s.id === active?.id ? "chip-accent" : ""}`}
              onClick={() => updateProject(project.id, { activeScreenId: s.id })}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 min-h-0 p-3 blueprint-grid overflow-auto">
        <div
          className="stage-frame mx-auto transition-all"
          style={{ width, maxWidth: "100%", minHeight: 440 }}
        >
          <div
            className="flex items-center gap-2 px-3 py-2 border-b"
            style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}
          >
            <span className="inline-flex gap-1.5">
              <i className="h-2.5 w-2.5 rounded-full" style={{ background: "#c45c26" }} />
              <i className="h-2.5 w-2.5 rounded-full" style={{ background: "#c9a227" }} />
              <i className="h-2.5 w-2.5 rounded-full" style={{ background: "#2a6b5a" }} />
            </span>
            <span
              className="mono text-xs truncate flex-1 px-2 py-0.5 rounded"
              style={{ color: "var(--ink-muted)", background: "var(--bg)" }}
            >
              {active
                ? `${project.deployUrl || `${slug(project.name)}.architect.new`}${active.route === "/" ? "" : active.route}`
                : project.deployUrl || `${slug(project.name)}.architect.new`}
            </span>
          </div>

          {project.previewReady && active ? (
            <GeneratedScreen
              screen={active}
              project={project}
              outreach={outreach}
              onRun={runOutreach}
            />
          ) : project.previewReady && screens.length === 0 ? (
            <LegacyLeadFallback outreach={outreach} onRun={runOutreach} project={project} />
          ) : (
            <div className="sketch-empty m-5">
              <p className="display text-xl m-0 mb-1">
                {step === "understanding"
                  ? "Thinking…"
                  : step === "spec"
                    ? "Writing docs…"
                    : step === "ui"
                      ? "Building screens…"
                      : "Assembling…"}
              </p>
              <p className="m-0 text-sm mb-3">
                {project.buildProgress
                  ? `${project.buildProgress.stepLabel} · ${project.buildProgress.etaLabel}`
                  : "Generation will populate Stage as screens appear."}
              </p>
              {project.blueprint.length > 0 && (
                <p className="m-0 text-xs" style={{ color: "var(--ok)" }}>
                  ✓ Blueprint sections ready — open Blueprint view
                </p>
              )}
            </div>
          )}
        </div>

        {(prefs.mode === "architect" || (outreach.logs && outreach.logs.length > 0)) &&
          project.previewReady && (
            <div
              className="card mt-3 p-3 mono text-[11px] fade-in"
              style={{ color: "var(--ink-muted)" }}
            >
              <div className="flex justify-between mb-1">
                <span>console · network</span>
                <span
                  style={{
                    color:
                      outreach.status === "fail"
                        ? "var(--danger)"
                        : outreach.status === "done"
                          ? "var(--ok)"
                          : "var(--ink-muted)",
                  }}
                >
                  {outreach.status === "fail"
                    ? "1 error"
                    : outreach.status === "running" || outreach.status === "queued"
                      ? "live"
                      : "0 errors"}
                </span>
              </div>
              {(outreach.logs.length
                ? outreach.logs
                : [
                    "GET /api/work 200 · 42ms",
                    "POST /api/run 201 · 118ms",
                    "WS /agents/stream connected",
                  ]
              ).map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          )}

        {/* Checkpoints — light versioning */}
        {project.checkpoints && project.checkpoints.length > 0 && (
          <div className="card mt-3 p-3 fade-in">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="label-caps">Checkpoints</span>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => checkpointProject(project.id)}
              >
                Save checkpoint
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {project.checkpoints.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="chip"
                  title={new Date(c.createdAt).toLocaleString()}
                  onClick={() => restoreCheckpoint(project.id, c.id)}
                >
                  ↩ {c.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {tweak && (
        <div
          className="border-t p-3 shrink-0 fade-in"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-semibold">Visual tweak</span>
            <button
              type="button"
              className="chip"
              onClick={() => showToast("Accent → sage applied")}
            >
              Accent sage
            </button>
            <button
              type="button"
              className="chip"
              onClick={() => showToast("Density → compact")}
            >
              Compact
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setTweak(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function GeneratedScreen({
  screen,
  project,
  outreach,
  onRun,
}: {
  screen: PreviewScreen;
  project: Project;
  outreach: NonNullable<Project["outreach"]>;
  onRun: () => void;
}) {
  const busy = outreach.status === "queued" || outreach.status === "running";
  const cta =
    outreach.status === "queued"
      ? "Queued…"
      : outreach.status === "running"
        ? "Running…"
        : outreach.status === "done"
          ? "Run again"
          : outreach.status === "fail"
            ? "Retry"
            : screen.primaryCta;

  const stats = screen.widgets.filter((w) => w.type === "stat");
  const rows = screen.widgets.filter((w) => w.type === "row" || w.type === "badge");
  const forms = screen.widgets.filter((w) => w.type === "form" || w.type === "card");

  return (
    <div className="p-5 fade-in" style={{ background: "var(--bg)" }}>
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <div>
          <div className="label-caps mb-1">{screen.name}</div>
          <h2 className="display text-[28px] m-0">{screen.headline}</h2>
          <p className="m-0 text-sm mt-1" style={{ color: "var(--ink-muted)" }}>
            {screen.subhead}
          </p>
        </div>
        {(screen.kind === "dashboard" ||
          screen.kind === "inbox" ||
          screen.kind === "list" ||
          screen.kind === "board") && (
          <button type="button" className="btn btn-signal" onClick={onRun} disabled={busy}>
            {cta}
          </button>
        )}
        {screen.kind === "compose" && (
          <button type="button" className="btn btn-primary" onClick={onRun} disabled={busy}>
            {cta}
          </button>
        )}
      </div>

      {busy && (
        <div
          className="mb-4 px-3 py-2 rounded-lg text-sm fade-in"
          style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
        >
          {outreach.status === "queued"
            ? "Queued — waiting for crew slot…"
            : `Crew running — ${project.agents
                .filter((a) => a.id.startsWith("agent-"))
                .map((a) => a.name)
                .slice(0, 4)
                .join(" → ")}`}
        </div>
      )}
      {outreach.status === "done" && (
        <div
          className="mb-4 px-3 py-2 rounded-lg text-sm fade-in"
          style={{ background: "var(--accent-soft)", color: "var(--ok)" }}
        >
          Done — artifacts updated · downstream synced
        </div>
      )}
      {outreach.status === "fail" && (
        <div
          className="mb-4 px-3 py-2 rounded-lg text-sm fade-in"
          style={{ background: "var(--signal-soft)", color: "var(--danger)" }}
        >
          Failed — connector error. Retry when ready.
        </div>
      )}

      {stats.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3 mb-4">
          {stats.map((w) => (
            <div key={w.label} className="card p-3.5">
              <div className="text-xs" style={{ color: "var(--ink-muted)" }}>
                {w.label}
              </div>
              <div className="display text-[26px] mt-0.5">{w.value}</div>
              {w.meta && (
                <div className="text-[11px] mt-0.5" style={{ color: "var(--ink-faint)" }}>
                  {w.meta}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {forms.length > 0 && (
        <div className="card p-4 mb-4 space-y-3">
          {forms.map((w) => (
            <div key={w.label}>
              <div className="text-xs mb-1" style={{ color: "var(--ink-muted)" }}>
                {w.label}
              </div>
              <div
                className="px-3 py-2 rounded-lg text-sm"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
              >
                {w.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {rows.length > 0 && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead style={{ background: "var(--surface-2)" }}>
              <tr>
                <th className="text-left p-2.5 font-medium">Item</th>
                <th className="text-left p-2.5 font-medium">Status</th>
                <th className="text-left p-2.5 font-medium hidden sm:table-cell">Detail</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((w) => (
                <tr key={w.label + (w.value || "")} style={{ borderTop: "1px solid var(--border)" }}>
                  <td className="p-2.5 font-medium">{w.label}</td>
                  <td className="p-2.5">
                    <span className="chip chip-accent">{w.value}</span>
                  </td>
                  <td className="p-2.5 hidden sm:table-cell" style={{ color: "var(--ink-muted)" }}>
                    {w.meta}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {stats.length === 0 && forms.length === 0 && rows.length === 0 && (
        <div className="sketch-empty">
          <p className="m-0 text-sm">Screen shell — add content via chat refine.</p>
        </div>
      )}
    </div>
  );
}

function LegacyLeadFallback({
  outreach,
  onRun,
  project,
}: {
  outreach: NonNullable<Project["outreach"]>;
  onRun: () => void;
  project: Project;
}) {
  const busy = outreach.status === "queued" || outreach.status === "running";
  return (
    <div className="p-5" style={{ background: "var(--bg)" }}>
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <div>
          <div className="label-caps mb-1">Preview</div>
          <h2 className="display text-[28px] m-0">{project.name}</h2>
          <p className="m-0 text-sm mt-1" style={{ color: "var(--ink-muted)" }}>
            {project.pitch}
          </p>
        </div>
        <button type="button" className="btn btn-signal" onClick={onRun} disabled={busy}>
          {busy ? "Running…" : "Run workflow"}
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-3 mb-4">
        {[
          ["Queued", String(outreach.counts.leads)],
          ["Drafts", String(outreach.counts.drafts)],
          ["Synced", String(outreach.counts.crm)],
        ].map(([label, val]) => (
          <div key={label} className="card p-3.5">
            <div className="text-xs" style={{ color: "var(--ink-muted)" }}>
              {label}
            </div>
            <div className="display text-[26px] mt-0.5">{val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
function ts() {
  return new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}
function slug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
